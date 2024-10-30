import {
  EditLockersStatusRequest,
  GetLockersModelOrderBy,
  PupilsLockerResponseOrderBy,
  SortDirection,
} from '@/data-contracts/education/data-contracts';

export enum LockerStatus {
  Free = 'FREE',
  Empty = 'EMPTY',
}

export interface EditLockersStatusBody extends Pick<EditLockersStatusRequest, 'lockerIds'> {
  status: LockerStatus;
}

export interface LockerFilter {
  status?: string;
  building?: string;
  buildingFloor?: string;
  nameQueryFilter?: string;
}

export interface LockerQueryParams {
  filter?: LockerFilter;
  PageNumber?: number;
  PageSize?: number;
  OrderBy: GetLockersModelOrderBy;
  OrderDirection: SortDirection;
}
