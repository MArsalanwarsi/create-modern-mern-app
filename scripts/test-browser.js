// Exercise the packed production client and compiled API on one origin.
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFileSync, readdirSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { randomUUID, randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const dist = process.argv[2];
assert.ok(process.env.TEST_MONGO_URI, 'TEST_BROWSER=1 requires a test MongoDB URI in TEST_MONGO_URI');
const workspace = path.resolve(dist, '../..');
const mongoose = createRequire(path.join(workspace, 'server/package.json'))('mongoose');
process.env.JWT_SECRET = randomBytes(48).toString('hex');
const { app } = await import(pathToFileURL(path.join(workspace, 'server/dist/index.js')));
const assets = new Map(readdirSync(path.join(dist, 'assets')).map(name =>
  ['/assets/' + name, readFileSync(path.join(dist, 'assets', name))]));
let index = readFileSync(path.join(dist, 'index.html'), 'utf8');
const chunks = [...assets.keys()].filter(name => name.endsWith('.js'));
function chunk(name) {
  const match = chunks.find(file => file.startsWith('/assets/' + name + '-'));
  assert.ok(match, 'Expected a separate production chunk for ' + name);
  return match;
}

const dashboard = chunk('AuthenticatedDashboard');
const overview = chunk('Overview');
const settings = chunk('Settings');
const account = chunk('Account');
// Model a release in which the old Settings asset is permanently removed.
// New HTML selects a new entry point that references the replacement chunk.
function switchRelease() {
  const replacements = new Map(chunks.map(file => [file, file.replace('.js', '-next.js')]));
  function rewrite(source) {
    for (const [oldFile, newFile] of replacements) {
      source = source.replaceAll(path.basename(oldFile), path.basename(newFile));
    }
    return source;
  }
  for (const [oldFile, newFile] of replacements) {
    assets.set(newFile, rewrite(assets.get(oldFile).toString('utf8')));
    assets.delete(oldFile);
  }
  index = rewrite(index);
  return replacements.get(settings);
}

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost').pathname;
  if (url.startsWith('/api/')) {
    app(req, res);
  } else if (url === '/avatars/shadcn.jpg') {
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(readFileSync(path.join(dist, 'avatars/shadcn.jpg')));
  } else if (assets.has(url)) {
    res.writeHead(200, { 'Content-Type': url.endsWith('.js') ? 'text/javascript' : url.endsWith('.woff2') ? 'font/woff2' : 'text/css' });
    res.end(assets.get(url));
  } else if (['/', '/login', '/signup', '/dashboard', '/dashboard/settings', '/dashboard/members'].includes(url)) {
    res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
    res.end(index);
  } else {
    res.writeHead(404);
    res.end();
  }
});

let browser;
try {
  await mongoose.connect(process.env.TEST_MONGO_URI, { dbName: 'mern_browser_' + randomUUID().replaceAll('-', '') });
  await mongoose.model('User').init();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  const requests = new Set();
  const errors = [];
  page.on('request', req => requests.add(new URL(req.url()).pathname));
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(origin);
  const link = page.locator('a[href="/dashboard"]').first();
  await link.waitFor();
  for (const file of [dashboard, overview, settings, account]) assert.ok(!requests.has(file), 'Eagerly requested ' + file);
  await link.click();
  await page.waitForURL(origin + '/login');
  await page.locator('a[href="/signup"]').click();
  const email = 'browser@example.test';
  const password = 'real-browser-passphrase';
  await page.locator('#name').fill('Browser Member');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#confirm-password').fill(password);
  await page.getByRole('button', { name: 'Create Account', exact: true }).click();
  await page.getByText('Acme Inc.', { exact: true }).waitFor();
  await page.getByText('Total Revenue', { exact: true }).waitFor();
  assert.ok((await page.context().cookies()).some(cookie => cookie.httpOnly && cookie.path === '/api'));
  await page.getByRole('button', { name: 'Team', exact: true }).click();
  await page.waitForURL(origin + '/dashboard/members');
  await page.getByRole('alert').filter({ hasText: 'Administrator access required' }).waitFor();
  await mongoose.model('User').updateOne({ email }, { role: 'admin' });
  await page.goto(origin + '/dashboard');
  await page.getByRole('button', { name: 'Team', exact: true }).click();
  await page.getByRole('row').filter({ hasText: email }).filter({ hasText: 'admin' }).waitFor();
  assert.ok(requests.has(dashboard) && requests.has(overview));
  assert.ok(!requests.has(settings));

  const replacement = switchRelease();
  const missing = page.waitForResponse(r => new URL(r.url()).pathname === settings && r.status() === 404);
  await page.locator('a[href="/dashboard/settings"]').first().click();
  await missing;
  const refresh = page.getByRole('button', { name: 'Refresh page' });
  await refresh.waitFor();
  assert.equal(page.url(), origin + '/dashboard/settings');
  const newDocument = page.waitForRequest(req => req.isNavigationRequest() && req.url() === origin + '/dashboard/settings');
  await refresh.click();
  await newDocument;
  await page.getByRole('heading', { name: 'Settings', exact: true }).waitFor();
  assert.equal(page.url(), origin + '/dashboard/settings');
  assert.ok(requests.has(replacement));
  await page.getByRole('button', { name: /Browser Member/ }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await page.waitForURL(origin + '/login');
  await page.goto(origin + '/dashboard');
  await page.waitForURL(origin + '/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.getByText('Total Revenue', { exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log('Chrome passed: real signup, login, logout, member denial, admin directory, deferred routes and stale-chunk recovery.');
} finally {
  try { await browser?.close(); }
  finally {
    if (server.listening) await new Promise(resolve => server.close(resolve));
    if (mongoose.connection.readyState === 1) {
      try { await mongoose.connection.dropDatabase(); } finally { await mongoose.disconnect(); }
    }
  }
}
