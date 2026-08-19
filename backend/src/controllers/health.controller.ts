import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import { Public } from '@middlewares/global-auth';
import { Controller, Get } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { APIS } from '@config';

@Controller()
export class HealthController {
  private readonly apiService = new ApiService();
  public readonly api = APIS.find(x => x.name === 'simulatorserver');

  @Public('Liveness probe - polled by infrastructure without a session; returns only whether the API gateway answers')
  @Get('/health/up')
  @OpenAPI({ summary: 'Return health check' })
  async up() {
    const url = `${this.api.name}/${this.api.version}/simulations/response?status=200%20OK`;
    const data = {
      status: 'OK',
    };
    const res = await this.apiService.post<{ status: string }>(data, { url }).catch(e => {
      logger.error('Error when doing health check:', e);
      return e;
    });

    return res.data;
  }
}
