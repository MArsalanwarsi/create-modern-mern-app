import pkg from '../package.json' with { type: 'json' };
import * as p from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import fs from 'node:fs';
import { validateTargetDir } from './utils/naming.js';
import { generateClient } from './generator/clientGenerator.js';
import { generateServer } from './generator/serverGenerator.js';
import { generateRoot } from './generator/rootGenerator.js';
import { runInstall } from './generator/installer.js';

export async function runCli(argv = process.argv) {
  const rawArgName = argv.slice(2).find(arg => !arg.startsWith('-'));
  const total = rawArgName ? 5 : 6;
  let step = 0;
  function question(section, title) {
    const position = String(++step).padStart(2, '0') + ' / 0' + total;
    return pc.bgCyan(pc.black(` ${position} `)) + '  ' + pc.cyan(section) + '  ' + pc.bold(title);
  }

  const compact = (process.stdout.columns ?? 80) < 54;
  const logo = compact ? '' : pc.cyan('  /\\    ');
  const banner = [
    logo + pc.bold('MODERN MERN'),
    (compact ? '' : pc.cyan(' /__\\   ')) + pc.dim('Full-stack workspace builder'),
    '',
    compact ? 'React + Express + MongoDB' : 'React + shadcn/ui    /    Express + MongoDB'
  ].join('\n');
  p.box(banner, pc.cyan(`CREATE  /  v${pkg.version}`), { formatBorder: pc.cyan });
  let projectName = rawArgName;

  if (!projectName) {
    const namePrompt = await p.text({
      message: question('Workspace', 'Name your project'),
      placeholder: 'my-mern-app',
      defaultValue: 'my-mern-app',
      validate: (value) => {
        const trimmed = (value ?? '').trim();
        if (!trimmed) return 'Project name cannot be empty.';
        const dirCheck = validateTargetDir(path.resolve(process.cwd(), trimmed));
        if (!dirCheck.valid) return dirCheck.error;
      }
    });

    if (p.isCancel(namePrompt)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
    projectName = namePrompt;
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  // Check target directory
  const dirCheck = validateTargetDir(targetDir);
  if (!dirCheck.valid) {
    p.cancel(pc.red(dirCheck.error));
    process.exit(1);
  }

  // 2. Frontend variant
  const variant = await p.select({
    message: question('Client', 'Choose a React starter'),
    options: [
      { value: 'js', label: 'JavaScript', hint: 'Fast Vite + React' },
      { value: 'js-compiler', label: 'JavaScript + React Compiler', hint: 'React 19 Compiler memoization' },
      { value: 'ts', label: 'TypeScript', hint: 'Vite + React with TypeScript' },
      { value: 'ts-compiler', label: 'TypeScript + React Compiler', hint: 'React 19 Compiler + TypeScript' }
    ]
  });

  if (p.isCancel(variant)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  // 3. Frontend packages
  const clientPackages = await p.multiselect({
    message: question('Client', 'Add client libraries'),
    options: [
      { value: 'redux', label: 'Redux Toolkit', hint: 'Predictable state management' },
      { value: 'toastify', label: 'React-Toastify', hint: 'Rich toast notifications' }
    ],
    required: false,
    initialValues: ['toastify']
  });

  if (p.isCancel(clientPackages)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  // 4. Backend language
  const backendLang = await p.select({
    message: question('Server', 'Choose a language'),
    options: [
      { value: 'js', label: 'JavaScript', hint: 'Native Node.js import/export' },
      { value: 'ts', label: 'TypeScript', hint: 'Node with tsx runner & full typings' }
    ]
  });

  if (p.isCancel(backendLang)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  // 5. Backend add-ons
  const serverAddOns = await p.multiselect({
    message: question('Server', 'Add integrations'),
    options: [
      { value: 'cors', label: 'CORS', hint: 'Cross-Origin Resource Sharing' },
      { value: 'dotenv', label: 'dotenv', hint: 'Load configuration from .env' },
      { value: 'multer', label: 'Multer', hint: 'File upload handling' },
      { value: 'cloudinary', label: 'Cloudinary', hint: 'Cloud media storage' },
      { value: 'nodemailer', label: 'Nodemailer', hint: 'Email service' }
    ],
    required: false,
    initialValues: ['cors', 'dotenv']
  });

  if (p.isCancel(serverAddOns)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  // 6. Install dependencies prompt
  const shouldInstall = await p.confirm({
    message: question('Install', 'Install packages now?'),
    active: 'Install now',
    inactive: 'Scaffold only',
    initialValue: true
  });

  if (p.isCancel(shouldInstall)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const additions = [...clientPackages, ...serverAddOns];
  p.note([
    pc.bold(projectName),
    '',
    `Client   ${variant.startsWith('ts') ? 'TypeScript' : 'JavaScript'}${variant.includes('compiler') ? ' + React Compiler' : ''} · shadcn/ui`,
    `Server   ${backendLang === 'ts' ? 'TypeScript' : 'JavaScript'} · Express · JWT auth`,
    `Extras   ${additions.join(', ') || 'None'}`
  ].join('\n'), pc.cyan('Your workspace'));

  // 7. Scaffolding execution
  const s = p.spinner();
  s.start('Scaffolding your MERN stack project...');

  const clientDir = path.join(targetDir, 'client');
  const serverDir = path.join(targetDir, 'server');

  fs.mkdirSync(clientDir, { recursive: true });
  fs.mkdirSync(serverDir, { recursive: true });

  await generateClient(clientDir, {
    projectName,
    variant,
    packages: clientPackages
  });

  await generateServer(serverDir, {
    projectName,
    language: backendLang,
    addOns: serverAddOns
  });

  await generateRoot(targetDir, projectName);

  s.stop(pc.green('Project structure created successfully!'));

  // 8. Optional installation
  if (shouldInstall) {
    p.log.info(pc.cyan('Installing dependencies in root, client, and server...'));
    
    const result = await runInstall(targetDir);
    if (result.success) {
      p.log.success(pc.green('All dependencies installed successfully!'));
    } else {
      process.exitCode = 1;
      p.outro(pc.yellow(`Installation failed: ${result.error}. From the generated root, run npm install to retry.`));
      return;
    }
  }

  const commands = [
    ...(projectName === '.' ? [] : [`cd "${projectName}"`]),
    ...(shouldInstall ? [] : ['npm install']),
    'npm run dev'
  ];
  p.note(commands.map(command => pc.bold(command)).join('\n'), pc.green('Start developing'));
  p.outro(`${pc.green('Workspace ready')}  ${pc.dim('·')}  http://localhost:3000`);
}
