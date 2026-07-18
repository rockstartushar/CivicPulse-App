import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ActivityType, ModerationState, ReportStatus, Visibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReferenceService } from '../reference/reference.service';
import { CreateReportDto } from './dto/create-report.dto';
import { TransitionReportDto } from './dto/transition-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

const transitions: Partial<Record<ReportStatus, ReportStatus[]>> = {
  DRAFT: [ReportStatus.SUBMITTED], SUBMITTED: [ReportStatus.ACKNOWLEDGED, ReportStatus.WORK_STARTED, ReportStatus.RESOLVED],
  ACKNOWLEDGED: [ReportStatus.WORK_STARTED, ReportStatus.RESOLVED], WORK_STARTED: [ReportStatus.RESOLVED],
  RESOLVED: [ReportStatus.VERIFIED, ReportStatus.REOPENED], VERIFIED: [ReportStatus.CLOSED, ReportStatus.REOPENED],
  CLOSED: [ReportStatus.REOPENED], REOPENED: [ReportStatus.SUBMITTED],
};
const publicPoint = (latitude: number, longitude: number) => ({ latitude: Math.round(latitude / 0.00135) * 0.00135, longitude: Math.round(longitude / (0.00135 / Math.cos(latitude * Math.PI / 180))) * (0.00135 / Math.cos(latitude * Math.PI / 180)) });
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService, private readonly reference: ReferenceService) {}
  async create(userId: string, dto: CreateReportDto, idempotencyKey?: string) {
    if (idempotencyKey) {
      const receipt = await this.prisma.offlineSyncReceipt.findUnique({ where: { userId_idempotencyKey: { userId, idempotencyKey } } });
      if (receipt) return this.one(userId, receipt.reportId);
    }
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category?.active) throw new BadRequestException('Unknown or inactive category');
    const rules = category.formRules as { photoRequired?: boolean; locationRequired?: boolean };
    if (rules.locationRequired && (dto.latitude === undefined || dto.longitude === undefined) && !dto.manualLocation) throw new BadRequestException('This category requires a location');
    const routing = await this.reference.routingFor(dto.categoryId);
    const safePoint = dto.latitude === undefined || dto.longitude === undefined ? undefined : publicPoint(dto.latitude, dto.longitude);
    const report = await this.prisma.$transaction(async (tx) => {
      const created = await tx.report.create({ data: {
        ownerId: userId, categoryId: dto.categoryId, description: dto.description, visibility: dto.visibility,
        manualLocation: dto.manualLocation, locationSource: dto.locationSource, latitude: dto.latitude, longitude: dto.longitude,
        publicLatitude: safePoint?.latitude, publicLongitude: safePoint?.longitude,
        moderationState: dto.visibility === Visibility.PRIVATE ? ModerationState.PUBLISHED : ModerationState.PENDING,
        routingSnapshot: routing ? { department: routing.department.name, confidence: routing.confidence, explanation: routing.explanation, channels: routing.department.channels } : undefined,
      }});
      await tx.reportActivity.createMany({ data: [
        { reportId: created.id, actorId: userId, type: ActivityType.CREATED },
        { reportId: created.id, actorId: userId, type: ActivityType.ROUTING_SNAPSHOTTED, payload: routing ? { department: routing.department.name, confidence: routing.confidence } : { unavailable: true } },
      ]});
      if (idempotencyKey) await tx.offlineSyncReceipt.create({ data: { userId, idempotencyKey, reportId: created.id } });
      return created;
    });
    return this.one(userId, report.id);
  }
  async mine(userId: string) { return this.prisma.report.findMany({ where: { ownerId: userId }, include: { category: true, media: true }, orderBy: { updatedAt: 'desc' } }); }
  async one(userId: string, id: string) {
    const report = await this.prisma.report.findUnique({ where: { id }, include: { category: true, media: true, activities: { orderBy: { createdAt: 'asc' } } } });
    if (!report) throw new NotFoundException('Report not found');
    if (report.ownerId !== userId) throw new ForbiddenException('Only the report owner can view this record');
    return report;
  }
  async update(userId: string, id: string, dto: UpdateReportDto) {
    const report = await this.one(userId, id);
    if (report.version !== dto.version) throw new ConflictException('This report changed elsewhere; reload before saving');
    const data = { description: dto.description, manualLocation: dto.manualLocation, visibility: dto.visibility, version: { increment: 1 }, moderationState: dto.visibility === Visibility.PUBLIC ? ModerationState.PENDING : undefined };
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.report.update({ where: { id }, data });
      await tx.reportActivity.create({ data: { reportId: id, actorId: userId, type: dto.visibility ? ActivityType.VISIBILITY_CHANGED : ActivityType.FIELD_CHANGED, payload: { changed: Object.keys(dto).filter((key) => key !== 'version') } } });
      return updated;
    });
  }
  async transition(userId: string, id: string, dto: TransitionReportDto) {
    const report = await this.one(userId, id);
    if (!transitions[report.status]?.includes(dto.to)) throw new BadRequestException(`Cannot move from ${report.status} to ${dto.to}`);
    if (dto.to === ReportStatus.REOPENED && !dto.reason) throw new BadRequestException('A reopen reason is required');
    if (dto.to === ReportStatus.SUBMITTED) {
      const rules = report.category.formRules as { photoRequired?: boolean; locationRequired?: boolean };
      if (rules.photoRequired && report.media.length === 0) throw new BadRequestException('A photo is required before tracking this report as submitted');
      if (rules.locationRequired && !report.manualLocation && (!report.latitude || !report.longitude)) throw new BadRequestException('A location is required before submission');
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.report.update({ where: { id }, data: { status: dto.to, complaintReference: dto.complaintReference ?? undefined, version: { increment: 1 } } });
      await tx.reportActivity.create({ data: { reportId: id, actorId: userId, type: ActivityType.STATUS_CHANGED, payload: { from: report.status, to: dto.to, reason: dto.reason } } });
      return updated;
    });
  }
  async nearby(lat: number, lng: number, radius: number, categoryId?: string, status?: string) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || radius < 250 || radius > 5000) throw new BadRequestException('Use a radius between 250 and 5000 metres');
    const reportStatus = status && Object.values(ReportStatus).includes(status as ReportStatus) ? status as ReportStatus : undefined;
    const reports = await this.prisma.report.findMany({ where: { visibility: Visibility.PUBLIC, moderationState: ModerationState.PUBLISHED, publicLatitude: { not: null }, publicLongitude: { not: null }, ...(categoryId ? { categoryId } : {}), ...(reportStatus ? { status: reportStatus } : {}) }, include: { category: true }, take: 100, orderBy: { createdAt: 'desc' } });
    const metres = (a: number, b: number, c: number, d: number) => 6371000 * 2 * Math.asin(Math.sqrt(Math.sin((c-a)*Math.PI/360)**2 + Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin((d-b)*Math.PI/360)**2));
    return reports.filter((r) => metres(lat, lng, Number(r.publicLatitude), Number(r.publicLongitude)) <= radius).map((r) => ({ id: r.id, category: r.category.name, status: r.status, latitude: r.publicLatitude, longitude: r.publicLongitude, createdAt: r.createdAt }));
  }
}
