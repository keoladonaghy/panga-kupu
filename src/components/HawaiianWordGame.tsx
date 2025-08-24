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

  // Rest of the component logic will be implemented similarly with WordPosition tracking...
  // For now, let's render a basic grid to test the WordPosition system

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="container mx-auto p-4">
        <AnimatedTitle />
        
        {gameState.showError && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive">{gameState.errorMessage}</p>
          </div>
        )}
        
        {/* Grid Display */}
        {grid.length > 0 && (
          <div className="mb-6 flex justify-center">
            <div className="inline-block bg-background p-4 rounded-lg shadow-lg">
              <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 2rem)` }}>
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const wordPositionsAtCell = getWordPositionsAt(gameState.wordPositions, rowIndex, colIndex);
                    const hasContent = cell !== '';
                    const isFound = wordPositionsAtCell.some(wp => isWordPositionFound(gameState.foundWordIDs, wp));
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          w-8 h-8 border border-border flex items-center justify-center text-xs font-bold
                          ${hasContent ? 'bg-background' : 'bg-muted'}
                          ${isFound ? 'bg-primary text-primary-foreground' : ''}
                        `}
                      >
                        {hasContent ? cell : ''}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Debug Info */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h3 className="font-bold mb-2">WordPosition Debug Info:</h3>
          <p>Total WordPositions: {gameState.wordPositions.length}</p>
          <p>Found WordIDs: {gameState.foundWordIDs.length}</p>
          {gameState.wordPositions.slice(0, 3).map(wp => (
            <div key={wp.id} className="text-sm">
              {wp.toString()} - Found: {isWordPositionFound(gameState.foundWordIDs, wp) ? 'Yes' : 'No'}
            </div>
          ))}
        </div>
        
        {/* Controls */}
        <div className="flex gap-2 justify-center mt-4">
          <Button onClick={() => loadHawaiianWords(true)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HawaiianWordGame;
