import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const scope = await prisma.geographyScope.upsert({ where: { id: 'jaipur-jhotwara' }, update: {}, create: { id: 'jaipur-jhotwara', country: 'India', state: 'Rajasthan', city: 'Jaipur', constituency: 'Jhotwara', isLaunchArea: true } });
  const water = await prisma.category.upsert({ where: { slug: 'water-logging' }, update: { name: 'Water Logging', formRules: { photoRequired: true, locationRequired: true, descriptionGuidance: 'Describe the road, landmark, depth, and how long water has remained.' }, sortOrder: 1 }, create: { slug: 'water-logging', name: 'Water Logging', formRules: { photoRequired: true, locationRequired: true, descriptionGuidance: 'Describe the road, landmark, depth, and how long water has remained.' }, sortOrder: 1 } });
  const garbage = await prisma.category.upsert({ where: { slug: 'garbage-dump' }, update: { name: 'Garbage Dump', formRules: { photoRequired: true, locationRequired: true, descriptionGuidance: 'Describe the exact landmark, scale, odour, or health/safety concern.' }, sortOrder: 2 }, create: { slug: 'garbage-dump', name: 'Garbage Dump', formRules: { photoRequired: true, locationRequired: true, descriptionGuidance: 'Describe the exact landmark, scale, odour, or health/safety concern.' }, sortOrder: 2 } });
  const jmc = await prisma.department.upsert({ where: { name: 'Jaipur Municipal Corporation' }, update: {}, create: { name: 'Jaipur Municipal Corporation' } });
  await prisma.officialChannel.upsert({ where: { id: 'jmc-helpline' }, update: { lastVerifiedAt: new Date() }, create: { id: 'jmc-helpline', departmentId: jmc.id, label: 'JMC official helpline', instructions: 'Use the current JMC official complaint channel. Record the reference number here after submitting externally.', phone: '0141-2742900', lastVerifiedAt: new Date() } });
  for (const category of [water, garbage]) await prisma.routingRule.upsert({ where: { id: `jhotwara-${category.slug}` }, update: {}, create: { id: `jhotwara-${category.slug}`, categoryId: category.id, departmentId: jmc.id, geographyScopeId: scope.id, confidence: 70, explanation: 'Likely municipal sanitation/drainage responsibility in the Jhotwara launch area.', priority: 100 } });
  const demoUser = await prisma.user.upsert({ where: { firebaseUid: 'demo-map-user' }, update: {}, create: { firebaseUid: 'demo-map-user' } });
  const examples = [
    { id: 'demo-water-logging-jhotwara', categoryId: water.id, description: 'Standing water reported near the Jhotwara road junction.', latitude: 26.9601, longitude: 75.7444, status: 'ACKNOWLEDGED' as const },
    { id: 'demo-garbage-jhotwara', categoryId: garbage.id, description: 'Public waste collection point requires attention.', latitude: 26.9672, longitude: 75.7521, status: 'SUBMITTED' as const },
  ];
  for (const example of examples) await prisma.report.upsert({ where: { id: example.id }, update: { status: example.status }, create: { ...example, ownerId: demoUser.id, visibility: 'PUBLIC', moderationState: 'PUBLISHED', locationSource: 'GPS', publicLatitude: example.latitude, publicLongitude: example.longitude } });
}
main().finally(() => prisma.$disconnect());
