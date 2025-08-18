import {
  AssignLockerRequest,
  CreateLockerRequest,
  EditLockerRequest,
  EditLockerResponse,
  GetLockersModel,
  GetLockersModelOrderBy,
  GetLockersModelPagedOffsetResponse,
  LockerAdditionError,
  LockerIdName,
  LockerStatus,
  LockType,
  PupilClassNames,
  SortDirection,
  UnassignLockerResponse,
} from '@/data-contracts/pupillocker/data-contracts';
import ApiResponse from '@/interfaces/api-service.interface';
import { AssignLockersRequest, EditLockersStatusBody, LockerFilter, LockerQueryParams } from '@/interfaces/lockers.interface';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class LockerOwner implements PupilClassNames {
  @IsString()
  @IsOptional()
  pupilName?: string;
  @IsString()
  @IsOptional()
  className?: string;
}

export class SchoolLockerFilter implements LockerFilter {
  @IsEnum(LockerStatus)
  @IsOptional()
  status?: LockerStatus;
  @IsString()
  @IsOptional()
  building?: string;
  @IsString()
  @IsOptional()
  buildingFloor?: string;
  @IsString()
  @IsOptional()
  nameQueryFilter?: string;
}

export class SchoolLockerQueryParams implements LockerQueryParams {
  @ValidateNested()
  @Type(() => SchoolLockerFilter)
  @IsOptional()
  filter?: SchoolLockerFilter;
  @IsInt()
  @IsOptional()
  PageNumber?: number;
  @IsInt()
  @IsOptional()
  PageSize?: number;
  @Reflect.metadata('design:type', { name: 'string' })
  @IsEnum(GetLockersModelOrderBy)
  OrderBy: GetLockersModelOrderBy;
  @Reflect.metadata('design:type', { name: 'string' })
  @IsEnum(SortDirection)
  OrderDirection: SortDirection;
}

export class LockerAssign implements AssignLockerRequest {
  @IsString()
  lockerId: string;
  @IsString()
  personId: string;
}

export class CreateLockerBody implements CreateLockerRequest {
  @IsArray()
  @IsString({ each: true })
  newLockerNames: string[];
  @IsEnum(LockType)
  lockType: LockType;
  @IsString()
  building: string;
  @IsString()
  buildingFloor: string;
}
export class EditLockerBody implements EditLockerRequest {
  @IsString()
  @IsOptional()
  name?: string;
  @IsEnum(LockType)
  @IsOptional()
  lockType?: LockType;
  @IsString()
  @IsOptional()
  codeLockId?: string;
  @IsString()
  @IsOptional()
  building?: string;
  @IsString()
  @IsOptional()
  buildingFloor?: string;
  @IsEnum(LockerStatus)
  @IsOptional()
  status?: LockerStatus;
}
export class LockerAssignBody implements AssignLockersRequest {
  @ValidateNested({ each: true })
  @Type(() => LockerAssign)
  data: LockerAssign[];
}
export class LockerStatusUpdate implements EditLockersStatusBody {
  @IsEnum(LockerStatus)
  status: LockerStatus;
  @IsArray()
  @IsString({ each: true })
  lockerIds: string[];
}

export class EditedLocker implements LockerIdName {
  @IsString()
  lockerId: string;
  @IsString()
  lockerName: string;
}

export class EditedLockerWithFailure implements LockerAdditionError {
  @IsString()
  lockerId: string;
  @IsString()
  lockerName: string;
  @IsString()
  @IsOptional()
  failureReason?: string;
}

export class LockerEditResponse implements EditLockerResponse {
  @ValidateNested({ each: true })
  @Type(() => EditedLocker)
  successfulLockers: EditedLocker[];
  @ValidateNested({ each: true })
  @Type(() => EditedLockerWithFailure)
  failedLockers: EditedLockerWithFailure[];
}
export class LockerUnassignResponse implements UnassignLockerResponse {
  @IsArray()
  @IsString({ each: true })
  successfulLockerIds: string[];
  @ValidateNested({ each: true })
  @Type(() => EditedLockerWithFailure)
  failedLockers: EditedLockerWithFailure[];
}

export class SchoolLocker implements GetLockersModel {
  @IsString()
  @IsOptional()
  lockerId: string;
  @IsString()
  @IsOptional()
  name?: string;
  @IsEnum(LockType)
  @IsOptional()
  lockType?: LockType;
  @IsString()
  @IsOptional()
  building?: string;
  @IsString()
  @IsOptional()
  buildingFloor?: string;
  @IsString()
  @IsOptional()
  unitId?: string;
  @IsEnum(LockerStatus)
  @IsOptional()
  status?: LockerStatus;
  @IsString()
  @IsOptional()
  codeLockId?: string;
  @IsInt()
  @IsOptional()
  activeCodeId?: number;
  @IsString()
  @IsOptional()
  activeCode?: string;
  @ValidateNested()
  @Type(() => LockerOwner)
  @IsOptional()
  assignedTo?: LockerOwner;
}

export class SchoolLockerApiResponse implements ApiResponse<SchoolLocker[]>, Omit<GetLockersModelPagedOffsetResponse, 'data'> {
  @ValidateNested({ each: true })
  @Type(() => SchoolLocker)
  data: SchoolLocker[];
  @IsString()
  message: string;
  @IsInt()
  pageNumber?: number;
  @IsInt()
  pageSize?: number;
  @IsInt()
  totalRecords?: number;
  @IsInt()
  totalPages?: number;
}
export class SingleSchoolLockerApiResponse implements ApiResponse<SchoolLocker> {
  @ValidateNested()
  @Type(() => SchoolLocker)
  data: SchoolLocker;
  @IsString()
  message: string;
}
export class SchoolLockerUpdateApiResponse implements ApiResponse<LockerEditResponse> {
  @ValidateNested()
  @Type(() => LockerEditResponse)
  data: LockerEditResponse;
  @IsString()
  message: string;
}
export class SchoolLockerUnassignApiResponse implements ApiResponse<LockerUnassignResponse> {
  @ValidateNested()
  @Type(() => LockerUnassignResponse)
  data: LockerUnassignResponse;
  @IsString()
  message: string;
}
export class SchoolLockerEditApiResponse implements ApiResponse<boolean> {
  @IsBoolean()
  data: boolean;
  @IsString()
  message: string;
}
