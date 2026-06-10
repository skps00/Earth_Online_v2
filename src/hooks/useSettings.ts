import { useEffect } from 'react';
import { useSetAtom, useAtom } from 'jotai';
import { themeAtom, langAtom, soundEnabledAtom, ThemeMode, Language } from '@/stores/settingsStore';
import { SettingsRepository } from '@/repositories/SettingsRepository';
import { getDeviceLanguage } from '@/i18n';

const settingsRepo = new SettingsRepository();

export function useSettings() {
  const setTheme = useSetAtom(themeAtom);
  const [lang, setLang] = useAtom(langAtom);
  const setSound = useSetAtom(soundEnabledAtom);

  // Load persisted settings on startup
  useEffect(() => {
    (async () => {
      const savedTheme = await settingsRepo.get('theme');
      if (savedTheme) setTheme(savedTheme as ThemeMode);

      const savedLang = await settingsRepo.get('lang');
      if (savedLang) {
        setLang(savedLang as Language);
      } else {
        const deviceLang = getDeviceLanguage();
        setLang(deviceLang);
        await settingsRepo.set('lang', deviceLang);
      }

      const savedSound = await settingsRepo.get('sound');
      if (savedSound !== null) setSound(savedSound === 'true');
    })();
  }, []);

  // Persist helper — exposed for ProfileScreen
  const persistTheme = async (value: ThemeMode) => {
    setTheme(value);
    await settingsRepo.set('theme', value);
  };

  const persistLang = async (value: Language) => {
    setLang(value);
    await settingsRepo.set('lang', value);
  };

  const persistSound = async (value: boolean) => {
    setSound(value);
    await settingsRepo.set('sound', String(value));
  };

  return { lang, persistTheme, persistLang, persistSound };
}
