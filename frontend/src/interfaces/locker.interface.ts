import { LockerStatusUpdate, SchoolLocker, SchoolLockerQueryParams } from '@data-contracts/backend/data-contracts';

export interface SchoolLockerForm extends Omit<SchoolLocker, 'activeCodeId'> {
  assignId?: string;
  activeCodeId?: string;
}

export type LockerOrderByType = SchoolLockerQueryParams['OrderBy'];
export type OrderDirectionType = SchoolLockerQueryParams['OrderDirection'];
export type LockerStatus = LockerStatusUpdate['status'];
export type LockType = SchoolLocker['lockType'];

export enum FailureReason {
  LockerAlreadyExists = 'Locker already exists',
}
