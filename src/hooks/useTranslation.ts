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
  const { interfaceLanguage, currentLanguage, setLanguage, availableLanguages } = useLanguageContext();

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = translations[interfaceLanguage];
    let value = getNestedValue(translation, key);
    
    // Fallback to English if translation not found
    if (value === undefined && interfaceLanguage !== 'en') {
      const fallbackValue = getNestedValue(translations.en, key);
      value = fallbackValue || key;
    } else {
      value = value || key;
    }
    
    // Replace interpolation variables
    if (params && typeof value === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      });
    }
    
    return value;
  };

  // Helper function for getting random celebration message
  const getCelebrationMessage = (): string => {
    const translation = translations[interfaceLanguage];
    const messages = getNestedValue(translation, 'game.messages.celebrationComplete');
    
    if (Array.isArray(messages)) {
      const randomIndex = Math.floor(Math.random() * messages.length);
      return messages[randomIndex];
    }
    
    // Fallback to English if current language doesn't have array
    const englishMessages = getNestedValue(translations.en, 'game.messages.celebrationComplete');
    if (Array.isArray(englishMessages)) {
      const randomIndex = Math.floor(Math.random() * englishMessages.length);
      return englishMessages[randomIndex];
    }
    
    // Final fallback to single string if exists
    return messages || englishMessages || 'You Won!';
  };

  return {
    t,
    getCelebrationMessage,
    currentLanguage,
    setLanguage,
    availableLanguages
  };
};