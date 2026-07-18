import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ReportStatus } from '@prisma/client';
export class TransitionReportDto {
  @IsEnum(ReportStatus) to!: ReportStatus;
  @IsOptional() @IsString() @Length(3, 500) complaintReference?: string;
  @IsOptional() @IsString() @Length(3, 1000) reason?: string;
}
