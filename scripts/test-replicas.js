// Run from the compiled TypeScript server workspace, against a disposable test database.
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const requireFromApp = createRequire(path.resolve('package.json'));
const mongoose = requireFromApp('mongoose');
const dbName = process.argv[2] === 'serve' ? process.env.REPLICA_TEST_DB : 'mern_limits_' + randomUUID().replaceAll('-', '');

if (process.argv[2] === 'serve') {
  process.loadEnvFile('.env');
  const { app } = await import(pathToFileURL(path.resolve('dist/index.js')));
  const { prepareLoginLimit } = await import(pathToFileURL(path.resolve('dist/src/config/loginLimit.js')));
  await mongoose.connect(process.env.TEST_MONGO_URI, { dbName });
  await prepareLoginLimit();
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  process.send(server.address().port);
} else {
  const children = [];
  try {
    await mongoose.connect(process.env.TEST_MONGO_URI, { dbName });
    const ports = await Promise.all([0, 1].map(() => new Promise((resolve, reject) => {
      const child = fork(import.meta.filename, ['serve'], {
        env: { ...process.env, REPLICA_TEST_DB: dbName, LOGIN_LIMIT_STORE: 'mongo', TRUSTED_PROXY_CIDRS: 'loopback' }
      });
      children.push(child);
      const timer = setTimeout(() => reject(new Error('Replica startup timed out')), 30000);
      child.once('message', port => { clearTimeout(timer); resolve(port); });
      child.once('exit', code => { clearTimeout(timer); reject(new Error('Replica exited: ' + code)); });
      child.once('error', reject);
    })));
    async function attempt(port, ip, endpoint = 'login') {
      const response = await fetch('http://127.0.0.1:' + port + '/api/auth/' + endpoint, {
        method: 'POST', headers: { 'X-Requested-With': 'mern-client', 'X-Forwarded-For': ip },
        signal: AbortSignal.timeout(10000)
      });
      await response.text();
      return response.status;
    }
    const ip = '192.0.2.50';
    // Invalid form submissions return 400 until the shared limit is reached.
    const statuses = await Promise.all(Array.from({ length: 36 }, (_, i) =>
      attempt(ports[i % 2], ip, i % 2 ? 'signup' : 'login')));
    assert.equal(statuses.filter(code => code === 400).length, 30);
    assert.equal(statuses.filter(code => code === 429).length, 6);
    assert.equal(await attempt(ports[0], '192.0.2.51'), 400);
    const counters = mongoose.connection.collection('auth_rate_limits');
    assert.ok((await counters.indexes()).some(index => index.key.resetTime === 1 && index.expireAfterSeconds === 0));
    await counters.updateOne({ _id: ip }, { $set: { resetTime: new Date(0) } });
    assert.equal(await attempt(ports[1], ip), 400);
    console.log('Two replicas shared the limit, isolated client IPs and reset expired counters.');
  } finally {
    await Promise.all(children.filter(child => child.exitCode === null && child.signalCode === null).map(child => {
      const done = once(child, 'exit'); child.kill(); return done;
    }));
    if (mongoose.connection.readyState === 1) {
      try { await mongoose.connection.dropDatabase(); } finally { await mongoose.disconnect(); }
    }
  }
}
