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
import { formatStepHeader } from './ui/theme.js';
import { renderConfigSummary, renderCompletionCard } from './ui/summary.js';

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
 * Implements the 6-step prompt sequence with Charm Lip Gloss styling and responsive robot mascot banner.
 *
 * @param {string[]} [argv=process.argv]
 */
export async function runCli(argv = process.argv) {
  const cliArgs = parseCliArgs(argv);

  // 1. Display Responsive Robot Mascot ASCII Banner
  const cols = typeof process !== 'undefined' && process.stdout?.columns ? process.stdout.columns : 80;
  if (typeof renderBanner === 'function') {
    console.log(renderBanner(cols));
    console.log();
  }

  let projectName = cliArgs.projectName;

  if (!projectName && !cliArgs.yes) {
    const namePrompt = await p.text({
      message: formatStepHeader(1, 6, 'PROJECT', 'Name your workspace directory', cols),
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
      message: formatStepHeader(2, 6, 'STACK', 'Choose language & compiler', cols),
      options: [
        {
          value: 'ts-compiler',
          label: 'TypeScript + React Compiler',
          hint: 'React 19 memoization compiler + TypeScript (Recommended)'
        },
        {
          value: 'ts',
          label: 'TypeScript',
          hint: 'Vite + React TypeScript client & Node.js tsx server'
        },
        {
          value: 'js-compiler',
          label: 'JavaScript + React Compiler',
          hint: 'React 19 memoization compiler + modern ES Modules'
        },
        {
          value: 'js',
          label: 'JavaScript',
          hint: 'Native ES Modules + JavaScript'
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
      message: formatStepHeader(3, 6, 'STYLING', 'Choose UI & styling framework', cols),
      options: [
        {
          value: 'shadcn',
          label: 'shadcn/ui + Tailwind CSS',
          hint: 'Ready-made dashboard-01, login-01, signup-01 blocks (Recommended)'
        },
        {
          value: 'tailwind',
          label: 'Tailwind CSS only',
          hint: 'Tailwind CSS v4 Vite setup without pre-built UI components'
        },
        {
          value: 'css',
          label: 'Plain CSS',
          hint: 'Standard modular CSS without Tailwind'
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
      message: formatStepHeader(4, 6, 'AUTH', 'Enable authentication system?', cols),
      active: 'JWT Cookie Auth (with role middleware)',
      inactive: 'No Auth (minimal starter)',
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
      message: formatStepHeader(5, 6, 'ADD-ONS', 'Select extra libraries & integrations', cols),
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
      message: formatStepHeader(6, 6, 'INSTALL', 'Install dependencies now?', cols),
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

  if (typeof renderConfigSummary === 'function') {
    console.log('\n' + renderConfigSummary(generatorOptions, { columns: cols }) + '\n');
  }

  const s = p.spinner();
  s.start('Forging your modern MERN workspace...');

  const clientDir = path.join(targetDir, 'client');
  const serverDir = path.join(targetDir, 'server');

  fs.mkdirSync(clientDir, { recursive: true });
  fs.mkdirSync(serverDir, { recursive: true });

  await generateClient(clientDir, generatorOptions);
  await generateServer(serverDir, { ...generatorOptions, language: backendLang, addOns: serverAddOns });
  await generateRoot(targetDir, projectName, generatorOptions);

  s.stop(pc.green('Workspace structure forged successfully!'));

  if (shouldInstall) {
    p.log.info(pc.cyan('Installing dependencies across root, client, and server...'));
    const result = await runInstall(targetDir);
    if (result.success) {
      p.log.success(pc.green('All dependencies installed successfully!'));
    } else {
      process.exitCode = 1;
      p.outro(pc.yellow(`Installation failed: ${result.error}. Run "npm install" at workspace root to retry.`));
      return;
    }
  }

  if (typeof renderCompletionCard === 'function') {
    console.log('\n' + renderCompletionCard(generatorOptions) + '\n');
  }

  p.outro(pc.cyan(`Ready to build! Navigate to your project: cd "${projectName}"`));
}
