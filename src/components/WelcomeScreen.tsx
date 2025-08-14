import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageDropdown from './LanguageDropdown';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="text-center">
        {/* Main Title with Help Icon */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <h1 className="text-6xl font-bold text-white drop-shadow-2xl">
            {t('welcome.title')}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowInstructions(true)}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </div>

        {/* Language Dropdown */}
        <div className="absolute top-4 right-4">
          <LanguageDropdown />
        </div>

        {/* Start Game Button */}
        <Button
          onClick={onStart}
          className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-xl font-semibold rounded-lg shadow-lg"
        >
          {t('welcome.startButton')}
        </Button>
      </div>

      {/* Instructions Modal */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogOverlay className="bg-black/50" />
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-white">
          {/* Header with Language Toggle */}
          <div className="flex items-center justify-start p-4 border-b bg-gray-50">
            <LanguageDropdown />
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 p-6">
            <div className="prose max-w-none">
              <h3 className="font-bold text-lg mb-4">{t('instructions.title')}</h3>
              <ol className="list-decimal list-inside space-y-3 mb-6">
                <li><strong>{t('instructions.steps.selectLetters.title')}</strong> {t('instructions.steps.selectLetters.description')}
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>{t('instructions.steps.selectLetters.vowels')}</li>
                    <li>{t('instructions.steps.selectLetters.longVowels')}</li>
                    <li>{t('instructions.steps.selectLetters.okina')}</li>
                  </ul>
                  {t('instructions.steps.selectLetters.note')}
                </li>
                <li><strong>{t('instructions.steps.formingWords.title')}</strong>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>{t('instructions.steps.formingWords.correctSpelling')}</li>
                    <li>{t('instructions.steps.formingWords.availableLetters')}</li>
                    <li>{t('instructions.steps.formingWords.minLength')}</li>
                  </ul>
                </li>
                <li><strong>{t('instructions.steps.submitAuto.title')}</strong>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>{t('instructions.steps.submitAuto.autoAppear')}</li>
                    <li>{t('instructions.steps.submitAuto.noSubmit')}</li>
                  </ul>
                </li>
                <li><strong>{t('instructions.steps.editing.title')}</strong>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>{t('instructions.steps.editing.mistake')}</li>
                    <li>{t('instructions.steps.editing.keepTapping')}</li>
                  </ul>
                </li>
                <li><strong>{t('instructions.steps.continue.title')}</strong>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>{t('instructions.steps.continue.afterSuccess')}</li>
                    <li>{t('instructions.steps.continue.findAll')}</li>
                  </ul>
                </li>
              </ol>

              <h3 className="font-bold text-lg mb-4">{t('instructions.tips.title')}</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>{t('instructions.tips.diacriticals')}</li>
                <li>{t('instructions.tips.differences')}
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>{t('instructions.tips.example')}</li>
                  </ul>
                </li>
                <li>{t('instructions.tips.pronunciation')}</li>
              </ul>
            </div>
          </ScrollArea>

        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WelcomeScreen;