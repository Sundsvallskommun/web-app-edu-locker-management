import { IsOptional, IsString } from 'class-validator';

export class NoticeDto {
  @IsString()
  pupilId: string;
  @IsString()
  email: string;
  @IsString()
  @IsOptional()
  message?: string;
  @IsString({ each: true })
  @IsOptional()
  lockerIds?: string[];
}
