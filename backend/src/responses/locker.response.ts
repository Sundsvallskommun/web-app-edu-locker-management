import {
  EditLockerResponse,
  GetLockersModel,
  GetLockersModelOrderBy,
  GetLockersModelPagedOffsetResponse,
  LockerAdditionError,
  LockerIdName,
  PupilClassNames,
  SortDirection,
  UnassignLockerResponse,
} from '@/data-contracts/education/data-contracts';
import ApiResponse from '@/interfaces/api-service.interface';
import { EditLockersStatusBody, LockerFilter, LockerQueryParams, LockerStatus } from '@/interfaces/lockers.interface';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class LockerOwner implements PupilClassNames {
  @IsString()
  @IsOptional()
  pupilName?: string;
  @IsString()
  @IsOptional()
  className?: string;
}

export class SchoolLockerFilter implements LockerFilter {
  @IsString()
  @IsOptional()
  status?: string;
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

export class LockerStatusUpdate implements EditLockersStatusBody {
  @IsEnum(LockerStatus)
  status: LockerStatus;
  @IsArray()
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
  @IsString()
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
  @IsString()
  @IsOptional()
  lockType?: string;
  @IsString()
  @IsOptional()
  building?: string;
  @IsString()
  @IsOptional()
  buildingFloor?: string;
  @IsString()
  @IsOptional()
  unitId?: string;
  @IsString()
  @IsOptional()
  status?: string;
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
