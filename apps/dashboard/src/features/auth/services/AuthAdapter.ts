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
  static async loginWithGoogle(): Promise<UserCredential> {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
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
