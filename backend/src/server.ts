import App from '@/app';
import { IndexController } from '@controllers/index.controller';
import validateEnv from '@utils/validateEnv';
import { UserController } from './controllers/user.controller';
import { HealthController } from './controllers/health.controller';
import { LockerController } from './controllers/locker.controller';

validateEnv();

const app = new App([IndexController, UserController, HealthController, LockerController]);

app.listen();
