import { PupilsLockerResponseOrderBy, SortDirection } from '@/data-contracts/education/data-contracts';

export interface PupilsLockersFilter {
  groupId?: string;
  nameQueryFilter?: string;
}

export interface PupilsLockersQueryParams {
  filter?: PupilsLockersFilter;
  PageNumber?: number;
  PageSize?: number;
  OrderBy: PupilsLockerResponseOrderBy;
  OrderDirection: SortDirection;
}
