// src/hooks/useInterfaceLanguage.ts
import { useState, useEffect } from 'react';
import { InterfaceTexts } from '../languages/interface/types';
import { InterfaceLanguageLoader } from '../languages/interface/loader';
import { getInterfaceLanguageByName, getDefaultInterfaceLanguage } from '../languages/interface/interfaceRegistry';

const INTERFACE_LANGUAGE_STORAGE_KEY = 'kimiKupuInterfaceLanguage';

export interface UseInterfaceLanguageResult {
  texts: InterfaceTexts | null;
  loading: boolean;
  error: string | null;
  currentLanguage: string;
  changeInterfaceLanguage: (languageName: string) => Promise<void>;
}

export const useInterfaceLanguage = (initialLanguage?: string): UseInterfaceLanguageResult => {
  // Get initial language from localStorage or use default
  const getStoredLanguage = (): string => {
    const stored = localStorage.getItem(INTERFACE_LANGUAGE_STORAGE_KEY);
    if (stored) {
      const langEntry = getInterfaceLanguageByName(stored);
      if (langEntry && langEntry.enabled) {
        return stored;
      }
    }
    // If initialLanguage provided, validate it exists in registry
    if (initialLanguage) {
      const initialEntry = getInterfaceLanguageByName(initialLanguage);
      if (initialEntry && initialEntry.enabled) {
        return initialLanguage;
      }
    }
    return getDefaultInterfaceLanguage().name;
  };

  const [texts, setTexts] = useState<InterfaceTexts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState(getStoredLanguage());

  const loadInterfaceTexts = async (languageName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const langEntry = getInterfaceLanguageByName(languageName);
      if (!langEntry) {
        throw new Error(`Interface language '${languageName}' not found`);
      }

      const interfaceTexts = await InterfaceLanguageLoader.loadInterfaceTexts(languageName);
      setTexts(interfaceTexts);
      setCurrentLanguage(languageName);
      
      // Save to localStorage
      localStorage.setItem(INTERFACE_LANGUAGE_STORAGE_KEY, languageName);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading interface language';
      setError(errorMessage);
      console.error('Interface language loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const changeInterfaceLanguage = async (languageName: string) => {
    await loadInterfaceTexts(languageName);
  };

  // Load initial language on mount
  useEffect(() => {
    loadInterfaceTexts(currentLanguage);
  }, [currentLanguage]);

  return {
    texts,
    loading,
    error,
    currentLanguage,
    changeInterfaceLanguage
  };
};