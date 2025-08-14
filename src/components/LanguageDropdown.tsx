import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

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

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
          >
            <Globe className="h-5 w-5" />
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
                value={interfaceLanguage} 
                onValueChange={(value) => setInterfaceLanguage(value as any)}
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
                value={gameLanguage} 
                onValueChange={(value) => setGameLanguage(value as any)}
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
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LanguageDropdown;