export type Role = "ADMIN" | "MEMBER" | "USER";

export interface Account {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scope?: string | null;
  password?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  banned: boolean;
  banReason?: string | null;
  accounts?: Account[];
  sessions?: Session[];
}
