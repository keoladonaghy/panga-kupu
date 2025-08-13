import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact';
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'default',
  className = '' 
}) => {
  const { currentLanguage, setLanguage, availableLanguages } = useTranslation();

  if (variant === 'compact') {
    return (
      <div className={`flex gap-1 ${className}`}>
        {availableLanguages.map((lang) => (
          <Button
            key={lang.code}
            variant={currentLanguage === lang.code ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setLanguage(lang.code)}
            disabled={currentLanguage === lang.code}
            className="text-xs font-medium px-2 py-1"
          >
            {lang.code === 'haw' ? "'ŌH" : lang.code === 'mao' ? 'MĀO' : 'EN'}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {availableLanguages.map((lang) => (
        <Button
          key={lang.code}
          variant={currentLanguage === lang.code ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setLanguage(lang.code)}
          disabled={currentLanguage === lang.code}
          className="text-xs font-medium"
        >
          {lang.nativeName}
        </Button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;