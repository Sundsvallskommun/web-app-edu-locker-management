import { CodeLockLocker, EditCodeLockRequest } from '@/data-contracts/education/data-contracts';
import ApiResponse from '@/interfaces/api-service.interface';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UpdateCodeLock implements EditCodeLockRequest {
  @IsInt()
  @IsOptional()
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

export class CodeLock implements CodeLockLocker {
  @IsString()
  @IsOptional()
  codeLockId?: string;
  @IsString()
  @IsOptional()
  lockerId?: string;
  @IsInt()
  @IsOptional()
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

export class CodeLockApiResponse implements ApiResponse<CodeLock> {
  @ValidateNested()
  @Type(() => CodeLock)
  data: CodeLock;
  @IsString()
  message: string;
}
export class CodeLocksApiResponse implements ApiResponse<CodeLock[]> {
  @ValidateNested({ each: true })
  @Type(() => CodeLock)
  data: CodeLock[];
  @IsString()
  message: string;
}
