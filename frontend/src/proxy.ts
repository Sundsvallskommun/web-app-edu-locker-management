import i18nConfig from '@app/i18nConfig';
import { NextRequest } from 'next/server';
import { i18nRouter } from 'next-i18n-router';

export function proxy(req: NextRequest) {
  // Read by generateMetadata in app/[locale]/layout.tsx to pick the page title from the paths namespace.
  req.headers.set('x-path', req.nextUrl.pathname);
  return i18nRouter(req, i18nConfig);
}

export const config = {
  // napi is the legacy alias for the api routes (rewritten in next.config.js) and must not be localized.
  matcher: '/((?!api|napi|static|.*\\..*|_next).*)',
};
