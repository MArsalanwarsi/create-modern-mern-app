import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { generateServer } from '../src/generator/serverGenerator.js';

describe('serverGenerator', () => {
  const testDir = path.join(os.tmpdir(), 'test-server-scaffold-' + Date.now());

  before(() => fs.mkdirSync(testDir, { recursive: true }));
  after(() => fs.rmSync(testDir, { recursive: true, force: true }));

  it('scaffolds server with ES Modules, MongoDB, controllers, routes, and selected add-ons', async () => {
    await generateServer(testDir, {
      projectName: 'test-app',
      language: 'js',
      addOns: ['cors', 'multer', 'cloudinary', 'nodemailer', 'dotenv']
    });

    // Check directory structure
    assert.ok(fs.existsSync(path.join(testDir, 'src/config/db.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/config/cloudinary.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/models/user.model.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/controllers/api.controller.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/routes/api.routes.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/middlewares/multer.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/utils/nodemailer.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'index.js')));
    assert.ok(fs.existsSync(path.join(testDir, '.env.example')));

    // Check package.json dependencies
    const pkg = JSON.parse(fs.readFileSync(path.join(testDir, 'package.json'), 'utf8'));
    assert.strictEqual(pkg.type, 'module');
    assert.ok(pkg.dependencies['express']);
    assert.ok(pkg.dependencies['mongoose']);
    assert.ok(pkg.dependencies['cors']);
    assert.ok(pkg.dependencies['multer']);
    assert.ok(pkg.dependencies['cloudinary']);
    assert.ok(pkg.dependencies['nodemailer']);
    assert.ok(pkg.dependencies['dotenv']);
  });

  it('scaffolds server with TypeScript when selected', async () => {
    const tsDir = path.join(testDir, 'ts-server');
    fs.mkdirSync(tsDir, { recursive: true });

    await generateServer(tsDir, {
      projectName: 'test-ts-app',
      language: 'ts',
      addOns: ['cors']
    });

    assert.ok(fs.existsSync(path.join(tsDir, 'index.ts')));
    assert.ok(fs.existsSync(path.join(tsDir, 'src/config/db.ts')));
    assert.ok(fs.existsSync(path.join(tsDir, 'tsconfig.json')));

    // Check imports under NodeNext have .js extensions
    const indexTs = fs.readFileSync(path.join(tsDir, 'index.ts'), 'utf8');
    assert.ok(indexTs.includes("from './src/config/db.js'"));
    assert.ok(indexTs.includes("from './src/routes/api.routes.js'"));

    const pkg = JSON.parse(fs.readFileSync(path.join(tsDir, 'package.json'), 'utf8'));
    assert.ok(pkg.devDependencies['tsx']);
    assert.ok(pkg.devDependencies['typescript']);
    assert.ok(pkg.devDependencies['@types/express']);
  });
});
