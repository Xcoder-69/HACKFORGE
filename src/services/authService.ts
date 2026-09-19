// Authentication Service Abstraction for AgroMind AI
// Provides mock asynchronous authentication with realistic delays and validation,
// ready to swap with Supabase Auth or SMS OTP gateways in production.

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  district?: string;
  village?: string;
  role: 'farmer' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: UserProfile;
}

export const authService = {
  /**
   * Mock login with phone + OTP or PIN
   */
  async login(phone: string, otpOrPin: string): Promise<AuthResponse> {
    await new Promise((res) => setTimeout(res, 600)); // simulate network

    // Basic format validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }

    if (!otpOrPin || otpOrPin.length < 4) {
      return { success: false, error: 'Please enter a valid 4-digit OTP or PIN' };
    }

    // Mock successful user profile
    const user: UserProfile = {
      id: 'usr_' + cleanPhone,
      name: 'Rameshbhai Patel',
      phone: cleanPhone,
      district: 'Surat',
      village: 'Olpad',
      role: 'farmer',
    };

    localStorage.setItem('agromind_user', JSON.stringify(user));
    localStorage.setItem('agromind_token', 'mock_jwt_token_' + Date.now());

    return { success: true, user, message: 'Login successful' };
  },

  /**
   * Mock registration for new farmers
   */
  async register(data: {
    name: string;
    phone: string;
    district: string;
    village: string;
  }): Promise<AuthResponse> {
    await new Promise((res) => setTimeout(res, 700));

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
      village: data.village,
      role: 'farmer',
    };

    localStorage.setItem('agromind_user', JSON.stringify(user));
    localStorage.setItem('agromind_token', 'mock_jwt_token_' + Date.now());

    return { success: true, user, message: 'Registration successful' };
  },

  /**
   * Send OTP via SMS / WhatsApp simulation
   */
  async sendOtp(phone: string): Promise<AuthResponse> {
    await new Promise((res) => setTimeout(res, 500));
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return { success: false, error: 'Invalid mobile number' };
    }

    // Fixed mock OTP for testing convenience: 8249
    return {
      success: true,
      message: `OTP sent to +91 ${cleanPhone}. (Use 8249 for testing)`,
    };
  },

  /**
   * Verify OTP
   */
  async verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
    await new Promise((res) => setTimeout(res, 400));
    if (otp === '8249' || otp.length === 4) {
      return { success: true, message: 'OTP verified successfully' };
    }
    return { success: false, error: 'Incorrect OTP. Try 8249' };
  },

  /**
   * Reset PIN
   */
  async resetPin(phone: string, otp: string, newPin: string): Promise<AuthResponse> {
    await new Promise((res) => setTimeout(res, 600));

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return { success: false, error: 'PIN must be exactly 4 digits' };
    }

    return {
      success: true,
      message: 'PIN has been reset successfully. You can now log in.',
    };
  },

  /**
   * Get currently logged-in user
   */
  getCurrentUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem('agromind_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('agromind_user');
    localStorage.removeItem('agromind_token');
  },
};
