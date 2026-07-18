import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private initialized = false;
  constructor(private readonly prisma: PrismaService) {}
  private init() {
    if (this.initialized) return;
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const credential = serviceAccount ? admin.credential.cert(JSON.parse(serviceAccount)) : admin.credential.applicationDefault();
    admin.initializeApp({ credential, projectId: process.env.FIREBASE_PROJECT_ID });
    this.initialized = true;
  }
  async authenticate(token: string) {
    try {
      this.init();
      const decoded = await admin.auth().verifyIdToken(token, true);
      return this.prisma.user.upsert({ where: { firebaseUid: decoded.uid }, update: {}, create: { firebaseUid: decoded.uid } });
    } catch { throw new UnauthorizedException('Invalid or expired Firebase ID token'); }
  }
  async demoUser() {
    if (process.env.DEMO_MODE !== 'true' || process.env.NODE_ENV === 'production') throw new UnauthorizedException('Demo mode is disabled');
    return this.prisma.user.upsert({ where: { firebaseUid: 'demo:civicpulse-local' }, update: {}, create: { firebaseUid: 'demo:civicpulse-local' } });
  }
}
