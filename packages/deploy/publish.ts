import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface PublishOptions {
  dir: string;
  slug: string;
  commitMessage: string;
  homepage?: string;
  description?: string;
  owner?: string;
  userName?: string;
  userEmail?: string;
}

export interface PublishResult {
  pushed: boolean;
  repo: string;
}

const DEFAULT_OWNER = process.env.GIT_OWNER || 'DuoCode2';
const DEFAULT_USER_NAME = process.env.GIT_USER_NAME || 'LiuWei';
const DEFAULT_USER_EMAIL = process.env.GIT_USER_EMAIL || 'sunflowers0607@outlook.com';
const DEFAULT_IGNORE_ENTRIES = ['.next/', 'node_modules/', '.vercel/'];

function run(command: string, cwd: string): string {
  return execSync(command, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 30_000,
  })
    .toString()
    .trim();
}

function tryRun(command: string, cwd: string): boolean {
  try {
    run(command, cwd);
    return true;
  } catch {
    return false;
  }
}

function ensureGitIgnore(repoDir: string): void {
  const ignorePath = path.join(repoDir, '.gitignore');
  const existing = fs.existsSync(ignorePath)
    ? fs.readFileSync(ignorePath, 'utf8').split(/\r?\n/)
    : [];

  const merged = new Set(existing.filter(Boolean));
  for (const entry of DEFAULT_IGNORE_ENTRIES) {
    merged.add(entry);
  }

  fs.writeFileSync(ignorePath, `${Array.from(merged).join('\n')}\n`);
}

export function publishGeneratedSite(options: PublishOptions): PublishResult {
  const repoDir = path.resolve(options.dir);
  const owner = options.owner ?? DEFAULT_OWNER;
  const repo = `${owner}/${options.slug}`;
  const remoteUrl = `https://github.com/${repo}.git`;

  if (!fs.existsSync(path.join(repoDir, '.git'))) {
    run('git init -q -b main', repoDir);
  }

  run(`git config user.name "${options.userName ?? DEFAULT_USER_NAME}"`, repoDir);
  run(`git config user.email "${options.userEmail ?? DEFAULT_USER_EMAIL}"`, repoDir);
  ensureGitIgnore(repoDir);

  const hasOrigin = tryRun('git remote get-url origin', repoDir);
  if (!hasOrigin) {
    if (tryRun(`gh repo view ${repo}`, repoDir)) {
      run(`git remote add origin ${remoteUrl}`, repoDir);
    } else {
      run(`gh repo create ${repo} --private --source=. --remote=origin`, repoDir);
    }
  }

  run('git add -A', repoDir);

  const hasChanges = !tryRun('git diff --cached --quiet', repoDir);
  if (!hasChanges) {
    if (options.homepage || options.description) {
      const args = [
        `gh repo edit ${repo}`,
        options.homepage ? `--homepage "${options.homepage}"` : '',
        options.description ? `--description "${options.description}"` : '',
      ]
        .filter(Boolean)
        .join(' ');
      tryRun(args, repoDir);
    }
    return { pushed: false, repo };
  }

  run(`git commit -q -m "${options.commitMessage.replace(/"/g, '\\"')}"`, repoDir);
  run('git branch -M main', repoDir);
  run('git push -u origin main', repoDir);

  if (options.homepage || options.description) {
    const args = [
      `gh repo edit ${repo}`,
      options.homepage ? `--homepage "${options.homepage}"` : '',
      options.description ? `--description "${options.description}"` : '',
    ]
      .filter(Boolean)
      .join(' ');
    tryRun(args, repoDir);
  }

  return { pushed: true, repo };
}
