import * as adminModule from 'firebase-admin';
const admin = adminModule as any;
import { IAuthenticationAdapter, DecodedAuthToken } from './AuthenticationAdapter';

export class FirebaseAdapter implements IAuthenticationAdapter {
  constructor() {
    if (!admin.apps.length) {
      // In a real environment, load these from secure environment variables
      // For now, we mock the initialization if credentials aren't present
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
      } catch (e) {
        console.warn('Firebase Admin SDK initialized without credentials for development.');
        admin.initializeApp();
      }
    }
  }

  async verifyToken(idToken: string): Promise<DecodedAuthToken> {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      return {
        uid: decoded.uid,
        email: decoded.email,
        emailVerified: decoded.email_verified,
        name: decoded.name,
        picture: decoded.picture,
        exp: decoded.exp,
        iat: decoded.iat,
        iss: decoded.iss,
      };
    } catch (error: any) {
      throw new Error(`Failed to verify Firebase token: ${error.message}`);
    }
  }

  async getUserByEmail(email: string): Promise<any> {
    return await admin.auth().getUserByEmail(email);
  }

  async disableUser(uid: string): Promise<void> {
    await admin.auth().updateUser(uid, { disabled: true });
  }

  async revokeRefreshTokens(uid: string): Promise<void> {
    await admin.auth().revokeRefreshTokens(uid);
  }

  async createCustomToken(uid: string, claims?: any): Promise<string> {
    return await admin.auth().createCustomToken(uid, claims);
  }
}
