import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { IsIn, IsString, MaxLength } from 'class-validator';
import { User } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { MediaService } from './media.service';
class RegisterMediaDto { @IsString() @MaxLength(500) cloudinaryPublicId!: string; @IsString() @MaxLength(2000) secureUrl!: string; @IsIn(['image/jpeg', 'image/png', 'image/webp']) contentType!: string; }
@UseGuards(AuthGuard) @Controller('reports/:reportId/media')
export class MediaController {
  constructor(private readonly media: MediaService) {}
  @Post('intent') intent(@CurrentUser() user: User, @Param('reportId') reportId: string) { return this.media.intent(user.id, reportId); }
  @Post() register(@CurrentUser() user: User, @Param('reportId') reportId: string, @Body() dto: RegisterMediaDto) { return this.media.register(user.id, reportId, dto); }
}
