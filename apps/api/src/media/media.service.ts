import { createHash } from 'crypto';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ActivityType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}
  private async owned(ownerId: string, reportId: string) { const report = await this.prisma.report.findUnique({ where: { id: reportId } }); if (!report) throw new NotFoundException('Report not found'); if (report.ownerId !== ownerId) throw new ForbiddenException(); return report; }
  async intent(ownerId: string, reportId: string) {
    await this.owned(ownerId, reportId);
    if (process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production') return { demo: true };
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME; const key = process.env.CLOUDINARY_API_KEY; const secret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !key || !secret) throw new BadRequestException('Photo uploads are not configured');
    const timestamp = Math.floor(Date.now() / 1000); const folder = `civicpulse/${ownerId}/${reportId}`; const publicId = `capture-${timestamp}-${Math.random().toString(36).slice(2, 10)}`;
    const signature = createHash('sha1').update(`folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${secret}`).digest('hex');
    return { cloudName, apiKey: key, timestamp, folder, publicId, signature, uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload` };
  }
  async register(ownerId: string, reportId: string, dto: { cloudinaryPublicId: string; secureUrl: string; contentType: string }) {
    await this.owned(ownerId, reportId);
    if (process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production') return this.prisma.$transaction(async (tx) => { const media = await tx.reportMedia.create({ data: { reportId, ...dto } }); await tx.reportActivity.create({ data: { reportId, actorId: ownerId, type: ActivityType.MEDIA_ADDED, payload: { mediaId: media.id, demo: true } } }); return media; });
    const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;
    if (!dto.secureUrl.startsWith(prefix) || !dto.cloudinaryPublicId.startsWith(`civicpulse/${ownerId}/${reportId}/`)) throw new BadRequestException('Unexpected upload asset');
    return this.prisma.$transaction(async (tx) => { const media = await tx.reportMedia.create({ data: { reportId, ...dto } }); await tx.reportActivity.create({ data: { reportId, actorId: ownerId, type: ActivityType.MEDIA_ADDED, payload: { mediaId: media.id } } }); return media; });
  }
}
