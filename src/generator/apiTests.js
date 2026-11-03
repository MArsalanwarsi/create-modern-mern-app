export function generateApiTests(isTs, hasAuth) {
  return `import assert from 'node:assert/strict';
import { once } from 'node:events';
import { after, before, test } from 'node:test';
${hasAuth ? `import { randomBytes, randomUUID } from 'node:crypto';
import mongoose from 'mongoose';

process.env.JWT_SECRET = randomBytes(48).toString('hex');` : ''}
const { app } = await import('../index.${isTs ? 'ts' : 'js'}');
let server;
let url;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  url = 'http://127.0.0.1:' + server.address().port + '/api';
});
after(() => new Promise(resolve => server.close(resolve)));

test('health responds with JSON and security headers', async () => {
  const response = await fetch(url + '/health');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'online');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-powered-by'), null);
});

test('writes without the client header are rejected', async () => {
  const response = await fetch(url + '/health', { method: 'POST' });
  assert.equal(response.status, 403);
});
${hasAuth ? `
test('private endpoints reject unauthenticated requests', async () => {
  for (const path of ['/auth/me', '/users']) {
    assert.equal((await fetch(url + path)).status, 401);
  }
});

test('signup, roles, logout and login', { skip: !process.env.TEST_MONGO_URI && 'Set TEST_MONGO_URI to run with MongoDB' }, async t => {
  await mongoose.connect(process.env.TEST_MONGO_URI, { dbName: 'mern_test_' + randomUUID().replaceAll('-', '') });
  t.after(async () => {
    try { await mongoose.connection.dropDatabase(); }
    finally { await mongoose.disconnect(); }
  });
  await mongoose.model('User').init();
  const user = { name: 'Test User', email: 'member@example.test', password: 'test-password-123', role: 'admin' };
  let cookie = '';
  async function request(path, body) {
    const response = await fetch(url + path, {
      method: body ? 'POST' : 'GET',
      headers: { cookie, 'Content-Type': 'application/json', 'X-Requested-With': 'mern-client' },
      body: body && JSON.stringify(body)
    });
    const session = response.headers.get('set-cookie');
    if (session) cookie = session.split(';')[0];
    return response;
  }
  const created = await request('/auth/signup', user);
  assert.equal(created.status, 201);
  assert.equal((await created.json()).user.role, 'member');
  assert.equal((await request('/auth/signup', user)).status, 409);
  assert.equal((await request('/auth/me')).status, 200);
  assert.equal((await request('/users')).status, 403);
  await mongoose.model('User').updateOne({ email: user.email }, { role: 'admin' });
  const directory = await request('/users');
  assert.equal(directory.status, 200);
  const [member] = (await directory.json()).data;
  assert.deepEqual(Object.keys(member).sort(), ['_id', 'email', 'name', 'role']);
  assert.equal(member.email, user.email);
  assert.equal((await request('/auth/logout', {})).status, 204);
  assert.equal((await request('/auth/me')).status, 401);
  assert.equal((await request('/auth/login', { ...user, password: 'incorrect' })).status, 401);
  assert.equal((await request('/auth/login', user)).status, 200);
  cookie += 'invalid';
  assert.equal((await request('/auth/me')).status, 401);
});
` : ''}`;
}
