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
    assert.ok(fs.existsSync(path.join(testDir, 'src/config/multer.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/models/user.model.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/services/auth.service.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/services/user.service.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/controllers/auth.controller.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/controllers/api.controller.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/routes/api.routes.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/routes/auth.routes.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/middlewares/csrf.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/middlewares/multer.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/middlewares/requireToken.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/middlewares/requireRole.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/utils/nodemailer.js')));
    assert.ok(fs.existsSync(path.join(testDir, 'index.js')));
    assert.ok(fs.existsSync(path.join(testDir, '.env.example')));

    // Check separation of concerns and elimination of cold-start latency
    const authControllerJs = fs.readFileSync(path.join(testDir, 'src/controllers/auth.controller.js'), 'utf8');
    assert.ok(!authControllerJs.includes('await bcrypt.hash'));
    assert.ok(authControllerJs.includes("from '../services/auth.service.js'"));

    const apiControllerJs = fs.readFileSync(path.join(testDir, 'src/controllers/api.controller.js'), 'utf8');
    assert.ok(apiControllerJs.includes("from '../services/user.service.js'"));
    assert.ok(!apiControllerJs.includes("from '../models/user.model.js'"));

    // Check multer uploads path is relative to server root
    const multerConfigJs = fs.readFileSync(path.join(testDir, 'src/config/multer.js'), 'utf8');
    assert.ok(multerConfigJs.includes("fileURLToPath(new URL('../../uploads', import.meta.url))"));

    // Check package.json dependencies
    const pkg = JSON.parse(fs.readFileSync(path.join(testDir, 'package.json'), 'utf8'));
    assert.strictEqual(pkg.type, 'module');
    assert.strictEqual(pkg.engines?.node, '>=20.12.0');
    assert.ok(pkg.dependencies['express']);
    assert.ok(pkg.dependencies['mongoose']);
    assert.ok(pkg.dependencies['bcryptjs']);
    assert.ok(pkg.dependencies['jsonwebtoken']);
    assert.ok(pkg.dependencies['express-rate-limit']);
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
    assert.ok(fs.existsSync(path.join(tsDir, 'src/models/user.model.ts')));
    assert.ok(fs.existsSync(path.join(tsDir, 'src/services/auth.service.ts')));
    assert.ok(fs.existsSync(path.join(tsDir, 'src/services/user.service.ts')));
    assert.ok(fs.existsSync(path.join(tsDir, 'src/middlewares/csrf.ts')));
    assert.ok(fs.existsSync(path.join(tsDir, 'tsconfig.json')));

    // Check IUser interface and model typing
    const userModelTs = fs.readFileSync(path.join(tsDir, 'src/models/user.model.ts'), 'utf8');
    assert.ok(userModelTs.includes('export interface IUser extends mongoose.Document'));
    assert.ok(userModelTs.includes('mongoose.Schema<IUser>'));
    assert.ok(userModelTs.includes('mongoose.model<IUser>'));

    // Check imports under NodeNext have .js extensions and index mounts csrfProtection
    const indexTs = fs.readFileSync(path.join(tsDir, 'index.ts'), 'utf8');
    assert.ok(indexTs.includes("from './src/config/db.js'"));
    assert.ok(indexTs.includes("from './src/routes/api.routes.js'"));
    assert.ok(indexTs.includes("from './src/middlewares/csrf.js'"));
    assert.ok(indexTs.includes("app.use('/api', csrfProtection);"));

    const pkg = JSON.parse(fs.readFileSync(path.join(tsDir, 'package.json'), 'utf8'));
    assert.strictEqual(pkg.engines?.node, '>=20.12.0');
    assert.ok(pkg.devDependencies['tsx']);
    assert.ok(pkg.devDependencies['typescript']);
    assert.ok(pkg.devDependencies['@types/express']);
    assert.ok(pkg.devDependencies['@types/jsonwebtoken']);
    assert.ok(pkg.devDependencies['@types/bcryptjs']);
  });

  it('scaffolds server with auth: false pruning dependencies, models, services, and routes (JS)', async () => {
    const noAuthDir = path.join(testDir, 'server-no-auth');
    fs.mkdirSync(noAuthDir, { recursive: true });

    await generateServer(noAuthDir, {
      projectName: 'no-auth-app',
      language: 'js',
      auth: false,
      addOns: ['cors', 'dotenv']
    });

    const pkg = JSON.parse(fs.readFileSync(path.join(noAuthDir, 'package.json'), 'utf8'));
    assert.strictEqual(pkg.dependencies['bcryptjs'], undefined);
    assert.strictEqual(pkg.dependencies['jsonwebtoken'], undefined);
    assert.strictEqual(pkg.dependencies['express-rate-limit'], undefined);

    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/models/user.model.js')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/config/session.js')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/services/auth.service.js')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/services/user.service.js')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/controllers/auth.controller.js')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/routes/auth.routes.js')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/middlewares/requireToken.js')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/middlewares/requireRole.js')), false);

    const apiRoutes = fs.readFileSync(path.join(noAuthDir, 'src/routes/api.routes.js'), 'utf8');
    assert.strictEqual(apiRoutes.includes('/auth'), false);
    assert.strictEqual(apiRoutes.includes('requireToken'), false);
    assert.ok(apiRoutes.includes('/health'));

    const apiController = fs.readFileSync(path.join(noAuthDir, 'src/controllers/api.controller.js'), 'utf8');
    assert.strictEqual(apiController.includes('user.service'), false);
    assert.strictEqual(apiController.includes('getUsers'), false);
    assert.ok(apiController.includes('getHealthCheck'));

    const env = fs.readFileSync(path.join(noAuthDir, '.env'), 'utf8');
    assert.strictEqual(env.includes('JWT_SECRET'), false);
    const envExample = fs.readFileSync(path.join(noAuthDir, '.env.example'), 'utf8');
    assert.strictEqual(envExample.includes('JWT_SECRET'), false);
  });

  it('scaffolds server with TypeScript and auth: false omitting @types/jsonwebtoken and @types/bcryptjs', async () => {
    const noAuthTsDir = path.join(testDir, 'server-no-auth-ts');
    fs.mkdirSync(noAuthTsDir, { recursive: true });

    await generateServer(noAuthTsDir, {
      projectName: 'no-auth-ts-app',
      language: 'ts',
      auth: false
    });

    const pkg = JSON.parse(fs.readFileSync(path.join(noAuthTsDir, 'package.json'), 'utf8'));
    assert.strictEqual(pkg.devDependencies['@types/jsonwebtoken'], undefined);
    assert.strictEqual(pkg.devDependencies['@types/bcryptjs'], undefined);
    assert.ok(pkg.devDependencies['@types/express']);
    assert.ok(pkg.devDependencies['typescript']);

    assert.strictEqual(fs.existsSync(path.join(noAuthTsDir, 'src/models/user.model.ts')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthTsDir, 'src/services/auth.service.ts')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthTsDir, 'src/services/user.service.ts')), false);
  });
});
