import fs from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import pc from 'picocolors';

import { validateTargetDir } from './utils/naming.js';
import { generateClient } from './generator/clientGenerator.js';
import { generateServer } from './generator/serverGenerator.js';
import { generateRoot } from './generator/rootGenerator.js';
import { runInstall } from './generator/installer.js';

import { renderBanner } from './ui/banner.js';
import { nextSteps } from './ui/summary.js';

/**
 * Graceful cancellation helper.
 * Throws ERR_CANCELLED instead of calling process.exit(0) directly
 * to allow test runners to test cancellation without terminating the runner.
 */
function handleCancel(value) {
  if (p.isCancel(value)) {
    p.cancel(pc.yellow('Setup cancelled. No files were generated.'));
    const err = new Error('Operation cancelled by user');
    err.code = 'ERR_CANCELLED';
    throw err;
  }
  return value;
}

/**
 * Lightweight, zero-dependency CLI arguments parser.
 * Supports flags: -y/--yes, -l/--language, -s/--styling, --auth/--no-auth, --install/--no-install.
 *
 * @param {string[]} [argv=process.argv]
 * @returns {object}
 */
export function parseCliArgs(argv = process.argv) {
  const args = argv.slice(2);
  const flags = {
    projectName: undefined,
    yes: false,
    language: undefined,
    styling: undefined,
    auth: undefined,
    install: undefined
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-y' || arg === '--yes') {
      flags.yes = true;
    } else if (arg === '--auth') {
      flags.auth = true;
    } else if (arg === '--no-auth') {
      flags.auth = false;
    } else if (arg === '--install') {
      flags.install = true;
    } else if (arg === '--no-install') {
      flags.install = false;
    } else if (arg === '--language' || arg === '-l') {
      flags.language = args[++i];
    } else if (arg.startsWith('--language=')) {
      flags.language = arg.split('=')[1];
    } else if (arg === '--styling' || arg === '-s') {
      flags.styling = args[++i];
    } else if (arg.startsWith('--styling=')) {
      flags.styling = arg.split('=')[1];
    } else if (!arg.startsWith('-') && !flags.projectName) {
      flags.projectName = arg;
    }
  }

  return flags;
}

/**
 * Main interactive CLI workflow.
 * Implements the 6-step prompt sequence with a responsive terminal header.
 *
 * @param {string[]} [argv=process.argv]
 */
export async function runCli(argv = process.argv) {
  const cliArgs = parseCliArgs(argv);

  const cols = typeof process !== 'undefined' && process.stdout?.columns ? process.stdout.columns : 80;
  if (typeof renderBanner === 'function') {
    console.log(renderBanner(cols));
    console.log();
  }

  let projectName = cliArgs.projectName;

  if (!projectName && !cliArgs.yes) {
    const namePrompt = await p.text({
      message: 'Project name:',
      placeholder: 'my-mern-app',
      defaultValue: 'my-mern-app',
      validate: (value) => {
        const trimmed = (value ?? '').trim();
        if (!trimmed) return 'Project name cannot be empty.';
        if (/[<>:"|?*]/.test(trimmed)) return 'Project name contains invalid characters.';
        const targetPath = path.resolve(process.cwd(), trimmed);
        const dirCheck = validateTargetDir(targetPath);
        if (!dirCheck.valid) return dirCheck.error;
      }
    });

    handleCancel(namePrompt);
    projectName = namePrompt.trim();
  } else if (!projectName) {
    projectName = 'my-mern-app';
  }

  const targetDir = path.resolve(process.cwd(), projectName);
  const dirCheck = validateTargetDir(targetDir);
  if (!dirCheck.valid) {
    p.cancel(pc.red(dirCheck.error));
    const err = new Error(dirCheck.error);
    err.code = 'ERR_DIR_COLLISION';
    throw err;
  }

  let language = cliArgs.language;

  if (!language && !cliArgs.yes) {
    const langPrompt = await p.select({
      message: 'Select a language:',
      options: [
        {
          value: 'ts-compiler',
          label: 'TypeScript + React Compiler',
          hint: 'recommended'
        },
        {
          value: 'ts',
          label: 'TypeScript',
          hint: 'standard TypeScript'
        },
        {
          value: 'js-compiler',
          label: 'JavaScript + React Compiler',
          hint: 'compiler enabled'
        },
        {
          value: 'js',
          label: 'JavaScript',
          hint: 'standard JavaScript'
        }
      ],
      initialValue: 'ts-compiler'
    });

    handleCancel(langPrompt);
    language = langPrompt;
  } else if (!language) {
    language = 'ts-compiler';
  }

  let styling = cliArgs.styling;

  if (!styling && !cliArgs.yes) {
    const stylingPrompt = await p.select({
      message: 'Select a styling option:',
      options: [
        {
          value: 'shadcn',
          label: 'shadcn/ui + Tailwind CSS',
          hint: 'styled components'
        },
        {
          value: 'tailwind',
          label: 'Tailwind CSS only',
          hint: 'utility classes'
        },
        {
          value: 'css',
          label: 'Plain CSS',
          hint: 'stylesheet'
        }
      ],
      initialValue: 'shadcn'
    });

    handleCancel(stylingPrompt);
    styling = stylingPrompt;
  } else if (!styling) {
    styling = 'shadcn';
  }

  let auth = cliArgs.auth;

  if (auth === undefined && !cliArgs.yes) {
    const authPrompt = await p.confirm({
      message: 'Include login and signup?',
      active: 'Yes',
      inactive: 'No',
      initialValue: true
    });

    handleCancel(authPrompt);
    auth = authPrompt;
  } else if (auth === undefined) {
    auth = true;
  }

  let packages;

  if (!cliArgs.yes) {
    const packagesPrompt = await p.multiselect({
      message: 'Select optional packages:',
      options: [
        { value: 'redux', label: 'Redux Toolkit', hint: 'Predictable state management (Client)' },
        { value: 'toastify', label: 'React-Toastify', hint: 'Rich toast notifications (Client)' },
        { value: 'cors', label: 'CORS', hint: 'Cross-Origin Resource Sharing (Server)' },
        { value: 'dotenv', label: 'dotenv', hint: 'Load environment variables from .env (Server)' },
        { value: 'multer', label: 'Multer', hint: 'Multipart file upload handling (Server)' },
        { value: 'cloudinary', label: 'Cloudinary', hint: 'Cloud media storage and CDN uploads (Server)' },
        { value: 'nodemailer', label: 'Nodemailer', hint: 'Email delivery utility via SMTP (Server)' }
      ],
      required: false,
      initialValues: ['toastify', 'cors', 'dotenv']
    });

    handleCancel(packagesPrompt);
    packages = packagesPrompt;
  } else {
    packages = ['toastify', 'cors', 'dotenv'];
  }

  let shouldInstall = cliArgs.install;

  if (shouldInstall === undefined && !cliArgs.yes) {
    const installPrompt = await p.confirm({
      message: 'Install dependencies now?',
      active: 'Install now',
      inactive: 'Scaffold only',
      initialValue: true
    });

    handleCancel(installPrompt);
    shouldInstall = installPrompt;
  } else if (shouldInstall === undefined) {
    shouldInstall = false;
  }

  const clientPackages = packages.filter(pkg => ['redux', 'toastify'].includes(pkg));
  const serverAddOns = packages.filter(pkg => ['cors', 'dotenv', 'multer', 'cloudinary', 'nodemailer'].includes(pkg));
  const backendLang = language.startsWith('ts') ? 'ts' : 'js';

  const generatorOptions = {
    projectName,
    targetDir,
    language,
    variant: language,     // Backward compatibility alias for clientGenerator
    backendLang,           // Backward compatibility alias for serverGenerator
    styling,
    auth,
    packages,              // Unified packages array adhering to GeneratorOptions
    clientPackages,        // Backward compatibility
    addOns: serverAddOns,  // Backward compatibility alias for serverGenerator
    serverAddOns,
    install: shouldInstall,
    shouldInstall
  };


  const s = p.spinner();
  s.start('Creating project files...');

  const clientDir = path.join(targetDir, 'client');
  const serverDir = path.join(targetDir, 'server');

  fs.mkdirSync(clientDir, { recursive: true });
  fs.mkdirSync(serverDir, { recursive: true });

  await generateClient(clientDir, generatorOptions);
  await generateServer(serverDir, { ...generatorOptions, language: backendLang, addOns: serverAddOns });
  await generateRoot(targetDir, projectName, generatorOptions);

  s.stop('Project files created.');

  if (shouldInstall) {
    p.log.info('Installing dependencies…');
    const result = await runInstall(targetDir);
    if (result.success) {
      p.log.success('Dependencies installed.');
    } else {
      process.exitCode = 1;
      p.outro(pc.yellow(`Installation failed: ${result.error}. Run "npm install" at workspace root to retry.`));
      return;
    }
  }

  p.outro(nextSteps(projectName, shouldInstall));
}
