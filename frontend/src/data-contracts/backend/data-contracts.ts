/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface User {
  name: string;
  username: string;
  schoolUnits: any[];
}

export interface UserApiResponse {
  data: User;
  message: string;
}

export interface LockerOwner {
  pupilName?: string;
  className?: string;
}

export interface SchoolLockerFilter {
  status?: string;
  building?: string;
  buildingFloor?: string;
  nameQueryFilter?: string;
}

export interface SchoolLockerQueryParams {
  filter?: SchoolLockerFilter;
  PageNumber?: number;
  PageSize?: number;
  OrderBy: SchoolLockerQueryParamsOrderByEnum;
  OrderDirection: SchoolLockerQueryParamsOrderDirectionEnum;
}

export interface LockerStatusUpdate {
  status: LockerStatusUpdateStatusEnum;
  lockerIds: any[];
}

export interface EditedLocker {
  lockerId: string;
  lockerName: string;
}

export interface EditedLockerWithFailure {
  lockerId: string;
  lockerName: string;
  failureReason?: string;
}

export interface LockerEditResponse {
  successfulLockers: EditedLocker[];
  failedLockers: EditedLockerWithFailure[];
}

export interface LockerUnassignResponse {
  successfulLockerIds: any[];
  failedLockers: EditedLockerWithFailure[];
}

export interface SchoolLocker {
  lockerId?: string;
  name?: string;
  lockType?: string;
  building?: string;
  buildingFloor?: string;
  unitId?: string;
  status?: string;
  codeLockId?: string;
  activeCodeId?: number;
  activeCode?: string;
  assignedTo: LockerOwner;
}

export interface SchoolLockerApiResponse {
  data: SchoolLocker[];
  message: string;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface SchoolLockerUpdateApiResponse {
  data: LockerEditResponse;
  message: string;
}

export interface SchoolLockerUnassignApiResponse {
  data: LockerUnassignResponse;
  message: string;
}

export interface SchoolPupil {
  personId: string;
  role?: string;
}

export interface SchoolGroup {
  groupId?: string;
  unitGUID?: string;
  code?: string;
  description?: string;
  type?: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  startDate?: string;
  /** @pattern \d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d+Z? */
  endDate?: string;
  period?: string;
  typeOfSchoolCode?: string;
  isVKlassGroup: boolean;
  vKlassGroupId?: number;
  members: SchoolPupil[];
}

export interface Building {
  buildingName?: string;
  floors?: any[];
}

export interface School {
  unitGUID?: string;
  unitName?: string;
  unitCode?: string;
  schoolUnitCode?: string;
  typeOfSchoolCode?: string;
  groups: SchoolGroup[];
  buildings: Building[];
}

export interface SchoolApiResponse {
  data: School[];
  message: string;
}

export enum SchoolLockerQueryParamsOrderByEnum {
  LockerId = 'LockerId',
  Name = 'Name',
  LockType = 'LockType',
  Building = 'Building',
  BuildingFloor = 'BuildingFloor',
  UnitId = 'UnitId',
  Status = 'Status',
  CodeLockId = 'CodeLockId',
  ActiveCodeId = 'ActiveCodeId',
  ActiveCode = 'ActiveCode',
  PupilName = 'PupilName',
  ClassName = 'ClassName',
}

export enum SchoolLockerQueryParamsOrderDirectionEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum LockerStatusUpdateStatusEnum {
  FREE = 'FREE',
  EMPTY = 'EMPTY',
}

export enum LockerControllerGetSchoolLockersParamsOrderByEnum {
  LockerId = 'LockerId',
  Name = 'Name',
  LockType = 'LockType',
  Building = 'Building',
  BuildingFloor = 'BuildingFloor',
  UnitId = 'UnitId',
  Status = 'Status',
  CodeLockId = 'CodeLockId',
  ActiveCodeId = 'ActiveCodeId',
  ActiveCode = 'ActiveCode',
  PupilName = 'PupilName',
  ClassName = 'ClassName',
}

export enum LockerControllerGetSchoolLockersParamsOrderDirectionEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}
