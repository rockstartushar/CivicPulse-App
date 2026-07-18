import { Body, Controller, Get, Headers, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { TransitionReportDto } from './dto/transition-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsService } from './reports.service';
@UseGuards(AuthGuard) @Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}
  @Post() create(@CurrentUser() user: User, @Body() dto: CreateReportDto, @Headers('idempotency-key') key?: string) { return this.reports.create(user.id, dto, key); }
  @Get() mine(@CurrentUser() user: User) { return this.reports.mine(user.id); }
  @Get('nearby') nearby(@Query('lat') lat: string, @Query('lng') lng: string, @Query('radius') radius?: string, @Query('categoryId') categoryId?: string, @Query('status') status?: string) {
    return this.reports.nearby(Number(lat), Number(lng), Number(radius ?? 1000), categoryId, status);
  }
  @Get(':id') one(@CurrentUser() user: User, @Param('id') id: string) { return this.reports.one(user.id, id); }
  @Patch(':id') update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateReportDto) { return this.reports.update(user.id, id, dto); }
  @Post(':id/transitions') transition(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: TransitionReportDto) { return this.reports.transition(user.id, id, dto); }
}
