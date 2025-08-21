import {
  AssignLockerRequest,
  EditLockersStatusRequest,
  GetLockersModelOrderBy,
  LockerStatus,
  SortDirection,
} from '@/data-contracts/pupillocker/data-contracts';

export interface EditLockersStatusBody extends Pick<EditLockersStatusRequest, 'lockerIds'> {
  status: LockerStatus;
}

export interface LockerFilter {
  status?: LockerStatus;
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

export interface AssignLockersRequest {
  data: AssignLockerRequest[];
}

export interface UnassignLocker {
  lockerId: string;
  pupilId?: string;
  email?: string;
}
export interface UnassignLockersRequest {
  status: LockerStatus;
  lockers: UnassignLocker[];
}
