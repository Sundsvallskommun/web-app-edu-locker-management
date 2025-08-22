import { EditCodeLockRequest, CreateCodeLockRequest } from '@/data-contracts/pupillocker/data-contracts';
import { IsInt, IsString, IsOptional } from 'class-validator';

export class UpdateCodeLock implements EditCodeLockRequest {
  @IsInt()
  activeCodeId?: number;
  @IsString()
  @IsOptional()
  code1?: string;
  @IsString()
  @IsOptional()
  code2?: string;
  @IsString()
  @IsOptional()
  code3?: string;
  @IsString()
  @IsOptional()
  code4?: string;
  @IsString()
  @IsOptional()
  code5?: string;
}

export class CreateCodeLock extends UpdateCodeLock implements CreateCodeLockRequest {
  @IsString()
  codeLockId: string;
  @IsString()
  @IsOptional()
  lockerId?: string;
}
