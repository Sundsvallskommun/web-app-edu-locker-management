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

export type ActionResult = object;

export interface AssignLockerRequest {
  /** @format uuid */
  lockerId?: string;
  /** @format uuid */
  personId?: string;
}

export interface ClassForecast {
  /** @format uuid */
  pupil?: string;
  givenname?: string | null;
  lastname?: string | null;
  forecastPeriod?: string | null;
  /** @format int32 */
  schoolYear?: number | null;
  /** @format int32 */
  subjectsOpenToForecast?: number;
  /** @format int32 */
  approved?: number;
  /** @format int32 */
  warnings?: number;
  /** @format int32 */
  unapproved?: number;
  /** @format int32 */
  presence?: number | null;
  className?: string | null;
  typeOfSchool?: string | null;
  /** @format int32 */
  totalSubjects?: number;
  teachers?: PupilTeacher[] | null;
}

export interface ClassGridForecast {
  /** @format uuid */
  pupil?: string;
  givenname?: string | null;
  lastname?: string | null;
  className?: string | null;
  /** @format int32 */
  presence?: number | null;
  typeOfSchool?: string | null;
  forecasts?: PupilClassGridForecast[] | null;
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

export interface CopyForecast {
  /** @format uuid */
  groupId?: string;
  period?: string | null;
  previusPeriod?: string | null;
  /** @format int32 */
  schoolYear?: number;
  /** @format int32 */
  previusSchoolYear?: number;
  /** @format uuid */
  teacherId?: string;
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

export interface CreateForecast {
  /** @format uuid */
  pupilId?: string;
  /** @format uuid */
  groupId?: string;
  period?: string | null;
  /** @format int32 */
  schoolYear?: number;
  /** @format int32 */
  forecast?: number;
  /** @format uuid */
  teacherId?: string;
}

export interface CreateLockerRequest {
  newLockerNames?: string[] | null;
  lockType?: string | null;
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
  lockType?: string | null;
  codeLockId?: string | null;
  building?: string | null;
  buildingFloor?: string | null;
  status?: string | null;
}

export interface EditLockerResponse {
  successfulLockers?: LockerIdName[] | null;
  failedLockers?: LockerAdditionError[] | null;
}

export interface EditLockersStatusRequest {
  lockerIds?: string[] | null;
  status?: string | null;
}

export interface EduUser {
  /** @format uuid */
  personId?: string;
  personNumber?: string | null;
  givenname?: string | null;
  lastname?: string | null;
  classified?: string | null;
  iCalURI?: string | null;
  domain?: string | null;
  loginname?: string | null;
  displayname?: string | null;
  smtpAddress?: string | null;
  /** @format uuid */
  unitGUID?: string | null;
  typeOfSchool?: string | null;
  signatur?: string | null;
  role?: string | null;
  groups?: GroupIdList[] | null;
}

export interface FileContentResultActionResult {
  result?: ActionResult;
  /** @format binary */
  value?: File | null;
}

export interface ForecastUserRole {
  role?: string | null;
  typeOfSchool?: string | null;
  /** @format uuid */
  unitId?: string;
}

export interface GetLockersModel {
  /** @format uuid */
  lockerId?: string;
  name?: string | null;
  lockType?: string | null;
  building?: string | null;
  buildingFloor?: string | null;
  assignedTo?: PupilClassNames;
  /** @format uuid */
  unitId?: string;
  status?: string | null;
  codeLockId?: string | null;
  /** @format int32 */
  activeCodeId?: number | null;
  activeCode?: string | null;
}

export interface Group {
  groupId?: string | null;
  /** @format uuid */
  unitGUID?: string;
  code?: string | null;
  name?: string | null;
  description?: string | null;
  type?: string | null;
  /**
   * @format date
   * @example "2023-01-01"
   */
  startDate?: string | null;
  /**
   * @format date
   * @example "2023-01-01"
   */
  endDate?: string | null;
  period?: string | null;
  typeOfSchoolCode?: string | null;
  isVKlassGroup?: boolean;
  /** @format int32 */
  vKlassGroupId?: number | null;
  members?: GroupMember[] | null;
}

export interface GroupForecast {
  /** @format uuid */
  groupId?: string;
  coursePeriod?: string | null;
  groupName?: string | null;
  courseId?: string | null;
  groupType?: string;
  forecastPeriod?: string | null;
  typeOfSchool?: string | null;
  /** @format int32 */
  totalPupils?: number;
  /** @format int32 */
  approvedPupils?: number;
  /** @format int32 */
  warningPupils?: number;
  /** @format int32 */
  unapprovedPupils?: number;
  /** @format int32 */
  presence?: number | null;
  teachers?: PupilTeacher[] | null;
}

export interface GroupIdList {
  groupId?: string | null;
}

export interface GroupLectureMinutes {
  groupId?: string | null;
  courseId?: string | null;
  name?: string | null;
  /** @format int32 */
  totalLectureMinutes?: number;
  /** @format int32 */
  teacherLectureMinutes?: number;
  /** @format int32 */
  teacherCount?: number;
  employeeType?: string | null;
  pupilsProgramme?: Pupilsprogramme[] | null;
  personId?: string | null;
}

export interface GroupMember {
  /** @format uuid */
  personId?: string;
  role?: string | null;
}

export interface GroupPupilForecast {
  groupInfo?: Group;
  pupilsForecast?: PupilForecast[] | null;
}

export interface LockerAdditionError {
  /** @format uuid */
  lockerId?: string | null;
  lockerName?: string | null;
  failureReason?: string | null;
}

export interface LockerIdName {
  /** @format uuid */
  lockerId?: string;
  lockerName?: string | null;
}

export interface PatchPupilPortal {
  isEnabled?: boolean | null;
  displayname?: string | null;
  password?: string | null;
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

export interface PupilClassGridForecast {
  /** @format uuid */
  groupId?: string | null;
  courseName?: string | null;
  courseId?: string | null;
  /** @format int32 */
  forecast?: number | null;
  /** @format int32 */
  previousForecast?: number | null;
  /** @format int32 */
  schoolYear?: number | null;
  forecastPeriod?: string | null;
  /** @format uuid */
  forecastTeacher?: string | null;
}

export interface PupilClassNames {
  pupilName?: string | null;
  className?: string | null;
}

export interface PupilForecast {
  /** @format uuid */
  pupil?: string | null;
  /** @format uuid */
  groupId?: string | null;
  forecastPeriod?: string | null;
  /** @format int32 */
  schoolYear?: number | null;
  /** @format int32 */
  subjectsOpenToForecast?: number | null;
  /** @format int32 */
  forecast?: number | null;
  /** @format int32 */
  previousForecast?: number | null;
  /** @format uuid */
  forecastTeacher?: string | null;
  givenname?: string | null;
  lastname?: string | null;
  className?: string | null;
  classGroupId?: string | null;
  courseName?: string | null;
  courseId?: string | null;
  /** @format int32 */
  presence?: number | null;
  typeOfSchool?: string | null;
  teachers?: PupilTeacher[] | null;
}

export interface PupilLockerIdNameResponse {
  /** @format uuid */
  lockerId?: string;
  lockerName?: string | null;
}

export interface PupilSumForecast {
  givenname?: string | null;
  lastname?: string | null;
  className?: string | null;
  /** @format uuid */
  pupil?: string | null;
  /** @format uuid */
  groupId?: string | null;
  /** @format int32 */
  schoolYear?: number | null;
  forecastPeriod?: string | null;
  /** @format int32 */
  approved?: number;
  /** @format int32 */
  warnings?: number;
  /** @format int32 */
  unapproved?: number;
  /** @format int32 */
  subjectsOpenToForecast?: number | null;
  /** @format int32 */
  totalSubjects?: number;
  /** @format int32 */
  presence?: number | null;
  typeOfSchool?: string | null;
  teachers?: PupilTeacher[] | null;
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
  /**
   * @format date
   * @example "2023-01-01"
   */
  birthDate?: string | null;
  name?: string | null;
  className?: string | null;
  lockers?: PupilLockerIdNameResponse[] | null;
  teachers?: PupilTeacher[] | null;
}

export interface Pupilsprogramme {
  programme?: string | null;
  /** @format int32 */
  pupilsInProgramme?: number;
}

export interface School {
  /** @format uuid */
  unitId?: string;
  name?: string | null;
  /** @format int32 */
  sortCol?: number;
}

export interface SchoolClassPupil {
  /** @format uuid */
  personId?: string;
  personNumber?: string | null;
  /** @format uuid */
  userId?: string;
  givenname?: string | null;
  lastname?: string | null;
  loginname?: string | null;
  password?: string | null;
  displayname?: string | null;
  isEnabled?: boolean;
  /** @format int32 */
  domainId?: number;
  primaryEMailAddress?: string | null;
  name?: string | null;
  yearGroup?: string | null;
  typeOfSchool?: string | null;
  programme?: string | null;
  yearCode?: string | null;
  className?: string | null;
  isWriteable?: boolean;
}

export interface SchoolType {
  typeOfSchoolCode?: string | null;
  typeOfSchoolName?: string | null;
  schoolUnits?: SchoolUnit[] | null;
}

export interface SchoolUnit {
  /** @format uuid */
  unitGUID?: string;
  unitName?: string | null;
  unitCode?: string | null;
  schoolUnitCode?: string | null;
  typeOfSchoolCode?: string | null;
  groups?: Group[] | null;
}

export interface StudentPupil {
  personNumber?: string | null;
  givenname?: string | null;
  lastname?: string | null;
  gender?: string | null;
  smtpAddress?: string | null;
  privateMobile?: string | null;
  homePhone?: string | null;
  address?: string | null;
  co?: string | null;
  countyMunicipalityCode?: string | null;
  postalCode?: string | null;
  city?: string | null;
  yearGroup?: string | null;
  programme?: string | null;
  scbCode?: string | null;
  unitCode?: string | null;
  schoolName?: string | null;
  pupilGroup?: string | null;
}

export interface TeacherGroupLectureMinutes {
  personId?: string | null;
  sign?: string | null;
  groups?: GroupLectureMinutes[] | null;
}

export interface UnassignLockerRequest {
  lockerIds?: string[] | null;
  status?: string | null;
}

export interface UnassignLockerResponse {
  successfulLockerIds?: string[] | null;
  failedLockers?: LockerAdditionError[] | null;
}
