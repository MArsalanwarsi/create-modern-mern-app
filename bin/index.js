#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 1. Zero-dependency manifest resolution
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.resolve(__dirname, '../package.json');
let pkg = { name: 'create-modern-mern-app', version: '3.0.0' };

try {
  pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
} catch {
  // Safe fallback if package.json read fails
}

// 2. Fast-path CLI argument checks (Zero external dependencies)
const args = process.argv.slice(2);

if (args.includes('--version') || args.includes('-v')) {
  console.log(`${pkg.name} v${pkg.version}`);
  process.exit(0);
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: create-modern-mern-app [project-name] [options]

Options:
  -v, --version              Display the current version
  -h, --help                 Display this help message
  -y, --yes                  Scaffold with recommended defaults (non-interactive)
  -l, --language <variant>   Language & compiler (ts-compiler | ts | js-compiler | js)
  -s, --styling <framework>  Styling framework (shadcn | tailwind | css)
      --auth / --no-auth     Enable or disable JWT cookie authentication
      --install / --no-install  Run dependency installation after scaffolding

Examples:
  npx ${pkg.name} my-app
  npx ${pkg.name} my-app --yes
  npx ${pkg.name} my-app --language ts-compiler --styling shadcn --auth
`);
  process.exit(0);
}

// 3. Deferred dynamic import of interactive CLI engine
try {
  const { runCli } = await import('../src/cli.js');
  await runCli(process.argv);
} catch (err) {
  if (err?.code === 'ERR_CANCELLED') {
    process.exit(0);
  }

  if (err?.code === 'ERR_MODULE_NOT_FOUND') {
    console.error(`\n\x1b[31mError: Required dependencies are missing (${err.message}).\x1b[0m`);
    console.error(`\x1b[33mPlease run "npm install" inside ${path.resolve(__dirname, '..')} before running the CLI.\x1b[0m\n`);
    process.exit(1);
  }

  console.error('\n\x1b[31mScaffolding Error:\x1b[0m', err?.message || err);
  process.exit(1);
}
