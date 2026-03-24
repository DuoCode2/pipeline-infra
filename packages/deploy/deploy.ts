import * as fs from 'fs';
import * as path from 'path';
import { requireEnv } from '../utils/env';

const VERCEL_TOKEN = requireEnv('VERCEL_TOKEN');
const VERCEL_API = 'https://api.vercel.com';

interface DeployResult {
  url: string;
  projectId: string;
  deploymentId: string;
}

export async function deployToVercel(buildDir: string, slug: string): Promise<DeployResult> {
  if (!fs.existsSync(buildDir)) {
    throw new Error(`Build directory not found: ${buildDir}`);
  }

  // Collect files, skip large dirs
  const files: Array<{ file: string; data: string }> = [];
  function collectFiles(dir: string, prefix: string = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (['.next', 'node_modules', '.git'].includes(entry.name)) continue;
        collectFiles(fullPath, relativePath);
      } else {
        files.push({ file: relativePath, data: fs.readFileSync(fullPath).toString('base64') });
      }
    }
  }
  collectFiles(buildDir);
  console.log(`Deploying ${files.length} files to Vercel...`);

  // Create deployment via REST API
  const res = await fetch(`${VERCEL_API}/v13/deployments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: slug,
      files: files.map(f => ({ file: f.file, data: f.data, encoding: 'base64' })),
      projectSettings: { framework: null },
      target: 'production',
      routes: [
        // Root redirect to /en
        { src: "^/$", status: 302, headers: { Location: "/en" } },
        // Clean URLs: strip .html extensions
        { handle: "filesystem" },
        { src: "/(.*)", dest: "/$1.html", check: true },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vercel deploy failed: ${res.status} ${err}`);
  }

  const deployment = await res.json() as { id: string; url: string; readyState: string };
  console.log(`Deployment created: ${deployment.url} (${deployment.readyState})`);

  // Wait for READY (max 60s)
  for (let i = 0; i < 12; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const check = await fetch(`${VERCEL_API}/v13/deployments/${deployment.id}`, {
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` },
    });
    const status = await check.json() as { readyState: string; alias?: string[] };
    if (status.readyState === 'READY') {
      // Use actual alias from Vercel (may differ from slug if name conflicts)
      const alias = status.alias?.[0];
      const prodUrl = alias ? `https://${alias}` : `https://${slug}.vercel.app`;
      console.log(`Deployed: ${prodUrl}`);
      return { url: prodUrl, projectId: slug, deploymentId: deployment.id };
    }
    if (status.readyState === 'ERROR') {
      throw new Error('Vercel deployment failed');
    }
  }

  return { url: `https://${deployment.url}`, projectId: slug, deploymentId: deployment.id };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (name: string, fallback: string) => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
  };
  const buildDir = getArg('build-dir', '');
  const slug = getArg('slug', '');
  if (!buildDir || !slug) { console.error('Usage: --build-dir <path> --slug <name>'); process.exit(1); }
  deployToVercel(buildDir, slug)
    .then(r => console.log('Result:', JSON.stringify(r, null, 2)))
    .catch(e => { console.error('Error:', e.message); process.exit(1); });
}
