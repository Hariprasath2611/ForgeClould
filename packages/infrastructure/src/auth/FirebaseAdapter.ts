import * as adminModule from 'firebase-admin';
const admin = (adminModule as any).default || adminModule;
import { IAuthenticationAdapter, DecodedAuthToken } from './AuthenticationAdapter';

export class FirebaseAdapter implements IAuthenticationAdapter {
  constructor() {
    const apps = admin.apps;
    if (!apps || !apps.length) {
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

  private getAuth() {
    return admin.auth();
  }

  async verifyToken(idToken: string): Promise<DecodedAuthToken> {
    try {
      const decoded = await this.getAuth().verifyIdToken(idToken);
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
    return await this.getAuth().getUserByEmail(email);
  }

  async disableUser(uid: string): Promise<void> {
    await this.getAuth().updateUser(uid, { disabled: true });
  }

  async revokeRefreshTokens(uid: string): Promise<void> {
    await this.getAuth().revokeRefreshTokens(uid);
  }

  async createCustomToken(uid: string, claims?: any): Promise<string> {
    return await this.getAuth().createCustomToken(uid, claims);
  }
}
