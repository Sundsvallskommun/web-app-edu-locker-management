import { GetLockersModel, PupilClassNames } from '@/data-contracts/education/data-contracts';
import ApiResponse from '@/interfaces/api-service.interface';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class LockerOwner implements PupilClassNames {
  @IsString()
  @IsOptional()
  pupilName?: string;
  @IsString()
  @IsOptional()
  className?: string;
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

export class SchoolLockerApiResponse implements ApiResponse<SchoolLocker[]> {
  @ValidateNested({ each: true })
  @Type(() => SchoolLocker)
  data: SchoolLocker[];
  @IsString()
  message: string;
}
