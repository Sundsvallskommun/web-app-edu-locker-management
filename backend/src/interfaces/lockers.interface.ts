import {
  AssignLockerRequest,
  EditLockersStatusRequest,
  GetLockersModelOrderBy,
  LockerStatus,
  SortDirection,
} from '@/data-contracts/education/data-contracts';

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
