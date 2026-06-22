import { UserModel } from '../../infrastructure/models/UserModel';
import { SessionModel } from '../../infrastructure/models/SessionModel';
import { DecodedAuthToken } from '@forge/infrastructure';
import { randomBytes } from 'crypto';

export class AuthUseCase {
  /**
   * Syncs a Firebase user to the MongoDB database.
   * If the user doesn't exist, they are created.
   * If they exist, their lastLoginAt is updated.
   * A new backend session is created and returned.
   */
  async syncUser(
    decodedToken: DecodedAuthToken,
    clientInfo: { ipAddress: string; userAgent: string }
  ) {
    if (!decodedToken.email) {
      throw new Error('Email is required in token payload to sync user.');
    }

    // 1. Find or create the user in MongoDB
    let user = await UserModel.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      // Create new user
      user = await UserModel.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split('@')[0], // Fallback if no name provided
        emailVerified: decodedToken.emailVerified || false,
        lastLoginAt: new Date(),
      });
    } else {
      // Update existing user
      user.lastLoginAt = new Date();
      // Optionally sync email/name changes here if needed
      await user.save();
    }

    // 2. Create a backend Session
    const sessionToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day session

    const session = await SessionModel.create({
      userId: user._id,
      deviceName: this.extractDeviceName(clientInfo.userAgent),
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      expiresAt,
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
      session: {
        id: session._id,
        token: sessionToken,
        expiresAt,
      }
    };
  }

  private extractDeviceName(userAgent: string): string {
    // Simple heuristic. A real app would use a library like `ua-parser-js`
    if (userAgent.includes('Mobile')) return 'Mobile Device';
    if (userAgent.includes('Macintosh')) return 'Mac';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Linux')) return 'Linux PC';
    return 'Unknown Device';
  }
}

export const authUseCase = new AuthUseCase();
