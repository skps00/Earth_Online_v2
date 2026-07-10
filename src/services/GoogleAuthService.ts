import { TurboModuleRegistry } from 'react-native';
import { Logger } from '@/utils/logger';

const WEB_CLIENT_ID = '335492280709-70e7rgnsjp4uj41gaj9sek08jtg5b4hv.apps.googleusercontent.com';

export const GOOGLE_SIGNIN_UNAVAILABLE = 'GOOGLE_SIGNIN_UNAVAILABLE';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

type GoogleSigninModule = typeof import('@react-native-google-signin/google-signin');

let googleModule: GoogleSigninModule | null | undefined;

export function isGoogleSigninNativeAvailable(): boolean {
  try {
    return TurboModuleRegistry.get('RNGoogleSignin') != null;
  } catch {
    return false;
  }
}

function getGoogleModule(): GoogleSigninModule | null {
  if (googleModule !== undefined) return googleModule;

  if (!isGoogleSigninNativeAvailable()) {
    googleModule = null;
    return null;
  }

  try {
    // Lazy require — top-level import crashes Expo Go / builds without native module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-google-signin/google-signin') as GoogleSigninModule;
    mod.GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      scopes: ['https://www.googleapis.com/auth/drive.appdata'],
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
    googleModule = mod;
    return mod;
  } catch (error) {
    Logger.error('Auth', 'Failed to load Google Sign-In native module', error);
    googleModule = null;
    return null;
  }
}

function requireGoogleModule(): GoogleSigninModule {
  const mod = getGoogleModule();
  if (!mod) throw new Error(GOOGLE_SIGNIN_UNAVAILABLE);
  return mod;
}

export async function signIn(): Promise<AuthTokens> {
  const { GoogleSignin, statusCodes } = requireGoogleModule();

  try {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signIn();
    Logger.info('Auth', 'Google sign-in response received');

    const tokens = await GoogleSignin.getTokens();
    Logger.info('Auth', `Token scopes check - access token length: ${tokens.accessToken.length}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: '',
      expiresAt: Date.now() + 3600 * 1000,
    };
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('User cancelled login');
    }
    if (code === statusCodes.IN_PROGRESS) {
      throw new Error('Login already in progress');
    }
    if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services not available');
    }
    throw error;
  }
}

export async function getTokens(): Promise<AuthTokens | null> {
  const mod = getGoogleModule();
  if (!mod) return null;

  const { GoogleSignin } = mod;

  try {
    const hasPrevious = GoogleSignin.hasPreviousSignIn();
    if (!hasPrevious) {
      Logger.info('Auth', 'getTokens: no previous sign-in');
      return null;
    }

    await GoogleSignin.signInSilently();
    const tokens = await GoogleSignin.getTokens();
    return {
      accessToken: tokens.accessToken,
      refreshToken: '',
      expiresAt: Date.now() + 3600 * 1000,
    };
  } catch (e) {
    Logger.error('Auth', 'getTokens failed', e);
    return null;
  }
}

export async function signOut(): Promise<void> {
  const mod = getGoogleModule();
  if (!mod) return;

  const { GoogleSignin } = mod;

  try {
    if (GoogleSignin.hasPreviousSignIn()) {
      try {
        await GoogleSignin.revokeAccess();
      } catch {
        // revoke may fail if session already invalid
      }
    }
    await GoogleSignin.signOut();
    Logger.info('Auth', 'Google sign-out');
  } catch (error) {
    Logger.error('Auth', 'Sign-out error', error);
  }
}

export async function isSignedIn(): Promise<boolean> {
  if (!isGoogleSigninNativeAvailable()) return false;
  const tokens = await getTokens();
  return tokens !== null;
}

export async function getUserEmail(): Promise<string | null> {
  const mod = getGoogleModule();
  if (!mod) return null;

  const { GoogleSignin } = mod;

  try {
    if (!GoogleSignin.hasPreviousSignIn()) return null;
    const userInfo = await GoogleSignin.signInSilently();
    return userInfo?.data?.user?.email ?? null;
  } catch {
    return null;
  }
}
