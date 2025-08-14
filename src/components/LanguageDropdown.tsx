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
    { code: 'haw', name: "'Ōlelo Hawaiʻi", disabled: false },
    { code: 'mao', name: 'Te Reo Māori', disabled: true },
    { code: 'en', name: 'English', disabled: false }
  ];

  const gameLanguages = [
    { code: 'haw', name: "'Ōlelo Hawaiʻi", disabled: false },
    { code: 'mao', name: 'Te Reo Māori', disabled: false },
    { code: 'en', name: 'English', disabled: true }
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
        {/* Globe icon - made 50% larger than help icon */}
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 rounded-full min-w-[48px] min-h-[48px] w-12 h-12 p-0 flex items-center justify-center"
          >
            <Globe className="h-10 w-10 min-w-[40px] min-h-[40px]" style={{width: '40px', height: '40px'}} />
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
              <h3 className="font-semibold text-gray-900 mb-3">Interface Language</h3>
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
                      {lang.name}
                      {lang.disabled && (
                        <span className="text-xs text-gray-400 ml-1">(under development)</span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Game Language Section */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Game Language</h3>
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
                      {lang.name}
                      {lang.disabled && (
                        <span className="text-xs text-gray-400 ml-1">(under development)</span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button 
                onClick={handleCancel}
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleApply}
                size="sm"
                className="flex-1"
              >
                OK
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LanguageDropdown;