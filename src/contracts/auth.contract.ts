// Typed Authentication Contract for AgroMind AI
import type { UserProfile, UserRole } from '../types';

export interface AuthSession {
  token: string;
  user: UserProfile;
  expiresAt?: number;
}

export interface AuthCredentials {
  phone: string;
  otpOrPin: string;
}

export interface RegistrationPayload {
  name: string;
  phone: string;
  district: string;
  village: string;
  taluka?: string;
  pincode?: string;
  role?: UserRole;
  language?: 'gu' | 'hi' | 'en';
}

export interface AuthContractResponse<T = UserProfile> {
  success: boolean;
  user?: T;
  session?: AuthSession;
  message?: string;
  error?: string;
}

export interface IAuthService {
  login(credentials: AuthCredentials): Promise<AuthContractResponse>;
  loginAdmin(accessCode?: string): Promise<AuthContractResponse>;
  register(payload: RegistrationPayload): Promise<AuthContractResponse>;
  getCurrentUser(): UserProfile | null;
  updateProfile(updates: Partial<UserProfile>): UserProfile | null;
  sendOtp(phone: string): Promise<AuthContractResponse<void>>;
  verifyOtp(phone: string, otp: string): Promise<AuthContractResponse<void>>;
  resetPin(phone: string, otp: string, newPin: string): Promise<AuthContractResponse<void>>;
  logout(): Promise<void>;
  switchRole(targetRole: UserRole): UserProfile;
}
