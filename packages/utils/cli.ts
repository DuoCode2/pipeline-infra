/**
 * Shared CLI argument parsing utilities.
 *
 * Replaces the duplicated `getArg` helper found across prepare.ts,
 * finalize.ts, deploy.ts, orchestrate.ts, lighthouse-check.ts, and
 * serve-and-check.ts.
 */

/** Parse `--name value` from argv. Returns `fallback` when missing. */
export function getArg(args: string[], name: string, fallback: string): string;
export function getArg(args: string[], name: string): string | undefined;
export function getArg(
  args: string[],
  name: string,
  fallback?: string,
): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
}

/** Check whether `--name` flag is present (no value). */
export function hasFlag(args: string[], name: string): boolean {
  return args.includes(`--${name}`);
}
