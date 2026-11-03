import { before, after, describe, it } from 'node:test';
import assert from 'node:assert';
import {
  renderBanner,
  BANNER_BREAKPOINTS,
  BANNER_DIMENSIONS,
  getFullBanner,
  getCompactBanner,
  getMinimalBanner
} from '../src/ui/banner.js';

describe('UI: Robot Mascot ASCII Banner (F1)', () => {
  const originalNoColor = process.env.NO_COLOR;
  before(() => { delete process.env.NO_COLOR; });
  after(() => {
    if (originalNoColor === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = originalNoColor;
  });
  it('exports expected breakpoints and dimensions constants', () => {
    assert.strictEqual(BANNER_BREAKPOINTS.FULL, 68);
    assert.strictEqual(BANNER_BREAKPOINTS.COMPACT, 54);
    assert.strictEqual(BANNER_DIMENSIONS.FULL_WIDTH, 56);
    assert.strictEqual(BANNER_DIMENSIONS.COMPACT_WIDTH, 44);
    assert.strictEqual(BANNER_DIMENSIONS.MINIMAL_WIDTH, 31);
  });

  it('renders full 6-armed robot mascot banner for columns >= 68', () => {
    const banner = renderBanner(80, { isTTY: true });
    assert.ok(banner.includes('React'));
    assert.ok(banner.includes('Mongo'));
    assert.ok(banner.includes('Express'));
    assert.ok(banner.includes('Vite'));
    assert.ok(banner.includes('[■]   [■]'));
    assert.ok(banner.includes('M O D E R N   M E R N'));
    assert.ok(banner.includes('[🔧]'));
    assert.ok(banner.includes('[⚡]'));
  });

  it('renders compact visor banner for columns between 54 and 67', () => {
    const banner = renderBanner(60, { isTTY: true });
    assert.ok(banner.includes('[■]   [■]'));
    assert.ok(banner.includes('MODERN MERN'));
    // Should NOT have full chest M O D E R N   M E R N
    assert.ok(!banner.includes('M O D E R N   M E R N'));
  });

  it('renders minimal banner for columns < 54', () => {
    const banner = renderBanner(50, { isTTY: true });
    assert.ok(banner.includes('[■_■]'));
    assert.ok(banner.includes('MODERN MERN'));
  });

  it('renders plain text banner when isTTY is false', () => {
    const banner = renderBanner(80, { isTTY: false });
    assert.ok(banner.includes('create-modern-mern-app'));
    assert.ok(banner.includes('React + Express + MongoDB + Vite'));
    assert.strictEqual(banner.includes('\x1b['), false); // Zero ANSI codes
  });

  it('renders plain text banner when plain option is true', () => {
    const banner = renderBanner(80, { plain: true });
    assert.ok(banner.includes('create-modern-mern-app'));
    assert.strictEqual(banner.includes('\x1b['), false);
  });

  it('getFullBanner plain mode produces unstyled ascii art', () => {
    const plainBanner = getFullBanner('3.0.0', true);
    assert.ok(plainBanner.includes('(o) React'));
    assert.ok(plainBanner.includes('(DB) Mongo'));
    assert.ok(plainBanner.includes('[■]   [■]'));
    assert.strictEqual(plainBanner.includes('\x1b['), false);
  });

  it('getCompactBanner plain mode produces unstyled compact visor', () => {
    const plainCompact = getCompactBanner('3.0.0', true);
    assert.ok(plainCompact.includes('[■]   [■]'));
    assert.ok(plainCompact.includes('MODERN MERN'));
    assert.strictEqual(plainCompact.includes('\x1b['), false);
  });

  it('getMinimalBanner plain mode produces unstyled 3-line text', () => {
    const minimal = getMinimalBanner('3.0.0', true);
    assert.ok(minimal.includes('create-modern-mern-app v3.0.0'));
    assert.strictEqual(minimal.includes('\x1b['), false);
  });

  it('honors NO_COLOR in an interactive terminal', () => {
    process.env.NO_COLOR = '1';
    try { assert.equal(renderBanner(80, { isTTY: true }), getMinimalBanner(undefined, true)); }
    finally { delete process.env.NO_COLOR; }
  });

  it('respects custom version option', () => {
    const banner = renderBanner(80, { version: '9.9.9', isTTY: true });
    assert.ok(banner.includes('v9.9.9'));
  });
});
