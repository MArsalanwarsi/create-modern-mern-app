/**
 * Charm Lip Gloss aesthetic theme and terminal presentation engine.
 * Pure zero-dependency implementation using picocolors and node:util.
 */

import { stripVTControlCharacters } from 'node:util';
import pc from 'picocolors';

/**
 * Unicode rounded box drawing glyphs.
 */
export const BORDER_CHARS_ROUNDED = Object.freeze({
  tl: '╭',
  tr: '╮',
  bl: '╰',
  br: '╯',
  h: '─',
  v: '│'
});

/**
 * Standard ASCII fallback glyphs for legacy terminals.
 */
export const BORDER_CHARS_ASCII = Object.freeze({
  tl: '+',
  tr: '+',
  bl: '+',
  br: '+',
  h: '-',
  v: '|'
});

/**
 * Detects whether the current terminal supports Unicode characters.
 * @returns {boolean}
 */
export function isUnicodeSupported() {
  if (process.env.NO_UNICODE === '1' || process.env.NODE_ENV === 'test-no-unicode') {
    return false;
  }
  if (process.platform !== 'win32') {
    return process.env.TERM !== 'linux';
  }
  return Boolean(process.env.CI)
    || Boolean(process.env.WT_SESSION)
    || Boolean(process.env.TERMINUS_SUBLIME)
    || process.env.ConEmuTask === '{cmd::Cmder}'
    || process.env.TERM_PROGRAM === 'Terminus-Sublime'
    || process.env.TERM_PROGRAM === 'vscode'
    || process.env.TERM === 'xterm-256color'
    || process.env.TERM === 'alacritty'
    || process.env.TERMINAL_EMULATOR === 'JetBrains-JediTerm';
}

/**
 * Strips ANSI/VT control characters from a string using Node.js built-in utility.
 * @param {string} str
 * @returns {string}
 */
export function stripAnsi(str) {
  return stripVTControlCharacters(str ?? '');
}

/**
 * Returns the visible terminal column width of a string.
 * @param {string} str
 * @returns {number}
 */
export function visibleWidth(str) {
  return stripAnsi(str).length;
}

/**
 * Creates a high-contrast Charm-style pill badge.
 * @param {string} text
 * @param {'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger' | 'muted' | 'step' | 'category' | 'ready' | 'recommended' | 'cancel'} [style='primary']
 * @returns {string}
 */
export function createBadge(text, style = 'primary') {
  const content = ` ${text} `;
  switch (style) {
    case 'primary':
    case 'step':
      return pc.bgCyan(pc.black(pc.bold(content)));
    case 'secondary':
    case 'category':
      return pc.bgMagenta(pc.white(pc.bold(content)));
    case 'success':
    case 'ready':
      return pc.bgGreen(pc.black(pc.bold(content)));
    case 'warning':
    case 'recommended':
      return pc.bgYellow(pc.black(pc.bold(content)));
    case 'info':
      return pc.bgBlue(pc.white(pc.bold(content)));
    case 'danger':
    case 'cancel':
      return pc.bgRed(pc.white(pc.bold(content)));
    case 'muted':
      return pc.dim(`[${text}]`);
    default:
      return pc.bgCyan(pc.black(pc.bold(content)));
  }
}

/**
 * Creates a step counter pill badge header.
 * @param {number|string} step
 * @param {number|string} total
 * @param {string} [label]
 * @returns {string}
 */
export function createStepBadge(step, total, label = '') {
  const stepBadge = createBadge(`${step}/${total}`, 'primary');
  if (!label) return stepBadge;
  return `${stepBadge} ${createBadge(label.toUpperCase(), 'secondary')}`;
}

/**
 * Formats step header badge message for @clack/prompts.
 * @param {number} step
 * @param {number} total
 * @param {string} category
 * @param {string} title
 * @param {number} [columns]
 * @returns {string}
 */
export function formatStepHeader(step, total, category, title, columns = (typeof process !== 'undefined' && process.stdout?.columns ? process.stdout.columns : 80)) {
  const stepText = `${step}/${total}`;
  const stepBadge = createBadge(stepText, 'primary');

  if (columns < 60) {
    return `${stepBadge} ${pc.cyan(pc.bold(category.toUpperCase()))} ${pc.dim('·')} ${pc.bold(title)}`;
  }

  const catBadge = createBadge(category.toUpperCase(), 'secondary');
  return `${stepBadge} ${catBadge} ${pc.bold(title)}`;
}

/**
 * Renders content within a Charm Lip Gloss rounded box with guaranteed equal row widths.
 * @param {string | string[]} content
 * @param {object} [options]
 * @param {string} [options.title]
 * @param {string} [options.subtitle]
 * @param {Function} [options.borderColor=pc.cyan]
 * @param {number | { left?: number, right?: number }} [options.padding=2]
 * @param {number} [options.minWidth=48]
 * @param {number} [options.maxWidth]
 * @param {boolean} [options.rounded]
 * @returns {string}
 */
export function renderBox(content, options = {}) {
  const {
    title = '',
    subtitle = '',
    borderColor = pc.cyan,
    padding = 2,
    minWidth = 48,
    maxWidth = (typeof process !== 'undefined' && process.stdout?.columns ? process.stdout.columns : 80) - 2,
    rounded = isUnicodeSupported()
  } = options;

  const chars = rounded ? BORDER_CHARS_ROUNDED : BORDER_CHARS_ASCII;
  const lines = Array.isArray(content) ? content : String(content).split('\n');

  const padLeft = typeof padding === 'object' ? (padding.left ?? 2) : padding;
  const padRight = typeof padding === 'object' ? (padding.right ?? 2) : padding;

  let maxContentLen = minWidth;
  for (const line of lines) {
    const len = visibleWidth(line);
    if (len > maxContentLen) maxContentLen = len;
  }

  const titleLen = title ? visibleWidth(title) + 2 : 0;
  const subLen = subtitle ? visibleWidth(subtitle) + 2 : 0;
  const headerNeeded = titleLen + subLen + 4;
  if (headerNeeded > maxContentLen) maxContentLen = headerNeeded;

  if (maxWidth && maxContentLen > maxWidth - padLeft - padRight - 2) {
    maxContentLen = Math.max(30, maxWidth - padLeft - padRight - 2);
  }

  const innerWidth = maxContentLen + padLeft + padRight;

  // Build top border
  let top = '';
  if (title) {
    const titlePartLen = 1 + 1 + visibleWidth(title) + 1; // '─ ' + title + ' '
    let subPartLen = 0;
    if (subtitle) {
      subPartLen = 1 + visibleWidth(subtitle) + 1 + 1; // ' ' + subtitle + ' ─'
    }

    const dashesCount = innerWidth - titlePartLen - subPartLen;
    top = borderColor(chars.tl + chars.h + ' ') +
      title +
      borderColor(' ' + chars.h.repeat(Math.max(1, dashesCount))) +
      (subtitle ? ' ' + subtitle + borderColor(' ' + chars.h) : '') +
      borderColor(chars.tr);
  } else {
    top = borderColor(chars.tl + chars.h.repeat(innerWidth) + chars.tr);
  }

  // Build content rows
  const rows = [];
  rows.push(top);

  for (const line of lines) {
    const len = visibleWidth(line);
    const rightFill = maxContentLen - len;
    const row = borderColor(chars.v) +
      ' '.repeat(padLeft) +
      line +
      ' '.repeat(Math.max(0, rightFill)) +
      ' '.repeat(padRight) +
      borderColor(chars.v);
    rows.push(row);
  }

  // Build bottom border
  const bottom = borderColor(chars.bl + chars.h.repeat(innerWidth) + chars.br);
  rows.push(bottom);

  return rows.join('\n');
}
