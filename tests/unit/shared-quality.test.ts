import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { evaluateLighthouseReport } from '../../packages/quality/shared';

const mockReport = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../fixtures/mock-lighthouse-report.json'), 'utf8')
);

describe('Quality Gate', () => {
  it('mock lighthouse report has expected structure', () => {
    expect(mockReport.categories).toHaveProperty('performance');
    expect(mockReport.categories).toHaveProperty('accessibility');
    expect(mockReport.categories).toHaveProperty('seo');
    expect(mockReport.categories).toHaveProperty('best-practices');
  });

  it('all mock scores are above thresholds', () => {
    expect(mockReport.categories.performance.score).toBeGreaterThanOrEqual(0.9);
    expect(mockReport.categories.accessibility.score).toBeGreaterThanOrEqual(0.95);
    expect(mockReport.categories.seo.score).toBeGreaterThanOrEqual(0.95);
    expect(mockReport.categories['best-practices'].score).toBeGreaterThanOrEqual(0.9);
  });

  it('evaluateLighthouseReport passes for good scores', () => {
    const result = evaluateLighthouseReport(mockReport);
    expect(result.allPass).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('evaluateLighthouseReport returns category scores', () => {
    const result = evaluateLighthouseReport(mockReport);
    expect(result.lighthouse.performance.score).toBe(95);
    expect(result.lighthouse.accessibility.score).toBe(98);
    expect(result.lighthouse.seo.score).toBe(100);
    expect(result.lighthouse['best-practices'].score).toBe(96);
  });

  it('evaluateLighthouseReport fails for low scores', () => {
    const badReport = {
      categories: {
        performance: { score: 0.5 },
        accessibility: { score: 0.4 },
        'best-practices': { score: 0.3 },
        seo: { score: 0.2 },
      },
    };
    const result = evaluateLighthouseReport(badReport);
    expect(result.allPass).toBe(false);
    // accessibility, best-practices, seo are 'error' level and should fail
    expect(result.lighthouse.accessibility.pass).toBe(false);
    expect(result.lighthouse['best-practices'].pass).toBe(false);
    expect(result.lighthouse.seo.pass).toBe(false);
  });

  it('evaluateLighthouseReport treats performance as warn-only', () => {
    const warnReport = {
      categories: {
        performance: { score: 0.5 },
        accessibility: { score: 1.0 },
        'best-practices': { score: 1.0 },
        seo: { score: 1.0 },
      },
    };
    const result = evaluateLighthouseReport(warnReport);
    // performance is 'warn' level so low score should NOT cause allPass=false
    expect(result.lighthouse.performance.pass).toBe(false);
    expect(result.lighthouse.performance.level).toBe('warn');
    expect(result.allPass).toBe(true);
  });
});
