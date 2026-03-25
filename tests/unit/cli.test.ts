import { describe, it, expect } from 'vitest';
import { getArg, hasFlag } from '../../packages/utils/cli';

// ---------------------------------------------------------------------------
// getArg
// ---------------------------------------------------------------------------
describe('getArg', () => {
  it('finds --key value pair', () => {
    const args = ['--city', 'KL', '--limit', '10'];
    expect(getArg(args, 'city', '')).toBe('KL');
  });

  it('finds the correct value among multiple args', () => {
    const args = ['--city', 'KL', '--limit', '10', '--region', 'my'];
    expect(getArg(args, 'limit', '')).toBe('10');
    expect(getArg(args, 'region', '')).toBe('my');
  });

  it('returns default when key is missing', () => {
    const args = ['--city', 'KL'];
    expect(getArg(args, 'limit', '5')).toBe('5');
  });

  it('returns empty string when no default and key missing', () => {
    const args = ['--city', 'KL'];
    expect(getArg(args, 'limit', '')).toBe('');
  });

  it('returns undefined when key missing and no fallback provided', () => {
    const args = ['--city', 'KL'];
    expect(getArg(args, 'limit')).toBeUndefined();
  });

  it('returns fallback when key is present but has no following value', () => {
    // --limit is the last element, so args[idx + 1] is undefined
    const args = ['--city', 'KL', '--limit'];
    expect(getArg(args, 'limit', 'default')).toBe('default');
  });

  it('handles value that starts with --', () => {
    // If the next arg happens to start with --, it still returns it
    const args = ['--name', '--weird-value'];
    expect(getArg(args, 'name', '')).toBe('--weird-value');
  });

  it('handles empty args array', () => {
    expect(getArg([], 'city', 'default')).toBe('default');
  });

  it('does not match partial key names', () => {
    const args = ['--city-name', 'KL'];
    expect(getArg(args, 'city', 'default')).toBe('default');
  });

  it('finds the first occurrence when key is duplicated', () => {
    const args = ['--city', 'KL', '--city', 'PJ'];
    expect(getArg(args, 'city', '')).toBe('KL');
  });
});

// ---------------------------------------------------------------------------
// hasFlag
// ---------------------------------------------------------------------------
describe('hasFlag', () => {
  it('returns true when flag is present', () => {
    const args = ['--verbose', '--city', 'KL'];
    expect(hasFlag(args, 'verbose')).toBe(true);
  });

  it('returns false when flag is absent', () => {
    const args = ['--city', 'KL'];
    expect(hasFlag(args, 'verbose')).toBe(false);
  });

  it('returns true when flag is at the end', () => {
    const args = ['--city', 'KL', '--dry-run'];
    expect(hasFlag(args, 'dry-run')).toBe(true);
  });

  it('returns false for empty args', () => {
    expect(hasFlag([], 'verbose')).toBe(false);
  });

  it('does not match partial flag names', () => {
    const args = ['--verbose-mode'];
    expect(hasFlag(args, 'verbose')).toBe(false);
  });

  it('does not match values, only flags', () => {
    // "verbose" appears as a value to --mode, not as --verbose
    const args = ['--mode', 'verbose'];
    // hasFlag checks args.includes('--verbose'), so this should be false
    expect(hasFlag(args, 'verbose')).toBe(false);
  });
});
