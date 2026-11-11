import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT, SESSION_STORE } from '@config';
import { logger } from '@utils/logger';
import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;

// The client reconnects forever at runtime (so a Redis restart heals itself), which also means
// connect() never rejects on its own. Bound the initial connect so a misconfigured pod fails
// fast with a clear message instead of hanging in a crash-less, never-ready state.
const CONNECT_TIMEOUT_MS = 30_000;

/**
 * Connects the shared Redis client. No-op unless SESSION_STORE=redis.
 * Must be awaited before `createSessionStore` or `RedisApiTokenService` are used.
 */
export async function initRedis(): Promise<void> {
  if (SESSION_STORE !== 'redis') {
    return;
  }

  if (!REDIS_HOST) {
    throw new Error('SESSION_STORE=redis but REDIS_HOST is not set');
  }

  if (client) {
    return;
  }

  client = createClient({
    socket: {
      host: REDIS_HOST,
      port: Number(REDIS_PORT || 6379),
      reconnectStrategy: retries => Math.min(retries * 100, 3000),
    },
    password: REDIS_PASSWORD || undefined,
  });

  client.on('error', err => logger.error(`Redis client error: ${(err as Error).message}`));
  client.on('reconnecting', () => logger.warn('Redis reconnecting'));
  client.on('ready', () => logger.info('Redis ready'));
  client.on('end', () => logger.warn('Redis connection closed'));

  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Timed out after ${CONNECT_TIMEOUT_MS} ms connecting to Redis at ${REDIS_HOST}:${REDIS_PORT || 6379}`)),
      CONNECT_TIMEOUT_MS,
    );
  });

  try {
    await Promise.race([client.connect(), timeout]);
    logger.info('Redis connected');
  } catch (err) {
    logger.error(`Failed to connect to Redis: ${(err as Error).message}`);
    const failed = client;
    client = null;
    // Stop the background reconnect loop so the process can exit.
    failed?.destroy();
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function getRedisClient(): RedisClientType {
  if (!client) {
    throw new Error('Redis client not initialized. Call initRedis() first.');
  }
  return client;
}
