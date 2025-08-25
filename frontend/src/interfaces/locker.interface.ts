import {
  LockerStatusUpdate,
  Pupil,
  SchoolLocker,
  SchoolLockerQueryParams,
} from '@data-contracts/backend/data-contracts';

export interface SchoolLockerForm extends Omit<SchoolLocker, 'activeCodeId'> {
  toAssign?: Pupil;
  activeCodeId?: string;
}

export type LockerOrderByType = SchoolLockerQueryParams['OrderBy'];
export type OrderDirectionType = SchoolLockerQueryParams['OrderDirection'];
export type LockerStatus = LockerStatusUpdate['status'];
export type LockType = SchoolLocker['lockType'];

export enum FailureReason {
  LockerAlreadyExists = 'Locker already exists',
}
