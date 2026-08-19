import { CodeLockController } from '@controllers/codelock.controller';
import { HealthController } from '@controllers/health.controller';
import { IndexController } from '@controllers/index.controller';
import { LockerController } from '@controllers/locker.controller';
import { NoticeController } from '@controllers/notice.controller';
import { PupilController } from '@controllers/pupil.controller';
import { SchoolController } from '@controllers/school.controller';
import { UserController } from '@controllers/user.controller';

export const registeredControllers = [
  IndexController,
  UserController,
  HealthController,
  LockerController,
  SchoolController,
  PupilController,
  CodeLockController,
  NoticeController,
];
