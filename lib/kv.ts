import { Redis } from "@upstash/redis";
import type { RuntimeState } from "@/lib/types";
import { createDefaultRuntime } from "@/lib/shim-sham/static";

const STATE_KEY = "shim-sham:runtime";

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function isKvConfigured() {
  return getRedis() !== null;
}

export async function loadRuntimeState(): Promise<RuntimeState> {
  const redis = getRedis();
  if (!redis) {
    return createDefaultRuntime();
  }

  const stored = await redis.get<RuntimeState>(STATE_KEY);
  return stored ?? createDefaultRuntime();
}

export async function saveRuntimeState(state: RuntimeState): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  await redis.set(STATE_KEY, state);
}
