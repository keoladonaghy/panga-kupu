import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import type { SupportedLanguage } from '@/contexts/LanguageContext';

interface LanguageDropdownProps {
  className?: string;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ className = '' }) => {
  const { 
    interfaceLanguage, 
    gameLanguage, 
    setInterfaceLanguage, 
    setGameLanguage, 
    availableLanguages 
  } = useLanguageContext();
  const { t } = useTranslation();

  // Local state for pending selections
  const [pendingInterfaceLanguage, setPendingInterfaceLanguage] = useState<SupportedLanguage>(interfaceLanguage);
  const [pendingGameLanguage, setPendingGameLanguage] = useState<SupportedLanguage>(gameLanguage);
  const [isOpen, setIsOpen] = useState(false);

  const interfaceLanguages = [
    { code: 'haw', nameKey: 'hawaiian', disabled: false },
    { code: 'mao', nameKey: 'maori', disabled: true },
    { code: 'tah', nameKey: 'tahitian', disabled: true },
    { code: 'en', nameKey: 'english', disabled: false }
  ];

  const gameLanguages = [
    { code: 'haw', nameKey: 'hawaiian', disabled: false },
    { code: 'mao', nameKey: 'maori', disabled: false },
    { code: 'tah', nameKey: 'tahitian', disabled: false },
    { code: 'en', nameKey: 'english', disabled: true }
  ];

  // Handle applying changes
  const handleApply = () => {
    setInterfaceLanguage(pendingInterfaceLanguage);
    setGameLanguage(pendingGameLanguage);
    setIsOpen(false);
  };

  // Handle canceling changes
  const handleCancel = () => {
    setPendingInterfaceLanguage(interfaceLanguage);
    setPendingGameLanguage(gameLanguage);
    setIsOpen(false);
  };

  // Reset pending changes when popover opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setPendingInterfaceLanguage(interfaceLanguage);
      setPendingGameLanguage(gameLanguage);
    }
    setIsOpen(open);
  };

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        {/* Globe icon - forced larger size */}
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 rounded-full"
            style={{ width: '32px', height: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Globe style={{ width: '24px', height: '24px' }} />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-6 bg-white border border-gray-200 shadow-lg rounded-lg"
          align="end"
          side="bottom"
          sideOffset={8}
        >
          <div className="space-y-6">
            {/* Interface Language Section */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{t('languageDropdown.interfaceLanguage')}</h3>
              <RadioGroup 
                value={pendingInterfaceLanguage} 
                onValueChange={(value) => setPendingInterfaceLanguage(value as SupportedLanguage)}
                className="space-y-2"
              >
                {interfaceLanguages.map((lang) => (
                  <div key={lang.code} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={lang.code} 
                      id={`interface-${lang.code}`}
                      disabled={lang.disabled}
                      className="text-primary"
                    />
                    <Label 
                      htmlFor={`interface-${lang.code}`}
                      className={`text-sm cursor-pointer ${
                        lang.disabled ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {t(`languageDropdown.${lang.nameKey}`)}
                      {lang.disabled && (
                        <span className="text-xs text-gray-400 ml-1">{t('languageDropdown.underDevelopment')}</span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Game Language Section */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{t('languageDropdown.gameLanguage')}</h3>
              <RadioGroup 
                value={pendingGameLanguage} 
                onValueChange={(value) => setPendingGameLanguage(value as SupportedLanguage)}
                className="space-y-2"
              >
                {gameLanguages.map((lang) => (
                  <div key={lang.code} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={lang.code} 
                      id={`game-${lang.code}`}
                      disabled={lang.disabled}
                      className="text-primary"
                    />
                    <Label 
                      htmlFor={`game-${lang.code}`}
                      className={`text-sm cursor-pointer ${
                        lang.disabled ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {t(`languageDropdown.${lang.nameKey}`)}
                      {lang.disabled && (
                        <span className="text-xs text-gray-400 ml-1">{t('languageDropdown.underDevelopment')}</span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Thank you message to Mary Boyce */}
            <div className="text-xs text-gray-500 italic border-t border-gray-100 pt-3">
              {t('languageDropdown.acknowledgment')}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button 
                onClick={handleCancel}
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                {t('languageDropdown.cancel')}
              </Button>
              <Button 
                onClick={handleApply}
                size="sm"
                className="flex-1"
              >
                {t('languageDropdown.ok')}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LanguageDropdown;