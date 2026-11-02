#!/usr/bin/env node

import pkg from '../package.json' with { type: 'json' };
import { runCli } from '../src/cli.js';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: create-modern-mern-app [project-name]

Options:
  -v, --version    Output the current version
  -h, --help       Display this help message
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log(`create-modern-mern-app v${pkg.version}`);
  process.exit(0);
}

runCli(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
