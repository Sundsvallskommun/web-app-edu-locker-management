import 'reflect-metadata';
import authMiddleware from '@middlewares/auth.middleware';
import schoolMiddleware from '@middlewares/school.middleware';
import { auditGlobalAuth } from '@middlewares/global-auth';
import { registeredControllers } from '@/registered-controllers';
import { getMetadataArgsStorage } from 'routing-controllers';

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

/**
 * Everything the app serves that needs a session. Spelled out rather than counted,
 * so a route quietly losing its guard fails here, and adding a route is a conscious
 * two-line change instead of a number going up.
 */
const EXPECTED_PROTECTED_ROUTES = [
  'GET /me',
  'GET /schools',
  'GET /pupils/:schoolId',
  'GET /pupils/searchfree/:schoolId/:query',
  'GET /lockers/:schoolId',
  'GET /lockers/:schoolId/:lockerId',
  'POST /lockers/:schoolId',
  'PATCH /lockers/:schoolId/:lockerId',
  'PATCH /lockers/status/:schoolId',
  'PATCH /lockers/assign/:schoolId',
  'PATCH /lockers/unassign/:schoolId',
  'DELETE /lockers/:schoolId/:lockerId',
  'GET /codelocks/:schoolId',
  'GET /codelocks/:schoolId/:lockId',
  'POST /codelocks/:schoolId',
  'PATCH /codelocks/:schoolId/:lockId',
  'POST /notice/:schoolId',
];

/**
 * Every route that takes a school id from the client. `schoolMiddleware` is what
 * turns "is logged in" into "may act for this school", by checking the id against
 * the school units the SAML assertion granted. Authentication alone would let any
 * employee read and change any school's lockers and pupils.
 */
const EXPECTED_SCHOOL_SCOPED_ROUTES = EXPECTED_PROTECTED_ROUTES.filter(route => route.includes(':schoolId'));

/** Which routes actually carry `schoolMiddleware`, read off the routing metadata. */
const declaredSchoolScopedRoutes = (): string[] => {
  const storage = getMetadataArgsStorage();
  const named = (target: unknown) => (target as { name: string }).name;

  const scoped = new Set(storage.uses.filter(use => use.middleware === schoolMiddleware).map(use => `${named(use.target)}.${use.method}`));

  return storage.actions
    .filter(action => scoped.has(`${named(action.target)}.${String(action.method)}`))
    .map(action => `${String(action.type).toUpperCase()} ${String(action.route)}`);
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

  it('protects every other registered route', () => {
    expect(report.protectedRoutes.map(asKey).sort()).toEqual([...EXPECTED_PROTECTED_ROUTES].sort());
  });

  it('accounts for every route the app registers', () => {
    const total = report.protectedRoutes.length + report.publicRoutes.length + report.unprotectedRoutes.length;

    expect(total).toBe(EXPECTED_PROTECTED_ROUTES.length + EXPECTED_PUBLIC_ROUTES.length);
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
    expect(declaredSchoolScopedRoutes().sort()).toEqual([...EXPECTED_SCHOOL_SCOPED_ROUTES].sort());
  });

  it('keeps the school-scoped list non-empty, so the check above cannot pass vacuously', () => {
    expect(EXPECTED_SCHOOL_SCOPED_ROUTES.length).toBeGreaterThan(10);
  });
});
