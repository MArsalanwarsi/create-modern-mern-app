/**
 * Configuration review and completion summary cards.
 * Implements Charm Lip Gloss styled cards for pre-scaffolding review and post-scaffolding launchpad.
 */

import pc from 'picocolors';
import { renderBox } from './theme.js';

/**
 * Formats and renders the pre-scaffolding configuration review card.
 * @param {object} config
 * @param {object} [options]
 * @param {string} [options.version='3.0.0']
 * @param {number} [options.columns]
 * @returns {string}
 */
export function renderConfigSummary(config = {}, options = {}) {
  const { version = '3.0.0', columns = (typeof process !== 'undefined' && process.stdout?.columns ? process.stdout.columns : 80) } = options;
  const isCompact = columns < 68;

  const labelWidth = isCompact ? 10 : 16;
  const label = (text) => pc.dim(text.padEnd(labelWidth, ' '));
  const highlight = (text) => pc.bold(pc.white(text));

  const variant = config.variant || config.language || 'ts-compiler';
  const langLabel = variant === 'ts-compiler'
    ? 'TypeScript + React 19 Compiler'
    : variant === 'ts'
    ? 'TypeScript (Vite + React)'
    : variant === 'js-compiler'
    ? 'JavaScript + React 19 Compiler'
    : 'JavaScript (Vite + React)';

  const styling = config.styling || 'shadcn';
  const stylingLabel = styling === 'shadcn'
    ? `shadcn/ui + Tailwind v4 ${pc.magenta('[dashboard, login, signup]')}`
    : styling === 'tailwind'
    ? 'Tailwind CSS v4'
    : 'Plain CSS';

  const isTsServer = config.backendLang === 'ts' || (typeof config.language === 'string' && config.language.startsWith('ts'));
  const backendLabel = `${isTsServer ? 'TypeScript' : 'JavaScript'} + Express 5`;

  const authEnabled = config.auth !== false;
  const authLabel = authEnabled
    ? `${pc.green('Enabled')} ${pc.dim('(JWT Cookies + Role Middleware)')}`
    : pc.dim('Disabled (Public API)');

  const clientPkgs = config.clientPackages || (config.packages ? config.packages.filter(p => ['redux', 'toastify'].includes(p)) : []);
  const serverAddOns = config.serverAddOns || (config.packages ? config.packages.filter(p => ['cors', 'dotenv', 'multer', 'cloudinary', 'nodemailer'].includes(p)) : []);
  const allAddOns = [...new Set([...clientPkgs, ...serverAddOns])];

  const extrasLabel = allAddOns.length > 0
    ? allAddOns.map(p => pc.cyan(p)).join(pc.dim(', '))
    : pc.dim('None');

  const shouldInstall = config.shouldInstall ?? config.install ?? false;
  const installLabel = shouldInstall
    ? `${pc.green('Yes')} ${pc.dim('(Automatic npm install)')}`
    : `${pc.yellow('No')} ${pc.dim('(Scaffold only)')}`;

  const projName = config.projectName || 'my-mern-app';
  const targetDirectory = config.targetDir || `./${projName}`;

  const rows = [
    '',
    `${label('Project')} : ${highlight(projName)}`,
    `${label('Directory')} : ${pc.dim(targetDirectory)}`,
    `${label('Frontend')} : ${langLabel}`,
    `${label('UI Styling')} : ${stylingLabel}`,
    `${label('Backend')} : ${backendLabel}`,
    `${label('Authentication')} : ${authLabel}`,
    `${label('Integrations')} : ${extrasLabel}`,
    `${label('Dependencies')} : ${installLabel}`,
    ''
  ];

  return renderBox(rows, {
    title: pc.bgCyan(pc.black(pc.bold(' CONFIGURATION REVIEW '))),
    subtitle: pc.dim(`v${version}`),
    borderColor: pc.cyan,
    padding: 2,
    minWidth: isCompact ? 48 : 66
  });
}

/**
 * Alias for renderConfigSummary matching feature spec naming.
 */
export function renderSummaryCard(config, options = {}) {
  return renderConfigSummary(config, options);
}

/**
 * Formats and renders the post-scaffolding completion launchpad card.
 * @param {object} options
 * @param {string} options.projectName
 * @param {boolean} [options.shouldInstall=true]
 * @param {boolean} [options.install]
 * @param {boolean} [options.hasAuth=true]
 * @param {boolean} [options.auth]
 * @param {boolean} [options.hasShadcn=true]
 * @param {string} [options.styling]
 * @param {number} [options.clientPort=3000]
 * @param {number} [options.serverPort=5000]
 * @param {number} [options.columns]
 * @returns {string}
 */
export function renderCompletionCard(options = {}) {
  const {
    projectName,
    shouldInstall = options.install ?? true,
    hasAuth = options.auth !== false,
    hasShadcn = options.styling ? options.styling === 'shadcn' : true,
    clientPort = 3000,
    serverPort = 5000,
    columns = (typeof process !== 'undefined' && process.stdout?.columns ? process.stdout.columns : 80)
  } = options;

  const bullet = pc.dim('•');
  const stepNum = (n) => pc.cyan(pc.bold(`${n}.`));

  const commands = [];
  let s = 1;
  if (projectName && projectName !== '.') {
    commands.push(`  ${stepNum(s++)}  ${pc.bold(`cd ${projectName}`)}`);
  }
  if (!shouldInstall) {
    commands.push(`  ${stepNum(s++)}  ${pc.bold('npm install')}`);
  }
  commands.push(`  ${stepNum(s++)}  ${pc.bold(pc.green('npm run dev'))}`);

  const rows = [
    '',
    `  ${pc.bold(pc.green('✔'))}  ${pc.bold('Your MERN full-stack workspace is ready!')}`,
    '',
    `  ${pc.bold(pc.cyan('Next Steps:'))}`,
    ...commands,
    '',
    `  ${pc.bold(pc.cyan('Development URLs:'))}`,
    `    ${bullet}  ${pc.dim('Client :')}  ${pc.underline(pc.cyan(`http://localhost:${clientPort}`))}`,
    `    ${bullet}  ${pc.dim('Server :')}  ${pc.underline(pc.cyan(`http://localhost:${serverPort}/api`))}`,
    `    ${bullet}  ${pc.dim('Health :')}  ${pc.underline(pc.cyan(`http://localhost:${serverPort}/api/health`))}`
  ];

  if (hasAuth) {
    rows.push(
      '',
      `  ${pc.bold(pc.magenta('Auth Endpoints:'))}`,
      `    ${bullet}  ${pc.dim('Login  :')}  ${pc.underline(pc.dim(`http://localhost:${clientPort}/login`))}`,
      `    ${bullet}  ${pc.dim('Signup :')}  ${pc.underline(pc.dim(`http://localhost:${clientPort}/signup`))}`
    );
  }

  if (hasShadcn && hasAuth) {
    rows.push(
      '',
      `  ${pc.bold(pc.magenta('Ready-Made Blocks:'))}`,
      `    ${bullet}  ${pc.dim('Dashboard :')}  ${pc.underline(pc.dim(`http://localhost:${clientPort}/dashboard`))}`
    );
  }

  rows.push('');

  return renderBox(rows, {
    title: pc.bgGreen(pc.black(pc.bold(' WORKSPACE READY '))),
    subtitle: pc.bold(pc.green('✔ SUCCESS')),
    borderColor: pc.green,
    padding: 2,
    minWidth: columns < 68 ? 50 : 66
  });
}
