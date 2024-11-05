import { LockerStatusUpdateStatusEnum, SchoolLocker } from '@data-contracts/backend/data-contracts';

export interface SchoolLockerForm extends Omit<SchoolLocker, 'activeCodeId' | 'status'> {
  assignId?: string;
  activeCodeId?: string;
  status?: LockerStatusUpdateStatusEnum;
}
