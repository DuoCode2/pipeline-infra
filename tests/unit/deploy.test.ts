import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  buildFallbackVercelConfig,
  findShadowedCleanUrls,
  generateHtmlOverrides,
  prepareBuildOutputAPI,
} from '../../packages/deploy/deploy';

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'duocode-deploy-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('generateHtmlOverrides', () => {
  it('maps locale landing pages and nested routes to clean URLs', () => {
    const outDir = makeTempDir();

    fs.mkdirSync(path.join(outDir, 'en'), { recursive: true });
    fs.mkdirSync(path.join(outDir, 'zh-CN'), { recursive: true });
    fs.mkdirSync(path.join(outDir, 'en', 'products'), { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), '<html />');
    fs.writeFileSync(path.join(outDir, 'en.html'), '<html />');
    fs.writeFileSync(path.join(outDir, 'zh-CN.html'), '<html />');
    fs.writeFileSync(path.join(outDir, 'en', 'products.html'), '<html />');

    const overrides = generateHtmlOverrides(outDir);

    expect(overrides).toEqual({
      'en.html': { path: 'en' },
      'zh-CN.html': { path: 'zh-CN' },
      'en/products.html': { path: 'en/products' },
    });
  });
});

describe('findShadowedCleanUrls', () => {
  it('finds locale routes where a directory shadows the sibling html page', () => {
    const outDir = makeTempDir();

    fs.mkdirSync(path.join(outDir, 'en'), { recursive: true });
    fs.mkdirSync(path.join(outDir, 'zh-CN'), { recursive: true });
    fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(outDir, 'en.html'), '<html />');
    fs.writeFileSync(path.join(outDir, 'zh-CN.html'), '<html />');
    fs.writeFileSync(path.join(outDir, 'assets.json'), '{}');

    expect(findShadowedCleanUrls(outDir)).toEqual([
      { directory: 'en', htmlFile: 'en.html' },
      { directory: 'zh-CN', htmlFile: 'zh-CN.html' },
    ]);
  });

  it('ignores directories without a sibling html file', () => {
    const outDir = makeTempDir();

    fs.mkdirSync(path.join(outDir, 'en'), { recursive: true });
    fs.writeFileSync(path.join(outDir, 'about.html'), '<html />');

    expect(findShadowedCleanUrls(outDir)).toEqual([]);
  });
});

describe('prepareBuildOutputAPI', () => {
  it('copies a self-contained static directory instead of symlinking files', () => {
    const outDir = makeTempDir();

    fs.mkdirSync(path.join(outDir, 'en'), { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), '<html />');
    fs.writeFileSync(path.join(outDir, 'en.html'), '<html />');
    fs.writeFileSync(path.join(outDir, 'en', 'products.html'), '<html />');

    const outputDir = prepareBuildOutputAPI(outDir);
    const copiedFile = path.join(outputDir, 'static', 'en.html');
    const copiedNestedFile = path.join(outputDir, 'static', 'en', 'products.html');

    expect(fs.existsSync(copiedFile)).toBe(true);
    expect(fs.existsSync(copiedNestedFile)).toBe(true);
    expect(fs.lstatSync(copiedFile).isSymbolicLink()).toBe(false);
    expect(fs.lstatSync(copiedNestedFile).isSymbolicLink()).toBe(false);
  });
});

describe('buildFallbackVercelConfig', () => {
  it('synthesizes clean locale routing when vercel.json is missing', () => {
    const projectDir = makeTempDir();
    const buildDir = path.join(projectDir, 'out');

    fs.mkdirSync(path.join(projectDir, 'src/lib'), { recursive: true });
    fs.mkdirSync(buildDir, { recursive: true });
    fs.writeFileSync(path.join(projectDir, 'src/lib/i18n.ts'), [
      "export const locales = ['en', 'ms'] as const;",
      "export type Locale = (typeof locales)[number];",
      "export const defaultLocale: Locale = 'ms';",
    ].join('\n'));
    fs.writeFileSync(path.join(buildDir, 'ms.html'), '<html />');

    const config = buildFallbackVercelConfig(projectDir, buildDir);

    expect(config).toContain('"cleanUrls": true');
    expect(config).toContain('"destination": "/ms"');
  });

  it('returns null when the default locale html file does not exist', () => {
    const projectDir = makeTempDir();
    const buildDir = path.join(projectDir, 'out');

    fs.mkdirSync(buildDir, { recursive: true });
    expect(buildFallbackVercelConfig(projectDir, buildDir)).toBeNull();
  });
});
