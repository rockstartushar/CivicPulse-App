import { IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { Visibility } from '@prisma/client';
export class UpdateReportDto {
  @IsInt() @Min(1) version!: number;
  @IsOptional() @IsString() @Length(10, 2000) description?: string;
  @IsOptional() @IsString() @Length(2, 240) manualLocation?: string;
  @IsOptional() @IsEnum(Visibility) visibility?: Visibility;
}
