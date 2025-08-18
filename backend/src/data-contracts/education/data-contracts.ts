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

export interface CatchmentSchool {
  schoolId?: string | null;
  schoolName?: string | null;
}

export interface FileContentResultActionResult {
  result?: ActionResult;
  /** @format binary */
  value?: File | null;
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

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  /** @format int32 */
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: any;
}

export interface PupilByPersonalNumber {
  /** @format uuid */
  personId?: string;
  /** @format uuid */
  pupilId?: string;
  givenname?: string | null;
  lastname?: string | null;
  gender?: string | null;
  smtpAddress?: string | null;
  address?: string | null;
  countyMunicipalityCode?: string | null;
  postalCode?: string | null;
  city?: string | null;
  /** @format int32 */
  yearGroup?: number;
  programme?: string | null;
  scbCode?: string | null;
  unitCode?: string | null;
  unitName?: string | null;
  schoolName?: string | null;
  schoolCode?: string | null;
  pupilGroup?: string | null;
}

export interface PupilEnrolment {
  programme?: string | null;
  schoolId?: string | null;
  schoolName?: string | null;
  unitId?: string | null;
  unitName?: string | null;
  schoolType?: string | null;
  /** @format int32 */
  schoolYear?: number;
  startDate?: string | null;
  endDate?: string | null;
  className?: string | null;
}

export interface PupilSchoolEnrolments {
  /** @format uuid */
  personId?: string;
  enrolment?: PupilEnrolment;
  upcomingEnrolment?: UpcomingEnrolment;
  catchmentSchool?: CatchmentSchool;
}

export interface Pupilsprogramme {
  programme?: string | null;
  /** @format int32 */
  pupilsInProgramme?: number;
}

export enum SchoolTypeEnum {
  GR = 'GR',
  GY = 'GY',
}

export interface SchoolUnitV2 {
  /** @format uuid */
  unitId?: string;
  unitName?: string | null;
  organisationCode?: string | null;
  schoolUnitCode?: string | null;
  schoolTypes?: string[] | null;
}

export interface SchoolWithUnits {
  /** @format uuid */
  schoolId?: string;
  schoolName?: string | null;
  organisationCode?: string | null;
  schoolUnits?: SchoolUnitV2[] | null;
}

export interface TeacherGroupLectureMinutes {
  personId?: string | null;
  sign?: string | null;
  groups?: GroupLectureMinutes[] | null;
}

export interface UpcomingEnrolment {
  schoolId?: string | null;
  schoolName?: string | null;
  unitId?: string | null;
  unitName?: string | null;
  schoolType?: string | null;
  /** @format int32 */
  schoolYear?: number;
  startDate?: string | null;
  endDate?: string | null;
}
