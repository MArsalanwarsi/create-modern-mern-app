#!/usr/bin/env node

import { runCli } from '../src/cli.js';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: create-fullstack-mern [project-name]

Options:
  -v, --version    Output the current version
  -h, --help       Display this help message
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log('create-fullstack-mern v1.0.0');
  process.exit(0);
}

runCli(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
