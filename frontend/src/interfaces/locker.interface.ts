import { SchoolLocker, SchoolLockerQueryParams } from '@data-contracts/backend/data-contracts';

export interface SchoolLockerForm extends Omit<SchoolLocker, 'activeCodeId'> {
  assignId?: string;
  activeCodeId?: string;
}

export type OrderByType = SchoolLockerQueryParams['OrderBy'];
export type OrderDirectionType = SchoolLockerQueryParams['OrderDirection'];
export type LockerStatus = SchoolLocker['status'];
export type LockType = SchoolLocker['lockType'];
