import { HttpException } from '@/exceptions/HttpException';
import { IApiTokenService } from '@interfaces/api-token.interface';
import { fetchApiToken } from '@utils/fetchToken';
import { getRedisClient } from '@utils/initRedis';
import { logger } from '@utils/logger';

const TOKEN_KEY = 'api_token';
const LOCK_KEY = 'api_token_lock';

/**
 * Caches the gateway OAuth token in Redis so all pods share one token.
 * A short-lived lock makes sure only one pod refreshes it at a time; the others wait.
 */
export class RedisApiTokenService implements IApiTokenService {
  private get redis() {
    return getRedisClient();
  }

  async getToken(): Promise<string> {
    try {
      const cached = (await this.redis.get(TOKEN_KEY)) as string | null;
      if (cached) return cached;

      const lock = await this.redis.set(LOCK_KEY, '1', { NX: true, EX: 10 });

      if (lock === 'OK') {
        try {
          const token = await this.fetchTokenFromApi();
          await this.redis.set(TOKEN_KEY, token.access_token, {
            EX: token.expires_in - 10,
          });
          return token.access_token;
        } finally {
          await this.redis.del(LOCK_KEY).catch(err => logger.warn(`Failed to release token lock: ${(err as Error).message}`));
        }
      }

      const waited = await this.waitForToken();
      if (waited) return waited;

      throw new HttpException(500, 'Token fetch failed');
    } catch (err) {
      if (err instanceof HttpException) throw err;
      logger.warn(`[REDIS] token path failed, falling back to direct fetch: ${(err as Error).message}`);
      const token = await this.fetchTokenFromApi();
      return token.access_token;
    }
  }

  private async waitForToken(timeoutMs = 10000): Promise<string | null> {
    const deadline = Date.now() + timeoutMs;

    const poll = async (): Promise<string | null> => {
      const token = (await this.redis.get(TOKEN_KEY)) as string | null;
      if (token) return token;
      if (Date.now() >= deadline) return null;

      await new Promise(resolve => setTimeout(resolve, 300));
      return poll();
    };

    return poll();
  }

  private async fetchTokenFromApi() {
    logger.info('[REDIS] fetching oauth API token');
    return fetchApiToken();
  }
}
