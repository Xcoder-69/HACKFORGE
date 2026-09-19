// Firebase Client Configuration & Phone Auth Service for AgroMind AI
// Provides 10,000 free real SMS OTP verifications per month to any mobile phone globally

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDy_u2sknXu2Kc4BN2FlEn6YJAZyM7e01o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "studio-7654728390-57060.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "studio-7654728390-57060",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "studio-7654728390-57060.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "294209817908",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:294209817908:web:58eb9c027c8771a3c62961",
};

// Initialize Firebase App singleton
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(firebaseApp);
if (typeof window !== 'undefined') {
  firebaseAuth.useDeviceLanguage();
}

// In-memory active confirmation result for OTP verification
let activeConfirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Initializes or reuses an invisible RecaptchaVerifier on the specified container
 */
export function getRecaptchaVerifier(containerId: string = 'recaptcha-container'): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('RecaptchaVerifier requires a browser environment');
  }

  // Ensure DOM element exists or create fallback if missing
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  // Clear existing if container was re-rendered
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // Ignore if already cleared
    }
    recaptchaVerifier = null;
  }

  recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - allow signInWithPhoneNumber
    },
    'expired-callback': () => {
      console.warn('[Firebase] Recaptcha expired, re-initializing.');
    },
  });

  return recaptchaVerifier;
}

/**
 * Sends a real SMS OTP via Google Firebase Phone Auth
 */
export async function sendFirebaseOtp(
  phone: string,
  containerId: string = 'recaptcha-container'
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }

    const formattedPhone = `+91${cleanPhone}`;
    const verifier = getRecaptchaVerifier(containerId);

    activeConfirmationResult = await signInWithPhoneNumber(firebaseAuth, formattedPhone, verifier);

    return {
      success: true,
      message: `Real SMS OTP sent to ${formattedPhone}. Please check your phone.`,
    };
  } catch (err: any) {
    console.warn('[Firebase] Phone OTP dispatch failed:', err);
    let errorMsg = err.message || 'Failed to send SMS OTP.';

    if (err.code === 'auth/invalid-phone-number') {
      errorMsg = 'The provided phone number is invalid.';
    } else if (err.code === 'auth/too-many-requests') {
      errorMsg = 'Too many requests. Please wait a moment before requesting another SMS.';
    } else if (err.code === 'auth/captcha-check-failed') {
      errorMsg = 'reCAPTCHA verification failed. Please try again.';
    } else if (err.code === 'auth/operation-not-allowed') {
      errorMsg = 'Phone authentication is not enabled yet in your Firebase Console (Authentication -> Sign-in method -> Phone).';
    } else if (err.code === 'auth/billing-not-enabled') {
      errorMsg = 'Firebase SMS quota exceeded or billing configuration required.';
    }

    return { success: false, error: errorMsg };
  }
}

/**
 * Verifies the SMS OTP code sent by Google Firebase
 */
export async function verifyFirebaseOtp(
  otpCode: string
): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    if (!activeConfirmationResult) {
      return { success: false, error: 'No active OTP verification session found. Please click "Send OTP".' };
    }

    const result = await activeConfirmationResult.confirm(otpCode);
    return {
      success: true,
      user: result.user,
    };
  } catch (err: any) {
    console.warn('[Firebase] OTP confirmation failed:', err);
    let errorMsg = 'Incorrect OTP code. Please check the SMS on your phone.';
    if (err.code === 'auth/code-expired') {
      errorMsg = 'The SMS verification code has expired. Please click "Resend OTP".';
    } else if (err.code === 'auth/invalid-verification-code') {
      errorMsg = 'Incorrect 6-digit OTP code.';
    }
    return { success: false, error: errorMsg };
  }
}

/**
 * Checks if there is an active Firebase verification awaiting input
 */
export function hasActiveOtpSession(): boolean {
  return !!activeConfirmationResult;
}
