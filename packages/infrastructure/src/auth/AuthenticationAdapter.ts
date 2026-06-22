export interface DecodedAuthToken {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
  exp: number;
  iat: number;
  iss: string;
}

export interface IAuthenticationAdapter {
  verifyToken(idToken: string): Promise<DecodedAuthToken>;
  getUserByEmail(email: string): Promise<any>;
  disableUser(uid: string): Promise<void>;
  revokeRefreshTokens(uid: string): Promise<void>;
  createCustomToken(uid: string, claims?: any): Promise<string>;
}
