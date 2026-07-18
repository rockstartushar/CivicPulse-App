import { Type } from 'class-transformer';
import { IsEnum, IsLatitude, IsLongitude, IsOptional, IsString, IsUUID, Length, ValidateIf } from 'class-validator';
import { LocationSource, Visibility } from '@prisma/client';
export class CreateReportDto {
  @IsUUID() categoryId!: string;
  @IsString() @Length(10, 2000) description!: string;
  @IsEnum(Visibility) visibility!: Visibility;
  @IsOptional() @IsString() @Length(2, 240) manualLocation?: string;
  @IsOptional() @IsEnum(LocationSource) locationSource?: LocationSource;
  @ValidateIf((v) => v.latitude !== undefined) @Type(() => Number) @IsLatitude() latitude?: number;
  @ValidateIf((v) => v.longitude !== undefined) @Type(() => Number) @IsLongitude() longitude?: number;
}
