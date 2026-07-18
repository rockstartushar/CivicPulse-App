import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportsModule } from './reports/reports.module';
import { ReferenceModule } from './reference/reference.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: Joi.object({ DATABASE_URL: Joi.string().required(), NODE_ENV: Joi.string().default('development'), DEMO_MODE: Joi.boolean().default(false), FIREBASE_PROJECT_ID: Joi.string().required() }) }),
    PrismaModule, AuthModule, ReferenceModule, ReportsModule, MediaModule,
  ],
})
export class AppModule {}
