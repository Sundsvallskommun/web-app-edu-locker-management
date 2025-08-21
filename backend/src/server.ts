import App from '@/app';
import { IndexController } from '@controllers/index.controller';
import validateEnv from '@utils/validateEnv';
import { UserController } from './controllers/user.controller';
import { HealthController } from './controllers/health.controller';
import { LockerController } from './controllers/locker.controller';
import { SchoolController } from './controllers/school.controller';
import { PupilController } from './controllers/pupil.controller';
import { CodeLockController } from './controllers/codelock.controller';
import { NoticeController } from './controllers/notice.controller';

validateEnv();

const app = new App([
  IndexController,
  UserController,
  HealthController,
  LockerController,
  SchoolController,
  PupilController,
  CodeLockController,
  NoticeController,
]);

app.listen();
