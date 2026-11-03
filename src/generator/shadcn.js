import { readFile } from 'node:fs/promises';

const primitives = [
  'avatar', 'badge', 'button', 'card', 'field', 'input', 'label', 'separator', 'sheet',
  'sidebar', 'skeleton', 'table', 'tooltip'
];

// Adapted from the shadcn/ui new-york-v4 login-01, signup-01 and dashboard-01
// registry blocks. Keep both source variants bundled for offline scaffolding.
export async function addShadcn(files, { isTs, hasAuth = true } = {}) {
  const variant = isTs ? 'ts' : 'js';
  const ext = isTs ? 'tsx' : 'jsx';

  const authTargets = hasAuth ? [
    ['login-form', `src/components/login-form.${ext}`],
    ['LoginForm', `src/components/LoginForm.${ext}`],
    ['signup-form', `src/components/signup-form.${ext}`],
    ['SignupForm', `src/components/SignupForm.${ext}`],
    ['AuthForm', `src/components/auth/AuthForm.${ext}`],
    ['DashboardLayout', `src/layout/DashboardLayout.${ext}`],
    ['SidebarSlice', `src/layout/slices/Sidebar.${ext}`],
    ['Header', `src/layout/slices/Header.${ext}`],
    ['Overview', `src/pages/dashboard/Overview.${ext}`]
  ] : [];

  const targets = [
    ...primitives.map(name => [name, `src/components/ui/${name}.${ext}`]),
    ['use-mobile', `src/hooks/use-mobile.${variant}`],
    ...authTargets
  ];

  const assets = [
    ...targets.map(([name, target]) => [`${variant}/${name}.tpl`, target]),
    ['shared/shadcn.css', 'src/styles/shadcn.css'],
    ['shared/LICENSE.shadcn', 'licenses/shadcn-ui.txt']
  ];
  await Promise.all(assets.map(async ([source, target]) => {
    const url = new URL(`./shadcn-assets/${source}`, import.meta.url);
    files[target] = await readFile(url, 'utf8');
  }));

  return {
    dependencies: { 'radix-ui': '^1.8.1' },
    devDependencies: { 'tw-animate-css': '^1.4.0' }
  };
}
