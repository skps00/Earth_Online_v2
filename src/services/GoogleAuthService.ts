import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Logger } from '@/utils/logger';

const WEB_CLIENT_ID = '335492280709-70e7rgnsjp4uj41gaj9sek08jtg5b4hv.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  scopes: ['https://www.googleapis.com/auth/drive.appdata'],
  offlineAccess: true,
});

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export async function signIn(): Promise<AuthTokens> {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();

    Logger.info('Auth', `Google sign-in successful: ${userInfo.user.email}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: '',
      expiresAt: Date.now() + 3600 * 1000,
    };
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('User cancelled login');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      throw new Error('Login already in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services not available');
    }
    throw error;
  }
}

export async function getTokens(): Promise<AuthTokens | null> {
  try {
    const userInfo = await GoogleSignin.signInSilently();
    if (!userInfo) return null;

    const tokens = await GoogleSignin.getTokens();
    return {
      accessToken: tokens.accessToken,
      refreshToken: '',
      expiresAt: Date.now() + 3600 * 1000,
    };
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    Logger.info('Auth', 'Google sign-out');
  } catch (error) {
    Logger.error('Auth', 'Sign-out error', error);
  }
}

export async function isSignedIn(): Promise<boolean> {
  try {
    const userInfo = await GoogleSignin.signInSilently();
    return userInfo !== null;
  } catch {
    return false;
  }
}
