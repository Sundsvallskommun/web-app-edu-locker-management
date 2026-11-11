import App from '@/app';
import { registeredControllers } from '@/registered-controllers';
import { initRedis } from '@utils/initRedis';
import validateEnv from '@utils/validateEnv';

validateEnv();

async function bootstrap() {
  // Connects Redis only when SESSION_STORE=redis; App then builds the session store from it.
  await initRedis();

  const app = new App(registeredControllers);

  app.listen();
}

bootstrap().catch(err => {
  console.error('Failed to start app:', err);
  process.exit(1);
});
