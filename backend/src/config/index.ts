import { config } from 'dotenv';
import { APIS } from './api-config';

export { APIS };

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const SWAGGER_ENABLED = process.env.SWAGGER_ENABLED === 'true';
// Session store: memory (default, local dev) | file (./data/sessions) | redis (OpenShift / multi-pod)
export const SESSION_STORE = process.env.SESSION_STORE || 'memory';
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// 'auto': the cookie is Secure when Express sees the request as HTTPS (directly, or via
// X-Forwarded-Proto from a trusted proxy). A hard `true` makes express-session silently drop
// the cookie when the proxy does not forward the protocol, which breaks login entirely.
export const SESSION_COOKIE_SECURE: boolean | 'auto' = process.env.NODE_ENV === 'production' ? 'auto' : false;

export const {
  APP_NAME,
  NODE_ENV,
  PORT,
  API_BASE_URL,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  SECRET_KEY,
  CLIENT_KEY,
  CLIENT_SECRET,
  BASE_URL_PREFIX,
  SAML_CALLBACK_URL,
  SAML_LOGOUT_CALLBACK_URL,
  SAML_SUCCESS_BASE,
  SAML_SUCCESS_REDIRECT,
  SAML_FAILURE_REDIRECT,
  SAML_FAILURE_REDIRECT_MESSAGE,
  SAML_LOGOUT_REDIRECT,
  SAML_ENTRY_SSO,
  SAML_ISSUER,
  SAML_IDP_PUBLIC_CERT,
  SAML_PRIVATE_KEY,
  SAML_PUBLIC_KEY,
  MUNICIPALITY_ID,
  SENDER_EMAIL,
  SENDER_NAME,
  REPLY_EMAIL,
  TEST_EMAIL,
  AD_GROUP,
} = process.env;
