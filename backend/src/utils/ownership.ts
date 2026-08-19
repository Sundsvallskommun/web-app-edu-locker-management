import { HttpException } from '@/exceptions/HttpException';
import { logger } from '@/utils/logger';

/**
 * Shared vocabulary for "may this session touch this object".
 *
 * `authMiddleware` proves a session exists; `schoolMiddleware` proves the session
 * may act for the school in the path. Neither says anything about an id that
 * arrives in a request *body*. This is where that gap is closed.
 */

/**
 * `HttpError` from routing-controllers calls `Object.setPrototypeOf` in its
 * constructor, so `error instanceof HttpException` is always false. Reading the
 * status off the object is the only thing that works - and getting this wrong is
 * silent: the check compiles, runs, and never denies.
 */
export const statusOf = (error: unknown): number | undefined => {
  const candidate = error as { status?: unknown; httpCode?: unknown };
  const status = candidate?.status ?? candidate?.httpCode;
  return typeof status === 'number' ? status : undefined;
};

/** Enough of an identifier to investigate with, not enough to rebuild a register from log files. */
export const maskIdentifier = (value?: string | null): string => {
  if (!value) return '<none>';
  return value.length <= 8 ? '***' : `${value.slice(0, 4)}***${value.slice(-4)}`;
};

/** Never reveals whether the object exists - a different answer per case turns the endpoint into an oracle. */
export const deny = (resource: string, id: string, scope: string): never => {
  logger.warn(`Ownership denied: ${resource} '${maskIdentifier(id)}' is not within scope '${scope}'`);
  throw new HttpException(403, 'MISSING_PERMISSIONS');
};

/** Maps a downstream 403/404 onto the same denial, so absence and non-ownership look identical. */
export const resolveOrDeny = async <T>(load: () => Promise<T>, resource: string, id: string, scope: string): Promise<T> => {
  try {
    return await load();
  } catch (error) {
    const status = statusOf(error);
    if (status === 404 || status === 403) {
      deny(resource, id, scope);
    }
    throw error;
  }
};
