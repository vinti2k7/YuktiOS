export type UserRole = 'owner' | 'admin' | 'manager' | 'employee';

export interface Business {
  id: string;
  name: string;
  industry: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord {
  id: string;
  businessId: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  createdAt: string;
}

export interface UserSession {
  token: string;
  userId: string;
  businessId: string;
  createdAt: number;
  expiresAt: number;
}

export interface PublicUserInfo {
  id: string;
  businessId: string;
  businessName: string;
  name: string;
  email: string;
  role: UserRole;
}
