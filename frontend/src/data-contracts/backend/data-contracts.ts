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
  status?: 'Ledigt' | 'Ska Tömmas' | 'Tilldelad';
  building?: string;
  buildingFloor?: string;
  nameQueryFilter?: string;
}

export interface SchoolLockerQueryParams {
  filter?: SchoolLockerFilter;
  PageNumber?: number;
  PageSize?: number;
  OrderBy:
    | 'LockerId'
    | 'Name'
    | 'LockType'
    | 'Building'
    | 'BuildingFloor'
    | 'UnitId'
    | 'Status'
    | 'CodeLockId'
    | 'ActiveCodeId'
    | 'ActiveCode'
    | 'PupilName'
    | 'ClassName';
  OrderDirection: 'ASC' | 'DESC';
}

export interface LockerAssign {
  lockerId: string;
  personId: string;
}

export interface CreateLockerBody {
  newLockerNames: string[];
  lockType: 'Inget' | 'Hänglås' | 'Kodlås';
  building: string;
  buildingFloor: string;
}

export interface EditLockerBody {
  name?: string;
  lockType?: 'Inget' | 'Hänglås' | 'Kodlås';
  codeLockId?: string;
  building?: string;
  buildingFloor?: string;
  status?: 'Ledigt' | 'Ska Tömmas' | 'Tilldelad';
}

export interface LockerAssignBody {
  data: LockerAssign[];
}

export interface LockerStatusUpdate {
  status: 'Ledigt' | 'Ska Tömmas' | 'Tilldelad';
  lockerIds: string[];
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
  successfulLockerIds: string[];
  failedLockers: EditedLockerWithFailure[];
}

export interface SchoolLocker {
  lockerId?: string;
  name?: string;
  lockType?: 'Inget' | 'Hänglås' | 'Kodlås';
  building?: string;
  buildingFloor?: string;
  unitId?: string;
  status?: 'Ledigt' | 'Ska Tömmas' | 'Tilldelad';
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

export interface SingleSchoolLockerApiResponse {
  data: SchoolLocker;
  message: string;
}

export interface SchoolLockerUpdateApiResponse {
  data: LockerEditResponse;
  message: string;
}

export interface SchoolLockerUnassignApiResponse {
  data: LockerUnassignResponse;
  message: string;
}

export interface SchoolLockerEditApiResponse {
  data: boolean;
  message: string;
}

export interface SchoolPupil {
  personId: string;
  role?: string;
}

export interface SchoolGroup {
  name?: string;
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

export interface PupilLocker {
  lockerId: string;
  lockerName: string;
}

export interface Teacher {
  givenname?: string;
  lastname?: string;
  personId: string;
  email?: string;
}

export interface PupilsFilter {
  groupId?: string;
  nameQueryFilter?: string;
  assignedFilter?: 'All' | 'With' | 'Without';
}

export interface PupilsQueryParams {
  filter?: PupilsFilter;
  PageNumber?: number;
  PageSize?: number;
  OrderBy: 'PersonId' | 'BirthDate' | 'Name' | 'ClassName' | 'LockerName' | 'TeacherGivenName';
  OrderDirection: 'ASC' | 'DESC';
}

export interface Pupil {
  personId: string;
  birthDate?: string;
  name?: string;
  className?: string;
  lockers: PupilLocker[];
  teachers: Teacher[];
}

export interface PupilApiResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  data: Pupil[];
  message: string;
}

export interface UpdateCodeLock {
  activeCodeId: number;
  code1?: string;
  code2?: string;
  code3?: string;
  code4?: string;
  code5?: string;
}

export interface CreateCodeLock {
  codeLockId: string;
  lockerId?: string;
  activeCodeId: number;
  code1?: string;
  code2?: string;
  code3?: string;
  code4?: string;
  code5?: string;
}

export interface CodeLock {
  codeLockId?: string;
  lockerId?: string;
  activeCodeId?: number;
  code1?: string;
  code2?: string;
  code3?: string;
  code4?: string;
  code5?: string;
}

export interface CodeLockApiResponse {
  data: CodeLock;
  message: string;
}

export interface CodeLocksApiResponse {
  data: CodeLock[];
  message: string;
}
