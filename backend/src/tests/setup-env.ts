/**
 * Test environment bootstrap.
 *
 * Runs before any module is imported, so the values here win over
 * `.env.<NODE_ENV>.local` - dotenv never overwrites an existing process.env key.
 * That is deliberate: the suite has to run in CI, where no .env file exists, and
 * it must never depend on real credentials or a real IdP.
 *
 * The SAML key pair is generated per run rather than committed. No secret in the
 * repository, and nothing here can be mistaken for a working configuration.
 */
import { generateKeyPairSync } from 'node:crypto';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

const defaults: Record<string, string> = {
  APP_NAME: 'Locker Management (test)',
  PORT: '0',
  BASE_URL_PREFIX: '/api',
  API_BASE_URL: 'http://localhost:9/never-called',
  CLIENT_KEY: 'test-client-key',
  CLIENT_SECRET: 'test-client-secret',
  SECRET_KEY: 'test-secret-key',
  MUNICIPALITY_ID: '2281',
  LOG_FORMAT: 'dev',
  LOG_DIR: '../../data/logs',
  SWAGGER_ENABLED: 'false',
  SESSION_MEMORY: 'true',
  ORIGIN: 'http://localhost:3000',
  CREDENTIALS: 'true',
  AD_GROUP: '',
  SENDER_EMAIL: 'noreply@example.test',
  SENDER_NAME: 'Test',
  REPLY_EMAIL: 'noreply@example.test',
  TEST_EMAIL: 'test@example.test',
  SAML_CALLBACK_URL: 'http://localhost:3001/api/saml/login/callback',
  SAML_LOGOUT_CALLBACK_URL: 'http://localhost:3001/api/saml/logout/callback',
  SAML_FAILURE_REDIRECT: 'http://localhost:3000/login?failed',
  SAML_SUCCESS_REDIRECT: 'http://localhost:3000',
  SAML_ENTRY_SSO: 'http://localhost:9/sso',
  SAML_ISSUER: 'passport-saml-test',
  SAML_IDP_PUBLIC_CERT: publicKey,
  SAML_PRIVATE_KEY: privateKey,
  SAML_PUBLIC_KEY: publicKey,
};

for (const [key, value] of Object.entries(defaults)) {
  if (process.env[key] === undefined || process.env[key] === '') {
    process.env[key] = value;
  }
}
