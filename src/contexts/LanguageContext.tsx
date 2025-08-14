import React, { createContext, useState, useContext, ReactNode } from 'react';

export type SupportedLanguage = 'en' | 'haw' | 'mao';

interface LanguageContextType {
  interfaceLanguage: SupportedLanguage;
  gameLanguage: SupportedLanguage;
  setInterfaceLanguage: (language: SupportedLanguage) => void;
  setGameLanguage: (language: SupportedLanguage) => void;
  availableLanguages: { code: SupportedLanguage; name: string; nativeName: string }[];
  // Legacy support for existing components
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Initialize languages from localStorage
  const getInitialInterfaceLanguage = (): SupportedLanguage => {
    const stored = localStorage.getItem('interface-language');
    return (stored === 'en' || stored === 'haw' || stored === 'mao') ? stored : 'haw';
  };
  
  const getInitialGameLanguage = (): SupportedLanguage => {
    const stored = localStorage.getItem('game-language');
    return (stored === 'en' || stored === 'haw' || stored === 'mao') ? stored : 'haw';
  };
  
  const [interfaceLanguage, setInterfaceLanguageState] = useState<SupportedLanguage>(getInitialInterfaceLanguage);
  const [gameLanguage, setGameLanguageState] = useState<SupportedLanguage>(getInitialGameLanguage);

  const availableLanguages = [
    { code: 'haw' as SupportedLanguage, name: 'Hawaiian', nativeName: "'Ōlelo Hawaiʻi" },
    { code: 'mao' as SupportedLanguage, name: 'Māori', nativeName: 'Te Reo Māori' },
    { code: 'en' as SupportedLanguage, name: 'English', nativeName: 'English' }
  ];

  const setInterfaceLanguage = (language: SupportedLanguage) => {
    setInterfaceLanguageState(language);
    localStorage.setItem('interface-language', language);
  };

  const setGameLanguage = (language: SupportedLanguage) => {
    setGameLanguageState(language);
    localStorage.setItem('game-language', language);
  };

  // Legacy support for existing components
  const setLanguage = (language: SupportedLanguage) => {
    setInterfaceLanguage(language);
    setGameLanguage(language);
  };

  // Monitor changes to localStorage from other components
  React.useEffect(() => {
    const handleStorageChange = () => {
      const interfaceStored = localStorage.getItem('interface-language');
      const gameStored = localStorage.getItem('game-language');
      
      if (interfaceStored && (interfaceStored === 'en' || interfaceStored === 'haw' || interfaceStored === 'mao') && interfaceStored !== interfaceLanguage) {
        setInterfaceLanguageState(interfaceStored);
      }
      
      if (gameStored && (gameStored === 'en' || gameStored === 'haw' || gameStored === 'mao') && gameStored !== gameLanguage) {
        setGameLanguageState(gameStored);
      }
    };
    
    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [interfaceLanguage, gameLanguage]);

  return (
    <LanguageContext.Provider value={{
      interfaceLanguage,
      gameLanguage,
      setInterfaceLanguage,
      setGameLanguage,
      availableLanguages,
      // Legacy support
      currentLanguage: interfaceLanguage,
      setLanguage
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