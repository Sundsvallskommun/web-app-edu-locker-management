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

export interface LockerAssign {
  lockerId: string;
  personId: string;
  email?: string;
}

export interface LockerAssignBody {
  data: LockerAssign[];
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
  pupilId?: string;
  pupilEmail?: string;
  comment?: string;
}

export interface LockerStatusUpdate {
  status: 'Ledigt' | 'Ska Tömmas' | 'Tilldelad';
  lockerIds: string[];
}

export interface UnassignLocker {
  lockerId: string;
  pupilId?: string | null;
  email?: string;
}

export interface UnassignLockerBody {
  lockers: UnassignLocker[];
  status: 'Ledigt' | 'Ska Tömmas' | 'Tilldelad';
}

export interface LockerOwner {
  pupilName?: string | null;
  className?: string | null;
  email?: string;
  personId?: string;
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
    | 'SchoolId'
    | 'Status'
    | 'Comment'
    | 'CodeLockId'
    | 'ActiveCodeId'
    | 'ActiveCode'
    | 'PupilName'
    | 'ClassName';
  OrderDirection: 'ASC' | 'DESC';
}

export interface EditedLocker {
  lockerId: string;
  lockerName: string;
}

export interface NoticedPupil {
  pupilId: string;
  reason?: string;
}

export interface EditedLockerWithFailure {
  lockerId: string;
  lockerName: string;
  failureReason?: string;
}

export interface LockerEditResponse {
  successfulLockers: EditedLocker[];
  failedLockers: EditedLockerWithFailure[];
  noticedPupils?: NoticedPupil[];
  failedNoticedPupils?: NoticedPupil[];
}

export interface SingleLockerEditResponse {
  lockerId: string;
  noticed?: boolean;
  noticeFailReason?: string;
}

export interface LockerUnassignResponse {
  successfulLockerIds: string[];
  failedLockers: EditedLockerWithFailure[];
  noticedPupils?: NoticedPupil[];
  failedNoticedPupils?: NoticedPupil[];
}

export interface SchoolLocker {
  lockerId?: string;
  name?: string;
  lockType?: 'Inget' | 'Hänglås' | 'Kodlås';
  building?: string;
  buildingFloor?: string;
  schoolId?: string;
  status?: 'Ledigt' | 'Ska Tömmas' | 'Tilldelad';
  codeLockId?: string;
  activeCodeId?: number;
  activeCode?: string;
  assignedTo?: LockerOwner;
  comment?: string;
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
  data: SingleLockerEditResponse;
  message: string;
}

export interface SchoolUnit {
  unitId: string;
  unitName: string;
  organisationCode?: string | null;
  schoolUnitCode?: string | null;
  schoolTypes?: string[] | null;
}

export interface Building {
  buildingName?: string | null;
  floors?: string[] | null;
}

export interface School {
  schoolId: string;
  schoolName?: string | null;
  organisationCode?: string | null;
  schoolUnits?: SchoolUnit[] | null;
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
  unitId?: string;
  nameQueryFilter?: string;
  assignedFilter?: 'All' | 'With' | 'Without';
}

export interface PupilsQueryParams {
  filter?: PupilsFilter;
  PageNumber?: number;
  PageSize?: number;
  OrderBy: 'PersonId' | 'BirthDate' | 'Name' | 'ClassName' | 'Email' | 'LockerName' | 'TeacherGivenName';
  OrderDirection: 'ASC' | 'DESC';
}

export interface Pupil {
  personId: string;
  birthDate?: string;
  email: string;
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

export interface NoticeDto {
  pupilId: string;
  email: string;
  message?: string;
  lockerIds?: string[];
}
