import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import { useAtomValue } from 'jotai';
import { langAtom, Language } from '@/stores/settingsStore';
import enCommon from './en/common.json';
import enHome from './en/home.json';
import enTrophies from './en/trophies.json';
import enQuest from './en/quest.json';
import enCompanion from './en/companion.json';
import enProfile from './en/profile.json';
import enErrors from './en/errors.json';
import zhCommon from './zh-TW/common.json';
import zhHome from './zh-TW/home.json';
import zhTrophies from './zh-TW/trophies.json';
import zhQuest from './zh-TW/quest.json';
import zhCompanion from './zh-TW/companion.json';
import zhProfile from './zh-TW/profile.json';
import zhErrors from './zh-TW/errors.json';

const i18n = new I18n({
  en: { ...enCommon, ...enHome, ...enTrophies, ...enQuest, ...enCompanion, ...enProfile, ...enErrors },
  'zh-TW': { ...zhCommon, ...zhHome, ...zhTrophies, ...zhQuest, ...zhCompanion, ...zhProfile, ...zhErrors },
});

i18n.enableFallback = true;
i18n.defaultLocale = 'en';
i18n.locale = 'en';

export function getDeviceLanguage(): Language {
  const locales = getLocales();
  const code = locales[0]?.languageCode ?? 'en';
  return code === 'zh' ? 'zh-TW' : 'en';
}

export function useTranslation() {
  const lang = useAtomValue(langAtom);
  i18n.locale = lang;
  return {
    t: (key: string, options?: Record<string, unknown>) => i18n.t(key, options),
    lang,
  };
}
