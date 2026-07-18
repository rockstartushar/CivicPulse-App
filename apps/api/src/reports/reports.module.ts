import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReferenceModule } from '../reference/reference.module';
import { AuthModule } from '../auth/auth.module';
@Module({ imports: [ReferenceModule, AuthModule], controllers: [ReportsController], providers: [ReportsService] }) export class ReportsModule {}
