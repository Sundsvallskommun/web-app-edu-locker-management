import { SESSION_STORE } from '@config';
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import createFileStore from 'session-file-store';
import { getRedisClient } from './initRedis';

/**
 * Session store selected by SESSION_STORE:
 *  - redis  : OpenShift / multi-pod. Requires initRedis() to have completed.
 *  - memory : default, local development.
 *  - file   : ./data/sessions on disk (legacy local behaviour).
 */
export function createSessionStore(sessionTTL: number): session.Store {
  if (SESSION_STORE === 'redis') {
    return new RedisStore({
      client: getRedisClient(),
      ttl: sessionTTL,
    });
  }

  if (SESSION_STORE === 'memory') {
    const MemoryStore = createMemoryStore(session);
    // NOTE: memory store uses ms
    return new MemoryStore({ checkPeriod: sessionTTL * 1000 });
  }

  const FileStore = createFileStore(session);
  // NOTE: file store uses seconds
  return new FileStore({ ttl: sessionTTL, path: './data/sessions' });
}
