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
  console.clear();
  p.intro(pc.bgCyan(pc.black(' create-fullstack-mern ')));

  // 1. Project name
  const rawArgName = argv.slice(2).find(arg => !arg.startsWith('-'));
  let projectName = rawArgName;

  if (!projectName) {
    const namePrompt = await p.text({
      message: 'What is your project name?',
      placeholder: 'my-mern-app',
      defaultValue: 'my-mern-app',
      validate: (value) => {
        const trimmed = value.trim();
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
    message: 'Select a frontend variant:',
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
    message: 'Select additional frontend packages (React Router DOM included by default):',
    options: [
      { value: 'tailwind', label: 'Tailwind CSS', hint: 'Utility-first styling' },
      { value: 'shadcn', label: 'Shadcn UI', hint: 'Component primitives (includes Tailwind)' },
      { value: 'redux', label: 'Redux Toolkit', hint: 'Predictable state management' },
      { value: 'toastify', label: 'React-Toastify', hint: 'Rich toast notifications' }
    ],
    required: false,
    initialValues: ['tailwind', 'toastify']
  });

  if (p.isCancel(clientPackages)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  // 4. Backend language
  const backendLang = await p.select({
    message: 'Select backend language:',
    options: [
      { value: 'js', label: 'JavaScript (Modern ES Modules)', hint: 'Native Node.js import/export' },
      { value: 'ts', label: 'TypeScript', hint: 'Node with tsx runner & full typings' }
    ]
  });

  if (p.isCancel(backendLang)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  // 5. Backend add-ons
  const serverAddOns = await p.multiselect({
    message: 'Select backend add-ons (Express + MongoDB included):',
    options: [
      { value: 'cors', label: 'CORS', hint: 'Cross-Origin Resource Sharing' },
      { value: 'dotenv', label: 'dotenv', hint: 'Environment variables' },
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
    message: 'Would you like to install dependencies now?',
    initialValue: true
  });

  if (p.isCancel(shouldInstall)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

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
    
    // Install root
    const rootRes = await runInstall(targetDir);
    // Install client
    const clientRes = await runInstall(clientDir);
    // Install server
    const serverRes = await runInstall(serverDir);

    if (rootRes.success && clientRes.success && serverRes.success) {
      p.log.success(pc.green('All dependencies installed successfully!'));
    } else {
      p.log.warn(pc.yellow('Automatic installation encountered an issue. You can run "npm run install:all" manually.'));
    }
  }

  // 9. Outro & Next Steps
  p.outro(pc.bold(pc.cyan('Next steps:')));
  console.log(`
  ${pc.bold(`cd ${projectName}`)}
  ${!shouldInstall ? `${pc.bold('npm run install:all')}\n  ` : ''}${pc.bold('npm run dev')}
  
  Frontend: ${pc.underline(pc.blue('http://localhost:3000'))}
  Backend:  ${pc.underline(pc.green('http://localhost:5000'))}
  `);
}
