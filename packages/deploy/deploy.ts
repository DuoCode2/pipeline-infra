import * as fs from 'fs';
import * as path from 'path';
import { requireEnv } from '../utils/env';

const VERCEL_TOKEN = requireEnv('VERCEL_TOKEN');

interface VercelProject {
  id: string;
  name: string;
}

interface DeployResult {
  url: string;
  projectId: string;
  deploymentId: string;
}

/**
 * Deploy a static site to Vercel using the Vercel SDK.
 * @param buildDir - path to the `out/` directory from `next build`
 * @param slug - project slug (used as subdomain: {slug}.vercel.app)
 */
export async function deployToVercel(
  buildDir: string,
  slug: string
): Promise<DeployResult> {
  if (!fs.existsSync(buildDir)) {
    throw new Error(`Build directory not found: ${buildDir}`);
  }

  // Dynamic import for @vercel/sdk (ESM)
  const { Vercel } = await import('@vercel/sdk');
  const vercel = new Vercel({ bearerToken: VERCEL_TOKEN });

  // Create or get project
  let projectId: string;
  try {
    const project = await vercel.projects.createProject({
      requestBody: { name: slug, framework: 'nextjs' },
    });
    projectId = project.id;
    console.log(`Created Vercel project: ${slug}`);
  } catch (err: unknown) {
    const error = err as { message?: string; status?: number };
    if (error?.message?.includes('already exist') || error?.status === 409) {
      const response = await vercel.projects.getProjects({ search: slug });
      const projects = response as unknown as { projects?: VercelProject[] };
      const list: VercelProject[] = projects.projects || [];
      const existing = list.find((p: VercelProject) => p.name === slug);
      if (!existing) throw new Error(`Project ${slug} not found`);
      projectId = existing.id;
      console.log(`Using existing Vercel project: ${slug}`);
    } else {
      throw err;
    }
  }

  // Collect files from build dir
  const files: Array<{ file: string; data: string }> = [];
  function collectFiles(dir: string, prefix: string = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        // Skip large build artifacts
        if (entry.name === '.next' || entry.name === 'node_modules' || entry.name === '.git') {
          continue;
        }
        collectFiles(fullPath, relativePath);
      } else {
        const data = fs.readFileSync(fullPath).toString('base64');
        files.push({ file: relativePath, data });
      }
    }
  }
  collectFiles(buildDir);

  // Create deployment
  const deployment = await vercel.deployments.createDeployment({
    requestBody: {
      name: slug,
      files: files.map((f) => ({
        file: f.file,
        data: f.data,
        encoding: 'base64' as const,
      })),
      projectSettings: {
        framework: 'nextjs',
        outputDirectory: '.',
      },
      target: 'production',
    },
  });

  const url = `https://${slug}.vercel.app`;
  console.log(`Deployed: ${url}`);

  return {
    url,
    projectId,
    deploymentId: deployment.id,
  };
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (name: string, fallback: string) => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  const buildDir = getArg('build-dir', '');
  const slug = getArg('slug', '');

  if (!buildDir || !slug) {
    console.error('Usage: --build-dir <path> --slug <project-slug>');
    process.exit(1);
  }

  deployToVercel(buildDir, slug)
    .then((result) => console.log('Result:', JSON.stringify(result, null, 2)))
    .catch((err) => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
