import { useLanguageContext } from '@/contexts/LanguageContext';
import { SupportedLanguage } from '@/contexts/LanguageContext';

// Import translation files
import en from '@/translations/en.json';
import haw from '@/translations/haw.json';
import mao from '@/translations/mao.json';

const translations = {
  en,
  haw,
  mao
};

// Helper function to get nested object value by string path
const getNestedValue = (obj: any, path: string): string => {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    value = value?.[key];
  }
  
  return value;
};

export const useTranslation = () => {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguageContext();

  const t = (key: string): string => {
    const translation = translations[currentLanguage];
    const value = getNestedValue(translation, key);
    
    // Fallback to English if translation not found
    if (value === undefined && currentLanguage !== 'en') {
      const fallbackValue = getNestedValue(translations.en, key);
      return fallbackValue || key;
    }
    
    return value || key;
  };

  return {
    t,
    currentLanguage,
    setLanguage,
    availableLanguages
  };
};