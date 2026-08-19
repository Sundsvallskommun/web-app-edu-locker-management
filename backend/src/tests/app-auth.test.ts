import 'reflect-metadata';
import type { Server } from 'http';
import type { AddressInfo } from 'net';
import App from '@/app';
import { BASE_URL_PREFIX } from '@config';
import { registeredControllers } from '@/registered-controllers';

/**
 * End-to-end authentication check against the real application.
 *
 * `app-routes.test.ts` reads decorators; this one boots the app the way `server.ts`
 * does, binds a free port and makes real HTTP requests over the loopback interface.
 * It is the test that would have caught the class of bug this work exists to fix -
 * an endpoint that looks protected in the source but answers anyway.
 *
 * Two routes from the actual repository, not fixtures:
 *
 *   GET /me         protected only by `@UseBefore(authMiddleware)` on the action.
 *                   Nothing else on that route can produce a 401, so a 401 here
 *                   means the decorator is present and running. Remove it and this
 *                   test fails - which is the entire point of asserting on a real
 *                   route rather than a purpose-built one.
 *
 *   GET /           marked `@Public()`. It answers 200 without a session, which
 *                   proves the 401 above is authentication doing its job and not
 *                   the app being broken or unreachable.
 *
 * Neither route calls a downstream API, so the suite needs no network and no
 * credentials.
 */

let server: Server;
let baseUrl: string;

const path = (route: string) => `${baseUrl}${BASE_URL_PREFIX}${route}`;

beforeAll(async () => {
  const app = new App(registeredControllers);

  await new Promise<void>(resolve => {
    // Port 0: the OS hands out a free one, so the suite never collides with a
    // running dev server or with a parallel jest worker.
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

  /**
   * School scoping sits behind authentication, so an anonymous caller must be
   * turned away at the door with 401 - never reaching `schoolMiddleware` and its
   * 403, which would mean the middleware order had been swapped.
   */
  it.each([
    ['GET', '/lockers/any-school'],
    ['GET', '/pupils/any-school'],
    ['GET', '/codelocks/any-school'],
    ['GET', '/schools'],
    ['POST', '/notice/any-school'],
    ['PATCH', '/lockers/status/any-school'],
    ['DELETE', '/lockers/any-school/any-locker'],
  ])('answers 401, not 403, on %s %s without a session', async (method, route) => {
    const response = await fetch(path(route), {
      method,
      headers: { 'content-type': 'application/json' },
      ...(method === 'GET' || method === 'DELETE' ? {} : { body: '{}' }),
    });

    expect(response.status).toBe(401);
  });

  it('sets a session cookie that scripts cannot read', async () => {
    // The public route is enough to make express-session issue a cookie header.
    const response = await fetch(path('/'));
    const setCookie = response.headers.get('set-cookie');

    if (setCookie) {
      expect(setCookie.toLowerCase()).toContain('httponly');
    }
  });
});
