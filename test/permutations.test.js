import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { generateClient } from '../src/generator/clientGenerator.js';
import { generateServer } from '../src/generator/serverGenerator.js';
import { generateRoot } from '../src/generator/rootGenerator.js';

describe('Permutation Test Matrix (F8 / Milestone 4)', () => {
  const baseTestDir = path.join(
    os.tmpdir(),
    `test-permutations-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );

  before(() => fs.mkdirSync(baseTestDir, { recursive: true }));
  after(() => fs.rmSync(baseTestDir, { recursive: true, force: true }));

  async function scaffoldPermutation(dirName, { lang, auth, styling }) {
    const projectDir = path.join(baseTestDir, dirName);
    const clientDir = path.join(projectDir, 'client');
    const serverDir = path.join(projectDir, 'server');

    fs.mkdirSync(clientDir, { recursive: true });
    fs.mkdirSync(serverDir, { recursive: true });

    await generateClient(clientDir, {
      projectName: dirName,
      variant: lang,
      language: lang,
      styling,
      auth
    });

    await generateServer(serverDir, {
      projectName: dirName,
      language: lang,
      auth
    });

    await generateRoot(projectDir, dirName);

    return { projectDir, clientDir, serverDir, isTs: lang === 'ts', hasAuth: auth, isShadcn: styling === 'shadcn' };
  }

  function verifyRelativeImports(rootDir) {
    const checkDir = (curr) => {
      for (const ent of fs.readdirSync(curr, { withFileTypes: true })) {
        const full = path.join(curr, ent.name);
        if (ent.isDirectory()) {
          checkDir(full);
        } else if (/\.(jsx?|tsx?)$/.test(ent.name)) {
          const content = fs.readFileSync(full, 'utf8');
          const matches = content.matchAll(/(?:from\s+|import\s*\(?\s*)['"](\.[^'"]+)['"]/g);
          for (const m of matches) {
            const spec = m[1];
            const base = path.resolve(path.dirname(full), spec);
            const candidates = [
              base,
              base + '.js',
              base + '.jsx',
              base + '.ts',
              base + '.tsx',
              base + '.css',
              path.join(base, 'index.js'),
              path.join(base, 'index.jsx'),
              path.join(base, 'index.ts'),
              path.join(base, 'index.tsx')
            ];
            if (spec.endsWith('.js')) {
              candidates.push(base.replace(/\.js$/, '.ts'));
              candidates.push(base.replace(/\.js$/, '.tsx'));
            }
            if (spec.endsWith('.jsx')) {
              candidates.push(base.replace(/\.jsx$/, '.tsx'));
            }
            const exists = candidates.some(c => fs.existsSync(c));
            assert.ok(
              exists,
              `Unresolved import "${spec}" in ${path.relative(rootDir, full)}`
            );
          }
        }
      }
    };
    checkDir(rootDir);
  }

  function verifyPermutation(perm) {
    const { projectDir, clientDir, serverDir, isTs, hasAuth, isShadcn } = perm;
    const ext = isTs ? 'tsx' : 'jsx';
    const scriptExt = isTs ? 'ts' : 'js';

    // 1. Root assertions
    assert.ok(fs.existsSync(path.join(projectDir, 'package.json')));
    assert.ok(fs.existsSync(path.join(projectDir, '.gitignore')));
    assert.ok(fs.existsSync(path.join(projectDir, 'README.md')));

    const rootPkg = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8'));
    assert.deepStrictEqual(rootPkg.workspaces, ['client', 'server']);
    assert.strictEqual(rootPkg.engines?.node, '>=20.12.0');
    assert.ok(rootPkg.scripts.dev.includes('concurrently'));
    assert.ok(rootPkg.scripts['build:client']);
    assert.ok(rootPkg.scripts['build:server']);
    assert.ok(rootPkg.scripts.build);
    assert.ok(rootPkg.scripts.lint);
    assert.ok(rootPkg.scripts.test);

    // 2. Client File Structure
    assert.ok(fs.existsSync(path.join(clientDir, 'index.html')));
    assert.ok(fs.existsSync(path.join(clientDir, `src/main.${ext}`)));
    assert.ok(fs.existsSync(path.join(clientDir, `src/App.${ext}`)));
    assert.ok(fs.existsSync(path.join(clientDir, 'src/index.css')));
    assert.ok(fs.existsSync(path.join(clientDir, `src/layout/WebsiteLayout.${ext}`)));
    assert.ok(fs.existsSync(path.join(clientDir, `src/layout/slices/Navbar.${ext}`)));
    assert.ok(fs.existsSync(path.join(clientDir, `src/layout/slices/Footer.${ext}`)));
    assert.ok(fs.existsSync(path.join(clientDir, `src/pages/website/Home.${ext}`)));
    assert.ok(fs.existsSync(path.join(clientDir, `src/pages/website/About.${ext}`)));
    assert.ok(fs.existsSync(path.join(clientDir, `src/pages/website/Contact.${ext}`)));
    assert.ok(fs.existsSync(path.join(clientDir, `src/api/client.${scriptExt}`)));

    if (isTs) {
      assert.ok(fs.existsSync(path.join(clientDir, 'tsconfig.json')));
      assert.strictEqual(fs.existsSync(path.join(clientDir, 'jsconfig.json')), false);
    } else {
      assert.ok(fs.existsSync(path.join(clientDir, 'jsconfig.json')));
      assert.strictEqual(fs.existsSync(path.join(clientDir, 'tsconfig.json')), false);
    }

    if (isShadcn) {
      assert.ok(fs.existsSync(path.join(clientDir, 'components.json')));
      assert.ok(fs.existsSync(path.join(clientDir, 'src/styles/shadcn.css')));
      assert.ok(fs.existsSync(path.join(clientDir, 'licenses/shadcn-ui.txt')));
      assert.ok(fs.existsSync(path.join(clientDir, `src/hooks/use-mobile.${scriptExt}`)));
      const primitives = ['button', 'card', 'table', 'badge', 'avatar', 'input', 'label', 'sheet', 'sidebar', 'separator', 'skeleton', 'tooltip', 'field'];
      for (const prim of primitives) {
        assert.ok(
          fs.existsSync(path.join(clientDir, `src/components/ui/${prim}.${ext}`)),
          `Missing shadcn primitive ${prim}.${ext}`
        );
      }
    } else {
      assert.ok(fs.existsSync(path.join(clientDir, `src/lib/utils.${scriptExt}`)));
      assert.strictEqual(fs.existsSync(path.join(clientDir, 'components.json')), false);
      assert.strictEqual(fs.existsSync(path.join(clientDir, 'src/components/ui')), false);
    }

    // 3. Server File Structure
    assert.ok(fs.existsSync(path.join(serverDir, `index.${scriptExt}`)));
    assert.ok(fs.existsSync(path.join(serverDir, `src/config/db.${scriptExt}`)));
    assert.ok(fs.existsSync(path.join(serverDir, `src/controllers/api.controller.${scriptExt}`)));
    assert.ok(fs.existsSync(path.join(serverDir, `src/routes/api.routes.${scriptExt}`)));
    assert.ok(fs.existsSync(path.join(serverDir, `src/middlewares/csrf.${scriptExt}`)));
    assert.ok(fs.existsSync(path.join(serverDir, `src/middlewares/errorHandler.${scriptExt}`)));
    assert.ok(fs.existsSync(path.join(serverDir, '.env')));
    assert.ok(fs.existsSync(path.join(serverDir, '.env.example')));

    if (isTs) {
      assert.ok(fs.existsSync(path.join(serverDir, 'tsconfig.json')));
    } else {
      assert.strictEqual(fs.existsSync(path.join(serverDir, 'tsconfig.json')), false);
    }

    // 4. Negative Directory & Pruning Assertions (auth: false)
    if (!hasAuth) {
      assert.strictEqual(fs.existsSync(path.join(clientDir, 'src/pages/dashboard')), false, 'client/src/pages/dashboard must not exist');
      assert.strictEqual(fs.existsSync(path.join(clientDir, 'src/pages/auth')), false, 'client/src/pages/auth must not exist');
      assert.strictEqual(fs.existsSync(path.join(clientDir, 'src/components/auth')), false, 'client/src/components/auth must not exist');
      assert.strictEqual(fs.existsSync(path.join(clientDir, `src/layout/AuthenticatedDashboard.${ext}`)), false);
      assert.strictEqual(fs.existsSync(path.join(clientDir, `src/layout/DashboardLayout.${ext}`)), false);

      assert.strictEqual(fs.existsSync(path.join(serverDir, 'src/models')), false, 'server/src/models must not exist');
      assert.strictEqual(fs.existsSync(path.join(serverDir, 'src/services')), false, 'server/src/services must not exist');
      assert.strictEqual(fs.existsSync(path.join(serverDir, `src/config/session.${scriptExt}`)), false);
      assert.strictEqual(fs.existsSync(path.join(serverDir, `src/controllers/auth.controller.${scriptExt}`)), false);
      assert.strictEqual(fs.existsSync(path.join(serverDir, `src/routes/auth.routes.${scriptExt}`)), false);
    } else {
      assert.ok(fs.existsSync(path.join(clientDir, 'src/pages/dashboard')));
      assert.ok(fs.existsSync(path.join(clientDir, `src/layout/AuthenticatedDashboard.${ext}`)));
      assert.ok(fs.existsSync(path.join(serverDir, 'src/models')));
      assert.ok(fs.existsSync(path.join(serverDir, 'src/services')));
      assert.ok(fs.existsSync(path.join(serverDir, `src/controllers/auth.controller.${scriptExt}`)));
      assert.ok(fs.existsSync(path.join(serverDir, `src/routes/auth.routes.${scriptExt}`)));
    }

    // 5. Client Package Manifest
    const clientPkg = JSON.parse(fs.readFileSync(path.join(clientDir, 'package.json'), 'utf8'));
    assert.strictEqual(clientPkg.engines?.node, '>=20.12.0');
    assert.ok(clientPkg.dependencies['react']);
    assert.ok(clientPkg.dependencies['react-dom']);
    assert.ok(clientPkg.dependencies['react-router-dom']);
    assert.ok(clientPkg.dependencies['axios']);

    if (isShadcn) {
      assert.ok(clientPkg.dependencies['radix-ui']);
      assert.ok(clientPkg.dependencies['clsx']);
      assert.ok(clientPkg.dependencies['class-variance-authority']);
      assert.ok(clientPkg.dependencies['tailwind-merge']);
      assert.ok(clientPkg.dependencies['lucide-react']);
      assert.ok(clientPkg.devDependencies['tailwindcss']);
      assert.ok(clientPkg.devDependencies['@tailwindcss/vite']);
      assert.ok(clientPkg.devDependencies['tw-animate-css']);
    } else {
      assert.ok(clientPkg.dependencies['clsx']);
      assert.ok(clientPkg.dependencies['class-variance-authority']);
      assert.ok(clientPkg.dependencies['tailwind-merge']);
      assert.ok(clientPkg.dependencies['lucide-react']);
      assert.ok(clientPkg.devDependencies['tailwindcss']);
      assert.ok(clientPkg.devDependencies['@tailwindcss/vite']);
      assert.strictEqual(clientPkg.dependencies['radix-ui'], undefined);
      assert.strictEqual(clientPkg.devDependencies['tw-animate-css'], undefined);
    }

    if (isTs) {
      assert.ok(clientPkg.devDependencies['typescript']);
      assert.ok(clientPkg.devDependencies['@types/react']);
      assert.ok(clientPkg.devDependencies['@types/react-dom']);
      assert.strictEqual(clientPkg.scripts.build, 'tsc -b && vite build');
    } else {
      assert.strictEqual(clientPkg.devDependencies?.['typescript'], undefined);
      assert.strictEqual(clientPkg.scripts.build, 'vite build');
    }
    assert.strictEqual(clientPkg.scripts.dev, 'vite');
    assert.strictEqual(clientPkg.scripts.lint, 'oxlint src --deny-warnings');
    assert.strictEqual(clientPkg.scripts.preview, 'vite preview');

    // 6. Server Package Manifest
    const serverPkg = JSON.parse(fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8'));
    assert.strictEqual(serverPkg.engines?.node, '>=20.12.0');
    assert.ok(serverPkg.dependencies['express']);
    assert.ok(serverPkg.dependencies['mongoose']);

    if (hasAuth) {
      assert.ok(serverPkg.dependencies['bcryptjs']);
      assert.ok(serverPkg.dependencies['jsonwebtoken']);
      assert.ok(serverPkg.dependencies['express-rate-limit']);
    } else {
      assert.strictEqual(serverPkg.dependencies['bcryptjs'], undefined);
      assert.strictEqual(serverPkg.dependencies['jsonwebtoken'], undefined);
      assert.strictEqual(serverPkg.dependencies['express-rate-limit'], undefined);
    }

    if (isTs) {
      assert.ok(serverPkg.devDependencies['typescript']);
      assert.ok(serverPkg.devDependencies['tsx']);
      assert.ok(serverPkg.devDependencies['@types/node']);
      assert.ok(serverPkg.devDependencies['@types/express']);
      if (hasAuth) {
        assert.ok(serverPkg.devDependencies['@types/jsonwebtoken']);
      } else {
        assert.strictEqual(serverPkg.devDependencies['@types/jsonwebtoken'], undefined);
        assert.strictEqual(serverPkg.devDependencies['@types/bcryptjs'], undefined);
      }
      assert.strictEqual(serverPkg.scripts.dev, 'tsx watch --env-file-if-exists=.env index.ts');
      assert.strictEqual(serverPkg.scripts.build, 'tsc');
      assert.strictEqual(serverPkg.scripts.start, 'node --env-file-if-exists=.env dist/index.js');
      assert.strictEqual(serverPkg.scripts.lint, 'oxlint index.ts src --deny-warnings');
    } else {
      assert.strictEqual(serverPkg.devDependencies?.['typescript'], undefined);
      assert.strictEqual(serverPkg.devDependencies?.['tsx'], undefined);
      assert.strictEqual(serverPkg.scripts.dev, 'node --watch --env-file-if-exists=.env index.js');
      assert.strictEqual(serverPkg.scripts.build, 'node --check index.js');
      assert.strictEqual(serverPkg.scripts.start, 'node --env-file-if-exists=.env index.js');
      assert.strictEqual(serverPkg.scripts.lint, 'oxlint index.js src --deny-warnings');
    }

    // 7. Auth Wiring vs Pruning Contents
    const appContent = fs.readFileSync(path.join(clientDir, `src/App.${ext}`), 'utf8');
    const navbarContent = fs.readFileSync(path.join(clientDir, `src/layout/slices/Navbar.${ext}`), 'utf8');
    const apiRoutesContent = fs.readFileSync(path.join(serverDir, `src/routes/api.routes.${scriptExt}`), 'utf8');
    const apiControllerContent = fs.readFileSync(path.join(serverDir, `src/controllers/api.controller.${scriptExt}`), 'utf8');
    const envContent = fs.readFileSync(path.join(serverDir, '.env'), 'utf8');
    const envExampleContent = fs.readFileSync(path.join(serverDir, '.env.example'), 'utf8');

    if (hasAuth) {
      assert.ok(appContent.includes('AuthenticatedDashboard'));
      assert.ok(appContent.includes('/login'));
      assert.ok(appContent.includes('/signup'));
      assert.ok(appContent.includes('/dashboard'));

      assert.ok(navbarContent.includes('/login'));
      assert.ok(navbarContent.includes('/signup'));
      assert.ok(navbarContent.includes('/dashboard'));

      assert.ok(apiRoutesContent.includes('authRoutes'));
      assert.ok(apiRoutesContent.includes('/auth'));
      assert.ok(apiRoutesContent.includes('requireToken'));
      assert.ok(apiRoutesContent.includes('requireRole'));

      assert.ok(apiControllerContent.includes('user.service'));
      assert.ok(apiControllerContent.includes('getUsers'));

      assert.ok(/JWT_SECRET=[0-9a-f]{96}/.test(envContent), 'server/.env must have 96-hex JWT_SECRET');
      assert.ok(envExampleContent.includes('JWT_SECRET='));
    } else {
      assert.strictEqual(appContent.includes('AuthenticatedDashboard'), false);
      assert.strictEqual(appContent.includes('/login'), false);
      assert.strictEqual(appContent.includes('/signup'), false);
      assert.strictEqual(appContent.includes('/dashboard'), false);

      assert.strictEqual(navbarContent.includes('/login'), false);
      assert.strictEqual(navbarContent.includes('/signup'), false);
      assert.strictEqual(navbarContent.includes('/dashboard'), false);

      assert.strictEqual(apiRoutesContent.includes('authRoutes'), false);
      assert.strictEqual(apiRoutesContent.includes('/auth'), false);
      assert.strictEqual(apiRoutesContent.includes('requireToken'), false);
      assert.strictEqual(apiRoutesContent.includes('requireRole'), false);

      assert.strictEqual(apiControllerContent.includes('user.service'), false);
      assert.strictEqual(apiControllerContent.includes('getUsers'), false);

      assert.strictEqual(envContent.includes('JWT_SECRET'), false);
      assert.strictEqual(envExampleContent.includes('JWT_SECRET'), false);
    }

    // 8. Zero Unresolved Relative Imports
    verifyRelativeImports(clientDir);
    verifyRelativeImports(serverDir);
  }

  it('P1: JS + Auth + shadcn', async () => {
    const perm = await scaffoldPermutation('p1-js-auth-shadcn', {
      lang: 'js',
      auth: true,
      styling: 'shadcn'
    });
    verifyPermutation(perm);
  });

  it('P2: JS + Auth + Tailwind', async () => {
    const perm = await scaffoldPermutation('p2-js-auth-tailwind', {
      lang: 'js',
      auth: true,
      styling: 'tailwind'
    });
    verifyPermutation(perm);
  });

  it('P3: JS + No-Auth + shadcn', async () => {
    const perm = await scaffoldPermutation('p3-js-noauth-shadcn', {
      lang: 'js',
      auth: false,
      styling: 'shadcn'
    });
    verifyPermutation(perm);
  });

  it('P4: JS + No-Auth + Tailwind', async () => {
    const perm = await scaffoldPermutation('p4-js-noauth-tailwind', {
      lang: 'js',
      auth: false,
      styling: 'tailwind'
    });
    verifyPermutation(perm);
  });

  it('P5: TS + Auth + shadcn', async () => {
    const perm = await scaffoldPermutation('p5-ts-auth-shadcn', {
      lang: 'ts',
      auth: true,
      styling: 'shadcn'
    });
    verifyPermutation(perm);
  });

  it('P6: TS + Auth + Tailwind', async () => {
    const perm = await scaffoldPermutation('p6-ts-auth-tailwind', {
      lang: 'ts',
      auth: true,
      styling: 'tailwind'
    });
    verifyPermutation(perm);
  });

  it('P7: TS + No-Auth + shadcn', async () => {
    const perm = await scaffoldPermutation('p7-ts-noauth-shadcn', {
      lang: 'ts',
      auth: false,
      styling: 'shadcn'
    });
    verifyPermutation(perm);
  });

  it('P8: TS + No-Auth + Tailwind', async () => {
    const perm = await scaffoldPermutation('p8-ts-noauth-tailwind', {
      lang: 'ts',
      auth: false,
      styling: 'tailwind'
    });
    verifyPermutation(perm);
  });
});
