import Constants from 'expo-constants';
import { Linking } from 'react-native';

export function resolvePrivacyPolicyUrl(url: string | undefined | null): string | null {
  if (!url || !url.startsWith('https://')) return null;
  return url;
}

export function getPrivacyPolicyUrl(): string | null {
  const url = Constants.expoConfig?.extra?.PRIVACY_POLICY_URL as string | undefined;
  return resolvePrivacyPolicyUrl(url);
}

export async function openPrivacyPolicy(): Promise<boolean> {
  const url = getPrivacyPolicyUrl();
  if (!url) return false;
  await Linking.openURL(url);
  return true;
}
