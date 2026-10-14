import 'reflect-metadata';
import authMiddleware from '@middlewares/auth.middleware';
import schoolMiddleware from '@middlewares/school.middleware';
import { auditGlobalAuth } from '@middlewares/global-auth';
import { registeredControllers } from '@/registered-controllers';
import { getMetadataArgsStorage } from 'routing-controllers';
import { describe, expect, it } from 'vitest';

/**
 * Regression net for the whole route table.
 *
 * Authentication is declared explicitly, one `@UseBefore(authMiddleware)` per
 * controller or action - deliberately, so that whoever adds a route has to think
 * about the authentication flow. This test is the check that the manual step was
 * not forgotten: add a controller without the decorator, or take the decorator
 * off an existing one, and it fails here rather than in production.
 *
 * Routes are listed without the `/api` prefix; `useExpressServer` adds that when it
 * builds the router, it is not part of the controller metadata.
 *
 * When a route legitimately becomes public, add it here in the same commit.
 */
const EXPECTED_PUBLIC_ROUTES = ['GET /', 'GET /health/up'];

const storage = getMetadataArgsStorage();
const registered = new Set<unknown>(registeredControllers);

const basePathOf = (target: unknown): string => {
  const args = storage.controllers.find(entry => entry.target === target);
  return typeof args?.route === 'string' ? args.route : '';
};

const routeKey = (action: { type?: unknown; route?: unknown; target?: unknown }): string =>
  `${String(action.type).toUpperCase()} ${basePathOf(action.target)}${String(action.route)}`;

/**
 * Every route the app registers, read off routing-controllers' own metadata - the
 * same source `useExpressServer` builds the router from.
 *
 * Derived rather than typed out. A hand-written list of protected routes would add
 * nothing here: `unprotectedRoutes` being empty and the public allowlist matching
 * exactly is already the whole invariant, and `app-auth.test.ts` calls every one of
 * these over HTTP. All a second list would do is need updating, which invites
 * updating it without thinking. Only the public allowlist above stays hand-written,
 * because that is the one list a person has to approve - protection is the default
 * and needs no sign-off.
 */
const registeredRoutes = (): string[] => storage.actions.filter(action => registered.has(action.target)).map(routeKey);

/**
 * Every route that takes a school id from the client. `schoolMiddleware` is what
 * turns "is logged in" into "may act for this school", by checking the id against
 * the school units the SAML assertion granted. Authentication alone would let any
 * employee read and change any school's lockers and pupils.
 */
const schoolScopedRoutes = (): string[] => registeredRoutes().filter(route => route.includes(':schoolId'));

/** Which routes actually carry `schoolMiddleware`, read off the routing metadata. */
const declaredSchoolScopedRoutes = (): string[] => {
  const named = (target: unknown) => (target as { name: string }).name;

  const scoped = new Set(storage.uses.filter(use => use.middleware === schoolMiddleware).map(use => `${named(use.target)}.${use.method}`));

  return storage.actions.filter(action => scoped.has(`${named(action.target)}.${String(action.method)}`)).map(routeKey);
};

const report = auditGlobalAuth({ authMiddleware, controllers: registeredControllers as never[] });
const asKey = (route: { httpMethod: string; route: string }) => `${route.httpMethod} ${route.route}`;

describe('registered routes', () => {
  it('leaves no route reachable without authentication', () => {
    expect(report.unprotectedRoutes.map(asKey)).toEqual([]);
  });

  it('exposes exactly the routes on the public allowlist', () => {
    expect(report.publicRoutes.map(asKey).sort()).toEqual([...EXPECTED_PUBLIC_ROUTES].sort());
  });

  it('requires every public route to document why', () => {
    for (const route of report.publicRoutes) {
      expect(route.reason).toBeTruthy();
    }
  });

  /**
   * Guards against the audit quietly seeing fewer routes than the app serves: if it
   * dropped a controller, `unprotectedRoutes` would be empty and the public allowlist
   * would still match, so both checks above would pass on nothing.
   */
  it('classifies every route the app registers, and nothing else', () => {
    const classified = [...report.protectedRoutes, ...report.publicRoutes, ...report.unprotectedRoutes].map(asKey);

    expect(classified.sort()).toEqual(registeredRoutes().sort());
  });

  it('finds a route table at all, so the check above cannot pass vacuously', () => {
    expect(registeredRoutes().length).toBeGreaterThan(10);
  });

  it('has no contradictory or empty controllers, and no middleware running ahead of authentication', () => {
    expect(report.warnings).toEqual([]);
  });

  /**
   * Stacked `@UseBefore` decorators evaluate bottom-up, so writing authMiddleware
   * first made it run last: anonymous requests were answered 400 by body validation
   * and 403 by school scoping, having never been asked for a session. Both
   * middlewares are now arguments to one `@UseBefore(...)`, which runs in source
   * order. This keeps it that way.
   */
  it('runs authentication before any other middleware on every protected route', () => {
    const authNotFirst = report.protectedRoutes.filter(route => !route.authRunsFirst).map(asKey);

    expect(authNotFirst).toEqual([]);
  });

  it('scopes every route taking a school id to the schools the caller may act for', () => {
    expect(declaredSchoolScopedRoutes().sort()).toEqual(schoolScopedRoutes().sort());
  });

  it('keeps the school-scoped list non-empty, so the check above cannot pass vacuously', () => {
    expect(schoolScopedRoutes().length).toBeGreaterThan(10);
  });
});
