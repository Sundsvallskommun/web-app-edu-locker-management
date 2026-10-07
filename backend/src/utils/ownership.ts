import { HttpException } from '@/exceptions/HttpException';
import { logger } from '@/utils/logger';

/**
 * Helpers for refusing access to something named in a request body.
 *
 * `authMiddleware` checks that the user is logged in, and `schoolMiddleware` that they
 * may act for the school in the URL. Neither checks ids in the request body, such as a
 * pupil id. These helpers are for that.
 */

/**
 * The HTTP status of an error, or undefined.
 *
 * Don't replace this with `error instanceof HttpException`: routing-controllers changes
 * the error's prototype, so that check is always false. A check written that way would
 * never refuse anything, and nothing would warn you.
 */
export const statusOf = (error: unknown): number | undefined => {
  const candidate = error as { status?: unknown; httpCode?: unknown };
  const status = candidate?.status ?? candidate?.httpCode;
  return typeof status === 'number' ? status : undefined;
};

/** Shortens an id for logging: enough to investigate with, not enough to collect pupil ids from the logs. */
export const maskIdentifier = (value?: string | null): string => {
  if (!value) return '<none>';
  return value.length <= 8 ? '***' : `${value.slice(0, 4)}***${value.slice(-4)}`;
};

/**
 * Refuses with 403 and logs it. Same answer whether the thing doesn't exist or belongs to
 * someone else, so nobody can use the answer to find out which ids exist.
 */
export const deny = (resource: string, id: string, scope: string): never => {
  logger.warn(`Ownership denied: ${resource} '${maskIdentifier(id)}' is not within scope '${scope}'`);
  throw new HttpException(403, 'MISSING_PERMISSIONS');
};

/** Runs `load`, turning a downstream 403 or 404 into the same 403 as `deny`. Other errors pass through. */
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
