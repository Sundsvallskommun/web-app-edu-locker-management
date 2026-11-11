import { NODE_ENV, SESSION_STORE } from '@config';
import { IApiTokenService } from '@interfaces/api-token.interface';
import { MemoryApiTokenService } from './api-token-service/memory-api-token.service';
import { RedisApiTokenService } from './api-token-service/redis-api-token.service';

/**
 * In production with Redis sessions the gateway token is shared between pods via Redis.
 * Everywhere else it is cached in process memory.
 */
export function createApiTokenService(): IApiTokenService {
  if (NODE_ENV === 'production' && SESSION_STORE === 'redis') {
    return new RedisApiTokenService();
  }

  return new MemoryApiTokenService();
}
