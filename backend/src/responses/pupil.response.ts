import {
  PupilLockerIdNameResponse,
  PupilsLockerResponse,
  PupilsLockerResponseOrderBy,
  PupilsLockerResponsePagedOffsetResponse,
  PupilTeacher,
  SortDirection,
} from '@/data-contracts/education/data-contracts';
import ApiResponse from '@/interfaces/api-service.interface';
import { PupilsAssignedFilterEnum, PupilsLockersFilter, PupilsLockersQueryParams } from '@/interfaces/pupils.interface';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class PupilLocker implements PupilLockerIdNameResponse {
  @IsString()
  lockerId?: string;
  @IsString()
  lockerName?: string;
}

export class Teacher implements PupilTeacher {
  @IsString()
  @IsOptional()
  givenname?: string;
  @IsString()
  @IsOptional()
  lastname?: string;
  @IsString()
  personId?: string;
  @IsString()
  @IsOptional()
  email?: string;
}

export class PupilsFilter implements PupilsLockersFilter {
  @IsString()
  @IsOptional()
  groupId?: string;
  @IsString()
  @IsOptional()
  nameQueryFilter?: string;
  @IsEnum(PupilsAssignedFilterEnum)
  @IsOptional()
  assignedFilter?: PupilsAssignedFilterEnum;
}
export class PupilsQueryParams implements PupilsLockersQueryParams {
  @ValidateNested()
  @Type(() => PupilsFilter)
  @IsOptional()
  filter?: PupilsFilter;
  @IsInt()
  @IsOptional()
  PageNumber?: number;
  @IsInt()
  @IsOptional()
  PageSize?: number;
  @Reflect.metadata('design:type', { name: 'string' })
  @IsEnum(PupilsLockerResponseOrderBy)
  OrderBy: PupilsLockerResponseOrderBy;
  @Reflect.metadata('design:type', { name: 'string' })
  @IsEnum(SortDirection)
  OrderDirection: SortDirection;
}

export class Pupil implements PupilsLockerResponse {
  @IsString()
  personId?: string;
  @IsString()
  @IsOptional()
  birthDate?: string;
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  className?: string;
  @ValidateNested({ each: true })
  @Type(() => PupilLocker)
  lockers?: PupilLocker[];
  @ValidateNested({ each: true })
  @Type(() => Teacher)
  teachers?: Teacher[];
}

export class PupilApiResponse implements ApiResponse<Pupil[]>, Omit<PupilsLockerResponsePagedOffsetResponse, 'data'> {
  @IsInt()
  pageNumber?: number;
  @IsInt()
  pageSize?: number;
  @IsInt()
  totalPages?: number;
  @IsInt()
  totalRecords?: number;
  @ValidateNested({ each: true })
  @Type(() => Pupil)
  data: Pupil[];
  @IsString()
  message: string;
}
