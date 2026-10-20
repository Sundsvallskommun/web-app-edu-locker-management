import { inspect } from 'util';
import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import ApiService, { describeFailedCall } from '@/services/api.service';
import { logger } from '@/utils/logger';

/**
 * Tests that a failed downstream call doesn't put the request in the log.
 *
 * The error axios throws carries the whole request, including the bearer token and, for a
 * mail, the recipient and the door code. Axios and the token service are mocked.
 */

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>();
  return { ...actual, default: Object.assign(vi.fn(), actual.default) };
});

vi.mock('@/services/api-token.service', () => ({
  default: class {
    getToken = async () => 'secret-bearer-token';
  },
}));

const axiosRequest = axios as unknown as Mock;

const mail = { emailAddress: 'pupil@example.com', message: 'Lås: Kod -4711' };

const failWith = (status?: number) =>
  axiosRequest.mockImplementation(async (config: InternalAxiosRequestConfig) => {
    const response = status ? { status, statusText: '', data: { detail: 'Gateway said no' }, headers: {}, config } : undefined;
    throw new AxiosError(
      'Request failed',
      status ? 'ERR_BAD_RESPONSE' : 'ECONNRESET',
      { ...config, headers: new AxiosHeaders(config.headers) },
      {},
      response,
    );
  });

describe('ApiService on a failed downstream call', () => {
  let logged: string;

  beforeEach(() => {
    logged = '';
    const capture = (...args: unknown[]) => {
      // inspect is what console.log prints, so an error logged whole shows up here as it would in production
      logged += args.map(arg => (typeof arg === 'string' ? arg : inspect(arg, { depth: 10 }))).join(' ');
      return logger;
    };
    vi.spyOn(logger, 'error').mockImplementation(capture as never);
    vi.spyOn(logger, 'warn').mockImplementation(capture as never);
    vi.spyOn(console, 'log').mockImplementation(capture);
    vi.spyOn(console, 'error').mockImplementation(capture);
  });

  afterEach(() => vi.restoreAllMocks());

  it('logs method, path and status, and none of the token, recipient or message', async () => {
    failWith(500);

    await expect(new ApiService().post(mail, { url: 'messaging/7.0/2281/email?loginName=kalle.karlsson' })).rejects.toMatchObject({
      status: 500,
    });

    expect(logged).not.toContain('secret-bearer-token');
    expect(logged).not.toContain('pupil@example.com');
    expect(logged).not.toContain('4711');
    expect(logged).not.toContain('loginName');
    expect(logged).toContain('POST messaging/7.0/2281/email -> 500');
  });

  it('answers 500 instead of crashing when there is no response at all', async () => {
    failWith(undefined);

    await expect(new ApiService().get({ url: 'education/2.0/2281/schoolunits/s1' })).rejects.toMatchObject({ status: 500 });

    expect(logged).toContain('GET education/2.0/2281/schoolunits/s1 -> ECONNRESET');
  });
});

describe('the token fetch on failure', () => {
  let logged: string;

  beforeEach(() => {
    logged = '';
    vi.spyOn(logger, 'error').mockImplementation(((message: string) => {
      logged += message;
      return logger;
    }) as never);
  });

  afterEach(() => vi.restoreAllMocks());

  it('logs neither the client key nor the client secret', async () => {
    // The module is mocked above for ApiService; this is the real one, on the same mocked axios.
    const { default: RealApiTokenService } = await vi.importActual<typeof import('@/services/api-token.service')>('@/services/api-token.service');
    failWith(503);

    await expect(new RealApiTokenService().fetchToken()).rejects.toMatchObject({ status: 502 });

    expect(logged).not.toContain(Buffer.from('test-client-key:test-client-secret').toString('base64'));
    expect(logged).not.toContain('test-client-secret');
    expect(logged).toContain('Failed to fetch JWT access token: 503');
  });
});

describe('describeFailedCall', () => {
  it('hides a personal number in the path completely', () => {
    expect(describeFailedCall({ method: 'GET', url: 'citizen/3.0/2281/199001011234/guid' }, null)).toBe(
      'Downstream call failed: GET citizen/3.0/2281/***/guid -> not an HTTP error',
    );
    expect(describeFailedCall({ url: 'citizen/3.0/2281/900101-1234/guid' }, null)).toContain('2281/***/guid');
    // + instead of - for someone aged 100 or more
    expect(describeFailedCall({ url: 'citizen/3.0/2281/191201+1234/guid' }, null)).toContain('2281/***/guid');
  });

  it('masks a person id in the path the same way ownership denials do', () => {
    expect(describeFailedCall({ url: 'education/2.0/2281/4a7f1c2e-1111-2222-3333-9d8e7f6a5b4c/schoolids' }, null)).toContain(
      '2281/4a7f***5b4c/schoolids',
    );
  });
});
