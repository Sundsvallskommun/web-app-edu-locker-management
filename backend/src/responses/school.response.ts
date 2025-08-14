import { SchoolUnitV2, SchoolWithUnits } from '@/data-contracts/education/data-contracts';
import { LockerBuilding } from '@/data-contracts/pupillocker/data-contracts';
import ApiResponse from '@/interfaces/api-service.interface';
import { IsNullable } from '@/utils/custom-validation-classes';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SchoolUnit implements SchoolUnitV2 {
  @IsString()
  unitId?: string;
  @IsString()
  unitName?: string;
  @IsString()
  @IsOptional()
  @IsNullable()
  organisationCode?: string | null;
  @IsString()
  @IsOptional()
  @IsNullable()
  schoolUnitCode?: string | null;
  @IsString({ each: true })
  @IsOptional()
  @IsNullable()
  schoolTypes?: string[] | null;
}

export class Building implements LockerBuilding {
  @IsString()
  @IsOptional()
  @IsNullable()
  buildingName?: string | null;
  @IsString({ each: true })
  @IsOptional()
  @IsNullable()
  floors?: string[] | null;
}

export class School implements SchoolWithUnits {
  @IsString()
  schoolId?: string;
  @IsString()
  @IsOptional()
  @IsNullable()
  schoolName?: string | null;
  @IsString()
  @IsOptional()
  @IsNullable()
  organisationCode?: string | null;
  @ValidateNested({ each: true })
  @Type(() => SchoolUnit)
  @IsOptional()
  @IsNullable()
  schoolUnits?: SchoolUnit[] | null;
  @ValidateNested({ each: true })
  @Type(() => Building)
  buildings?: Building[];
}

export class SchoolApiResponse implements ApiResponse<School[]> {
  @ValidateNested({ each: true })
  @Type(() => School)
  data: School[];
  @IsString()
  message: string;
}
