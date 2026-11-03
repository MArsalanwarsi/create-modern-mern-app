import { describe, it } from 'node:test';
import assert from 'node:assert';
import pc from 'picocolors';
import {
  stripAnsi,
  visibleWidth,
  createBadge,
  createStepBadge,
  formatStepHeader,
  renderBox,
  isUnicodeSupported
} from '../src/ui/theme.js';
import {
  renderConfigSummary,
  renderSummaryCard,
  renderCompletionCard
} from '../src/ui/summary.js';

describe('UI: Charm Lip Gloss Theme & Cards (F2)', () => {
  it('strips ANSI escape codes accurately', () => {
    const raw = pc.bgCyan(pc.black(pc.bold(' TEST ')));
    assert.strictEqual(stripAnsi(raw), ' TEST ');
    assert.strictEqual(visibleWidth(raw), 6);
  });

  it('generates high-contrast pill badges for all styles', () => {
    const styles = ['primary', 'secondary', 'success', 'warning', 'info', 'danger', 'muted', 'step', 'category'];
    for (const style of styles) {
      const badge = createBadge('TEST', style);
      assert.ok(badge.includes('TEST'));
      assert.ok(visibleWidth(badge) >= 6);
    }
  });

  it('creates step counter badge headers', () => {
    const badge = createStepBadge(1, 6, 'project');
    assert.ok(badge.includes('1/6'));
    assert.ok(badge.includes('PROJECT'));
  });

  it('renders step headers with double badge on wide displays', () => {
    const header = formatStepHeader(1, 6, 'Project', 'Name your workspace', 80);
    assert.ok(header.includes('1/6'));
    assert.ok(header.includes('PROJECT'));
    assert.ok(header.includes('Name your workspace'));
  });

  it('renders step headers in compact format on narrow displays', () => {
    const header = formatStepHeader(1, 6, 'Project', 'Name your workspace', 50);
    assert.ok(header.includes('1/6'));
    assert.ok(header.includes('PROJECT'));
    assert.ok(header.includes('·'));
  });

  it('detects Unicode capability without errors', () => {
    const supported = isUnicodeSupported();
    assert.strictEqual(typeof supported, 'boolean');
  });

  it('renders rounded box with perfectly equal row widths', () => {
    const boxOutput = renderBox(['Line one', 'Line two is longer', 'Line 3'], {
      title: 'TITLE',
      subtitle: 'SUB',
      rounded: true,
      minWidth: 40
    });

    const lines = boxOutput.split('\n');
    assert.ok(lines.length >= 5);
    const expectedWidth = visibleWidth(lines[0]);

    for (let i = 0; i < lines.length; i++) {
      const w = visibleWidth(lines[i]);
      assert.strictEqual(
        w,
        expectedWidth,
        `Line ${i} width (${w}) does not match expected width (${expectedWidth})`
      );
    }
  });

  it('renders ASCII box fallback when rounded is false', () => {
    const boxOutput = renderBox(['Test row'], {
      title: 'TEST',
      rounded: false
    });
    assert.ok(stripAnsi(boxOutput).startsWith('+'));
    assert.ok(stripAnsi(boxOutput).endsWith('+'));
  });

  it('renders configuration summary card with uniform row widths', () => {
    const card = renderConfigSummary({
      projectName: 'acme-app',
      targetDir: 'C:\\acme-app',
      variant: 'ts-compiler',
      styling: 'shadcn',
      backendLang: 'ts',
      auth: true,
      packages: ['redux', 'toastify', 'cors', 'dotenv', 'multer'],
      shouldInstall: true
    }, { version: '3.0.0' });

    const lines = card.split('\n');
    const width = visibleWidth(lines[0]);
    for (let i = 0; i < lines.length; i++) {
      assert.strictEqual(visibleWidth(lines[i]), width, `Config card line ${i} width mismatch`);
    }
  });

  it('renderSummaryCard alias works identical to renderConfigSummary', () => {
    const card1 = renderConfigSummary({ projectName: 'test-app' }, { version: '3.0.0' });
    const card2 = renderSummaryCard({ projectName: 'test-app' }, { version: '3.0.0' });
    assert.strictEqual(card1, card2);
  });

  it('renders completion card with uniform row widths across auth and styling permutations', () => {
    for (const hasAuth of [true, false]) {
      for (const hasShadcn of [true, false]) {
        const card = renderCompletionCard({
          projectName: 'acme-app',
          shouldInstall: false,
          hasAuth,
          hasShadcn
        });

        const lines = card.split('\n');
        const width = visibleWidth(lines[0]);
        for (let i = 0; i < lines.length; i++) {
          assert.strictEqual(visibleWidth(lines[i]), width, `Completion card (auth=${hasAuth}, shadcn=${hasShadcn}) line ${i} width mismatch`);
        }
      }
    }
  });

  it('includes ready-made dashboard URL in completion card only when both shadcn and auth are enabled', () => {
    // 1. shadcn + auth -> includes Dashboard and Ready-Made Blocks
    const cardBoth = renderCompletionCard({ projectName: 'app', hasAuth: true, hasShadcn: true });
    assert.ok(cardBoth.includes('/dashboard'), 'Should include /dashboard when auth: true and shadcn: true');
    assert.ok(cardBoth.includes('Ready-Made Blocks'), 'Should include Ready-Made Blocks header');

    // 2. shadcn + no-auth -> omits Dashboard and Ready-Made Blocks
    const cardShadcnNoAuth = renderCompletionCard({ projectName: 'app', hasAuth: false, hasShadcn: true });
    assert.strictEqual(cardShadcnNoAuth.includes('/dashboard'), false, 'Must not include /dashboard when auth: false');
    assert.strictEqual(cardShadcnNoAuth.includes('Ready-Made Blocks'), false, 'Must not include Ready-Made Blocks when auth: false');

    // 3. no-shadcn + auth -> omits Ready-Made Blocks header
    const cardAuthNoShadcn = renderCompletionCard({ projectName: 'app', hasAuth: true, hasShadcn: false });
    assert.strictEqual(cardAuthNoShadcn.includes('Ready-Made Blocks'), false, 'Must not include Ready-Made Blocks when shadcn: false');

    // 4. no-shadcn + no-auth -> omits both
    const cardNeither = renderCompletionCard({ projectName: 'app', hasAuth: false, hasShadcn: false });
    assert.strictEqual(cardNeither.includes('/dashboard'), false);
    assert.strictEqual(cardNeither.includes('Ready-Made Blocks'), false);
    assert.strictEqual(cardNeither.includes('Auth Endpoints'), false);
  });
});
