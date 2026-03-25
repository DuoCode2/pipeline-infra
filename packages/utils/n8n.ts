/**
 * n8n API client for pipeline integration.
 *
 * Two modes:
 *   1. Webhook mode (no API key) — fire-and-forget POST to webhook URLs
 *   2. API mode (with N8N_API_KEY) — full workflow management
 *
 * Webhook mode is the default and works without any n8n API configuration.
 * API mode is optional and enables health checks, execution logs, etc.
 */

import { optionalEnv } from './env';

export interface N8nConfig {
  baseUrl?: string;
  apiKey?: string;
  webhookUrl?: string;
}

function getConfig(): N8nConfig {
  return {
    baseUrl: optionalEnv('N8N_BASE_URL', 'http://localhost:5678'),
    apiKey: optionalEnv('N8N_API_KEY', ''),
    webhookUrl: optionalEnv('N8N_WEBHOOK_URL', ''),
  };
}

// ── Health check ──────────────────────────────────────────────────

export async function isN8nRunning(config?: N8nConfig): Promise<boolean> {
  const { baseUrl } = { ...getConfig(), ...config };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${baseUrl}/healthz`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

// ── Webhook (no API key needed) ───────────────────────────────────

export async function postWebhook(
  path: string,
  data: Record<string, unknown>,
  config?: N8nConfig,
): Promise<{ ok: boolean; status: number; body?: unknown }> {
  const { baseUrl } = { ...getConfig(), ...config };
  const url = path.startsWith('http') ? path : `${baseUrl}/webhook/${path}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = res.headers.get('content-type')?.includes('json')
      ? await res.json()
      : await res.text();
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    return { ok: false, status: 0, body: String(err) };
  }
}

// ── API mode (needs N8N_API_KEY) ──────────────────────────────────

function apiHeaders(apiKey: string): Record<string, string> {
  return {
    'X-N8N-API-KEY': apiKey,
    'Content-Type': 'application/json',
  };
}

export async function listWorkflows(config?: N8nConfig) {
  const { baseUrl, apiKey } = { ...getConfig(), ...config };
  if (!apiKey) throw new Error('N8N_API_KEY not set');
  const res = await fetch(`${baseUrl}/api/v1/workflows`, {
    headers: apiHeaders(apiKey),
  });
  if (!res.ok) throw new Error(`n8n API ${res.status}: ${await res.text()}`);
  return (await res.json()) as { data: Array<{ id: string; name: string; active: boolean }> };
}

export async function listExecutions(
  options: { status?: string; limit?: number } = {},
  config?: N8nConfig,
) {
  const { baseUrl, apiKey } = { ...getConfig(), ...config };
  if (!apiKey) throw new Error('N8N_API_KEY not set');
  const params = new URLSearchParams();
  if (options.status) params.set('status', options.status);
  if (options.limit) params.set('limit', String(options.limit));
  const res = await fetch(`${baseUrl}/api/v1/executions?${params}`, {
    headers: apiHeaders(apiKey),
  });
  if (!res.ok) throw new Error(`n8n API ${res.status}: ${await res.text()}`);
  return (await res.json()) as { data: Array<{ id: string; status: string; workflowId: string; startedAt: string }> };
}

// ── Pipeline helpers ──────────────────────────────────────────────

/** Log an action to n8n (used by prepare.ts and finalize.ts) */
export async function logAction(data: {
  place_id: string;
  slug?: string;
  action: string;
  result?: string;
  url?: string;
  industry?: string;
  qa_score?: Record<string, number>;
}): Promise<void> {
  const { webhookUrl } = getConfig();
  if (!webhookUrl) return; // silently skip if not configured

  const payload = { ...data, timestamp: new Date().toISOString() };
  const MAX_RETRIES = 1;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await postWebhook(webhookUrl, payload).catch((err) => {
      return { ok: false, status: 0, body: String(err) };
    });

    if (res.ok) return;

    if (attempt < MAX_RETRIES) {
      console.warn(`[n8n] logAction failed (attempt ${attempt + 1}), retrying in 2s... status=${res.status}`);
      await new Promise((r) => setTimeout(r, 2000));
    } else {
      console.warn(`[n8n] logAction failed after ${MAX_RETRIES + 1} attempts: status=${res.status} body=${JSON.stringify(res.body)}`);
    }
  }
}

// ── CLI ───────────────────────────────────────────────────────────

if (require.main === module) {
  const command = process.argv[2];

  (async () => {
    switch (command) {
      case 'health':
      case 'check': {
        const running = await isN8nRunning();
        console.log(running ? 'n8n is running' : 'n8n is NOT running');
        process.exit(running ? 0 : 1);
        break;
      }
      case 'workflows': {
        const { data } = await listWorkflows();
        for (const w of data) {
          console.log(`  ${w.active ? '●' : '○'} ${w.id} ${w.name}`);
        }
        break;
      }
      case 'executions': {
        const { data } = await listExecutions({ limit: 10 });
        for (const e of data) {
          console.log(`  ${e.status} ${e.id} workflow=${e.workflowId} ${e.startedAt}`);
        }
        break;
      }
      case 'webhook': {
        const path = process.argv[3];
        const payload = process.argv[4] ? JSON.parse(process.argv[4]) : {};
        if (!path) { console.error('Usage: n8n.ts webhook <path> [json]'); process.exit(1); }
        const res = await postWebhook(path, payload);
        console.log(JSON.stringify(res, null, 2));
        break;
      }
      default:
        console.error('Usage: npx tsx packages/utils/n8n.ts <health|workflows|executions|webhook>');
        process.exit(1);
    }
  })().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
