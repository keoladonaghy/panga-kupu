import React, { useState, useCallback, useEffect } from 'react';
import { Loader2, RefreshCw, RotateCcw, Lightbulb, Info, Upload, List, ChevronDown, ChevronUp, Send, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AnimatedTitle from '@/components/AnimatedTitle';
import WelcomeScreen from '@/components/WelcomeScreen';
import { NotificationBox } from '@/components/NotificationBox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { CrosswordGenerator, CrosswordWord } from '@/utils/crosswordGenerator';
import { WordPosition } from '@/types/WordPosition';

// Updated language dropdown implementation
import { getWordLimitsForLanguage } from '@/config/languageWordLimits';
import WordListUploader from '@/components/WordListUploader';
import LanguageDropdown from '@/components/LanguageDropdown';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/contexts/LanguageContext';

// Legacy constants - will be replaced by language-specific settings
const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 5;

interface GameState {
  foundWordIDs: string[]; // Now tracks WordPosition IDs instead of word text
  hintsUsed: number;
  availableWords: string[];
  selectedLetters: string[];
  currentWord: string;
  availableLetters: string[];
  crosswordWords: CrosswordWord[];
  wordPositions: WordPosition[]; // New: WordPosition objects for precise tracking
  showError: boolean;
  errorMessage: string;
  typedWord: string;
  showCelebration: boolean;
  isManualCelebration: boolean;
  showCircleError?: boolean;
  circleErrorMessage?: string;
  hintAttemptsLeft: number;
  showHintMessage: boolean;
  hintMessage: string;
  lastHintedWordPosition?: WordPosition; // Now tracks WordPosition instead of CrosswordWord
  lastHintedLetterIndex: number;
  foundThreeLetterWords: string[]; // Track found 3-letter words to avoid re-triggering
  threeLetterToastShown: boolean; // Track if the three-letter timeout toast has been shown
  showSuccessNotification: boolean;
  successMessage: string;
}

// Toast message constants
const WORD_FOUND_TOAST_TITLE = "UIHĀ!";
const WORD_FOUND_TOAST_DESCRIPTION = (word: string) => `Ua koho pono 'oe iā ${word}!`;

// Helper functions for WordPosition tracking
const findWordPosition = (wordPositions: WordPosition[], word: string, row: number, col: number): WordPosition | undefined => {
  return wordPositions.find(wp => 
    wp.word.toUpperCase() === word.toUpperCase() && 
    wp.startsAt(row, col)
  );
};

const isWordPositionFound = (foundWordIDs: string[], wordPosition: WordPosition): boolean => {
  return foundWordIDs.includes(wordPosition.id);
};

const getWordPositionsAt = (wordPositions: WordPosition[], row: number, col: number): WordPosition[] => {
  return wordPositions.filter(wp => wp.containsCell(row, col));
};

const getWordPositionsStartingAt = (wordPositions: WordPosition[], row: number, col: number): WordPosition[] => {
  return wordPositions.filter(wp => wp.startsAt(row, col));
};

const HawaiianWordGame: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const { t, currentLanguage, getCelebrationMessage } = useTranslation();
  const { gameLanguage } = useLanguageContext();
  const [gameState, setGameState] = useState<GameState>({
    foundWordIDs: [],
    hintsUsed: 0,
    availableWords: [],
    selectedLetters: [],
    currentWord: '',
    availableLetters: [],
    crosswordWords: [],
    wordPositions: [],
    showError: false,
    errorMessage: '',
    typedWord: '',
    showCelebration: false,
    isManualCelebration: false,
    hintAttemptsLeft: 2,
    showHintMessage: false,
    hintMessage: '',
    lastHintedWordPosition: undefined,
    lastHintedLetterIndex: -1,
    foundThreeLetterWords: [],
    threeLetterToastShown: false,
    showSuccessNotification: false,
    successMessage: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [grid, setGrid] = useState<string[][]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [customWords, setCustomWords] = useState<string[] | null>(null);
  const [customWordsLoaded, setCustomWordsLoaded] = useState(false);
  const [debuggingOpen, setDebuggingOpen] = useState(false);
  const [showWordDisplay, setShowWordDisplay] = useState(false);
  const [displayWords, setDisplayWords] = useState<string[]>([]);
  const [threeLetterTimeout, setThreeLetterTimeout] = useState<NodeJS.Timeout | null>(null);
  const [wordClearTimeout, setWordClearTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hokaTimeout, setHokaTimeout] = useState<NodeJS.Timeout | null>(null);
  const [revealMode, setRevealMode] = useState(false);
  
  const { toast } = useToast();

  // Initialize game on component mount and language change
  useEffect(() => {
    const initializeGame = async () => {
      console.log('🎮 Initializing game...');
      try {
        await loadHawaiianWords();
      } catch (error) {
        console.error('Failed to initialize game:', error);
        setGameState(prev => ({
          ...prev,
          showError: true,
          errorMessage: t('error.loadingFailed')
        }));
      }
    };

    initializeGame();
  }, [gameLanguage]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      [threeLetterTimeout, wordClearTimeout, hokaTimeout].forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [threeLetterTimeout, wordClearTimeout, hokaTimeout]);

  // Helper function to check if a word was found using WordPosition tracking
  const isWordFound = (word: string, length?: number, row?: number, col?: number) => {
    const normalizedWord = toHawaiianUppercase(word);
    
    // If position is provided, find the specific WordPosition and check if it's found
    if (row !== undefined && col !== undefined) {
      const wordPosition = findWordPosition(gameState.wordPositions, normalizedWord, row, col);
      return wordPosition ? isWordPositionFound(gameState.foundWordIDs, wordPosition) : false;
    }
    
    // If no position provided, check if any WordPosition with this word text is found
    return gameState.wordPositions.some(wp => 
      wp.word.toUpperCase() === normalizedWord && 
      (length === undefined || wp.length === length) &&
      isWordPositionFound(gameState.foundWordIDs, wp)
    );
  };

  // Convert to Hawaiian uppercase (preserving diacriticals)
  const toHawaiianUppercase = (word: string): string => {
    const result = word
      .replace(/'/g, gameLanguage === 'haw' ? 'ʻ' : '') // Convert or remove left single quotes
      .toUpperCase() // This will handle regular letters but preserve 'okina
      .normalize('NFC'); // Recompose characters for consistent storage
    
    console.log('🔤 toHawaiianUppercase output:', result);
    return result;
  };

  // Load words from public file based on current language
  const loadHawaiianWords = useCallback(async (useRandomSeed = false, forceTestWords = false) => {
    console.log('loadHawaiianWords called with useRandomSeed:', useRandomSeed, 'forceTestWords:', forceTestWords);
    
    try {
      setLoading(true);
      
      // If custom words were uploaded, use them
      if (customWords && customWords.length > 0 && !forceTestWords) {
        console.log('📋 Using custom uploaded words:', customWords.length);
        await generateCrosswordLayout(customWords, useRandomSeed);
        return;
      }

      // Get appropriate word file based on game language
      let wordFile = '/HawaiianWords.txt';
      switch (gameLanguage) {
        case 'mao':
          wordFile = '/KupuMaori.txt';
          break;
        case 'tah':
          wordFile = '/ParauTahiti.txt';
          break;
        default:
          wordFile = '/HawaiianWords.txt';
      }
      
      console.log(`📄 Loading words from: ${wordFile}`);
      
      const response = await fetch(wordFile);
      if (!response.ok) {
        throw new Error(`Failed to load words: ${response.status}`);
      }
      
      const text = await response.text();
      const words = text
        .split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0)
        .map(word => word.replace(/'/g, gameLanguage === 'haw' ? 'ʻ' : ''));
      
      console.log(`📚 Loaded ${words.length} words from ${wordFile}`);
      await generateCrosswordLayout(words, useRandomSeed);
      
    } catch (error) {
      console.error('Error loading words:', error);
      setGameState(prev => ({
        ...prev,
        showError: true,
        errorMessage: t('error.loadingWords')
      }));
      setLoading(false);
    }
  }, [gameLanguage, customWords, t]);

  // Generate crossword layout from word list
  const generateCrosswordLayout = async (words: string[], useRandomSeed = false) => {
    console.log('🎯 Generating crossword layout from', words.length, 'words');
    
    try {
      setLoading(true);
      
      const wordLimits = getWordLimitsForLanguage(gameLanguage);
      console.log('📏 Using word limits for', gameLanguage, ':', wordLimits);
      
      const generator = new CrosswordGenerator(words, 15, gameLanguage, wordLimits);
      const result = await generator.generateCrossword();
      
      if (!result) {
        throw new Error('Failed to generate crossword - no valid layout found');
      }
      
      console.log('✅ Generated crossword with', result.words.length, 'words');
      console.log('🎲 Selected letters:', result.selectedLetters);
      
      // Update grid
      setGrid(result.grid);
      
      // Update game state with WordPositions
      setGameState(prev => ({
        ...prev,
        foundWordIDs: [], // Reset found words
        crosswordWords: result.words,
        wordPositions: result.wordPositions, // Store WordPosition objects
        selectedLetters: result.selectedLetters,
        availableLetters: [...result.selectedLetters],
        currentWord: '',
        typedWord: '',
        showError: false,
        hintsUsed: 0,
        hintAttemptsLeft: 2,
        foundThreeLetterWords: [],
        threeLetterToastShown: false,
        lastHintedWordPosition: undefined,
        lastHintedLetterIndex: -1
      }));
      
    } catch (error) {
      console.error('❌ Error generating crossword:', error);
      setGameState(prev => ({
        ...prev,
        showError: true,
        errorMessage: t('error.generatingCrossword')
      }));
    } finally {
      setLoading(false);
    }
  };

  // Clear timeouts helper
  const clearAllTimeouts = () => {
    [threeLetterTimeout, wordClearTimeout, hokaTimeout].forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
    setThreeLetterTimeout(null);
    setWordClearTimeout(null);
    setHokaTimeout(null);
  };

  // Handle letter click from wheel
  const handleLetterClick = (letter: string) => {
    console.log('🔤 Letter clicked:', letter);
    
    clearAllTimeouts();
    
    const newWord = gameState.currentWord + letter;
    console.log('📝 New word after letter click:', newWord);
    
    // Update available letters and current word
    const updatedAvailableLetters = [...gameState.availableLetters];
    const letterIndex = updatedAvailableLetters.indexOf(letter);
    if (letterIndex > -1) {
      updatedAvailableLetters.splice(letterIndex, 1);
    }
    
    setGameState(prev => ({
      ...prev,
      currentWord: newWord,
      availableLetters: updatedAvailableLetters,
      showError: false,
      showCircleError: false
    }));

    // Auto-check logic for words that match crossword positions
    if (newWord.length >= MIN_WORD_LENGTH) {
      const normalizedWord = toHawaiianUppercase(newWord);
      
      // Find matching WordPositions for this word
      const matchingWordPositions = gameState.wordPositions.filter(wp => 
        wp.word.toUpperCase() === normalizedWord
      );
      
      if (matchingWordPositions.length > 0) {
        // Check if any of these positions haven't been found yet
        const unFoundPositions = matchingWordPositions.filter(wp => 
          !isWordPositionFound(gameState.foundWordIDs, wp)
        );
        
        if (unFoundPositions.length > 0) {
          // Word found! Mark the first unfound position as found
          const foundPosition = unFoundPositions[0];
          
          setGameState(prev => ({
            ...prev,
            foundWordIDs: [...prev.foundWordIDs, foundPosition.id],
            currentWord: '',
            availableLetters: [...prev.selectedLetters],
            foundThreeLetterWords: newWord.length === 3 ? 
              [...prev.foundThreeLetterWords, normalizedWord] : 
              prev.foundThreeLetterWords,
            showSuccessNotification: true,
            successMessage: getCelebrationMessage()
          }));

          // Show success toast
          toast({
            title: WORD_FOUND_TOAST_TITLE,
            description: WORD_FOUND_TOAST_DESCRIPTION(normalizedWord),
            duration: 2000,
          });

          // Check if game is complete
          checkGameCompletion();
          return;
        }
      }
    }
  };

  // Handle backspace
  const handleBackspaceClick = () => {
    console.log('⬅️ Backspace clicked');
    
    clearAllTimeouts();
    
    if (gameState.currentWord.length > 0) {
      const removedLetter = gameState.currentWord.slice(-1);
      const newCurrentWord = gameState.currentWord.slice(0, -1);
      
      setGameState(prev => ({
        ...prev,
        currentWord: newCurrentWord,
        availableLetters: [...prev.availableLetters, removedLetter],
        showError: false,
        showCircleError: false
      }));
    }
  };

  // Handle clear word
  const handleClearWord = () => {
    console.log('🗑️ Clear word clicked');
    
    clearAllTimeouts();
    
    setGameState(prev => ({
      ...prev,
      currentWord: '',
      availableLetters: [...prev.selectedLetters],
      showError: false,
      showCircleError: false
    }));
  };

  // Check if game is complete
  const checkGameCompletion = () => {
    const totalWords = gameState.wordPositions.length;
    const foundWords = gameState.foundWordIDs.length;
    
    console.log(`🎯 Game completion check: ${foundWords}/${totalWords} words found`);
    
    if (foundWords >= totalWords) {
      console.log('🎉 Game completed!');
      setGameState(prev => ({
        ...prev,
        showCelebration: true,
        isManualCelebration: false
      }));
    }
  };

  // Handle celebration completion
  const handleCelebrationComplete = () => {
    setGameState(prev => ({
      ...prev,
      showCelebration: false,
      isManualCelebration: false
    }));
  };

  // Handle manual celebration
  const handleManualCelebration = () => {
    setGameState(prev => ({
      ...prev,
      showCelebration: true,
      isManualCelebration: true
    }));
  };

  // Handle hints
  const handleHint = () => {
    console.log('💡 Hint clicked, attempts left:', gameState.hintAttemptsLeft);
    
    if (gameState.hintAttemptsLeft <= 0) {
      setGameState(prev => ({
        ...prev,
        showHintMessage: true,
        hintMessage: t('hint.noAttemptsLeft')
      }));
      return;
    }

    // Find an unfound word to hint
    const unfoundPositions = gameState.wordPositions.filter(wp => 
      !isWordPositionFound(gameState.foundWordIDs, wp)
    );

    if (unfoundPositions.length === 0) {
      setGameState(prev => ({
        ...prev,
        showHintMessage: true,
        hintMessage: t('hint.allWordsFound')
      }));
      return;
    }

    // Choose a random unfound word
    const randomPosition = unfoundPositions[Math.floor(Math.random() * unfoundPositions.length)];
    
    setGameState(prev => ({
      ...prev,
      lastHintedWordPosition: randomPosition,
      lastHintedLetterIndex: 0,
      hintAttemptsLeft: prev.hintAttemptsLeft - 1,
      hintsUsed: prev.hintsUsed + 1,
      showHintMessage: true,
      hintMessage: t('hint.revealedLetter', { letter: randomPosition.word[0].toUpperCase() })
    }));
  };

  // Check if a grid cell should be displayed (found word or hint)
  const isGridCellInFoundWord = (row: number, col: number): boolean => {
    const wordPositionsAtCell = getWordPositionsAt(gameState.wordPositions, row, col);
    
    // Check if any WordPosition at this cell is found
    const hasFoundWord = wordPositionsAtCell.some(wp => 
      isWordPositionFound(gameState.foundWordIDs, wp)
    );
    
    if (hasFoundWord) return true;

    // Check for hints
    if (gameState.lastHintedWordPosition) {
      const hintedPosition = gameState.lastHintedWordPosition;
      if (hintedPosition.containsCell(row, col)) {
        // Get the index of this cell within the hinted word
        const cellIndex = hintedPosition.occupiedCells.findIndex(cell => 
          cell.row === row && cell.col === col
        );
        return cellIndex >= 0 && cellIndex <= gameState.lastHintedLetterIndex;
      }
    }

    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <AnimatedTitle />
          <div className="flex gap-2">
            <LanguageDropdown />
            <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="w-4 h-4 mr-2" />
                  {t('instructions')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('instructions')}</DialogTitle>
                </DialogHeader>
                <WelcomeScreen onStart={() => setShowInstructions(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Error Display */}
        {gameState.showError && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive">{gameState.errorMessage}</p>
          </div>
        )}

        {/* Success Notification */}
        {gameState.showSuccessNotification && (
          <NotificationBox
            message={gameState.successMessage}
            isVisible={gameState.showSuccessNotification}
          />
        )}

        {/* Game Stats */}
        <div className="flex justify-center gap-4 mb-6">
          <Badge variant="secondary">
            {t('wordsFound')}: {gameState.foundWordIDs.length}/{gameState.wordPositions.length}
          </Badge>
          <Badge variant="secondary">
            {t('hintsUsed')}: {gameState.hintsUsed}
          </Badge>
        </div>

        {/* Crossword Grid */}
        {grid.length > 0 && (
          <div className="mb-6 flex justify-center">
            <Card className="p-4">
              <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 2rem)` }}>
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const hasContent = cell !== '';
                    const shouldDisplay = isGridCellInFoundWord(rowIndex, colIndex);
                    const wordPositionsAtCell = getWordPositionsAt(gameState.wordPositions, rowIndex, colIndex);
                    const isWordStart = getWordPositionsStartingAt(gameState.wordPositions, rowIndex, colIndex).length > 0;
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          w-8 h-8 border border-border flex items-center justify-center text-xs font-bold
                          ${hasContent ? 'bg-background' : 'bg-muted/30'}
                          ${shouldDisplay ? 'bg-primary text-primary-foreground' : ''}
                          ${isWordStart && hasContent ? 'relative' : ''}
                        `}
                      >
                        {hasContent && shouldDisplay ? cell : (hasContent ? '' : '')}
                        {isWordStart && hasContent && (
                          <div className="absolute -top-1 -left-1 w-2 h-2 bg-accent rounded-full text-[6px] flex items-center justify-center">
                            {getWordPositionsStartingAt(gameState.wordPositions, rowIndex, colIndex)[0]?.number || ''}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Current Word Display */}
        <div className="text-center mb-6">
          <Card className="inline-block p-4 min-w-[200px]">
            <h3 className="text-lg font-bold mb-2">{t('currentWord')}</h3>
            <div className="text-2xl font-mono tracking-wider min-h-[2rem] flex items-center justify-center">
              {gameState.currentWord || '___'}
            </div>
          </Card>
        </div>

        {/* Letter Wheel */}
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-4 gap-2 max-w-xs">
            {gameState.selectedLetters.map((letter, index) => {
              const isAvailable = gameState.availableLetters.includes(letter);
              return (
                <Button
                  key={`${letter}-${index}`}
                  variant={isAvailable ? "default" : "secondary"}
                  size="lg"
                  className="w-12 h-12 text-lg font-bold"
                  onClick={() => isAvailable && handleLetterClick(letter)}
                  disabled={!isAvailable}
                >
                  {letter}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant="outline"
            onClick={handleBackspaceClick}
            disabled={gameState.currentWord.length === 0}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('backspace')}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleClearWord}
            disabled={gameState.currentWord.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('clear')}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleHint}
            disabled={gameState.hintAttemptsLeft <= 0}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            {t('hint')} ({gameState.hintAttemptsLeft})
          </Button>
        </div>

        {/* New Game Button */}
        <div className="flex justify-center gap-2">
          <Button onClick={() => loadHawaiianWords(true)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('newGame')}
          </Button>
          
          <Dialog open={showUploader} onOpenChange={setShowUploader}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                {t('uploadWords')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('uploadWordList')}</DialogTitle>
              </DialogHeader>
              <WordListUploader 
                onWordsUpdated={(words) => {
                  setCustomWords(words);
                  setCustomWordsLoaded(true);
                  setShowUploader(false);
                  generateCrosswordLayout(words);
                }}
                onClose={() => setShowUploader(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Hint Message */}
        {gameState.showHintMessage && (
          <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
            <p className="text-primary">{gameState.hintMessage}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setGameState(prev => ({ ...prev, showHintMessage: false }))}
            >
              {t('close')}
            </Button>
          </div>
        )}

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Collapsible open={debuggingOpen} onOpenChange={setDebuggingOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="mt-4">
                <ChevronDown className="w-4 h-4 mr-2" />
                Debug Info
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-4 bg-muted rounded-lg text-sm">
              <div>
                <p><strong>WordPositions:</strong> {gameState.wordPositions.length}</p>
                <p><strong>Found IDs:</strong> {gameState.foundWordIDs.length}</p>
                <p><strong>Available Letters:</strong> {gameState.availableLetters.join(', ')}</p>
                {gameState.wordPositions.slice(0, 3).map(wp => (
                  <div key={wp.id}>
                    {wp.toString()} - Found: {isWordPositionFound(gameState.foundWordIDs, wp) ? 'Yes' : 'No'}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Celebration Modal */}
      {gameState.showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 text-center max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-primary">🎉 {t('congratulations')} 🎉</h2>
            <p className="mb-6">{getCelebrationMessage()}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleCelebrationComplete}>
                {t('close')}
              </Button>
              <Button variant="outline" onClick={() => loadHawaiianWords(true)}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('newGame')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HawaiianWordGame;