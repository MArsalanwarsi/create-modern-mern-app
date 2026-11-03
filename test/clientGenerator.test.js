import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { generateClient } from '../src/generator/clientGenerator.js';

describe('clientGenerator', () => {
  const testDir = path.join(os.tmpdir(), 'test-client-scaffold-' + Date.now());

  before(() => fs.mkdirSync(testDir, { recursive: true }));
  after(() => fs.rmSync(testDir, { recursive: true, force: true }));

  it('scaffolds client with required sliced layouts, pages, and react-router-dom', async () => {
    await generateClient(testDir, {
      projectName: 'test-app',
      variant: 'ts',
      packages: ['tailwind', 'redux', 'toastify']
    });

    // Check directory structure
    assert.ok(fs.existsSync(path.join(testDir, 'src/components')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/pages/dashboard/Overview.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/pages/dashboard/Settings.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/pages/website/Home.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/pages/website/About.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/pages/website/Contact.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/layout/slices/Navbar.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/layout/slices/Sidebar.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/layout/WebsiteLayout.tsx')));
    assert.ok(fs.existsSync(path.join(testDir, 'src/layout/DashboardLayout.tsx')));

    // Check package.json dependencies
    const pkg = JSON.parse(fs.readFileSync(path.join(testDir, 'package.json'), 'utf8'));
    assert.strictEqual(pkg.engines?.node, '>=24.16.0');
    assert.ok(pkg.dependencies['react-router-dom']);
    assert.ok(pkg.dependencies['@reduxjs/toolkit']);
    assert.ok(pkg.dependencies['react-toastify']);
    assert.ok(pkg.devDependencies['tailwindcss']);

    // Check store import in TS
    const storeContent = fs.readFileSync(path.join(testDir, 'src/store/index.ts'), 'utf8');
    assert.ok(!storeContent.includes("counterSlice.'"));
    assert.ok(storeContent.includes("counterSlice'"));
  });

  it('scaffolds javascript variant correctly', async () => {
    const jsDir = path.join(testDir, 'js-client');
    fs.mkdirSync(jsDir, { recursive: true });

    await generateClient(jsDir, {
      projectName: 'test-js-app',
      variant: 'js-compiler',
      packages: ['tailwind', 'shadcn']
    });

    assert.ok(fs.existsSync(path.join(jsDir, 'src/pages/dashboard/Overview.jsx')));
    assert.ok(fs.existsSync(path.join(jsDir, 'src/layout/slices/Navbar.jsx')));
    assert.ok(fs.existsSync(path.join(jsDir, 'components.json')));
    assert.ok(fs.existsSync(path.join(jsDir, 'src/lib/utils.js')));

    // Check vite.config has no leading comma syntax error
    const viteConfig = fs.readFileSync(path.join(jsDir, 'vite.config.js'), 'utf8');
    assert.ok(!viteConfig.includes('react({,'));

    const pkg = JSON.parse(fs.readFileSync(path.join(jsDir, 'package.json'), 'utf8'));
    assert.strictEqual(pkg.engines?.node, '>=24.16.0');
    assert.ok(pkg.devDependencies['babel-plugin-react-compiler']);
  });

  it('scaffolds typescript with shadcn without trailing dot import in button.tsx', async () => {
    const tsShadcnDir = path.join(testDir, 'ts-shadcn-client');
    fs.mkdirSync(tsShadcnDir, { recursive: true });

    await generateClient(tsShadcnDir, {
      projectName: 'test-ts-shadcn',
      variant: 'ts-compiler',
      packages: ['shadcn']
    });

    const buttonContent = fs.readFileSync(path.join(tsShadcnDir, 'src/components/ui/button.tsx'), 'utf8');
    assert.ok(!buttonContent.includes("utils.'"));
    assert.ok(buttonContent.includes("utils'"));

    const viteConfig = fs.readFileSync(path.join(tsShadcnDir, 'vite.config.ts'), 'utf8');
    assert.ok(!viteConfig.includes('react({,'));
  });

  it('eliminates inline styles and dead Card component while adding official shadcn primitives and blocks', async () => {
    const modernDir = path.join(testDir, 'modern-client');
    fs.mkdirSync(modernDir, { recursive: true });

    await generateClient(modernDir, {
      projectName: 'modern-app',
      variant: 'ts',
      styling: 'shadcn',
      auth: true
    });

    // Dead Card does not exist, official ui/card exists
    assert.strictEqual(fs.existsSync(path.join(modernDir, 'src/components/Card.tsx')), false);
    assert.ok(fs.existsSync(path.join(modernDir, 'src/components/ui/card.tsx')));

    // New UI primitives exist
    assert.ok(fs.existsSync(path.join(modernDir, 'src/components/ui/badge.tsx')));
    assert.ok(fs.existsSync(path.join(modernDir, 'src/components/ui/table.tsx')));
    assert.ok(fs.existsSync(path.join(modernDir, 'src/components/ui/avatar.tsx')));

    // Official blocks exist
    assert.ok(fs.existsSync(path.join(modernDir, 'src/components/login-form.tsx')));
    assert.ok(fs.existsSync(path.join(modernDir, 'src/components/signup-form.tsx')));
    assert.ok(fs.existsSync(path.join(modernDir, 'src/components/auth/AuthForm.tsx')));

    // Overview uses the authenticated account and links to the protected directory
    const overview = fs.readFileSync(path.join(modernDir, 'src/pages/dashboard/Overview.tsx'), 'utf8');
    assert.ok(overview.includes('/dashboard/members'));

    // index.css has no hardcoded hex overrides
    const indexCss = fs.readFileSync(path.join(modernDir, 'src/index.css'), 'utf8');
    assert.ok(!indexCss.includes('#f8fafc'));
    assert.ok(!indexCss.includes('#0f172a'));
    assert.ok(indexCss.includes('@layer base'));
    assert.ok(indexCss.includes('@apply bg-background text-foreground;'));

    // SidebarSlice uses safe optional chaining for user
    const sidebar = fs.readFileSync(path.join(modernDir, 'src/layout/slices/Sidebar.tsx'), 'utf8');
    assert.ok(sidebar.includes("user?.name || 'Workspace Member'"));
    assert.ok(sidebar.includes("user?.email"));
    assert.ok(!sidebar.includes('{user.name}'));
    assert.ok(!sidebar.includes('{user.email}'));
    assert.ok(sidebar.includes('export function Sidebar({ user }: { user?: WorkspaceUser | null })'));

    // TS block forms omit native onSubmit to avoid prop collision
    const loginForm = fs.readFileSync(path.join(modernDir, 'src/components/login-form.tsx'), 'utf8');
    assert.ok(loginForm.includes("Omit<React.ComponentPropsWithoutRef<'div'>, 'onSubmit'>"));
    const signupForm = fs.readFileSync(path.join(modernDir, 'src/components/signup-form.tsx'), 'utf8');
    assert.ok(signupForm.includes("Omit<React.ComponentPropsWithoutRef<'div'>, 'onSubmit'>"));

    // No inline styles across src/ files
    function checkNoInlineStyles(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkNoInlineStyles(fullPath);
        } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          assert.ok(!content.includes('style={{'), `File ${entry.name} should not contain inline styles`);
        }
      }
    }
    checkNoInlineStyles(path.join(modernDir, 'src'));
  });

  it('scaffolds auth: false correctly without auth routes or navbar auth buttons', async () => {
    const noAuthDir = path.join(testDir, 'noauth-client');
    fs.mkdirSync(noAuthDir, { recursive: true });

    await generateClient(noAuthDir, {
      projectName: 'noauth-app',
      variant: 'ts',
      auth: false,
      styling: 'shadcn'
    });

    const appContent = fs.readFileSync(path.join(noAuthDir, 'src/App.tsx'), 'utf8');
    assert.ok(!appContent.includes('/login'));
    assert.ok(!appContent.includes('/signup'));
    assert.ok(!appContent.includes('/dashboard'));
    assert.ok(!appContent.includes('AuthenticatedDashboard'));
    assert.ok(!appContent.includes('Account'));

    const navbarContent = fs.readFileSync(path.join(noAuthDir, 'src/layout/slices/Navbar.tsx'), 'utf8');
    assert.ok(!navbarContent.includes('/login'));
    assert.ok(!navbarContent.includes('/signup'));
    assert.ok(!navbarContent.includes('/dashboard'));

    // Verify dead auth/dashboard files are pruned
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/components/login-form.tsx')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/components/LoginForm.tsx')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/components/signup-form.tsx')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/components/SignupForm.tsx')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/components/auth/AuthForm.tsx')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/layout/DashboardLayout.tsx')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/layout/slices/Sidebar.tsx')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/layout/slices/Header.tsx')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/pages/dashboard/Overview.tsx')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/pages/dashboard/Settings.tsx')), false);
    assert.strictEqual(fs.existsSync(path.join(noAuthDir, 'src/pages/dashboard')), false);

    // Verify UI primitives remain intact
    assert.ok(fs.existsSync(path.join(noAuthDir, 'src/components/ui/button.tsx')));
    assert.ok(fs.existsSync(path.join(noAuthDir, 'components.json')));
  });

  it('scaffolds styling: css correctly with plain CSS and without Tailwind dependencies', async () => {
    const cssDir = path.join(testDir, 'css-client');
    fs.mkdirSync(cssDir, { recursive: true });

    await generateClient(cssDir, {
      projectName: 'css-app',
      variant: 'js',
      styling: 'css',
      auth: false
    });

    const pkg = JSON.parse(fs.readFileSync(path.join(cssDir, 'package.json'), 'utf8'));
    assert.strictEqual(pkg.devDependencies.tailwindcss, undefined);
    assert.strictEqual(pkg.devDependencies['@tailwindcss/vite'], undefined);
    assert.strictEqual(fs.existsSync(path.join(cssDir, 'components.json')), false);

    const viteConfig = fs.readFileSync(path.join(cssDir, 'vite.config.js'), 'utf8');
    assert.ok(!viteConfig.includes('tailwindcss()'));
  });

  it('scaffolds zero-dependency fallback Overview for non-shadcn styling with auth', async () => {
    const tailwindDir = path.join(testDir, 'tw-auth-client');
    fs.mkdirSync(tailwindDir, { recursive: true });
    await generateClient(tailwindDir, {
      projectName: 'tw-app',
      variant: 'ts',
      styling: 'tailwind',
      auth: true
    });
    const overviewTsx = path.join(tailwindDir, 'src/pages/dashboard/Overview.tsx');
    assert.ok(fs.existsSync(overviewTsx));
    const content = fs.readFileSync(overviewTsx, 'utf8');
    assert.ok(content.includes('/dashboard/members'));
    // Zero external UI primitives, Radix, or lucide-react imports
    assert.ok(!content.includes('lucide-react'));
    assert.ok(!content.includes('@radix-ui'));
    assert.ok(!content.includes('../../components/ui'));
  });

  it('resolves all relative imports cleanly across all 24 client permutations', async () => {
    const languages = ['js', 'ts', 'js-compiler', 'ts-compiler'];
    const stylings = ['shadcn', 'tailwind', 'css'];
    const authOpts = [true, false];

    for (const lang of languages) {
      for (const styling of stylings) {
        for (const auth of authOpts) {
          const dir = path.join(testDir, `perm-${lang}-${styling}-${auth}`);
          fs.mkdirSync(dir, { recursive: true });
          await generateClient(dir, {
            projectName: 'perm-app',
            language: lang,
            styling,
            auth
          });

          if (!auth) {
            assert.strictEqual(
              fs.existsSync(path.join(dir, 'src/pages/dashboard')),
              false,
              `src/pages/dashboard should not exist under auth: false [${lang}, ${styling}]`
            );
          }

          const checkDir = (curr) => {
            for (const ent of fs.readdirSync(curr, { withFileTypes: true })) {
              const p = path.join(curr, ent.name);
              if (ent.isDirectory()) {
                checkDir(p);
              } else if (/\.(jsx?|tsx?)$/.test(ent.name)) {
                const code = fs.readFileSync(p, 'utf8');
                const matches = code.matchAll(/from\s+['"](\.[^'"]+)['"]/g);
                for (const m of matches) {
                  const spec = m[1];
                  const base = path.resolve(path.dirname(p), spec);
                  const ex = [
                    base,
                    base + '.js',
                    base + '.jsx',
                    base + '.ts',
                    base + '.tsx',
                    path.join(base, 'index.js'),
                    path.join(base, 'index.jsx'),
                    path.join(base, 'index.ts'),
                    path.join(base, 'index.tsx')
                  ].some(c => fs.existsSync(c));
                  assert.ok(ex, `Unresolved import "${spec}" in ${path.relative(dir, p)} under [${lang}, ${styling}, auth:${auth}]`);
                }
              }
            }
          };
          checkDir(path.join(dir, 'src'));
        }
      }
    }
  });
});
