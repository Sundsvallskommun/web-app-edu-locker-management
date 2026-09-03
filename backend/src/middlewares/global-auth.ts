import { ActionArgs, AuditGlobalAuthOptions, AuthAuditReport, Ctor, MetadataStorage, Middleware, RouteRef } from '@/interfaces/global-auth.interface';
import { getMetadataArgsStorage } from 'routing-controllers';

/**
 * Route protection audit.
 *
 * Authentication stays declared explicitly with `@UseBefore(authMiddleware)` on
 * every controller or action - nothing here injects middleware. Keeping the
 * decorator visible is the point: the person adding a route has to think about
 * the authentication flow rather than inherit it silently.
 *
 * What this module adds is the check that the decorator was not forgotten. It
 * reads routing-controllers' own metadata, so it sees the route table the app
 * actually serves - not a text scan of the source, and not a second list that
 * drifts from the first.
 *
 * A route is one of three things, and nothing else:
 *   - protected   - carries `@UseBefore(authMiddleware)` at class or action level
 *   - public      - carries `@Public('<reason>')`
 *   - unprotected - a finding; `src/tests/app-routes.test.ts` fails on it
 */

const publicClasses = new Map<Ctor, string | undefined>();
const publicMethods = new Map<Ctor, Map<string, string | undefined>>();

/**
 * Marks a route as intentionally reachable without a session.
 *
 * The reason is not decoration: it is logged on every boot and read in review.
 * In a BFF the honest list is the health probe and the service root.
 */
export function Public(reason?: string): ClassDecorator & MethodDecorator {
  return ((target: any, propertyKey?: string | symbol): void => {
    if (propertyKey === undefined) {
      publicClasses.set(target as Ctor, reason);
      return;
    }
    const ctor: Ctor = typeof target === 'function' ? target : target.constructor;
    let methods = publicMethods.get(ctor);
    if (!methods) {
      methods = new Map();
      publicMethods.set(ctor, methods);
    }
    methods.set(String(propertyKey), reason);
  }) as ClassDecorator & MethodDecorator;
}

const prototypeChain = (target: Ctor): Ctor[] => {
  const chain: Ctor[] = [];
  for (let current: any = target; typeof current === 'function' && current !== Function.prototype; current = Object.getPrototypeOf(current)) {
    chain.push(current);
  }
  return chain;
};

/**
 * Exact match, not the prototype chain: a route may only be public where it is
 * registered. Inheriting "this is public" from a base class would be the one kind of
 * inheritance that loosens a route, so it has to be restated on the derived class.
 */
const resolvePublic = (target: Ctor, method: string): { isPublic: boolean; reason?: string } => {
  if (publicClasses.has(target)) {
    return { isPublic: true, reason: publicClasses.get(target) };
  }
  const methods = publicMethods.get(target);
  if (methods?.has(method)) {
    return { isPublic: true, reason: methods.get(method) };
  }
  return { isPublic: false };
};

const controllerBasePath = (storage: MetadataStorage, controller: Ctor): string => {
  const args = storage.controllers.find(entry => entry.target === controller);
  return typeof args?.route === 'string' ? args.route : '';
};

const describeRoute = (controller: Ctor, action: ActionArgs, basePath: string): RouteRef => {
  const route = typeof action.route === 'string' ? action.route : String(action.route ?? '');
  return {
    controller: controller.name,
    action: String(action.method ?? ''),
    httpMethod: String(action.type ?? '').toUpperCase(),
    route: `${basePath}${route}` || '/',
  };
};

/**
 * True when `@UseBefore(authMiddleware)` sits on the class itself.
 *
 * Exact target match, no prototype chain - because that is what routing-controllers
 * does. `createControllerUses` filters with `use.target === controller.target`, so a
 * base class's class-level middleware is silently dropped for a derived controller,
 * even though `createActions` *does* walk the chain and registers the base class's
 * routes. Inherit a controller and you inherit its routes without its protection.
 *
 * Matching the chain here would make this audit report those routes as protected
 * while the server serves them open. It must never be more optimistic than express.
 *
 * `afterAction` is excluded for the same reason: `@UseAfter(authMiddleware)` runs
 * once the handler has already answered, so it guards nothing. Counting it would
 * file an open route under `protectedRoutes`.
 */
const hasClassLevelAuth = (storage: MetadataStorage, controller: Ctor, authMiddleware: Middleware): boolean =>
  storage.uses.some(use => !use.afterAction && !use.method && use.middleware === authMiddleware && use.target === controller);

const hasActionLevelAuth = (storage: MetadataStorage, controller: Ctor, method: string, authMiddleware: Middleware): boolean =>
  storage.uses.some(use => !use.afterAction && use.target === controller && use.method === method && use.middleware === authMiddleware);

/**
 * The middlewares express will run before the handler, in the order it runs them.
 *
 * Mirrors what ExpressDriver does: controller-level uses first, then action-level,
 * each in the order routing-controllers recorded them. That recording order is
 * decorator *evaluation* order, and TypeScript evaluates stacked decorators bottom
 * to top - so a controller reading
 *
 *   @UseBefore(authMiddleware)
 *   @UseBefore(schoolMiddleware)
 *
 * runs schoolMiddleware first. Top-to-bottom is how everyone reads it, which is why
 * this is worth deriving and asserting rather than trusting. Listing the middlewares
 * as arguments to a single `@UseBefore(a, b, c)` gives the order the source implies.
 */
const beforeMiddlewaresFor = (storage: MetadataStorage, controller: Ctor, method: string): Middleware[] => {
  // Exact target match, for the same reason as hasClassLevelAuth above.
  const relevant = storage.uses.filter(use => !use.afterAction && use.target === controller);

  return [...relevant.filter(use => !use.method), ...relevant.filter(use => use.method === method)].map(use => use.middleware as Middleware);
};

/**
 * Groups the registered controllers' actions.
 *
 * This one *does* follow the prototype chain, because `MetadataBuilder.createActions`
 * does: it walks from the controller up, taking each base class's actions and
 * re-targeting them onto the derived controller. A method defined on both wins from
 * the most derived class, which is why the first occurrence is kept.
 *
 * Note the asymmetry with the middleware lookups above, which match exactly. That is
 * not an inconsistency here - it is the inconsistency in routing-controllers, and
 * reproducing it faithfully is the only way the report describes the real server.
 */
const actionsByController = (storage: MetadataStorage, controllers: Ctor[]): Map<Ctor, ActionArgs[]> => {
  const grouped = new Map<Ctor, ActionArgs[]>();

  for (const controller of controllers) {
    const actions: ActionArgs[] = [];

    for (const ctor of prototypeChain(controller)) {
      for (const action of storage.actions.filter(candidate => candidate.target === ctor)) {
        if (!actions.some(seen => seen.method === action.method)) {
          actions.push(action);
        }
      }
    }

    grouped.set(controller, actions);
  }

  return grouped;
};

export const auditGlobalAuth = (options: AuditGlobalAuthOptions): AuthAuditReport => {
  const { authMiddleware, controllers, logger } = options;

  if (typeof authMiddleware !== 'function') {
    throw new TypeError('auditGlobalAuth: authMiddleware must be a function');
  }

  const storage = getMetadataArgsStorage();
  const report: AuthAuditReport = { protectedRoutes: [], publicRoutes: [], unprotectedRoutes: [], warnings: [] };

  for (const [controller, actions] of actionsByController(storage, controllers)) {
    if (!actions.length) {
      report.warnings.push(`${controller.name}: registered as a controller but declares no routes`);
      continue;
    }

    const basePath = controllerBasePath(storage, controller);
    const classIsAuthed = hasClassLevelAuth(storage, controller, authMiddleware);

    // routing-controllers inherits a base class's routes but drops its middleware.
    // Anything declared @UseBefore on an ancestor is dead weight that reads as
    // protection, so say so rather than letting it look like it works.
    const inheritedMiddleware = storage.uses.filter(use => use.target !== controller && prototypeChain(controller).includes(use.target as Ctor));
    if (inheritedMiddleware.length) {
      const ancestors = [...new Set(inheritedMiddleware.map(use => (use.target as Ctor).name))];
      report.warnings.push(
        `${controller.name}: inherits routes from ${ancestors.join(', ')}, but routing-controllers does not ` +
          'apply a base class @UseBefore - declare the middleware on the controller itself',
      );
    }

    for (const action of actions) {
      const actionName = String(action.method ?? '');
      const ref = describeRoute(controller, action, basePath);
      const { isPublic, reason } = resolvePublic(controller, actionName);
      const actionIsAuthed = classIsAuthed || hasActionLevelAuth(storage, controller, actionName, authMiddleware);

      const describeProtected = (): RouteRef => {
        const before = beforeMiddlewaresFor(storage, controller, actionName);
        const authRunsFirst = before[0] === authMiddleware;

        if (!authRunsFirst) {
          const ahead = before.slice(0, before.indexOf(authMiddleware)).map(middleware => middleware.name || 'anonymous');
          report.warnings.push(
            `${controller.name}.${actionName}: ${ahead.join(', ')} run before authMiddleware, so anonymous requests ` +
              'reach them first - pass the middlewares to a single @UseBefore(authMiddleware, ...) in the order they should run',
          );
        }

        return { ...ref, declaredAt: classIsAuthed ? 'class' : 'action', authRunsFirst };
      };

      if (isPublic && actionIsAuthed) {
        // Contradictory: the decorators disagree about whether a session is needed.
        // Auth wins at runtime, so report it as protected and flag the mismatch.
        report.warnings.push(`${controller.name}.${actionName}: marked @Public() but also carries @UseBefore(authMiddleware) - remove one`);
        report.protectedRoutes.push(describeProtected());
        continue;
      }

      if (isPublic) {
        report.publicRoutes.push({ ...ref, ...(reason ? { reason } : {}) });
      } else if (actionIsAuthed) {
        report.protectedRoutes.push(describeProtected());
      } else {
        report.unprotectedRoutes.push(ref);
      }
    }
  }

  logReport(report, logger);
  return report;
};

const logReport = (report: AuthAuditReport, logger?: AuditGlobalAuthOptions['logger']): void => {
  if (!logger) return;

  const total = report.protectedRoutes.length + report.publicRoutes.length + report.unprotectedRoutes.length;
  logger.info?.(
    `Auth audit: ${total} routes - ${report.protectedRoutes.length} protected, ` +
      `${report.publicRoutes.length} public, ${report.unprotectedRoutes.length} unprotected`,
  );

  for (const route of report.publicRoutes) {
    logger.warn?.(
      `Auth audit: PUBLIC ${route.httpMethod} ${route.route} (${route.controller}.${route.action})` +
        (route.reason ? ` - ${route.reason}` : ' - NO REASON GIVEN'),
    );
  }

  for (const route of report.unprotectedRoutes) {
    logger.error?.(
      `Auth audit: UNPROTECTED ${route.httpMethod} ${route.route} (${route.controller}.${route.action}) - ` +
        'add @UseBefore(authMiddleware), or @Public() with a reason if that is intended',
    );
  }

  for (const warning of report.warnings) {
    logger.warn?.(`Auth audit: ${warning}`);
  }
};
