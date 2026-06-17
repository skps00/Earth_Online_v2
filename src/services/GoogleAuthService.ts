import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Logger } from '@/utils/logger';

const CLIENT_ID = Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID ?? '';
const SCHEME = 'earthonline';

const DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const SCOPES = ['https://www.googleapis.com/auth/drive.appdata'];

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const TOKEN_KEY = 'google_auth_tokens';

export async function signIn(): Promise<AuthTokens> {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: SCHEME });
  const request = new AuthSession.AuthRequest({
    clientId: CLIENT_ID,
    scopes: SCOPES,
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
  });

  const result = await request.promptAsync(DISCOVERY);
  if (result.type !== 'success') {
    throw new Error(`OAuth failed: ${result.type}`);
  }

  const tokenResponse = await AuthSession.exchangeCodeAsync(
    { code: result.params.code, clientId: CLIENT_ID, redirectUri, extraParams: { code_verifier: request.codeVerifier ?? '' } },
    DISCOVERY
  );

  const tokens: AuthTokens = {
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken ?? '',
    expiresAt: Date.now() + (tokenResponse.expiresIn ?? 3600) * 1000,
  };

  await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens));
  Logger.info('Auth', 'Google sign-in successful');
  return tokens;
}

export async function getTokens(): Promise<AuthTokens | null> {
  const stored = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!stored) return null;
  const tokens: AuthTokens = JSON.parse(stored);
  if (Date.now() > tokens.expiresAt - 60000) {
    return await refreshTokens(tokens.refreshToken);
  }
  return tokens;
}

async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${CLIENT_ID}&refresh_token=${refreshToken}&grant_type=refresh_token`,
  });
  const data = await response.json();
  const tokens: AuthTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens));
  return tokens;
}

export async function signOut(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  Logger.info('Auth', 'Google sign-out');
}

export async function isSignedIn(): Promise<boolean> {
  const tokens = await getTokens();
  return tokens !== null;
}
