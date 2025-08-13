import React, { createContext, useState, useContext, ReactNode } from 'react';

export type SupportedLanguage = 'en' | 'haw' | 'mao';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  availableLanguages: { code: SupportedLanguage; name: string; nativeName: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Initialize from localStorage first, then default to 'haw'
  const getInitialLanguage = (): SupportedLanguage => {
    const stored = localStorage.getItem('preferred-language');
    return (stored === 'en' || stored === 'haw' || stored === 'mao') ? stored : 'haw';
  };
  
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(getInitialLanguage);

  const availableLanguages = [
    { code: 'haw' as SupportedLanguage, name: 'Hawaiian', nativeName: "'Ōlelo Hawaiʻi" },
    { code: 'mao' as SupportedLanguage, name: 'Māori', nativeName: 'Te Reo Māori' },
    { code: 'en' as SupportedLanguage, name: 'English', nativeName: 'English' }
  ];

  const setLanguage = (language: SupportedLanguage) => {
    setCurrentLanguage(language);
    // Store preference in localStorage
    localStorage.setItem('preferred-language', language);
  };

  // Initialize from localStorage on mount
  // Monitor changes to localStorage from other components
  React.useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('preferred-language');
      if (stored && (stored === 'en' || stored === 'haw' || stored === 'mao') && stored !== currentLanguage) {
        setCurrentLanguage(stored);
      }
    };
    
    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguage,
      availableLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};