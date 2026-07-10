import { resolvePrivacyPolicyUrl } from '@/utils/legalLinks';

describe('resolvePrivacyPolicyUrl', () => {
  it('rejects missing or non-HTTPS URLs', () => {
    expect(resolvePrivacyPolicyUrl(undefined)).toBeNull();
    expect(resolvePrivacyPolicyUrl('')).toBeNull();
    expect(resolvePrivacyPolicyUrl('http://insecure.example/privacy')).toBeNull();
  });

  it('accepts HTTPS URLs', () => {
    expect(resolvePrivacyPolicyUrl('https://example.com/privacy')).toBe('https://example.com/privacy');
  });
});
