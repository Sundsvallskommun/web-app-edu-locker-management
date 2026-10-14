import 'reflect-metadata';
import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { getMetadataArgsStorage } from 'routing-controllers';
import App from '@/app';
import { BASE_URL_PREFIX } from '@config';
import { registeredControllers } from '@/registered-controllers';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

/**
 * End-to-end authentication check against the real application.
 *
 * The app is booted the way `server.ts` boots it - same controller list, same
 * middleware chain - bound to a free port, and called over the loopback
 * interface. It is the test that would have caught the class of bug this work
 * exists to fix: an endpoint that looks protected in the source but answers
 * anyway, because the middleware ran in a different order than it was written.
 *
 * The route table is read from routing-controllers' own metadata rather than
 * typed out here, so a route added tomorrow is swept without anyone remembering
 * to extend this file. Only the two deliberately open routes are named, in
 * `PUBLIC_ROUTES` below.
 *
 * Two routes carry the argument:
 *
 *   GET /me   nothing on that route but `authMiddleware` can produce a 401, so a
 *             401 means authentication is present and running. Remove
 *             `@UseBefore(authMiddleware)` from `UserController` and this fails.
 *
 *   GET /     answers 200 without a session, which proves the 401s above are
 *             authentication doing its job and not the app being dead.
 *
 * The suite needs no network and no credentials: an anonymous call is rejected
 * before any controller body runs, and `/health/up` - the one public route that
 * does call downstream - is never called.
 */

const PUBLIC_ROUTES = new Set(['GET /', 'GET /health/up']);

const storage = getMetadataArgsStorage();

const controllerRoute = (target: Function) => storage.controllers.find(controller => controller.target === target)?.route ?? '';

const registered = new Set<Function>(registeredControllers);

const allRoutes = storage.actions
  .filter(action => registered.has(action.target))
  .map(action => {
    if (typeof action.route !== 'string') {
      // A RegExp route cannot be turned back into a URL, so it would be dropped
      // silently and read as covered. Fail loudly instead.
      throw new Error(`Cannot sweep non-string route on ${action.target.name}.${action.method}`);
    }

    return {
      method: action.type.toUpperCase(),
      route: `${controllerRoute(action.target)}${action.route}`,
    };
  });

const protectedRoutes = allRoutes.filter(({ method, route }) => !PUBLIC_ROUTES.has(`${method} ${route}`));

// `:schoolId` -> `any-schoolid`. The value never matters: authentication answers
// before anything looks at it.
const fillParams = (route: string) => route.replace(/:(\w+)/g, (_, name: string) => `any-${name.toLowerCase()}`);

let server: Server;
let baseUrl: string;

const path = (route: string) => `${baseUrl}${BASE_URL_PREFIX}${route}`;

// No anonymous route writes to the session, so without a real IdP login the app never
// sends a session cookie. This route, added behind the real session middleware, does.
const SESSION_PROBE = '/__test/session-probe';

let app: App;

beforeAll(async () => {
  app = new App(registeredControllers);
  app.getServer().get(SESSION_PROBE, (req, res) => {
    (req.session as unknown as Record<string, unknown>).probe = true;
    res.send('ok');
  });

  await new Promise<void>(resolve => {
    server = app.getServer().listen(0, '127.0.0.1', () => resolve());
  });

  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  if (server) {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});

describe('the route table this suite sweeps', () => {
  it('was actually found, so a broken filter cannot pass as a clean sweep', () => {
    expect(protectedRoutes.length).toBeGreaterThan(0);
  });

  it('exempts only routes that exist, so a renamed public route is noticed', () => {
    const known = new Set(allRoutes.map(({ method, route }) => `${method} ${route}`));

    expect([...PUBLIC_ROUTES].filter(route => !known.has(route))).toEqual([]);
  });
});

describe('the running application', () => {
  it('answers 401 on a protected route when there is no session', async () => {
    const response = await fetch(path('/me'));

    expect(response.status).toBe(401);
  });

  it('answers 200 on the public route, so the 401 above is authentication and not a dead app', async () => {
    const response = await fetch(path('/'));

    expect(response.status).toBe(200);
    expect(await response.text()).toContain('OK');
  });

  it('does not leak user data in the 401 body', async () => {
    const response = await fetch(path('/me'));
    const body = await response.text();

    expect(response.status).toBe(401);
    expect(body).not.toMatch(/username|schoolUnits|citizenIdentifier/i);
  });

  it('rejects a forged session cookie', async () => {
    const response = await fetch(path('/me'), {
      headers: { cookie: 'connect.sid=s%3Aforged.signature' },
    });

    expect(response.status).toBe(401);
  });

  describe('the session cookie', () => {
    const sessionCookie = async () => {
      const response = await fetch(`${baseUrl}${SESSION_PROBE}`);
      const cookie = response.headers.getSetCookie().find(value => value.startsWith('connect.sid='));
      expect(cookie).toBeDefined();
      return cookie;
    };

    it('is HttpOnly and SameSite=Lax', async () => {
      const cookie = await sessionCookie();

      expect(cookie).toMatch(/;\s*HttpOnly/i);
      expect(cookie).toMatch(/;\s*SameSite=Lax/i);
    });

    it('has no expiry, so it ends when the browser closes', async () => {
      expect(await sessionCookie()).not.toMatch(/Expires=|Max-Age=/i);
    });

    it('is Secure in production', async () => {
      const original = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        vi.resetModules();
        const { SESSION_COOKIE_SECURE } = await import('@config');
        expect(SESSION_COOKIE_SECURE).toBe(true);
      } finally {
        process.env.NODE_ENV = original;
      }
    });

    /** `secure` is off outside production, and express only sees TLS behind the ingress if it trusts the proxy. */
    it('trusts the proxy in front of it', () => {
      expect(app.getServer().get('trust proxy')).toBe(1);
    });
  });

  /**
   * Body validation and school scoping both sit behind authentication, so an
   * anonymous caller must be turned away at the door with 401 - never reaching
   * `validationMiddleware` and its 400, nor `schoolMiddleware` and its 403.
   * Either of those answers means the middleware order has been swapped back.
   */
  it.each(protectedRoutes.map(({ method, route }): [string, string] => [method, route]))(
    'answers 401, not 400 or 403, on %s %s without a session',
    async (method, route) => {
      const response = await fetch(path(fillParams(route)), {
        method,
        headers: { 'content-type': 'application/json' },
        ...(method === 'GET' || method === 'DELETE' ? {} : { body: '{}' }),
      });

      expect(response.status).toBe(401);
    },
  );
});
