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

export interface AssignLockerRequest {
  /** @format uuid */
  lockerId?: string;
  /** @format uuid */
  personId?: string;
}

export interface CodeLockLocker {
  codeLockId?: string | null;
  lockerId?: string | null;
  /** @format int32 */
  activeCodeId?: number | null;
  code1?: string | null;
  code2?: string | null;
  code3?: string | null;
  code4?: string | null;
  code5?: string | null;
}

export interface CreateCodeLockRequest {
  codeLockId?: string | null;
  /** @format uuid */
  lockerId?: string | null;
  /** @format int32 */
  activeCodeId?: number | null;
  code1?: string | null;
  code2?: string | null;
  code3?: string | null;
  code4?: string | null;
  code5?: string | null;
}

export interface CreateLockerRequest {
  newLockerNames?: string[] | null;
  lockType?: LockType;
  building?: string | null;
  buildingFloor?: string | null;
}

export interface EditCodeLockRequest {
  /** @format int32 */
  activeCodeId?: number | null;
  code1?: string | null;
  code2?: string | null;
  code3?: string | null;
  code4?: string | null;
  code5?: string | null;
}

export interface EditLockerRequest {
  name?: string | null;
  lockType?: LockType;
  codeLockId?: string | null;
  building?: string | null;
  buildingFloor?: string | null;
  status?: LockerStatus;
}

export interface EditLockerResponse {
  successfulLockers?: LockerIdName[] | null;
  failedLockers?: LockerAdditionError[] | null;
}

export interface EditLockersStatusRequest {
  lockerIds?: string[] | null;
  status?: LockerStatus;
}

export interface GetLockersModel {
  /** @format uuid */
  lockerId?: string;
  name?: string | null;
  lockType?: LockType;
  building?: string | null;
  buildingFloor?: string | null;
  /** @format uuid */
  schoolId?: string;
  status?: LockerStatus;
  codeLockId?: string | null;
  /** @format int32 */
  activeCodeId?: number | null;
  activeCode?: string | null;
  assignedTo?: PupilClassNames;
}

export enum GetLockersModelOrderBy {
  LockerId = 'LockerId',
  Name = 'Name',
  LockType = 'LockType',
  Building = 'Building',
  BuildingFloor = 'BuildingFloor',
  SchoolId = 'SchoolId',
  Status = 'Status',
  CodeLockId = 'CodeLockId',
  ActiveCodeId = 'ActiveCodeId',
  ActiveCode = 'ActiveCode',
  PupilName = 'PupilName',
  ClassName = 'ClassName',
}

/** Används för att returnera paginerat resultat */
export interface GetLockersModelPagedOffsetResponse {
  /**
   * Vilken Sida
   * @format int32
   */
  pageNumber?: number;
  /**
   * Hur många items per sida
   * @format int32
   */
  pageSize?: number;
  /**
   * Antalet
   * @format int32
   */
  totalRecords?: number;
  /**
   * Antal sidor
   * @format int32
   */
  totalPages?: number;
  /** Lista med data */
  data?: GetLockersModel[] | null;
}

export enum LockType {
  Inget = 'Inget',
  Hanglas = 'Hänglås',
  Kodlas = 'Kodlås',
}

export interface LockerAdditionError {
  /** @format uuid */
  lockerId?: string | null;
  lockerName?: string | null;
  failureReason?: string | null;
}

export interface LockerBuilding {
  buildingName?: string | null;
  floors?: string[] | null;
}

export enum LockerFilter {
  All = 'All',
  With = 'With',
  Without = 'Without',
}

export interface LockerIdName {
  /** @format uuid */
  lockerId?: string;
  lockerName?: string | null;
}

export enum LockerStatus {
  Ledigt = 'Ledigt',
  SkaTommas = 'Ska Tömmas',
  Tilldelad = 'Tilldelad',
}

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  /** @format int32 */
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: any;
}

export interface PupilClassNames {
  pupilName?: string | null;
  className?: string | null;
}

export interface PupilLockerIdNameResponse {
  /** @format uuid */
  lockerId?: string;
  lockerName?: string | null;
}

export interface PupilTeacher {
  givenname?: string | null;
  lastname?: string | null;
  /** @format uuid */
  personId?: string;
  email?: string | null;
}

export interface PupilsLockerResponse {
  /** @format uuid */
  personId?: string;
  birthDate?: string | null;
  name?: string | null;
  className?: string | null;
  lockers?: PupilLockerIdNameResponse[] | null;
  teachers?: PupilTeacher[] | null;
}

export enum PupilsLockerResponseOrderBy {
  PersonId = 'PersonId',
  BirthDate = 'BirthDate',
  Name = 'Name',
  ClassName = 'ClassName',
  Email = 'Email',
  LockerName = 'LockerName',
  TeacherGivenName = 'TeacherGivenName',
}

/** Används för att returnera paginerat resultat */
export interface PupilsLockerResponsePagedOffsetResponse {
  /**
   * Vilken Sida
   * @format int32
   */
  pageNumber?: number;
  /**
   * Hur många items per sida
   * @format int32
   */
  pageSize?: number;
  /**
   * Antalet
   * @format int32
   */
  totalRecords?: number;
  /**
   * Antal sidor
   * @format int32
   */
  totalPages?: number;
  /** Lista med data */
  data?: PupilsLockerResponse[] | null;
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface UnassignLockerRequest {
  lockerIds?: string[] | null;
  status?: LockerStatus;
}

export interface UnassignLockerResponse {
  successfulLockerIds?: string[] | null;
  failedLockers?: LockerAdditionError[] | null;
}
