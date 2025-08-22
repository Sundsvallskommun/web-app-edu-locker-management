import {
  AssignLockerRequest,
  CreateLockerRequest,
  EditLockerRequest,
  LockerStatus,
  LockType,
  UnassignLockerRequest,
} from '@/data-contracts/pupillocker/data-contracts';
import { AssignLockersRequest, EditLockersStatusBody, UnassignLocker as UnassignLockerType } from '@/interfaces/lockers.interface';
import { IsNullable } from '@/utils/custom-validation-classes';
import { Type } from 'class-transformer';
import { IsString, IsOptional, ValidateNested, IsArray, IsEnum } from 'class-validator';

export class LockerAssign implements AssignLockerRequest {
  @IsString()
  lockerId: string;
  @IsString()
  personId: string;
  @IsOptional()
  @IsString()
  email?: string;
}

export class LockerAssignBody implements AssignLockersRequest {
  @ValidateNested({ each: true })
  @Type(() => LockerAssign)
  data: LockerAssign[];
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
  @IsOptional()
  @IsString()
  pupilId?: string;
  @IsOptional()
  @IsString()
  pupilEmail?: string;
}

export class LockerStatusUpdate implements EditLockersStatusBody {
  @IsEnum(LockerStatus)
  status: LockerStatus;
  @IsArray()
  @IsString({ each: true })
  lockerIds: string[];
}

export class UnassignLocker implements UnassignLockerType {
  @IsString()
  lockerId: string;
  @IsString()
  @IsOptional()
  @IsNullable()
  pupilId?: string | null;
  @IsString()
  @IsOptional()
  email?: string;
}

export class UnassignLockerBody implements UnassignLockerRequest {
  @ValidateNested({ each: true })
  @Type(() => UnassignLocker)
  lockers: UnassignLocker[];
  @IsEnum(LockerStatus)
  status: LockerStatus;
}
