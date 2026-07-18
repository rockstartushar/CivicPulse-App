import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ReferenceService } from './reference.service';
@UseGuards(AuthGuard) @Controller()
export class ReferenceController {
  constructor(private readonly reference: ReferenceService) {}
  @Get('bootstrap') bootstrap() { return this.reference.bootstrap(); }
}
