import { HttpException } from '@/exceptions/HttpException';
import { logger } from '@/utils/logger';
import { maskIdentifier } from '@/utils/ownership';
import { apiURL } from '@/utils/util';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import ApiTokenService from './api-token.service';

class ApiResponse<T> {
  data: T;
  message: string;
}

const PERSONAL_NUMBER = /^\d{6}(\d{2})?[-+]?\d{4}$/;
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const maskSegment = (segment: string): string => {
  if (PERSONAL_NUMBER.test(segment)) return '***';
  if (GUID.test(segment)) return maskIdentifier(segment);
  return segment;
};

/**
 * Describes a failed downstream call for the log: method, path and status, nothing else.
 *
 * Don't log the error itself. An AxiosError carries the whole request: the bearer token,
 * and for a mail the recipient and a message with the locker's door code. The query is
 * dropped and person ids in the path are masked, since the citizen lookup puts the
 * personal number in the path.
 */
export const describeFailedCall = (config: AxiosRequestConfig, error: unknown): string => {
  const path = (config.url ?? '').split('?')[0].split('/').map(maskSegment).join('/');
  const status = axios.isAxiosError(error) ? (error.response?.status ?? error.code ?? 'no response') : 'not an HTTP error';
  return `Downstream call failed: ${config.method ?? 'GET'} ${path} -> ${status}`;
};

class ApiService {
  private apiTokenService = new ApiTokenService();
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const token = await this.apiTokenService.getToken();

    const defaultHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const defaultParams = {};

    const preparedConfig: AxiosRequestConfig = {
      ...config,
      headers: { ...defaultHeaders, ...config.headers },
      params: { ...defaultParams, ...config.params },
      url: apiURL(config.url),
    };

    try {
      const res = await axios(preparedConfig);
      return { data: res.data, message: 'success' };
    } catch (error: unknown | AxiosError) {
      logger.error(describeFailedCall(config, error));
      if (axios.isAxiosError(error)) {
        if ((error as AxiosError).response?.status === 404) {
          throw new HttpException(404, error?.response?.data?.detail || 'Not found');
        } else {
          throw new HttpException(
            error.response?.status || 500,
            error?.response?.data?.detail || error.message || 'Internal server error from gateway',
          );
        }
      }
      // NOTE: did you subscribe to the API called?
      throw new HttpException(500, 'Internal server error from gateway');
    }
  }

  public async get<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET' });
  }

  public async post<T, D = any>(data: D, config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', data: data });
  }

  public async patch<T, D = any>(data: D, config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', data: data });
  }

  public async delete<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE' });
  }
}

export default ApiService;
