import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../../../lib/firebase';

/**
 * The Frontend Authentication Adapter.
 * This class isolates the Firebase SDK from the rest of the application's business logic.
 * If we ever migrate away from Firebase, we only need to update this file.
 */
export class AuthAdapter {
  private static async syncWithBackend(user: import('firebase/auth').User): Promise<any> {
    try {
      const idToken = await user.getIdToken();
      // In production, this would point to the gateway service URL e.g. https://api.forgecloud.com/v1/auth/sync
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
      
      const response = await fetch(`${API_URL}/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to synchronize user with backend.');
      }

      return await response.json();
    } catch (error: any) {
      console.warn("Backend sync warning (mock mode if backend is down):", error.message);
      return null;
    }
  }

  static async loginWithGoogle(): Promise<{ credential: UserCredential, backendData: any }> {
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const backendData = await this.syncWithBackend(credential.user);
      return { credential, backendData };
    } catch (error: any) {
      console.error("Google login failed:", error);
      throw new Error(error.message || "Failed to authenticate with Google.");
    }
  }
      console.error("Google login failed:", error);
      throw new Error(error.message || "Failed to authenticate with Google.");
    }
  }

  static async loginWithGithub(): Promise<UserCredential> {
    try {
      return await signInWithPopup(auth, githubProvider);
    } catch (error: any) {
      console.error("GitHub login failed:", error);
      throw new Error(error.message || "Failed to authenticate with GitHub.");
    }
  }

  static async loginWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Email login failed:", error);
      throw new Error(error.message || "Invalid email or password.");
    }
  }

  static async registerWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw new Error(error.message || "Failed to create account.");
    }
  }

  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Logout failed:", error);
      throw new Error(error.message || "Failed to log out properly.");
    }
  }
}
