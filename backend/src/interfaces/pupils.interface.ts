import { PupilsLockerResponseOrderBy, SortDirection } from '@/data-contracts/pupillocker/data-contracts';

export enum PupilsAssignedFilterEnum {
  All = 'All',
  With = 'With',
  Without = 'Without',
}

export interface PupilsLockersFilter {
  groupId?: string;
  nameQueryFilter?: string;
  assignedFilter?: PupilsAssignedFilterEnum;
}

export interface PupilsLockersQueryParams {
  filter?: PupilsLockersFilter;
  PageNumber?: number;
  PageSize?: number;
  OrderBy: PupilsLockerResponseOrderBy;
  OrderDirection: SortDirection;
}

export interface PupilId {
  pupilId: string;
}
