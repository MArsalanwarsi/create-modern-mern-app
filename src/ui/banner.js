import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let pkgVersion = '3.0.0';
try {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8'));
  pkgVersion = pkg.version || '3.0.0';
} catch {
  // Safe fallback if package.json cannot be read
}

export const BANNER_BREAKPOINTS = Object.freeze({
  FULL: 68,
  COMPACT: 54
});

export const BANNER_DIMENSIONS = Object.freeze({
  FULL_WIDTH: 56,
  COMPACT_WIDTH: 44,
  MINIMAL_WIDTH: 31
});

/**
 * Generate full 6-armed robot mascot banner matching assets/logo.jpg.
 * Designed for terminal columns >= 68 (max line width: 56 chars).
 *
 * @param {string} [version]
 * @param {boolean} [plain]
 * @returns {string}
 */
export function getFullBanner(version = pkgVersion, plain = false) {
  if (plain) {
    return [
      '     (o) React                               (DB) Mongo',
      '       \\             _//.-------------.\\\\_             /',
      ' (*)   \\           /   .---------.   \\           /   (^)',
      '  \\____\\_________|  (  [■]   [■]  )  |____________/____/',
      ' Express            \\       ===       /             Vite',
      '                      \'-----------------\'',
      '                     /|   M O D E R N   |\\',
      '                    / |      M E R N    | \\',
      '                  [+] \'---------------\' [^]',
      '                       /=====\\     /=====\\',
      '',
      `          ◆  M O D E R N   M E R N  v${version}  ◆`,
      '       High-Performance Full-Stack CLI Scaffolder',
      '     React 19 · Vite · Express 5 · MongoDB'
    ].join('\n');
  }

  return [
    '     ' + pc.cyan(pc.bold('(⚛) React')) + '                               ' + pc.green(pc.bold('(🗄) Mongo')),
    '       ' + pc.cyan('\\') + '             ' + pc.dim('_//') + pc.white('.-------------.') + pc.dim('\\\\_') + '             ' + pc.green('/'),
    ' ' + pc.magenta(pc.bold('(⚙)')) + '   ' + pc.cyan('\\') + '           ' + pc.white('/   .---------.   \\') + '           ' + pc.green('/') + '   ' + pc.yellow(pc.bold('(⚡)')),
    '  ' + pc.magenta('\\____') + pc.cyan('\\_________|') + pc.white('  (  ') + pc.cyan(pc.bold('[■]   [■]')) + pc.white('  )  |') + pc.green('____________/') + pc.yellow('____/'),
    ' ' + pc.magenta('Express') + '            ' + pc.white('\\       ') + pc.cyan('===') + pc.white('       /') + '             ' + pc.yellow('Vite'),
    '                      ' + pc.dim('\'-----------------\''),
    '                     ' + pc.white('/|   ') + pc.bold(pc.cyan('M O D E R N')) + pc.white('   |\\'),
    '                    ' + pc.white('/ |      ') + pc.bold(pc.white('M E R N')) + pc.white('    | \\'),
    '                  ' + pc.magenta('[🔧]') + pc.dim(' \'---------------\' ') + pc.yellow('[⚡]'),
    '                       ' + pc.dim('/=====\\     /=====\\'),
    '',
    '          ' + pc.bold(pc.cyan('◆')) + pc.bold(pc.white('  M O D E R N   M E R N  ')) + pc.dim(`v${version}`) + '  ' + pc.bold(pc.cyan('◆')),
    '       ' + pc.dim('High-Performance Full-Stack CLI Scaffolder'),
    '     ' + pc.cyan('⚛ React 19') + pc.dim(' · ') + pc.yellow('⚡ Vite') + pc.dim(' · ') + pc.magenta('⚙ Express 5') + pc.dim(' · ') + pc.green('🗄 MongoDB')
  ].join('\n');
}

/**
 * Generate compact robot visor banner.
 * Designed for terminal columns between 54 and 67 (max line width: 44 chars).
 *
 * @param {string} [version]
 * @param {boolean} [plain]
 * @returns {string}
 */
export function getCompactBanner(version = pkgVersion, plain = false) {
  if (plain) {
    return [
      '             _//.---------.\\\\_',
      '            |  ( [■]   [■] )  |',
      '             \\     ===     /',
      '              \'-------------\'',
      `        ◆  MODERN MERN  v${version}  ◆`,
      '    React · Vite · Express · Mongo'
    ].join('\n');
  }

  return [
    '             ' + pc.dim('_//') + pc.white('.---------.') + pc.dim('\\\\_'),
    '            ' + pc.white('|  ( ') + pc.bold(pc.cyan('[■]   [■]')) + pc.white(' )  |'),
    '             ' + pc.white('\\     ') + pc.cyan('===') + pc.white('     /'),
    '              ' + pc.dim('\'-------------\''),
    '        ' + pc.bold(pc.cyan('◆')) + pc.bold(pc.white('  MODERN MERN  ')) + pc.dim(`v${version}`) + '  ' + pc.bold(pc.cyan('◆')),
    '    ' + pc.cyan('⚛ React') + pc.dim(' · ') + pc.yellow('⚡ Vite') + pc.dim(' · ') + pc.magenta('⚙ Express') + pc.dim(' · ') + pc.green('🗄 Mongo')
  ].join('\n');
}

/**
 * Generate minimal single-line badge or plain text fallback.
 * Designed for terminal columns < 54 or non-TTY / NO_COLOR environments.
 *
 * @param {string} [version]
 * @param {boolean} [plain]
 * @returns {string}
 */
export function getMinimalBanner(version = pkgVersion, plain = false) {
  if (plain) {
    return [
      `create-modern-mern-app v${version}`,
      'High-Performance Full-Stack MERN Scaffolder',
      'React + Express + MongoDB + Vite'
    ].join('\n');
  }

  return [
    pc.cyan(pc.bold('[■_■]')) + ' ' + pc.bold(pc.white('MODERN MERN')) + ' ' + pc.dim(`v${version}`),
    pc.dim('High-Performance Full-Stack CLI Scaffolder'),
    pc.cyan('React') + pc.dim(' · ') + pc.yellow('Vite') + pc.dim(' · ') + pc.magenta('Express') + pc.dim(' · ') + pc.green('Mongo')
  ].join('\n');
}

/**
 * Renders the responsive ANSI-colored Modern MERN robot mascot banner.
 *
 * @param {number} [columns] - Terminal width in columns.
 * @param {object} [options] - Rendering options.
 * @param {string} [options.version] - Version string override.
 * @param {boolean} [options.isTTY] - TTY state override.
 * @param {boolean} [options.plain] - Force plain text without ANSI codes.
 * @returns {string} Rendered banner string.
 */
export function renderBanner(columns, options = {}) {
  const cols = columns ?? (typeof process !== 'undefined' && process.stdout?.columns ? process.stdout.columns : 80);
  const isTTY = options.isTTY ?? (typeof process !== 'undefined' ? Boolean(process.stdout?.isTTY) : true);
  const version = options.version ?? pkgVersion;
  const isColorDisabled = options.plain || !isTTY || (typeof process !== 'undefined' && Boolean(process.env.NO_COLOR));

  if (!isTTY || isColorDisabled) {
    return getMinimalBanner(version, true);
  }

  if (cols >= BANNER_BREAKPOINTS.FULL) {
    return getFullBanner(version, false);
  }

  if (cols >= BANNER_BREAKPOINTS.COMPACT) {
    return getCompactBanner(version, false);
  }

  return getMinimalBanner(version, false);
}
