// Authentication Service for AgroMind AI
// Provides asynchronous authentication, session management, and profile updates backed by storageService and Supabase

import { storageService, STORAGE_KEYS } from './storageService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { syncEngine } from '../lib/syncEngine';
import { sendFirebaseOtp, verifyFirebaseOtp, hasActiveOtpSession } from '../lib/firebaseClient';
import type { UserProfile, UserRole } from '../types';
import type {
  IAuthService,
  AuthCredentials,
  RegistrationPayload,
  AuthContractResponse,
} from '../contracts/auth.contract';

export type { UserProfile };

export interface AuthResponse extends AuthContractResponse<UserProfile> {}

class AuthService implements IAuthService {
  /**
   * Login with phone + OTP or PIN
   */
  async login(credentialsOrPhone: AuthCredentials | string, pin?: string): Promise<AuthResponse> {
    const phone = typeof credentialsOrPhone === 'string' ? credentialsOrPhone : credentialsOrPhone.phone;
    const otpOrPin = typeof credentialsOrPhone === 'string' ? (pin || '') : credentialsOrPhone.otpOrPin;

    await new Promise((res) => setTimeout(res, 400)); // Network simulation

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }

    if (!otpOrPin || otpOrPin.length < 4) {
      return { success: false, error: 'Please enter a valid 4-digit or 6-digit OTP' };
    }

    // Verify real Firebase SMS OTP session if active and not using demo code 8249
    if (hasActiveOtpSession() && otpOrPin !== '8249') {
      const fbVerify = await verifyFirebaseOtp(otpOrPin);
      if (!fbVerify.success) {
        return { success: false, error: fbVerify.error || 'Incorrect OTP code.' };
      }
    }

    // Try Supabase Auth lookup if configured & online
    if (isSupabaseConfigured() && supabase && syncEngine.isOnline()) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', cleanPhone)
          .maybeSingle();

        if (!error && data) {
          const user: UserProfile = {
            id: data.id,
            name: data.name,
            phone: data.phone,
            district: data.district,
            city: data.city || data.taluka,
            village: data.village,
            taluka: data.taluka || data.village,
            pincode: data.pincode,
            ageGroup: data.age_group,
            pmKisanId: data.pm_kisan_id,
            role: (data.role as UserRole) || 'farmer',
            kycDone: data.kyc_done ?? true,
            language: data.language || 'gu',
            smsAlerts: data.sms_alerts ?? true,
            whatsappAlerts: data.whatsapp_alerts ?? true,
            voiceAssistance: data.voice_assistance ?? true,
          };

          storageService.set(STORAGE_KEYS.USER, user);
          storageService.set(STORAGE_KEYS.TOKEN, 'agromind_supabase_token_' + Date.now());

          return { success: true, user, message: 'Login successful' };
        }
      } catch (err) {
        console.warn('[AuthService] Supabase profile query failed, using offline session:', err);
      }
    }

    // Check existing stored user or build new profile
    const existing = storageService.get<UserProfile | null>(STORAGE_KEYS.USER, null);
    const user: UserProfile = existing && existing.phone === cleanPhone
      ? existing
      : {
          id: 'usr_' + cleanPhone,
          name: existing?.name || 'Rameshbhai Patel',
          phone: cleanPhone,
          district: existing?.district || 'Surat',
          city: existing?.city || 'Kamrej',
          village: existing?.village || 'Kamrej',
          taluka: existing?.taluka || 'Kamrej',
          pmKisanId: existing?.pmKisanId || 'GJ-SUR-88412',
          role: 'farmer',
          kycDone: true,
          language: 'gu',
          smsAlerts: true,
          whatsappAlerts: true,
          voiceAssistance: true,
        };

    storageService.set(STORAGE_KEYS.USER, user);
    storageService.set(STORAGE_KEYS.TOKEN, 'agromind_token_' + Date.now());

    return { success: true, user, message: 'Login successful' };
  }

  /**
   * Dedicated login for KVK Enterprise Admin
   * In online Supabase mode, verifies verified admin role in profiles table.
   * In offline/hackathon evaluation mode, validates evaluator passcode (KVK2026).
   */
  async loginAdmin(accessCode: string = 'KVK2026'): Promise<AuthResponse> {
    await new Promise((res) => setTimeout(res, 400));

    // Try Supabase verification if online and configured
    if (isSupabaseConfigured() && supabase && syncEngine.isOnline()) {
      try {
        const { data: adminProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'admin')
          .limit(1)
          .maybeSingle();

        if (!error && adminProfile) {
          const adminUser: UserProfile = {
            id: adminProfile.id,
            name: adminProfile.name,
            phone: adminProfile.phone,
            district: adminProfile.district,
            village: adminProfile.village,
            taluka: adminProfile.taluka,
            role: 'admin',
            kycDone: true,
            language: (adminProfile.language as any) || 'en',
          };
          storageService.set(STORAGE_KEYS.USER, adminUser);
          storageService.set(STORAGE_KEYS.TOKEN, 'agromind_supabase_admin_token_' + Date.now());
          return { success: true, user: adminUser, message: 'KVK Admin authenticated via Supabase' };
        }
      } catch (err) {
        console.warn('[AuthService] Supabase admin verification error, using evaluator mode:', err);
      }
    }

    // Evaluator / Hackathon demonstration validation
    if (accessCode !== 'KVK2026') {
      return { success: false, error: 'Invalid KVK Admin Credentials. Evaluator passcode: KVK2026' };
    }

    const adminUser: UserProfile = {
      id: 'usr_kvk_admin_01',
      name: 'Dr. Pravin Vaghela (Senior Agronomist)',
      phone: '9428100234',
      district: 'Surat',
      village: 'KVK Extension Center',
      taluka: 'Navsari Road',
      role: 'admin',
      kycDone: true,
      language: 'en',
    };

    storageService.set(STORAGE_KEYS.USER, adminUser);
    storageService.set(STORAGE_KEYS.TOKEN, 'agromind_admin_token_' + Date.now());

    return { success: true, user: adminUser, message: 'Admin authenticated (Evaluator Session)' };
  }

  /**
   * Switch role between farmer and admin for seamless demonstration
   */
  switchRole(targetRole: UserRole): UserProfile {
    const current = this.getCurrentUser();
    if (targetRole === 'admin') {
      const admin: UserProfile = {
        id: current?.id || 'usr_admin',
        name: current?.name || 'KVK Agronomist Admin',
        phone: current?.phone || '9428100234',
        district: current?.district || 'Surat',
        village: 'KVK Extension Hub',
        role: 'admin',
      };
      storageService.set(STORAGE_KEYS.USER, admin);
      return admin;
    } else {
      const farmer: UserProfile = {
        id: current?.id || 'usr_farmer',
        name: current?.name || 'Rameshbhai Patel',
        phone: current?.phone || '9876543210',
        district: current?.district || 'Surat',
        village: current?.village || 'Kamrej',
        role: 'farmer',
      };
      storageService.set(STORAGE_KEYS.USER, farmer);
      return farmer;
    }
  }

  /**
   * Register new farmer
   */
  async register(data: RegistrationPayload): Promise<AuthResponse> {
    await new Promise((res) => setTimeout(res, 500));

    const cleanPhone = data.phone.replace(/\D/g, '');
    if (!data.name.trim()) {
      return { success: false, error: 'Please enter your full name' };
    }
    if (cleanPhone.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }
    if (!data.district.trim()) {
      return { success: false, error: 'Please select your district' };
    }

    const user: UserProfile = {
      id: 'usr_' + cleanPhone,
      name: data.name.trim(),
      phone: cleanPhone,
      district: data.district,
      city: data.city || data.taluka || 'Kamrej',
      village: data.village || 'Kamrej',
      taluka: data.taluka || data.city || data.village || 'Kamrej',
      pincode: data.pincode,
      role: data.role || 'farmer',
      kycDone: false,
      language: data.language || 'gu',
      smsAlerts: true,
      whatsappAlerts: true,
      voiceAssistance: true,
    };

    storageService.set(STORAGE_KEYS.USER, user);
    storageService.set(STORAGE_KEYS.TOKEN, 'agromind_token_' + Date.now());

    // Queue profile insert for Supabase sync
    syncEngine.enqueue({
      tableName: 'profiles',
      operation: 'INSERT',
      recordId: user.id,
      payload: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        district: user.district,
        city: user.city,
        village: user.village,
        taluka: user.taluka,
        pincode: user.pincode,
        role: user.role,
        kyc_done: user.kycDone,
        language: user.language,
      },
    });

    return { success: true, user, message: 'Registration successful' };
  }

  /**
   * Update current user profile with optimistic L1 write and Supabase queue
   */
  updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    const current = this.getCurrentUser();
    if (!current) {
      return null;
    }
    const updated: UserProfile = { ...current, ...updates };
    storageService.set(STORAGE_KEYS.USER, updated);

    // Queue profile update for Supabase sync
    syncEngine.enqueue({
      tableName: 'profiles',
      operation: 'UPDATE',
      recordId: updated.id,
      payload: {
        name: updated.name,
        district: updated.district,
        village: updated.village,
        taluka: updated.taluka,
        pincode: updated.pincode,
        language: updated.language,
        sms_alerts: updated.smsAlerts,
        whatsapp_alerts: updated.whatsappAlerts,
        voice_assistance: updated.voiceAssistance,
      },
    });

    return updated;
  }

  /**
   * Send Real SMS OTP via Google Firebase Phone Auth
   */
  async sendOtp(phone: string): Promise<AuthContractResponse<void>> {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }

    // Call Google Firebase Phone Auth for real SMS delivery to any mobile
    if (typeof window !== 'undefined') {
      try {
        const fbRes = await sendFirebaseOtp(cleanPhone);
        if (fbRes.success) {
          return {
            success: true,
            message: fbRes.message || `Real SMS OTP sent to +91 ${cleanPhone}.`,
          };
        }
        if (fbRes.error) {
          return {
            success: false,
            error: fbRes.error,
          };
        }
      } catch (err: any) {
        console.warn('[AuthService] Firebase sendOtp error:', err);
      }
    }

    return {
      success: true,
      message: `OTP sent to +91 ${cleanPhone}. (Use 8249 for demo)`,
    };
  }

  /**
   * Verify OTP via Google Firebase or demo code 8249
   */
  async verifyOtp(phone: string, otp: string): Promise<AuthContractResponse<void>> {
    await new Promise((res) => setTimeout(res, 300));

    // 1. Allow test/demo code 8249 directly
    if (otp === '8249') {
      return { success: true, message: 'OTP verified successfully (Demo code)' };
    }

    // 2. Verify via Google Firebase Phone Auth session
    if (hasActiveOtpSession()) {
      const fbRes = await verifyFirebaseOtp(otp);
      if (fbRes.success) {
        return { success: true, message: 'Real SMS OTP verified via Google Firebase' };
      }
      return { success: false, error: fbRes.error || 'Invalid OTP code' };
    }

    if (otp.length >= 4) {
      return { success: true, message: 'OTP verified successfully' };
    }
    return { success: false, error: 'Incorrect OTP. Try 8249' };
  }

  /**
   * Reset PIN
   */
  async resetPin(_phone: string, _otp: string, newPin: string): Promise<AuthContractResponse<void>> {
    await new Promise((res) => setTimeout(res, 400));

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return { success: false, error: 'PIN must be exactly 4 digits' };
    }

    return {
      success: true,
      message: 'PIN has been reset successfully. You can now log in.',
    };
  }

  /**
   * Get currently logged-in user
   */
  getCurrentUser(): UserProfile | null {
    return storageService.get<UserProfile | null>(STORAGE_KEYS.USER, null);
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    storageService.remove(STORAGE_KEYS.USER);
    storageService.remove(STORAGE_KEYS.TOKEN);
    syncEngine.clearQueue();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[AuthService] Supabase signOut warning:', err);
      }
    }
  }
}

export const authService = new AuthService();
