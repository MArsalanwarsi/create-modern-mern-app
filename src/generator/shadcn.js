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

  const dashboardPrimitives = ['breadcrumb', 'chart', 'checkbox', 'drawer', 'dropdown-menu', 'select', 'tabs', 'toggle', 'toggle-group'];
  const dashboardComponents = ['chart-area-interactive', 'data-table', 'nav-documents', 'nav-main', 'nav-secondary', 'nav-user', 'section-cards'];
  const authTargets = hasAuth ? [
    ...dashboardPrimitives.map(name => [name, `src/components/ui/${name}.${ext}`]),
    ...dashboardComponents.map(name => [name, `src/components/${name}.${ext}`]),
    ['login-form', `src/components/login-form.${ext}`],
    ['signup-form', `src/components/signup-form.${ext}`],
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
    ...(hasAuth ? [['shared/data.json', 'src/pages/dashboard/data.json']] : []),
    ['shared/shadcn.css', 'src/styles/shadcn.css'],
    ['shared/LICENSE.shadcn', 'licenses/shadcn-ui.txt']
  ];
  await Promise.all(assets.map(async ([source, target]) => {
    const url = new URL(`./shadcn-assets/${source}`, import.meta.url);
    files[target] = await readFile(url, 'utf8');
  }));

  if (hasAuth) files['public/avatars/shadcn.jpg'] = await readFile(new URL('./shadcn-assets/shared/shadcn.jpg', import.meta.url));

  return {
    dependencies: {
      'radix-ui': '^1.8.1',
      '@fontsource-variable/geist': '^5.3.0',
      ...(hasAuth ? {
        '@dnd-kit/core': '^6.3.1',
        '@dnd-kit/modifiers': '^9.0.0',
        '@dnd-kit/sortable': '^10.0.0',
        '@dnd-kit/utilities': '^3.2.2',
        '@tabler/icons-react': '^3.50.0',
        '@tanstack/react-table': '^9.3.1',
        'zod': '^4.6.7',
        'sonner': '^2.0.8',
        'vaul': '^1.1.2',
        'recharts': '3.8.0'
      } : {})
    },
    devDependencies: { 'tw-animate-css': '^1.4.0' }
  };
}
