import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ReferenceService {
  constructor(private readonly prisma: PrismaService) {}
  async bootstrap() {
    const [categories, channels] = await Promise.all([
      this.prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
      this.prisma.officialChannel.findMany({ where: { active: true }, include: { department: true } }),
    ]);
    return { launch: { city: 'Jaipur', constituency: 'Jhotwara' }, categories, channels };
  }
  async routingFor(categoryId: string) {
    return this.prisma.routingRule.findFirst({ where: { categoryId, active: true }, orderBy: [{ priority: 'desc' }], include: { department: { include: { channels: { where: { active: true } } } } } });
  }
}
