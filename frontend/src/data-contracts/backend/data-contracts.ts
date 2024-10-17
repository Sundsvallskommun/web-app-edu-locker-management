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
}

export interface UserApiResponse {
  data: User;
  message: string;
}

export interface LockerOwner {
  pupilName?: string;
  className?: string;
}

export interface SchoolLocker {
  lockedId?: string;
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
}
