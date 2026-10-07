import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const src = fileURLToPath(new URL('./src/', import.meta.url));
const { compilerOptions } = JSON.parse(readFileSync(new URL('./tsconfig.json', import.meta.url), 'utf8'));

const aliases = Object.entries<string[]>(compilerOptions.paths).map(([key, [target]]) =>
  key.endsWith('/*')
    ? { find: new RegExp(`^${key.slice(0, -2)}/(.*)$`), replacement: `${src}${target.slice(0, -1)}$1` }
    : { find: new RegExp(`^${key}$`), replacement: `${src}${target}` },
);

export default defineConfig({
  resolve: { alias: aliases },
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    setupFiles: ['src/tests/setup-env.ts'],
  },
});
