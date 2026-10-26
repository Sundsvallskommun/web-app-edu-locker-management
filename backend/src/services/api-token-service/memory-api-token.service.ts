import { IApiTokenService } from '@interfaces/api-token.interface';
import { fetchApiToken, Token } from '@utils/fetchToken';
import { logger } from '@utils/logger';

// NOTE: token cached in process memory. Each pod fetches its own token.
let c_access_token = '';
let c_token_expires = 0;

export class MemoryApiTokenService implements IApiTokenService {
  public async getToken(): Promise<string> {
    if (Date.now() >= c_token_expires) {
      logger.info('[MEMORY] Getting oauth API token');
      await this.fetchToken();
    }
    return c_access_token;
  }

  private setToken(token: Token) {
    c_access_token = token.access_token;
    // NOTE: Set timestamp for when we need to refresh minus 10 seconds for margin
    c_token_expires = Date.now() + (token.expires_in * 1000 - 10000);
  }

  private async fetchToken(): Promise<void> {
    const token = await fetchApiToken();
    this.setToken(token);
  }
}
