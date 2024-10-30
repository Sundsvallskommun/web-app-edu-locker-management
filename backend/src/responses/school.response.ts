import { Group, GroupMember, LockerBuilding, SchoolUnit } from '@/data-contracts/education/data-contracts';
import ApiResponse from '@/interfaces/api-service.interface';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SchoolPupil implements GroupMember {
  @IsString()
  personId?: string;
  @IsString()
  @IsOptional()
  role?: string;
}

export class SchoolGroup implements Group {
  @IsString()
  @IsOptional()
  groupId?: string;
  @IsString()
  @IsOptional()
  unitGUID?: string;
  @IsString()
  @IsOptional()
  code?: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsOptional()
  type?: string;
  @IsOptional()
  @IsDateString()
  startDate?: string;
  @IsOptional()
  @IsDateString()
  endDate?: string;
  @IsString()
  @IsOptional()
  period?: string;
  @IsString()
  @IsOptional()
  typeOfSchoolCode?: string;
  @IsBoolean()
  isVKlassGroup?: boolean;
  @IsInt()
  @IsOptional()
  vKlassGroupId?: number;
  @ValidateNested({ each: true })
  @Type(() => SchoolPupil)
  members?: SchoolPupil[];
}

interface Buildings {
  buildings?: LockerBuilding[];
}

class Building implements LockerBuilding {
  @IsString()
  @IsOptional()
  buildingName?: string;
  @IsArray()
  @IsString()
  @IsOptional()
  floors?: string[];
}

export class School implements SchoolUnit, Buildings {
  @IsString()
  @IsOptional()
  unitGUID?: string;
  @IsString()
  @IsOptional()
  unitName?: string;
  @IsString()
  @IsOptional()
  unitCode?: string;
  @IsString()
  @IsOptional()
  schoolUnitCode?: string;
  @IsString()
  @IsOptional()
  typeOfSchoolCode?: string;
  @ValidateNested({ each: true })
  @Type(() => SchoolGroup)
  groups?: SchoolGroup[];
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
