import { EditLockersStatusRequest } from '@/data-contracts/education/data-contracts';

export enum LockerStatus {
  Free = 'FREE',
  Empty = 'EMPTY',
}

export interface EditLockersStatusBody extends Pick<EditLockersStatusRequest, 'lockerIds'> {
  status: LockerStatus;
}
