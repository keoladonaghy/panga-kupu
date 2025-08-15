import React, { useState, useEffect, useCallback } from 'react';
import { NotificationBox } from './NotificationBox';
import { Lightbulb, Upload, RotateCcw, ChevronDown, ChevronRight, Delete, HelpCircle, X, RefreshCcw, CornerDownLeft, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { CrosswordGenerator, CrosswordWord } from '@/utils/crosswordGenerator';
import { hawaiianWords } from '@/data/hawaiianWords';
import { maoriWords } from '@/data/maoriWords';
import WordListUploader from './WordListUploader';
import LanguageDropdown from './LanguageDropdown';

// Updated language dropdown implementation
import { getWordLimitsForLanguage } from '@/config/languageWordLimits';

// Legacy constants - will be replaced by language-specific settings
const MIN_WORD_LENGTH = 3; // Minimum character limit for valid words
const MAX_WORD_LENGTH = 5; // Maximum character limit for typed words

interface GameState {
  foundWords: string[];
  hintsUsed: number;
  availableWords: string[];
  selectedLetters: string[];
  currentWord: string;
  availableLetters: string[];
  crosswordWords: CrosswordWord[];
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
  lastHintedWord?: CrosswordWord;
  lastHintedLetterIndex: number;
  foundThreeLetterWords: string[]; // Track found 3-letter words to avoid re-triggering
  threeLetterToastShown: boolean; // Track if the three-letter timeout toast has been shown
  showSuccessNotification: boolean;
  successMessage: string;
}

// Toast message constants
const WORD_FOUND_TOAST_TITLE = "UIHĀ!";
const WORD_FOUND_TOAST_DESCRIPTION = (word: string) => `Ua koho pono 'oe iā ${word}!`;

const HawaiianWordGame: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const { t, currentLanguage } = useTranslation();
  const { gameLanguage } = useLanguageContext();
  const [gameState, setGameState] = useState<GameState>({
    foundWords: [],
    hintsUsed: 0,
    availableWords: [],
    selectedLetters: [],
    currentWord: '',
    availableLetters: [],
    crosswordWords: [],
    showError: false,
    errorMessage: '',
    typedWord: '',
    showCelebration: false,
    isManualCelebration: false,
    hintAttemptsLeft: 2,
    showHintMessage: false,
    hintMessage: '',
    lastHintedWord: undefined,
    lastHintedLetterIndex: -1,
    foundThreeLetterWords: [],
    threeLetterToastShown: false,
    showSuccessNotification: false,
    successMessage: ''
  });
  
  // Debug hint attempts initialization
  console.log('🎯 Game state initialized with hint attempts:', gameState.hintAttemptsLeft);
  
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
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [showChoiceBox, setShowChoiceBox] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);
  const { toast } = useToast();

  // Hawaiian and English instruction content
  const hawaiianText = (
    <div>
      <h3 className="font-bold text-lg mb-4">Pehea e Pā'ani Ai</h3>
      <ol className="list-decimal list-inside space-y-3 mb-6">
        <li><strong>Koho Huapalapala:</strong> Koho i nā pihi i loko o ka huila e kākau ai i kekahi huaʻōlelo. Aia i loko o ka huila 'ehiku huapalapala i 'ike 'ia i loko o nā hua'ōlelo:
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>Nā hua Hawaiʻi: a, e, i, o, u</li>
            <li>Nā hua me ka kahakō: ā, ē, ī, ō, ū</li>
            <li>Ka ʻokina: (ʻ)</li>
          </ul>
          Hiki i nā leka ke hōʻike ʻia ma nā huaʻōlelo he nui, akā e hōʻike ʻia hoʻokahi wale nō manawa i loko o ka huila.
        </li>
        <li><strong>Ke Haku Huaʻōlelo:</strong>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>Pono e kākau pololei ʻia nā huaʻōlelo 'ōlelo Hawai'i i hūnā 'ia i loko o ka nane hua'ōlelo.</li>
            <li>Aia i loko o ka huila nā huapalapala a pau i loa'a i loko o nā hua'ōlelo.</li>
            <li>Pono e lōʻihi ka huaʻōlelo i ka nui X o nā leka (hoʻoholo i kēia inā kūpono).</li>
          </ul>
        </li>
        <li><strong>Hoʻouna ʻAkomi:</strong>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>Ke pau ka huaʻōlelo kūpono, e pāʻia ʻakomi ia ma loko o ka papa huaʻōlelo ma luna o ka huila.</li>
            <li>ʻAʻole pono e kaomi i ka pihi "hoʻouna".</li>
          </ul>
        </li>
        <li><strong>Hoʻoponopono:</strong>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>Ua kiko hewa 'oe? E kaomi i ke pihi holoi i waena o nā huapalapala e wehe ai i ka huapalapala hope loa āu i koho ai.</li>
            <li>Paʻi mau i ka holoi e wehe mau i nā leka hoʻokahi i ka manawa.</li>
          </ul>
        </li>
        <li><strong>E Hoʻomau i ka Nānā ʻana:</strong>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>Ma hope o ka loaʻa ʻana o kekahi huaʻōlelo kūpono, e hoʻomau e ʻimi i nā mea hou aku.</li>
            <li>E hoʻāʻo e ʻike i nā huaʻōlelo a pau i hūnā ʻia i loko o ka pakuhi!</li>
          </ul>
        </li>
      </ol>

      <h3 className="font-bold text-lg mb-4">Nā Manaʻo Kōkua</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>Mai poina e hoʻohana i ka kahakō (macron) a me ka ʻokina i nā wahi kūpono—he mau leka kūʻokoʻa nō lāua.</li>
        <li>E makaʻala: Nui nā huaʻōlelo Hawaiʻi e koe wale nō ka hoʻohana ʻana i ka ʻokina a i ʻole ka kahakō.
          <ul className="list-disc list-inside ml-4 mt-1">
            <li>He laʻana: ʻokoʻa kēia mau huaʻōlelo: pau, paʻu, paʻū, a me pāʻū.</li>
          </ul>
        </li>
        <li>E hoʻolohe pono i ka puana ʻana o nā huaʻōlelo Hawaiʻi—he kōkua ka lohe pono ana i ke kikokiko 'ana i ka hua'ōlelo pololei.</li>
      </ul>
    </div>
  );
  const englishText = (
    <div>
      <h3 className="font-bold text-lg mb-4">How to Play</h3>
      <ol className="list-decimal list-inside space-y-3 mb-6">
        <li><strong>Select Letters:</strong> Tap the buttons around the wheel to form a word. The wheel contains a mix of:
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>Hawaiian vowels: a, e, i, o, u</li>
            <li>Long vowels with kahakō: ā, ē, ī, ō, ū</li>
            <li>The glottal stop: ʻokina (ʻ)</li>
          </ul>
          Letters may appear more than once across different words but are shown only once in the wheel.
        </li>
        <li><strong>Forming Words:</strong>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>Words in the puzzle must be spelled correctly in ʻōlelo Hawaiʻi.</li>
            <li>All letters in the word must come from the seven on the wheel.</li>
            <li>Each word must be at least X letters long (define this minimum if applicable).</li>
          </ul>
        </li>
        <li><strong>Submit Automatically:</strong>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>When you complete a valid word, it will automatically appear in the crossword-style grid above the wheel.</li>
            <li>No need to press a "submit" button.</li>
          </ul>
        </li>
        <li><strong>Editing:</strong>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>Made a mistake? Tap the center delete button to remove the last letter you selected.</li>
            <li>Keep tapping delete to remove letters one by one.</li>
          </ul>
        </li>
        <li><strong>Continue Guessing:</strong>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>After a successful word, keep going to find more.</li>
            <li>Try to discover all the words hidden in the puzzle!</li>
          </ul>
        </li>
      </ol>

      <h3 className="font-bold text-lg mb-4">Tips</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>Don't forget to use the kahakō (macron) and the ʻokina where needed—they count as distinct characters.</li>
        <li>Many Hawaiian words differ only by the use of kahakō or the ʻokina. Be careful:
          <ul className="list-disc list-inside ml-4 mt-1">
            <li>For example, these are all different words: pau, paʻu, paʻū, and pāʻū.</li>
          </ul>
        </li>
        <li>Listen closely to how Hawaiian words are pronounced—they often hint at correct spelling.</li>
      </ul>
    </div>
  );


  // Generate crossword layout using proper algorithm
  const generateCrosswordLayout = useCallback((allWords: string[]) => {
    console.log('generateCrosswordLayout called with', allWords.length, 'words');
    console.log('Starting crossword generation with', allWords.length, 'total words');
    const wordLimits = getWordLimitsForLanguage(gameLanguage);
    const generator = new CrosswordGenerator(allWords, 12, gameLanguage, wordLimits);
    const crosswordResult = generator.generateCrossword();
    
    console.log('Crossword generation result:', crosswordResult);
    
    if (crosswordResult) {
      const { words: crosswordWords, grid, selectedLetters } = crosswordResult;
      
      console.log('Crossword words placed:', crosswordWords.length);
      console.log('Grid size:', grid.length, 'x', grid[0]?.length);
      console.log('Selected letters from generator:', selectedLetters);
      
      // Set the available words to be all the crossword words for this puzzle
      const placedWords = crosswordWords.map(w => w.word);
      const availableWords = placedWords.map(word => toHawaiianUppercase(word));
      
      setGrid(grid);
      setGameState(prev => ({
        ...prev,
        availableLetters: selectedLetters, // Use all selected letters (should be exactly 7)
        crosswordWords,
        availableWords // Set the available words to the crossword words
      }));
      
      console.log('Updated availableLetters in game state:', selectedLetters);
    } else {
      console.log('Crossword generation failed, trying with more words');
      // If crossword generation fails, let's try with a larger subset
      const moreWords = allWords.slice(0, Math.min(50, allWords.length));
      console.log('Retrying with', moreWords.length, 'words');
      
      const retryWordLimits = getWordLimitsForLanguage(gameLanguage);
      const retryGenerator = new CrosswordGenerator(moreWords, 12, gameLanguage, retryWordLimits);
      const retryResult = retryGenerator.generateCrossword();
      
      if (retryResult) {
        const { words: crosswordWords, grid, selectedLetters } = retryResult;
        const placedWords = crosswordWords.map(w => w.word);
        const availableWords = placedWords.map(word => toHawaiianUppercase(word));
        
        setGrid(grid);
        setGameState(prev => ({
          ...prev,
          availableLetters: selectedLetters || (gameLanguage === 'haw' ? ['a', 'e', 'i', 'o', 'u', 'h', 'k'] : ['a', 'e', 'i', 'o', 'u', 'h', 'k']), // Use appropriate fallback
          crosswordWords,
          availableWords
        }));
      } else {
        console.log('Crossword generation failed completely, using fallback');
        // Complete fallback
        const fallbackWords = allWords.slice(0, 12);
        const newGrid: string[][] = Array(12).fill(null).map(() => Array(12).fill(''));
        setGrid(newGrid);
        setGameState(prev => ({
          ...prev,
          availableLetters: gameLanguage === 'haw' ? ['a', 'e', 'i', 'o', 'u', 'h', 'k'] : ['a', 'e', 'i', 'o', 'u', 'h', 'k'], // Use appropriate fallback
          crosswordWords: [],
          availableWords: fallbackWords.map(word => toHawaiianUppercase(word))
        }));
      }
    }
  }, [gameLanguage]);

  // Function to properly uppercase Hawaiian/Māori words while preserving diacritical marks and 'okina
  const toHawaiianUppercase = (word: string): string => {
    const result = word
      .replace(/ā/g, 'Ā')
      .replace(/ē/g, 'Ē') 
      .replace(/ī/g, 'Ī')
      .replace(/ō/g, 'Ō')
      .replace(/ū/g, 'Ū')
      // Normalize quotes to proper 'okina for Hawaiian, remove for others
      .replace(/'/g, gameLanguage === 'haw' ? 'ʻ' : '') // Convert or remove straight quotes
      .replace(/`/g, gameLanguage === 'haw' ? 'ʻ' : '') // Convert or remove backticks
      .replace(/'/g, gameLanguage === 'haw' ? 'ʻ' : '') // Convert or remove right single quotes
      .replace(/'/g, gameLanguage === 'haw' ? 'ʻ' : '') // Convert or remove left single quotes
      .toUpperCase(); // This will handle regular letters but preserve 'okina
    
    return result;
  };

  // Helper function to check if a word was found (works with new length-aware format)
  const isWordFound = (word: string, length?: number) => {
    const normalizedWord = toHawaiianUppercase(word);
    
    // If length is provided, check the new format
    if (length !== undefined) {
      return gameState.foundWords.includes(`${normalizedWord}_${length}`);
    }
    
    // If no length provided, check if any version of this word exists
    return gameState.foundWords.some(foundWord => {
      // Check for exact word_length format match
      const parts = foundWord.split('_');
      return parts.length === 2 && parts[0] === normalizedWord;
    });
  };

  // Load words from public file based on current language
  const loadHawaiianWords = useCallback(async (useRandomSeed = false, forceTestWords = false) => {
    console.log('loadHawaiianWords called with useRandomSeed:', useRandomSeed, 'forceTestWords:', forceTestWords);
    
    try {
      // Choose file based on game language
      const fileName = gameLanguage === 'mao' ? '/KupuMaori.txt' : '/HawaiianWords.txt';
      const response = await fetch(fileName);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${gameLanguage === 'mao' ? 'Māori' : 'Hawaiian'} words file`);
      }
      
      const text = await response.text();
      const wordsToUse = text.split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0);
      
      console.log('Loading Hawaiian words from public file...');
      console.log(`Word source: PUBLIC FILE`);
      console.log(`Total words available: ${wordsToUse.length}`);
      
      // Debug: check if "iii" is in the word list
      const hasIII = wordsToUse.includes('iii') || wordsToUse.includes('III');
      console.log(`Word list contains "iii": ${hasIII}`);
      
      // Filter by length using language-specific limits
      const wordLimits = getWordLimitsForLanguage(gameLanguage);
      const filteredWords = wordsToUse
        .map(word => {
          // Normalize quotes to proper 'okina for Hawaiian, remove for others
          if (gameLanguage === 'haw') {
            return word
              .replace(/'/g, 'ʻ') // Convert straight quotes to 'okina
              .replace(/`/g, 'ʻ') // Convert backticks to 'okina
              .replace(/'/g, 'ʻ') // Convert right single quotes to 'okina
              .replace(/'/g, 'ʻ') // Convert left single quotes to 'okina
          } else {
            return word
              .replace(/'/g, '') // Remove straight quotes
              .replace(/ʻ/g, '') // Remove 'okina
              .replace(/`/g, '') // Remove backticks
              .replace(/'/g, '') // Remove right single quotes
              .replace(/'/g, '') // Remove left single quotes
          }
        })
        .filter(word => word.length >= wordLimits.minWordLength && word.length <= wordLimits.maxWordLength && word.length > 0)
        .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
        
      console.log(`Words after length filter (${wordLimits.minWordLength}-${wordLimits.maxWordLength} letters):`, filteredWords.length);
      console.log('Sample filtered words (with ʻokina preserved for Hawaiian):', filteredWords.slice(0, 10));
      console.log('Words with ʻokina:', filteredWords.filter(w => w.includes('ʻ')).slice(0, 5));
      console.log('Words after length filter:', filteredWords.length);
      console.log('Sample words with okina:', filteredWords.filter(w => w.includes("'") || w.includes("'") || w.includes("ʻ")).slice(0, 10));
      
      // Create a selection - use date as seed for consistent daily puzzles, or random for reloads
      let seedHash;
      if (useRandomSeed) {
        // Use random seed for reload to get different words
        seedHash = Math.floor(Math.random() * 1000000);
      } else {
        // Use date-based seed for consistent daily puzzle
        const today = new Date().toDateString();
        seedHash = today.split('').reduce((hash, char) => {
          return ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff;
        }, 0);
      }
      
      // Shuffle with seeded random
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      
      const shuffledWords = [...filteredWords];
      for (let i = shuffledWords.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seedHash + i) * (i + 1));
        [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
      }
      
      console.log('Passing all filtered words to crossword generator:', shuffledWords.length);
      
      // Special test mode: Force inclusion of "ake" and "akea" for testing
      if (forceTestWords) {
        console.log('🧪 TEST MODE: Creating manual crossword with "ake" and "akea"');
        
        // Create a simple manual crossword with both words
        const testGrid: string[][] = Array(12).fill(null).map(() => Array(12).fill(''));
        
        // Place "akea" horizontally at row 7, col 5
        const akeaWord = 'akea';
        for (let i = 0; i < akeaWord.length; i++) {
          testGrid[7][5 + i] = akeaWord[i];
        }
        
        // Place "ake" vertically at row 6, col 5 (sharing the 'a')
        const akeWord = 'ake';
        for (let i = 0; i < akeWord.length; i++) {
          testGrid[6 + i][5] = akeWord[i];
        }
        
        // Create crossword words array
        const testCrosswordWords: CrosswordWord[] = [
          {
            word: 'akea',
            row: 7,
            col: 5,
            direction: 'across',
            number: 1
          },
          {
            word: 'ake',
            row: 6,
            col: 5,
            direction: 'down',
            number: 2
          }
        ];
        
        // Create selected letters (all unique letters from both words)
        const testSelectedLetters = ['a', 'k', 'e', 'ā', 'h', 'i', 'o']; // Include both 'a' and 'ā', plus 'k'
        
        console.log('✅ Created manual test crossword with ake and akea');
        console.log('Test words:', testCrosswordWords.map(w => w.word));
        console.log('🔤 Test selected letters:', testSelectedLetters);
        
        setGrid(testGrid);
        setGameState(prev => ({
          ...prev,
          availableLetters: testSelectedLetters,
          crosswordWords: testCrosswordWords,
          availableWords: ['AKE', 'AKEA']
        }));
        
        console.log('🔤 Set availableLetters to:', testSelectedLetters);
        console.log('🔤 Letters being set in state:', testSelectedLetters.map((l, i) => `${i}: "${l}"`));
        
        toast({
          title: "Test Mode",
          description: "Generated puzzle with AKE and AKEA for testing!",
          duration: 3000,
        });
      } else {
        // Pass ALL filtered words to the crossword generator
        // The generator will select 7 letters and filter words itself
        console.log('🎯 Calling generateCrosswordLayout with', shuffledWords.length, 'words');
        generateCrosswordLayout(shuffledWords);
      }
    } catch (error) {
      console.error('Error loading Hawaiian words:', error);
      toast({
        title: "Error",
        description: "Failed to load Hawaiian words from public file",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, generateCrosswordLayout, gameLanguage]);

  // Handle celebration completion and new puzzle generation
  const handleCelebrationComplete = useCallback(() => {
    // Reset game state and generate new puzzle
    setGameState({
      foundWords: [],
      hintsUsed: 0,
      availableWords: [],
      selectedLetters: [],
      currentWord: '',
      availableLetters: [],
      crosswordWords: [],
      showError: false,
      errorMessage: '',
      typedWord: '',
      showCelebration: false,
      isManualCelebration: false,
      hintAttemptsLeft: 2,
      showHintMessage: false,
      hintMessage: '',
      lastHintedWord: undefined,
      lastHintedLetterIndex: -1,
      foundThreeLetterWords: [], // Reset the exclusion list
      threeLetterToastShown: false,
      showSuccessNotification: false,
      successMessage: ''
    });
    setLoading(true);
    loadHawaiianWords(true);
  }, [loadHawaiianWords]);

  // Manual celebration trigger
  const handleManualCelebration = () => {
    setGameState(prev => ({ 
      ...prev, 
      showCelebration: true, 
      isManualCelebration: true 
    }));
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (wordClearTimeout) {
        clearTimeout(wordClearTimeout);
      }
      if (hokaTimeout) {
        clearTimeout(hokaTimeout);
      }
    };
  }, [wordClearTimeout, hokaTimeout]);

  // Handle celebration animation and auto-restart
  useEffect(() => {
    if (gameState.showCelebration) {
      console.log('🎊 Celebration effect triggered!', {
        showCelebration: gameState.showCelebration,
        isManualCelebration: gameState.isManualCelebration
      });
      // Different timing for manual vs automatic celebration
      const celebrationDuration = gameState.isManualCelebration ? 5000 : 6000;
      const timer = setTimeout(() => {
        console.log('🔄 Celebration timer completed, handling completion...');
        if (gameState.isManualCelebration) {
          // Manual celebration - just hide it, don't restart game
          console.log('📱 Manual celebration - hiding celebration');
          setGameState(prev => ({ 
            ...prev, 
            showCelebration: false, 
            isManualCelebration: false 
          }));
        } else {
          // Automatic celebration - restart game
          console.log('🔄 Automatic celebration - restarting game');
          handleCelebrationComplete();
        }
      }, celebrationDuration);

      return () => clearTimeout(timer);
    }
  }, [gameState.showCelebration, gameState.isManualCelebration, handleCelebrationComplete]);

  // Initialize game and reload when game language changes
  useEffect(() => {
    console.log('Initializing game - loading words from public file...');
    loadHawaiianWords();
    // Progress saving disabled - game starts fresh each time
  }, [loadHawaiianWords, gameLanguage]); // Add gameLanguage dependency

  const handleBackspaceClick = useCallback(() => {
    // Clear any existing timeout when user deletes letters
    if (threeLetterTimeout) {
      clearTimeout(threeLetterTimeout);
      setThreeLetterTimeout(null);
    }
    clearHokaTimeout();
    
    setGameState(prev => ({
      ...prev,
      selectedLetters: prev.selectedLetters.slice(0, -1),
      currentWord: prev.currentWord.slice(0, -1)
    }));
  }, [threeLetterTimeout]);

  // Add global keyboard event handling for backspace/delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle backspace/delete when not focused on an input field
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleBackspaceClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBackspaceClick]);

  // Helper function to clear existing HOKA timeout
  const clearHokaTimeout = useCallback(() => {
    if (hokaTimeout) {
      clearTimeout(hokaTimeout);
      setHokaTimeout(null);
    }
  }, [hokaTimeout]);

  // Helper function to set HOKA timeout
  const setHokaTimeoutHelper = useCallback((callback: () => void, delay: number = 1500) => {
    clearHokaTimeout();
    const timeout = setTimeout(callback, delay);
    setHokaTimeout(timeout);
  }, [clearHokaTimeout]);

  // Get the longest remaining word length
  const getLongestRemainingWordLength = useCallback(() => {
    const remainingWords = gameState.crosswordWords.filter(crosswordWord => 
      !isWordFound(crosswordWord.word)
    );
    
    if (remainingWords.length === 0) return 0;
    return Math.max(...remainingWords.map(w => w.word.length));
  }, [gameState.crosswordWords, gameState.foundWords]);

  // Check if current word matches any crossword words - with auto-checking for longest word length
  const checkForCompleteWord = useCallback((word: string, isTypedWord: boolean = false) => {
    if (!word.trim()) return;

    const normalizedWord = toHawaiianUppercase(word.trim());
    const isWordInCrossword = gameState.crosswordWords.some(crosswordWord => 
      toHawaiianUppercase(crosswordWord.word) === normalizedWord && 
      crosswordWord.word.length === normalizedWord.length
    );

    // For typed words, check if we should auto-trigger based on longest remaining word length
    if (isTypedWord) {
      const longestRemainingLength = getLongestRemainingWordLength();
      const shouldAutoCheck = word.length === longestRemainingLength && longestRemainingLength > 0;
      
      if (shouldAutoCheck) {
        if (isWordInCrossword && !gameState.foundWords.includes(normalizedWord)) {
          // Correct word of longest length - reveal it
          clearHokaTimeout(); // Clear any pending HOKA timeouts
          const newFoundWords = [...gameState.foundWords, normalizedWord];
          
          setGameState(prev => ({
            ...prev,
            foundWords: newFoundWords,
            selectedLetters: [], // Clear circle selection
            currentWord: '', // Clear circle word
            typedWord: '', // Clear typed word
            showError: false,
            errorMessage: '',
            showSuccessNotification: true,
            successMessage: 'UA LOA\'A NŌ!'
          }));
          
          // Auto-hide success notification after 2.5 seconds
          setTimeout(() => {
            setGameState(prev => ({
              ...prev,
              showSuccessNotification: false,
              successMessage: ''
            }));
          }, 2500);

          // Check if all words are found (excluding hint markers)
          if (getActualFoundWordsCount(newFoundWords) === gameState.crosswordWords.length) {
            setTimeout(() => {
              setGameState(prev => ({ ...prev, showCelebration: true, isManualCelebration: false }));
            }, 1000);
          }
        } else if (!gameState.foundWords.includes(normalizedWord)) {
          // Incorrect word of longest length - show HOKA!
          setGameState(prev => ({
            ...prev,
            typedWord: 'HOKA!',
            showError: true,
            errorMessage: 'HOKA!'
          }));
          
          // Clear the HOKA! after 1.5 seconds
          setHokaTimeoutHelper(() => {
            setGameState(prev => ({
              ...prev,
              typedWord: '',
              showError: false,
              errorMessage: ''
            }));
          });
        }
      }
    } else {
      // For circle-selected words, check immediately
      if (isWordInCrossword && !gameState.foundWords.includes(normalizedWord)) {
        // Word found! Add to found words and clear the current input
        clearHokaTimeout(); // Clear any pending HOKA timeouts
        const newFoundWords = [...gameState.foundWords, normalizedWord];
        
        setGameState(prev => ({
          ...prev,
          foundWords: newFoundWords,
          selectedLetters: [], // Clear circle selection
          currentWord: '', // Clear circle word
          typedWord: '', // Clear typed word
          showError: false,
          errorMessage: '',
          showSuccessNotification: true,
          successMessage: 'UA LOA\'A NŌ!'
        }));
        
        // Auto-hide success notification after 2.5 seconds
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            showSuccessNotification: false,
            successMessage: ''
          }));
        }, 2500);

        // Check if all words are found (excluding hint markers)
        if (getActualFoundWordsCount(newFoundWords) === gameState.crosswordWords.length) {
          setTimeout(() => {
            setGameState(prev => ({ ...prev, showCelebration: true, isManualCelebration: false }));
          }, 1000); // Small delay for the word to register
        }
      }
    }
  }, [gameState.crosswordWords, gameState.foundWords, toast, getLongestRemainingWordLength]);

  const handleManualWordCheck = () => {
    // Clear any existing timeouts when manually checking
    if (threeLetterTimeout) {
      clearTimeout(threeLetterTimeout);
      setThreeLetterTimeout(null);
    }
    if (wordClearTimeout) {
      clearTimeout(wordClearTimeout);
      setWordClearTimeout(null);
    }
    clearHokaTimeout();
    
    const currentWord = gameState.currentWord;
    if (currentWord.length >= MIN_WORD_LENGTH) {
      console.log('🔍 Manual word check for:', currentWord);
      
      const normalizedWord = toHawaiianUppercase(currentWord.trim());
      
      // Find crossword words that match both the text AND the length
      const exactMatchingWords = gameState.crosswordWords.filter(crosswordWord => 
        toHawaiianUppercase(crosswordWord.word) === normalizedWord &&
        crosswordWord.word.length === currentWord.length
      );
      
      // Only accept words that have an exact match (same text AND same length)
      const validWord = exactMatchingWords.length > 0 ? normalizedWord : null;
      
      if (validWord && !isWordFound(validWord, currentWord.length)) {
        console.log('✅ Manual check - Valid word found:', validWord);
        
        // Check if this is a 3-letter word that should be excluded from re-triggering
        if (currentWord.length === 3 && gameState.foundThreeLetterWords.includes(validWord)) {
          console.log('🚫 3-letter word already found and excluded:', validWord);
          return;
        }
        
        // Store the found word with length information
        const wordWithLength = `${validWord}_${currentWord.length}`;
        const newFoundWords = [...gameState.foundWords, wordWithLength];
        const newFoundThreeLetterWords = currentWord.length === 3 ? 
          [...gameState.foundThreeLetterWords, validWord] : 
          gameState.foundThreeLetterWords;
        
        clearHokaTimeout(); // Clear any pending HOKA timeouts
        setGameState(prev => ({
          ...prev,
          foundWords: newFoundWords,
          foundThreeLetterWords: newFoundThreeLetterWords,
          selectedLetters: [],
          showError: false,
          errorMessage: '',
          lastHintedWord: undefined,
          lastHintedLetterIndex: -1
        }));
        
        // Wait 3 seconds before clearing the current word
        const clearTimeout = setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            currentWord: ''
          }));
          setWordClearTimeout(null);
        }, 3000);
        setWordClearTimeout(clearTimeout);
        
        setGameState(prev => ({
          ...prev,
          showSuccessNotification: true,
          successMessage: 'UA LOA\'A NŌ!'
        }));
        
        // Auto-hide success notification after 2.5 seconds
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            showSuccessNotification: false,
            successMessage: ''
          }));
        }, 2500);

        // Check if all words are found
        if (getActualFoundWordsCount(newFoundWords) === gameState.crosswordWords.length) {
          setTimeout(() => {
            setGameState(prev => ({ ...prev, showCelebration: true, isManualCelebration: false }));
          }, 1000);
        }
      } else {
        // Invalid word - show HOKA! just like automatic checking
        console.log('🚨 MANUAL CHECK - TRIGGERING HOKA! - invalid word');
        setGameState(prev => ({
          ...prev,
          selectedLetters: [],
          showCircleError: true,
          circleErrorMessage: 'HOKA!'
        }));
        
        // Clear the HOKA! and the word after 1.5 seconds
        setHokaTimeoutHelper(() => {
          setGameState(prev => ({
            ...prev,
            currentWord: '',
            showCircleError: false,
            circleErrorMessage: ''
          }));
        });
      }
    }
  };

  const handleLetterClick = (letter: string) => {
    // Don't allow letter clicks when error messages are displayed
    if (gameState.showCircleError || gameState.showError || gameState.typedWord === 'HOKA!' || gameState.typedWord === 'UA LOA\'A MUA!') {
      return;
    }
    
    // Clear any existing timeout when user interacts
    if (threeLetterTimeout) {
      clearTimeout(threeLetterTimeout);
      setThreeLetterTimeout(null);
    }
    clearHokaTimeout();
    
    const currentLength = gameState.currentWord.length;
    
    console.log('=== LETTER CLICK DEBUG ===');
    console.log('Letter clicked:', letter);
    console.log('Current word:', gameState.currentWord);
    console.log('Current word length:', currentLength);
    console.log('MIN_WORD_LENGTH:', MIN_WORD_LENGTH);
    console.log('MAX_WORD_LENGTH:', MAX_WORD_LENGTH);
    
    // Prevent clicking beyond max length - use dynamic word limits
    const currentWordLimits = getWordLimitsForLanguage(gameLanguage);
    if (currentLength >= currentWordLimits.maxWordLength) {
      console.log('🔍 DEBUG: HOKA trigger #4 - Letter click blocked at max length', { currentLength, maxLength: currentWordLimits.maxWordLength, timestamp: Date.now() });
      console.log(`🚫 BLOCKED - already at max length (${currentWordLimits.maxWordLength}), cannot add more letters`);
      return;
    }
    
    const newWord = gameState.currentWord + letter;
    console.log('✅ Adding letter, new word will be:', newWord);
    
    setGameState(prev => ({
      ...prev,
      selectedLetters: [...prev.selectedLetters, letter],
      currentWord: prev.currentWord + letter
    }));
    
    // Check for valid words at minimum length and above
    // Check if word meets minimum length requirement for this language
    const wordLimits = getWordLimitsForLanguage(gameLanguage);
    if (newWord.length >= wordLimits.minWordLength) {
      console.log('🔍 Checking word validity at length', newWord.length, ':', newWord);
      
      const normalizedWord = toHawaiianUppercase(newWord.trim());
      
      // Find crossword words that match both the text AND the length
      // This ensures "mau" goes to a 3-letter slot, not a 4-letter "maua" slot
      const exactMatchingWords = gameState.crosswordWords.filter(crosswordWord => 
        toHawaiianUppercase(crosswordWord.word) === normalizedWord &&
        crosswordWord.word.length === newWord.length
      );
      
      console.log('🎯 Exact matching words for', normalizedWord, ':', exactMatchingWords.map(w => ({ word: w.word, length: w.word.length })));
      
      // Only accept words that have an exact match (same text AND same length)
      const validWord = exactMatchingWords.length > 0 ? normalizedWord : null;
      
      console.log('🔎 validWord determination:');
      console.log('  - newWord:', newWord);
      console.log('  - normalizedWord:', normalizedWord);
      console.log('  - exactMatchingWords.length:', exactMatchingWords.length);
      console.log('  - validWord:', validWord);
      
      if (validWord && !isWordFound(validWord, newWord.length)) {
        console.log('✅ Valid word found:', validWord);
        console.log('📍 Matching crossword words:', exactMatchingWords.map(w => ({ word: w.word, length: w.word.length, row: w.row, col: w.col, direction: w.direction })));
        
        // Check if this is a 3-letter word that should be excluded from re-triggering
        if (newWord.length === 3 && gameState.foundThreeLetterWords.includes(validWord)) {
          console.log('🚫 3-letter word already found and excluded:', validWord);
          return; // Skip processing this word - allow continued typing for longer words
        }
        
        // Store the found word with length information to ensure correct placement
        // Format: "WORD_LENGTH" so we can distinguish between words of different lengths
        const wordWithLength = `${validWord}_${newWord.length}`;
        const newFoundWords = [...gameState.foundWords, wordWithLength];
        const newFoundThreeLetterWords = newWord.length === 3 ? 
          [...gameState.foundThreeLetterWords, validWord] : 
          gameState.foundThreeLetterWords;
        
        clearHokaTimeout(); // Clear any pending HOKA timeouts
        setGameState(prev => ({
          ...prev,
          foundWords: newFoundWords,
          foundThreeLetterWords: newFoundThreeLetterWords,
          selectedLetters: [],
          showError: false,
          errorMessage: '',
          // Clear hint state when word is found
          lastHintedWord: undefined,
          lastHintedLetterIndex: -1
        }));
        
        // Language-specific 3-second delay before clearing the current word
        console.log(`⏱️ Setting 3-second delay before clearing word (found at length ${newWord.length})`);
        const clearTimeout = setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            currentWord: ''
          }));
          setWordClearTimeout(null);
        }, 3000);
        setWordClearTimeout(clearTimeout);
        
        setGameState(prev => ({
          ...prev,
          showSuccessNotification: true,
          successMessage: 'UA LOA\'A NŌ!'
        }));
        
        // Auto-hide success notification after 2.5 seconds
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            showSuccessNotification: false,
            successMessage: ''
          }));
        }, 2500);

        // Check if all words are found (excluding hint markers)
        if (getActualFoundWordsCount(newFoundWords) === gameState.crosswordWords.length) {
          setTimeout(() => {
            setGameState(prev => ({ ...prev, showCelebration: true, isManualCelebration: false }));
          }, 1000);
        }
        
        return; // Stop here, don't continue to check for HOKA!
      } else if (validWord && isWordFound(validWord, newWord.length)) {
        // Only show UA LOA'A MUA! if this is the maximum word length possible with current letters
        // This allows players to discover for themselves if longer words exist
        const maxPossibleLength = gameState.availableLetters.length;
        
        console.log('🔄 Already found word:', validWord, 'at length', newWord.length);
        console.log('🔄 Max possible length with available letters:', maxPossibleLength);
        
        if (newWord.length >= maxPossibleLength) {
          // At maximum length, so show UA LOA'A MUA!
          console.log('🔄 At max length, showing UA LOA\'A MUA!');
          setGameState(prev => ({
            ...prev,
            selectedLetters: [],
            currentWord: '',
            showCircleError: true,
            circleErrorMessage: 'UA LOA\'A MUA!'
          }));
          
          // Clear the error after 2 seconds
          setTimeout(() => {
            setGameState(prev => ({
              ...prev,
              showCircleError: false,
              circleErrorMessage: ''
            }));
          }, 2000);
        } else {
          // Not at max length - let player continue to discover longer words themselves
          console.log('🔄 Not at max length, allowing continued typing');
        }
        
        return; // Stop here
      }
      
      // Continue checking for words if no match found at current length
      console.log(`❌ No valid word found at length ${newWord.length}, will continue checking as user types more letters`);
      
      // Add 3-second timeout for circle selection at minimum length
      if (newWord.length >= wordLimits.minWordLength && newWord.length < wordLimits.maxWordLength) {
        console.log(`🕐 Setting 3-second timeout for circle selection word: ${newWord} (length: ${newWord.length})`);
        const timeout = setTimeout(() => {
          console.log(`⏰ 3-second circle timeout triggered for: ${newWord}`);
          // Show HOKA! for invalid words after 3 seconds at minimum length
          const hasSeenExplanation = localStorage.getItem('wordDetectionExplanationShown') === 'true';
          
          if (!hasSeenExplanation) {
            toast({
              title: "Word Detection Explanation",
              description: `I am programmed to wait three seconds after you have selected a ${newWord.length} letter word, and will assume that is what you wanted. I will then clear your attempt and you can try again with a new word.`,
              duration: 4000,
            });
            localStorage.setItem('wordDetectionExplanationShown', 'true');
            setGameState(prev => ({
              ...prev,
              currentWord: '',
              selectedLetters: [],
              threeLetterToastShown: true
            }));
          } else {
            // Clear any other timeouts first
            clearHokaTimeout();
            
            setGameState(prev => ({
              ...prev,
              selectedLetters: [],
              currentWord: '',
              showCircleError: true,
              circleErrorMessage: 'HOKA!'
            }));
            
            // Clear the HOKA! message after 1.5 seconds
            setHokaTimeout(setTimeout(() => {
              setGameState(prev => ({
                ...prev,
                showCircleError: false,
                circleErrorMessage: ''
              }));
            }, 1500));
          }
          setThreeLetterTimeout(null);
        }, 3000);
        setThreeLetterTimeout(timeout);
      }
    } else {
      console.log(`⏳ Word too short (${newWord.length} < ${wordLimits.minWordLength}), waiting for more letters...`);
    }
    
    // If we've reached max length and no valid word was found, show HOKA!
    if (newWord.length === wordLimits.maxWordLength) {
      console.log(`🚨 REACHED MAX LENGTH (${wordLimits.maxWordLength}) - No valid word found, triggering HOKA!`);
      
      // Clear any pending 3-second timeout to prevent double HOKA!
      if (threeLetterTimeout) {
        clearTimeout(threeLetterTimeout);
        setThreeLetterTimeout(null);
      }
      
      // Clear any pending HOKA timeouts to prevent overlap
      clearHokaTimeout();
      
      setGameState(prev => ({
        ...prev,
        selectedLetters: [],
        currentWord: '',  // Clear immediately, don't wait
        showCircleError: true,
        circleErrorMessage: 'HOKA!'
      }));
      
      // Clear the HOKA! message after 1.5 seconds - single timeout only
      setHokaTimeout(setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          showCircleError: false,
          circleErrorMessage: ''
        }));
      }, 1500));
    }
  };

  const handleWordSubmit = () => {
    const word = toHawaiianUppercase(gameState.currentWord.trim());
    if (!word) return;

    // Check if the word is in the crossword puzzle
    const isWordInCrossword = gameState.crosswordWords.some(crosswordWord => 
      toHawaiianUppercase(crosswordWord.word) === word && 
      crosswordWord.word.length === word.length
    );

    if (isWordInCrossword && !isWordFound(word, word.length)) {
      // Word found! Add to found words and clear current word
      clearHokaTimeout(); // Clear any pending HOKA timeouts
      const wordWithLength = `${word}_${word.length}`;
      const newFoundWords = [...gameState.foundWords, wordWithLength];
      
      setGameState(prev => ({
        ...prev,
        foundWords: newFoundWords,
        selectedLetters: [],
        currentWord: '',
        showError: false,
        errorMessage: '',
        showSuccessNotification: true,
        successMessage: 'UA LOA\'A NŌ!'
      }));
      
      // Auto-hide success notification after 2.5 seconds
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          showSuccessNotification: false,
          successMessage: ''
        }));
      }, 2500);

      // Check if all words are found (excluding hint markers)
      if (getActualFoundWordsCount(newFoundWords) === gameState.crosswordWords.length) {
        setTimeout(() => {
          setGameState(prev => ({ ...prev, showCelebration: true, isManualCelebration: false }));
        }, 1000);
      }
    } else if (isWordFound(word, word.length)) {
      // Already found this word - show UA LOA'A MUA! over delete key
      setGameState(prev => ({
        ...prev,
        selectedLetters: [],
        currentWord: '',
        showCircleError: true,
        circleErrorMessage: 'UA LOA\'A MUA!'
      }));
      
      // Clear the error after 2 seconds
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          showCircleError: false,
          circleErrorMessage: ''
        }));
      }, 2000);
    } else {
      // Word not in crossword - show HOKA! error
      setGameState(prev => ({
        ...prev,
        selectedLetters: [],
        currentWord: '',
        showError: true,
        errorMessage: 'HOKA!'
      }));
      
      // Clear the error after 2 seconds
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          showError: false,
          errorMessage: ''
        }));
      }, 2000);
    }
  };

  const handleTypedWordSubmit = () => {
    const word = toHawaiianUppercase(gameState.typedWord.trim());
    console.log('🔍 SUBMIT DEBUG - word:', word, 'typedWord:', gameState.typedWord);
    if (!word) return;

    // Check if the word is in the crossword puzzle
    const matchingCrosswordWords = gameState.crosswordWords.filter(crosswordWord => 
      toHawaiianUppercase(crosswordWord.word) === word && 
      crosswordWord.word.length === word.length
    );

    if (matchingCrosswordWords.length > 0 && !isWordFound(word, word.length)) {
      // Word found! Add to found words with length suffix for consistency
      clearHokaTimeout(); // Clear any pending HOKA timeouts
      const wordWithLength = `${word}_${word.length}`;
      const newFoundWords = [...gameState.foundWords, wordWithLength];
      
      setGameState(prev => ({
        ...prev,
        foundWords: newFoundWords,
        typedWord: '',
        showError: false,
        errorMessage: '',
        showSuccessNotification: true,
        successMessage: 'UA LOA\'A NŌ!'
      }));
      
      // Auto-hide success notification after 2.5 seconds
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          showSuccessNotification: false,
          successMessage: ''
        }));
      }, 2500);

      // Check if all words are found (excluding hint markers)
      const actualFoundCount = getActualFoundWordsCount(newFoundWords);
      const totalWordsCount = gameState.crosswordWords.length;
      console.log('🏆 Completion check:', {
        actualFoundCount,
        totalWordsCount,
        foundWords: newFoundWords,
        crosswordWords: gameState.crosswordWords.map(w => w.word)
      });
      
      if (actualFoundCount === totalWordsCount) {
        console.log('🎉 ALL WORDS FOUND! Triggering celebration...');
        setTimeout(() => {
          setGameState(prev => ({ ...prev, showCelebration: true, isManualCelebration: false }));
        }, 1000);
      } else {
        console.log('🔄 Still missing words:', totalWordsCount - actualFoundCount);
      }
    } else if (isWordFound(word, word.length)) {
      // Already found this word
      console.log('🔄 TYPED WORD ALREADY FOUND:', word, 'length:', word.length);
      setGameState(prev => ({
        ...prev,
        typedWord: '',
        showError: false,
        errorMessage: ''
      }));
      
      console.log('📢 Showing toast for already found word');
      toast({
        title: "Already found!",
        description: "You've already found this word",
        variant: "destructive"
      });
    } else {
      // Incorrect word - show HOKA! and clear the field
      setGameState(prev => ({
        ...prev,
        typedWord: 'HOKA!',
        showError: false,
        errorMessage: ''
      }));
      
      // Clear the HOKA! after 1.5 seconds
      setHokaTimeoutHelper(() => {
        setGameState(prev => ({
          ...prev,
          typedWord: ''
        }));
      });
    }
  };

  const handleClearWord = () => {
    // Clear all timeouts and HOKA state
    clearHokaTimeout();
    if (wordClearTimeout) {
      clearTimeout(wordClearTimeout);
      setWordClearTimeout(null);
    }
    if (threeLetterTimeout) {
      clearTimeout(threeLetterTimeout);
      setThreeLetterTimeout(null);
    }
    setGameState(prev => ({
      ...prev,
      selectedLetters: [],
      currentWord: '',
      typedWord: '',
      showHoka: false,
      hokaMessage: '',
      showCircleError: false,
      circleErrorMessage: '',
      showError: false,
      errorMessage: ''
    }));
  };

  const handleHint = () => {
    console.log('🎯 Hint button clicked, attempts left:', gameState.hintAttemptsLeft);
    
    if (gameState.hintAttemptsLeft <= 0) {
      // Show "PAU KE KŌKUA" message
      setGameState(prev => ({
        ...prev,
        showHintMessage: true,
        hintMessage: 'PAU KE KŌKUA'
      }));
      
      // Clear the message after 2 seconds
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          showHintMessage: false,
          hintMessage: ''
        }));
      }, 2000);
      
      return;
    }

    let wordToReveal = null;
    let letterIndex = 0;
    let letterRow = 0;
    let letterCol = 0;

    // Check if we have a previously hinted word and should continue with it
    if (gameState.lastHintedWord && gameState.lastHintedLetterIndex >= 0) {
      const lastWord = gameState.lastHintedWord;
      const nextLetterIndex = gameState.lastHintedLetterIndex + 1;
      
      // Check if the last hinted word is still unsolved and has more letters
      const isStillUnsolved = !gameState.foundWords.includes(toHawaiianUppercase(lastWord.word));
      
      if (isStillUnsolved && nextLetterIndex < lastWord.word.length) {
        wordToReveal = lastWord;
        letterIndex = nextLetterIndex;
        
        // Calculate position for next letter
        if (lastWord.direction === 'across') {
          letterRow = lastWord.row;
          letterCol = lastWord.col + letterIndex;
        } else {
          letterRow = lastWord.row + letterIndex;
          letterCol = lastWord.col;
        }
        
        console.log('🔄 Continuing with previous hinted word:', lastWord.word, 'letter index:', letterIndex);
      }
    }

    // If no previous word or it's finished, find a new word
    if (!wordToReveal) {
      const remainingWords = gameState.crosswordWords.filter(crosswordWord => 
        !gameState.foundWords.includes(toHawaiianUppercase(crosswordWord.word))
      );

      console.log('🔍 Remaining words for hint:', remainingWords.map(w => w.word));

      if (remainingWords.length === 0) {
        console.log('❌ No remaining words to hint for');
        return;
      }

      // Select a random unsolved word and start with its first letter
      wordToReveal = remainingWords[Math.floor(Math.random() * remainingWords.length)];
      letterIndex = 0;
      letterRow = wordToReveal.row;
      letterCol = wordToReveal.col;
      
      console.log('🎲 Selected new word for hint:', wordToReveal.word);
    }

    const letter = wordToReveal.word[letterIndex];

    console.log('💡 Revealing letter:', {
      word: wordToReveal.word,
      letter: letter,
      letterIndex: letterIndex,
      position: { row: letterRow, col: letterCol },
      gridLetter: grid[letterRow]?.[letterCol]
    });

    // Check if this position already has the correct letter from an intersecting found word
    const isAlreadyRevealed = isGridCellInFoundWord(letterRow, letterCol);
    
    if (isAlreadyRevealed) {
      console.log('⚠️ Letter already revealed at this position, finding unrevealed letter');
      
      // Find an unrevealed letter in this word
      let foundUnrevealedLetter = false;
      
      for (let i = 0; i < wordToReveal.word.length; i++) {
        let testRow, testCol;
        
        if (wordToReveal.direction === 'across') {
          testRow = wordToReveal.row;
          testCol = wordToReveal.col + i;
        } else {
          testRow = wordToReveal.row + i;
          testCol = wordToReveal.col;
        }
        
        if (!isGridCellInFoundWord(testRow, testCol)) {
          letterRow = testRow;
          letterCol = testCol;
          letterIndex = i;
          foundUnrevealedLetter = true;
          console.log('🔄 Found unrevealed letter in word:', { letterIndex, position: { row: letterRow, col: letterCol } });
          break;
        }
      }
      
      // If no unrevealed letters in this word, try a completely different word
      if (!foundUnrevealedLetter) {
        console.log('⏭️ All letters revealed in this word, trying different word');
        
        const remainingWords = gameState.crosswordWords.filter(crosswordWord => {
          if (gameState.foundWords.includes(toHawaiianUppercase(crosswordWord.word))) {
            return false;
          }
          
          // Check if this word has any unrevealed letters
          for (let i = 0; i < crosswordWord.word.length; i++) {
            let testRow, testCol;
            
            if (crosswordWord.direction === 'across') {
              testRow = crosswordWord.row;
              testCol = crosswordWord.col + i;
            } else {
              testRow = crosswordWord.row + i;
              testCol = crosswordWord.col;
            }
            
            if (!isGridCellInFoundWord(testRow, testCol)) {
              return true; // This word has at least one unrevealed letter
            }
          }
          
          return false; // All letters in this word are revealed
        });
        
        if (remainingWords.length === 0) {
          console.log('❌ No words with unrevealed letters found');
          // Reset hint state and consume attempt
          setGameState(prev => ({
            ...prev,
            hintAttemptsLeft: prev.hintAttemptsLeft - 1,
            lastHintedWord: null,
            lastHintedLetterIndex: -1
          }));
          return;
        }
        
        // Select a new word and find its first unrevealed letter
        wordToReveal = remainingWords[Math.floor(Math.random() * remainingWords.length)];
        
        for (let i = 0; i < wordToReveal.word.length; i++) {
          let testRow, testCol;
          
          if (wordToReveal.direction === 'across') {
            testRow = wordToReveal.row;
            testCol = wordToReveal.col + i;
          } else {
            testRow = wordToReveal.row + i;
            testCol = wordToReveal.col;
          }
          
          if (!isGridCellInFoundWord(testRow, testCol)) {
            letterRow = testRow;
            letterCol = testCol;
            letterIndex = i;
            console.log('🎲 Selected new word with unrevealed letter:', { word: wordToReveal.word, letterIndex, position: { row: letterRow, col: letterCol } });
            break;
          }
        }
      }
    }

    // Create a special hint word that will mark this single cell as revealed
    const hintWord = `HINT_${letterRow}_${letterCol}`;
    
    setGameState(prev => ({
      ...prev,
      foundWords: [...prev.foundWords, hintWord],
      hintAttemptsLeft: prev.hintAttemptsLeft - 1,
      lastHintedWord: wordToReveal,
      lastHintedLetterIndex: letterIndex
    }));

    // Show reminder toast after first hint usage
    if (gameState.hintAttemptsLeft === 2) {
      toast({
        title: "Reminder",
        description: "Please remember that when you use a hint or both and a letter appears, you must enter the full word to get the word correct!",
        duration: 5000,
      });
    }

    console.log('✅ Added hint marker:', hintWord);
  };

  const isGridCellInFoundWord = (row: number, col: number) => {
    // Check for hint markers first - simplified format
    const hintMarker = gameState.foundWords.find(word => 
      word === `HINT_${row}_${col}`
    );
    if (hintMarker) {
      console.log('🎯 Found hint marker for position:', { row, col });
      return true;
    }

    // Find all crossword words that match found words at this position
    const matchingWords = gameState.crosswordWords.filter(crosswordWord => {
      // Normalize both the crossword word and found words for comparison
      const normalizedCrosswordWord = toHawaiianUppercase(crosswordWord.word);
      
      // Check if this specific word (with its length) was found
      // Format: "WORD_LENGTH" ensures "MAU_3" doesn't match "MAUA_4"
      const wordWithLength = `${normalizedCrosswordWord}_${crosswordWord.word.length}`;
      const isExactWordFound = gameState.foundWords.includes(wordWithLength);
      
      console.log('🔍 Checking word placement:', {
        crosswordWord: normalizedCrosswordWord,
        wordLength: crosswordWord.word.length,
        wordWithLength,
        foundWords: gameState.foundWords,
        isExactWordFound,
        position: { row, col }
      });
      
      if (!isExactWordFound) return false;
      
      // Check if this cell position is part of this word
      const isInWord = crosswordWord.direction === 'across' 
        ? (row === crosswordWord.row && col >= crosswordWord.col && col < crosswordWord.col + crosswordWord.word.length)
        : (col === crosswordWord.col && row >= crosswordWord.row && row < crosswordWord.row + crosswordWord.word.length);
      
      return isInWord;
    });

    if (matchingWords.length === 0) return false;
    
    // If multiple words could occupy this position, prioritize by exact length match
    // This ensures 3-letter words go to 3-letter slots, not longer word slots
    if (matchingWords.length > 1) {
      console.log('🎯 Multiple words could occupy position:', { row, col }, 
        'Words:', matchingWords.map(w => ({ word: w.word, length: w.word.length })));
      
      // Group words by their length
      const wordsByLength = new Map();
      matchingWords.forEach(word => {
        const len = word.word.length;
        if (!wordsByLength.has(len)) {
          wordsByLength.set(len, []);
        }
        wordsByLength.get(len).push(word);
      });
      
      // Prefer the shortest word length first (3-letter over 4-letter, etc.)
      const sortedLengths = Array.from(wordsByLength.keys()).sort((a, b) => a - b);
      const preferredLength = sortedLengths[0];
      const preferredWords = wordsByLength.get(preferredLength);
      
      console.log('🎯 Prioritizing words of length:', preferredLength, 
        'Words:', preferredWords.map(w => w.word));
      
      return preferredWords.length > 0;
    }
    
    return true;
  };

  // Helper function to count only actual found words (not hint markers)
  const getActualFoundWordsCount = (foundWords: string[]) => {
    return foundWords.filter(word => !word.startsWith('HINT_')).length;
  };

  // Function to get letters already placed in a row or column for a specific crossword word
  const getExistingLettersInWord = (targetWord: CrosswordWord) => {
    const existingLetters: { [key: number]: string } = {};
    
    // Check each position in the target word
    for (let i = 0; i < targetWord.word.length; i++) {
      let checkRow: number;
      let checkCol: number;
      
      if (targetWord.direction === 'across') {
        checkRow = targetWord.row;
        checkCol = targetWord.col + i;
      } else {
        checkRow = targetWord.row + i;
        checkCol = targetWord.col;
      }
      
      // Check if this position has a letter from any found word (including hints)
      if (isGridCellInFoundWord(checkRow, checkCol)) {
        // Check if this is a hint marker first
        const hasHintMarker = gameState.foundWords.some(word => 
          word === `HINT_${checkRow}_${checkCol}`
        );
        
        if (hasHintMarker) {
          // For hints, use the letter from the target word itself
          existingLetters[i] = targetWord.word[i].toLowerCase();
        } else {
          // For regular found words, get the letter from the grid
          const letter = grid[checkRow]?.[checkCol];
          if (letter) {
            existingLetters[i] = letter.toLowerCase();
          }
        }
      }
    }
    
    return existingLetters;
  };

  // Function to find which crossword word the current position might be building
  const findPotentialWords = (currentWord: string) => {
    if (!currentWord) return [];
    
    const currentWordLower = currentWord.toLowerCase();
    const potentialWords: Array<{word: CrosswordWord, existingLetters: { [key: number]: string }}> = [];
    
    gameState.crosswordWords.forEach(crosswordWord => {
      const wordUpper = toHawaiianUppercase(crosswordWord.word);
      if (gameState.foundWords.includes(wordUpper)) return; // Skip already found words
      
      const existingLetters = getExistingLettersInWord(crosswordWord);
      const wordLower = crosswordWord.word.toLowerCase();
      
      // Check if current typed letters + existing letters could form this word
      let canForm = true;
      let currentIndex = 0;
      
      for (let i = 0; i < wordLower.length; i++) {
        if (existingLetters[i]) {
          // Position has existing letter, skip
          continue;
        } else if (currentIndex < currentWordLower.length) {
          // Check if current letter matches
          if (wordLower[i] !== currentWordLower[currentIndex]) {
            canForm = false;
            break;
          }
          currentIndex++;
        } else {
          // We need more letters for this position
          break;
        }
      }
      
      if (canForm && currentIndex <= currentWordLower.length) {
        potentialWords.push({ word: crosswordWord, existingLetters });
      }
    });
    
    return potentialWords;
  };

  // Function to get display word - simplified to show only what player typed
  const getDisplayWordWithExisting = () => {
    return gameState.currentWord;
  };

  // Function to check if current word + existing letters form a valid word
  const checkWordWithExistingLetters = (currentWord: string) => {
    const potentialWords = findPotentialWords(currentWord);
    
    if (potentialWords.length === 0) return null;
    
    const currentWordLower = currentWord.toLowerCase();
    
    // Check each potential word to see if it's complete
    for (const { word: targetWord, existingLetters } of potentialWords) {
      const targetWordLower = targetWord.word.toLowerCase();
      
      console.log('🔍 Checking word with existing letters:', {
        currentWord,
        targetWord: targetWord.word,
        existingLetters
      });
      
      // Build the complete word using existing + typed letters
      let completeWord = '';
      let currentIndex = 0;
      let isComplete = true;
      
      for (let i = 0; i < targetWordLower.length; i++) {
        if (existingLetters[i]) {
          // Use existing letter from grid
          completeWord += existingLetters[i];
        } else if (currentIndex < currentWordLower.length) {
          // Use letter from current word
          if (targetWordLower[i] === currentWordLower[currentIndex]) {
            completeWord += currentWordLower[currentIndex];
            currentIndex++;
          } else {
            isComplete = false;
            break;
          }
        } else {
          // Missing letters
          isComplete = false;
          break;
        }
      }
      
      console.log('🎯 Complete word check:', {
        completeWord,
        targetWord: targetWordLower,
        isComplete,
        usedAllTypedLetters: currentIndex === currentWordLower.length
      });
      
      // Check if we have a complete match and used all typed letters
      if (isComplete && completeWord === targetWordLower && currentIndex === currentWordLower.length) {
        return toHawaiianUppercase(targetWord.word);
      }
    }
    
    return null;
  };

  const handleWordsUpdate = (newWords: string[]) => {
    // Store in localStorage with language-specific key
    const storageKey = currentLanguage === 'mao' ? 'maori-custom-words' : 'hawaiian-custom-words';
    const fileName = currentLanguage === 'mao' ? 'public/KupuMaori.txt' : 'public/HawaiianWords.txt';
    
    localStorage.setItem(storageKey, JSON.stringify(newWords));
    setCustomWords(newWords);
    
    // Log the words in a format ready for the appropriate public file
    console.log(`=== WORDS FOR ${fileName} ===`);
    console.log(newWords.join('\n'));
    console.log('=== END WORD LIST ===');
    
    // Show success message with instructions
    toast({
      title: "Words uploaded!",
      description: `Uploaded ${newWords.length} words. Check console for word list to copy to ${fileName}`,
    });
    
    // Display the words for manual copying
    const wordListText = newWords.join('\n');
    alert(`Copy these ${newWords.length} words to ${fileName}:\n\n${wordListText.substring(0, 500)}${wordListText.length > 500 ? '...\n\n(Full list in console)' : ''}`);
  };

  const handleReloadWords = () => {
    // Reset game state and reload words
    setGameState({
      foundWords: [],
      hintsUsed: 0,
      availableWords: [],
      selectedLetters: [],
      currentWord: '',
      availableLetters: [],
      crosswordWords: [],
      showError: false,
      errorMessage: '',
      typedWord: '',
      showCelebration: false,
      isManualCelebration: false,
      hintAttemptsLeft: 2,
      showHintMessage: false,
      hintMessage: '',
      lastHintedWord: undefined,
      lastHintedLetterIndex: -1,
      foundThreeLetterWords: [],
      threeLetterToastShown: false,
      showSuccessNotification: false,
      successMessage: ''
    });
    setLoading(true);
    // Reload words with random selection
    loadHawaiianWords(true);
  };

  // Handle reveal words functionality
  const handleRevealWords = () => {
    setRevealMode(true);
    setButtonsDisabled(true);
    
    // Wait 5 seconds then show choice box
    setTimeout(() => {
      setShowChoiceBox(true);
    }, 5000);
  };

  // Handle refresh choice
  const handleRefreshChoice = () => {
    setShowChoiceBox(false);
    setRevealMode(false);
    setButtonsDisabled(false);
    handleReloadWords();
  };

  // Handle quit choice
  const handleQuitChoice = () => {
    setShowChoiceBox(false);
    setShowFarewell(true);
    
    // Wait 3 seconds then close window
    setTimeout(() => {
      window.close();
    }, 3000);
  };

  // Test function to generate puzzle with ake/akea
  const handleTestAkeAkea = () => {
    setGameState({
      foundWords: [],
      hintsUsed: 0,
      availableWords: [],
      selectedLetters: [],
      currentWord: '',
      availableLetters: [],
      crosswordWords: [],
      showError: false,
      errorMessage: '',
      typedWord: '',
      showCelebration: false,
      isManualCelebration: false,
      hintAttemptsLeft: 2,
      showHintMessage: false,
      hintMessage: '',
      lastHintedWord: undefined,
      lastHintedLetterIndex: -1,
      foundThreeLetterWords: [],
      threeLetterToastShown: false,
      showSuccessNotification: false,
      successMessage: ''
    });
    setLoading(true);
    loadHawaiianWords(true, true); // Use random seed + force test words
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hawaiian flex items-center justify-center">
        <div className="text-white text-2xl text-center whitespace-pre-line max-w-[75%]">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hawaiian relative">
      {/* Celebration Animation Overlay */}
      {gameState.showCelebration && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Black Screen Fade */}
          <div className="absolute inset-0 bg-black animate-[blackFade_1s_ease-in-out_forwards]" />
          
          {/* Congratulations Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center opacity-0 animate-[textPhase_4s_ease-in-out_2s_forwards]">
              <div className="text-6xl font-black text-white leading-tight" 
                   style={{ fontFamily: 'Arial Black, Arial, sans-serif', textShadow: '4px 4px 8px rgba(0,0,0,0.8)' }}>
                <div>UA</div>
                <div>LANAKILA</div>
                <div>ʻOE!</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 hidden">
              <Button
                onClick={() => setShowUploader(true)}
                variant="outline"
                size="sm"
                className="border-white/30 text-black bg-white/90 hover:bg-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Word List
              </Button>
              <Button
                onClick={() => {
                  const storageKey = currentLanguage === 'mao' ? 'maori-custom-words' : 'hawaiian-custom-words';
                  const savedWords = localStorage.getItem(storageKey);
                  if (savedWords) {
                    const words = JSON.parse(savedWords);
                    setDisplayWords(words);
                    setShowWordDisplay(true);
                    toast({
                      title: "Word list displayed",
                      description: `Showing all ${words.length} words for copying`
                    });
                  } else {
                    toast({
                      title: "No words found",
                      description: "Please upload a word list first"
                    });
                  }
                }}
                variant="outline"
                size="sm"
                className="border-white/30 text-black bg-blue-500 hover:bg-blue-600"
              >
                Show All Words
              </Button>
              <Button
                onClick={handleReloadWords}
                variant="outline"
                size="sm"
                className="border-white/30 text-black bg-white/90 hover:bg-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reload Words
              </Button>
              {customWords && (
                <>
                  <Button
                    onClick={() => {
                      setCustomWords(null);
                      const storageKey = currentLanguage === 'mao' ? 'maori-custom-words' : 'hawaiian-custom-words';
                      const progressKey = currentLanguage === 'mao' ? 'maori-progress' : 'hawaiian-progress';
                      localStorage.removeItem(storageKey);
                      localStorage.removeItem(progressKey);
                      setLoading(true);
                      loadHawaiianWords(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-black bg-white/90 hover:bg-white"
                  >
                    <Delete className="w-4 h-4 mr-2" />
                    Clear Word List
                  </Button>
                  <Button
                    onClick={handleTestAkeAkea}
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white bg-green-600 hover:bg-green-700"
                  >
                    🧪 Test Ake/Akea
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center">
              <h1 className="text-lg sm:text-2xl font-bold text-white shadow-puzzle">
                &nbsp;{gameLanguage === 'haw' ? 'Nane Huaʻōlelo' : gameLanguage === 'mao' ? 'Panga Kupu' : 'Hawaiian Word Puzzle'}&nbsp;
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInstructions(true)}
                className="text-white hover:bg-white/20 rounded-full ml-2"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center">
              <LanguageDropdown />
            </div>
          </div>
          
          
          {/* Collapsible Debugging Panel - Hidden */}
          <div className="hidden">
            <Collapsible open={debuggingOpen} onOpenChange={setDebuggingOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="text-white/90 mb-4 p-2 bg-black/30 rounded-lg hover:bg-black/40 w-full"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-bold">Selected Words and Letters (for testing)</span>
                    {debuggingOpen ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="text-white/90 mb-4 p-4 bg-black/30 rounded-lg">
                  <div className="text-sm font-bold mb-2">Puzzle Words:</div>
                  <div className="text-xs flex flex-wrap gap-2">
                    {gameState.crosswordWords.map((word, index) => (
                      <span key={index} className="bg-white/20 px-2 py-1 rounded">
                        {word.word.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm font-bold mb-2 mt-4">Available Letters (should be 7):</div>
                  <div className="text-xs flex flex-wrap gap-2">
                    {gameState.availableLetters.map((letter, index) => (
                      <span key={index} className="bg-blue/20 px-2 py-1 rounded">
                        {letter.toUpperCase()}
                      </span>
                    ))}
                    <span className="text-white/60">({gameState.availableLetters.length} letters)</span>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          <div className="text-white/90 hidden">
            Found: {gameState.foundWords.length} / {gameState.crosswordWords.length}
            {customWords && (
              <span className="text-white/70 ml-2 text-sm">(Custom word list)</span>
            )}
          </div>
        </div>

        {/* Game Play Area - Compact mobile layout */}
        <div className="flex flex-col items-center pt-4">
          
          {/* Crossword Grid - positioned close to header */}
          <div className="flex justify-center flex-shrink-0" style={{ marginBottom: '10px' }}>
            {/* Mobile-safe container with simplified responsive dimensions */}
            <div className="crossword-container w-full max-w-[min(95vw,500px)] flex justify-center items-center mx-auto relative" style={{ height: 'clamp(350px, 87vw, 458px)' }}>
              <div className="crossword-grid w-full h-full grid grid-cols-12 gap-0" style={{ gridTemplateRows: 'repeat(11, 1fr)' }}>
                {(() => {
                  const cells = [];
                  // Always render full 12x11 grid for consistent dimensions
                  for (let rowIndex = 0; rowIndex < 11; rowIndex++) {
                    for (let colIndex = 0; colIndex < 12; colIndex++) {
                      const letter = grid[rowIndex]?.[colIndex] || '';
                      const hasLetter = letter !== '';
                      const isFound = isGridCellInFoundWord(rowIndex, colIndex);
                      
                      cells.push(
                        <div
                          key={`${rowIndex}-${colIndex}`}
                           className={`
                             crossword-cell aspect-square flex items-center justify-center font-bold transition-all duration-300
                             ${hasLetter 
                               ? isFound 
                                 ? 'bg-white text-black border border-gray-400 animate-fade-in' 
                                 : revealMode
                                   ? 'bg-white text-red-500 border border-gray-400'  // Show letters in red during reveal mode
                                   : 'bg-white text-transparent border border-gray-400'  // Hide letters until found
                               : 'bg-transparent'  // No border for empty cells
                             }
                           `}
                           style={{
                             fontSize: 'clamp(12px, 2.5vw + 8px, 28px)'
                           }}
                         >
                           {hasLetter && (isFound || revealMode) ? letter : ''}
                        </div>
                      );
                    }
                  }
                  return cells;
                })()}
              </div>
            </div>
          </div>

          {/* Typed word display above letter wheel */}
          <div className="flex justify-center relative" style={{ marginBottom: '18px' }}>
            <div className="text-center">
              <div className="font-bold text-black backdrop-fallback-dark rounded-lg px-6 py-2 text-lg flex items-center justify-center" style={{ height: '40px', width: '160px' }}>
                {gameState.currentWord.toUpperCase() || "\u00A0"}
              </div>
            </div>
            {/* Return button positioned responsively to the right */}
            <button
              onClick={handleManualWordCheck}
              disabled={gameState.currentWord.length < MIN_WORD_LENGTH}
              className="absolute w-10 h-10 backdrop-fallback-dark rounded border border-white/60 hover:bg-white/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
              style={{ 
                left: 'min(calc(50% + 95px), calc(100vw - 60px))', 
                top: '50%', 
                transform: 'translateY(-50%)' 
              }}
              title="Check word"
            >
              <CornerDownLeft size={20} className="text-black" />
            </button>
          </div>

          {/* Circular Letter Selection with Hint Button - fixed at bottom */}
          <div className="relative flex justify-center" style={{ marginBottom: 'calc(1rem - 35px)' }}>
          <div className="relative w-64 h-64 mx-auto letter-wheel">
            <div className="absolute inset-0 rounded-full backdrop-fallback-dark border-4 border-white/60 shadow-lg"></div>
            
            {/* Left side buttons group - positioned 15px from circle edge */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2" 
                 style={{ 
                   left: 'calc(-15px - 48px)', // 15px from circle edge + 48px button width
                   transform: 'translateY(-50%)'
                 }}>
              {/* Refresh Button */}
              <button
                onClick={handleReloadWords}
                className="w-12 h-12 bg-green-500 hover:bg-green-400 
                         rounded-lg border-2 border-white/40 text-white font-bold text-sm 
                         transition-all duration-200 hover:scale-110
                         flex items-center justify-center mb-2"
                title="Refresh Game"
              >
                <RefreshCcw className="w-8 h-8" />
              </button>

              {/* Question Mark Icon for Refresh Info */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-6 h-6 bg-white/80 hover:bg-white rounded-full border border-white/40 
                             flex items-center justify-center ml-3 mb-2
                             transition-all duration-200 hover:scale-110"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-700" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="max-w-60">
                  <p className="text-sm leading-tight">Clicking on this button will erase what you have done so far and set up a new game.</p>
                </PopoverContent>
              </Popover>

              {/* Clear Word Button */}
              <button
                onClick={() => {
                  // Clear current word and any pending timeouts/alerts
                  clearHokaTimeout();
                  if (wordClearTimeout) {
                    clearTimeout(wordClearTimeout);
                    setWordClearTimeout(null);
                  }
                  if (threeLetterTimeout) {
                    clearTimeout(threeLetterTimeout);
                    setThreeLetterTimeout(null);
                  }
                  // Force clear the input field immediately
                  const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (inputElement) {
                    inputElement.value = '';
                  }
                  setGameState(prev => ({ 
                    ...prev, 
                    currentWord: '',
                    selectedLetters: [],
                    typedWord: '',
                    showHoka: false,
                    hokaMessage: '',
                    showCircleError: false,
                    circleErrorMessage: '',
                    showError: false,
                    errorMessage: ''
                  }));
                }}
                disabled={!gameState.currentWord || buttonsDisabled}
                className="w-12 h-12 bg-hawaiian-purple hover:bg-hawaiian-purple-hover disabled:bg-gray-400 
                         rounded-lg border-2 border-white/40 text-white font-bold text-sm 
                         transition-all duration-200 hover:scale-110 disabled:scale-100 disabled:cursor-not-allowed
                         flex items-center justify-center"
                title="Clear current word"
              >
                <Trash2 className="w-8 h-8" />
              </button>
            </div>

            {/* Right side buttons group - positioned 15px from circle edge */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2" 
                 style={{ 
                   right: 'calc(-15px - 48px)', // 15px from circle edge + 48px button width  
                   transform: 'translateY(-50%)'
                 }}>
              <div className="relative">
                {/* Hint Button */}
                <button
                  onClick={handleHint}
                  disabled={gameState.hintAttemptsLeft <= 0 || buttonsDisabled}
                  className="w-12 h-12 bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-400 
                           rounded-lg border-2 border-white/40 text-black font-bold text-sm 
                           transition-all duration-200 hover:scale-110 disabled:scale-100 disabled:cursor-not-allowed
                           flex items-center justify-center mb-2"
                  title={gameState.hintAttemptsLeft > 0 ? `Hint (${gameState.hintAttemptsLeft} left)` : 'No hints left'}
                >
                  <Lightbulb className="w-8 h-8" />
                </button>

                {/* Hint attempts display */}
                {gameState.hintAttemptsLeft > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border border-black
                               flex items-center justify-center text-sm font-bold text-black">
                    {gameState.hintAttemptsLeft}
                  </div>
                )}

                {/* Question Mark Icon for Free Letters Info */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="w-6 h-6 bg-white/80 hover:bg-white rounded-full border border-white/40 
                               flex items-center justify-center ml-3 mb-2
                               transition-all duration-200 hover:scale-110"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-700" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-48">
                    <p className="text-sm leading-tight">You have two free letters per game if you get stuck. They will be placed randomly on the puzzle.</p>
                  </PopoverContent>
                </Popover>

                {/* Reveal Words Button */}
                <button
                  onClick={handleRevealWords}
                  disabled={buttonsDisabled}
                  className="w-12 h-12 bg-blue-500 hover:bg-blue-400 disabled:bg-gray-400 
                           rounded-lg border-2 border-white/40 text-white font-bold text-sm 
                           transition-all duration-200 hover:scale-110 disabled:scale-100 disabled:cursor-not-allowed
                           flex items-center justify-center mb-2"
                  title="Reveal all words"
                >
                  <Eye className="w-8 h-8" />
                </button>

                {/* Question Mark Icon for Reveal Words Info */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="w-6 h-6 bg-white/80 hover:bg-white rounded-full border border-white/40 
                               flex items-center justify-center ml-3
                               transition-all duration-200 hover:scale-110"
                      disabled={buttonsDisabled}
                    >
                      <HelpCircle className="w-4 h-4 text-gray-700" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-48">
                    <p className="text-sm leading-tight">
                      Hō'ike I<br/>
                      Nā<br/>
                      Hua'ōlelo
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Hint Message Display - positioned like other error messages */}
            {gameState.showHintMessage && (
              <div
                className="absolute w-28 h-14 bg-yellow-400 border-2 border-yellow-500 rounded-lg
                         flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2
                         animate-scale-in z-10 shadow-lg"
                style={{
                  left: '50%',
                  top: '50%'
                }}
              >
                <span className="text-black font-bold text-xs text-center leading-tight px-1">
                  {gameState.hintMessage}
                </span>
              </div>
            )}
            
            {/* Backspace button in center */}
            <button
              onClick={handleBackspaceClick}
              disabled={!gameState.currentWord || buttonsDisabled}
              className="absolute w-16 h-16 bg-red-600 hover:bg-red-700 disabled:bg-red-400 
                       rounded-lg border-2 border-white/40 text-white font-bold text-sm 
                       transition-all duration-200 hover:scale-110 disabled:scale-100 disabled:cursor-not-allowed
                       flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: '50%',
                top: '50%'
              }}
              title="Backspace (Delete key)"
            >
              <Delete className="w-6 h-6" />
            </button>
            
            {/* Notification boxes centered over circle */}
            <NotificationBox
              message={gameState.circleErrorMessage}
              isVisible={gameState.showCircleError}
              position={{
                left: '50%',
                top: '50%'
              }}
              bgColor="bg-yellow-400"
              borderColor="border-yellow-500"
              textColor="text-black"
            />
            
            {/* Success notification box - same position as error messages */}
            <NotificationBox
              message={gameState.successMessage}
              isVisible={gameState.showSuccessNotification}
              position={{
                left: '50%',
                top: '50%'
              }}
              bgColor="bg-green-800"
              borderColor="border-green-700"
              textColor="text-white"
            />
            
            {gameState.availableLetters.map((letter, index) => {
              console.log(`🔤 Rendering letter ${index}: "${letter}"`);
              const angle = (index * 360) / gameState.availableLetters.length;
              const radius = 86;
              const x = radius * Math.cos((angle - 90) * Math.PI / 180);
              const y = radius * Math.sin((angle - 90) * Math.PI / 180);
              
              return (
                <button
                  key={index}
                  onClick={() => handleLetterClick(letter)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!buttonsDisabled && !gameState.showCircleError && !gameState.showError && gameState.typedWord !== 'HOKA!' && gameState.typedWord !== 'UA LOA\'A MUA!') {
                      handleLetterClick(letter);
                    }
                  }}
                  disabled={buttonsDisabled || gameState.showCircleError || gameState.showError || gameState.typedWord === 'HOKA!' || gameState.typedWord === 'UA LOA\'A MUA!'}
                  className="absolute w-12 h-12 bg-gray-300 hover:bg-gray-200 disabled:bg-gray-400 rounded-lg border-2 border-white/40 
                           text-black font-bold text-lg uppercase transition-all duration-200 hover:scale-110 disabled:scale-100 disabled:cursor-not-allowed
                           flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2
                           select-none touch-none"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    touchAction: 'none',
                    userSelect: 'none'
                  }}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Type Word Input - New Feature */}
        <div className="text-center mb-6 hidden">
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm inline-block relative">
            <div className="text-white mb-3 text-sm sm:text-base">Or type a word directly:</div>
            <div className="flex gap-2 justify-center items-center">
              {/* Notification box overlay for typed input area */}
              <NotificationBox
                message={gameState.typedWord === 'HOKA!' ? 'HOKA!' : gameState.typedWord === 'UA LOA\'A MUA!' ? 'UA LOA\'A MUA!' : ''}
                isVisible={gameState.typedWord === 'HOKA!' || gameState.typedWord === 'UA LOA\'A MUA!'}
                position={{
                  left: '50%',
                  top: '50%'
                }}
                bgColor="bg-yellow-400"
                borderColor="border-yellow-500"
                textColor="text-black"
              />
              <Input
                value={gameState.typedWord}
                maxLength={getWordLimitsForLanguage(gameLanguage).maxWordLength}
                onChange={(e) => {
                  console.log('🔍 onChange triggered, current input:', e.target.value);
                  const wordLimits = getWordLimitsForLanguage(gameLanguage);
                  console.log('📏 Word limits:', wordLimits);
                  
                  // Clear any existing timeout
                  if (threeLetterTimeout) {
                    console.log('🧹 Clearing existing timeout');
                    clearTimeout(threeLetterTimeout);
                    setThreeLetterTimeout(null);
                  }
                  clearHokaTimeout();
                  
                  // Prevent typing if HOKA! is currently displayed
                  if (gameState.typedWord === 'HOKA!') {
                    console.log('🚫 Prevented typing - HOKA! is displayed');
                    return;
                  }
                  
                  const newValue = e.target.value;
                  console.log('🔍 DEBUG: Input change detected', { newValue, length: newValue.length, maxLength: wordLimits.maxWordLength });
                  
                  // Check if new value would exceed max length
                  if (newValue.length > wordLimits.maxWordLength) {
                    console.log('🔍 DEBUG: HOKA trigger #1 - Input exceeds max length', { newValueLength: newValue.length, maxLength: wordLimits.maxWordLength, timestamp: Date.now() });
                    // Trigger HOKA! when exceeding length
                    setGameState(prev => ({
                      ...prev,
                      typedWord: 'HOKA!'
                    }));
                    
                    // Clear the HOKA! after 1.5 seconds
                    setHokaTimeoutHelper(() => {
                      setGameState(prev => ({
                        ...prev,
                        typedWord: ''
                      }));
                    });
                    return;
                  }
                  
                  console.log('🔍 DEBUG: Setting typedWord to:', newValue);
                  setGameState(prev => ({ ...prev, typedWord: newValue }));
                  
                  
                  // Check for valid words immediately on any length change
                  if (newValue.length > 0) {
                    console.log('🔍 Checking for immediate word match, length:', newValue.length);
                    const normalizedWord = toHawaiianUppercase(newValue.trim());
                    console.log('🔤 Normalized word:', normalizedWord);
                     const isWordInCrossword = gameState.crosswordWords.some(crosswordWord => 
                       toHawaiianUppercase(crosswordWord.word) === normalizedWord && 
                       crosswordWord.word.length === normalizedWord.length
                     );
                    
                    // If it's a valid word that hasn't been found yet
                    if (isWordInCrossword && !gameState.foundWords.includes(normalizedWord)) {
                      // Valid word found - trigger success immediately
                      clearHokaTimeout(); // Clear any pending HOKA timeouts
                      const newFoundWords = [...gameState.foundWords, normalizedWord];
                      
                      setGameState(prev => ({
                        ...prev,
                        foundWords: newFoundWords,
                        typedWord: '',
                        showError: false,
                        errorMessage: '',
                        showSuccessNotification: true,
                        successMessage: 'UA LOA\'A NŌ!'
                      }));
                      
                      // Auto-hide success notification after 2.5 seconds
                      setTimeout(() => {
                        setGameState(prev => ({
                          ...prev,
                          showSuccessNotification: false,
                          successMessage: ''
                        }));
                      }, 2500);

                      // Check if all words are found (excluding hint markers)
                      if (getActualFoundWordsCount(newFoundWords) === gameState.crosswordWords.length) {
                        setTimeout(() => {
                          setGameState(prev => ({ ...prev, showCelebration: true, isManualCelebration: false }));
                        }, 1000);
                      }
                      
                      return; // Stop here
                    } else if (isWordInCrossword && gameState.foundWords.includes(normalizedWord)) {
                      // Only show "already found" if this is a complete word attempt (at max length or through explicit submission)
                      // Don't trigger while user is still potentially typing a longer word
                      if (newValue.length === wordLimits.maxWordLength) {
                        // Already found this word - show UA LOA'A MUA!
                        setGameState(prev => ({
                          ...prev,
                          typedWord: 'UA LOA\'A MUA!'
                        }));
                        
                        // Clear the message after 2 seconds
                        setTimeout(() => {
                          setGameState(prev => ({
                            ...prev,
                            typedWord: ''
                          }));
                        }, 2000);
                        
                        return; // Stop here
                      }
                    }
                  }
                  
                  // Check for minimum word length detection with 3-second delay
                  if (newValue.length >= wordLimits.minWordLength && newValue.length <= wordLimits.maxWordLength) {
                    console.log('✅ Word length qualifies for timeout check:', newValue.length, 'min:', wordLimits.minWordLength, 'max:', wordLimits.maxWordLength);
                    const normalizedWord = toHawaiianUppercase(newValue.trim());
                    console.log('🔤 Normalized word for timeout check:', normalizedWord);
                     const isWordInCrossword = gameState.crosswordWords.some(crosswordWord => 
                       toHawaiianUppercase(crosswordWord.word) === normalizedWord && 
                       crosswordWord.word.length === normalizedWord.length
                     );
                    console.log('🎯 Is word in crossword?', isWordInCrossword);
                    console.log('📝 Already found?', gameState.foundWords.includes(normalizedWord));
                    
                    if (!isWordInCrossword && !gameState.foundWords.includes(normalizedWord)) {
                      console.log(`🕐 Setting 3-second timeout for ${newValue.length}-letter word: ${normalizedWord}`);
                      const timeout = setTimeout(() => {
                        console.log(`⏰ 3-second timeout triggered for: ${normalizedWord}`);
                        // Only show explanation toast for words that are max-1 length, not max length
                        const shouldShowExplanation = newValue.length === (wordLimits.maxWordLength - 1);
                        const hasSeenExplanation = localStorage.getItem('wordDetectionExplanationShown') === 'true';
                        
                        if (shouldShowExplanation && !hasSeenExplanation) {
                          toast({
                            title: "Word Detection Explanation",
                            description: `I am programmed to wait three seconds after you have typed a ${newValue.length} letter word, and will assume that is what you wanted. I will then clear your attempt and you can try again with a new word.`,
                            duration: 4000,
                          });
                          localStorage.setItem('wordDetectionExplanationShown', 'true');
                          // Reset the typed word and clear the input
                          setGameState(prev => ({
                            ...prev,
                            typedWord: '',
                            threeLetterToastShown: true
                          }));
                        } else {
                          console.log('🔍 DEBUG: HOKA trigger #2 - 3-second timeout for invalid word', { timestamp: Date.now() });
                          // Show HOKA! behavior for max length words or after first toast has been shown
                          setGameState(prev => ({
                            ...prev,
                            typedWord: 'HOKA!',
                            showError: false,
                            errorMessage: ''
                          }));
                          
                          // Clear the HOKA! after 1.5 seconds
                          setHokaTimeoutHelper(() => {
                            setGameState(prev => ({
                              ...prev,
                              typedWord: ''
                            }));
                          });
                        }
                        setThreeLetterTimeout(null);
                      }, 3000);
                      setThreeLetterTimeout(timeout);
                    } else {
                      console.log(`❌ No timeout set - word either found in crossword or already found: ${normalizedWord}`);
                    }
                  }
                  
                  // If we've reached max length and no valid word was found, show HOKA!
                  if (newValue.length === wordLimits.maxWordLength) {
                    // Clear any pending 3-second timeout to prevent double HOKA!
                    if (threeLetterTimeout) {
                      clearTimeout(threeLetterTimeout);
                      setThreeLetterTimeout(null);
                    }
                    
                    // Small delay to ensure the state update above is processed
                    setTimeout(() => {
                      const normalizedWord = toHawaiianUppercase(newValue.trim());
                       const isWordInCrossword = gameState.crosswordWords.some(crosswordWord => 
                         toHawaiianUppercase(crosswordWord.word) === normalizedWord && 
                         crosswordWord.word.length === normalizedWord.length
                       );
                      
                      if (!isWordInCrossword) {
                        console.log('🔍 DEBUG: HOKA trigger #3 - Max length invalid word immediate check', { normalizedWord, timestamp: Date.now() });
                        setGameState(prev => ({
                          ...prev,
                          typedWord: 'HOKA!'
                        }));
                        
                        // Clear the HOKA! after 1.5 seconds
                        setHokaTimeoutHelper(() => {
                          setGameState(prev => ({
                            ...prev,
                            typedWord: ''
                          }));
                        });
                      } else if (gameState.foundWords.includes(normalizedWord)) {
                        setGameState(prev => ({
                          ...prev,
                          typedWord: 'UA LOA\'A MUA!'
                        }));
                        
                        // Clear the message after 2 seconds
                        setTimeout(() => {
                          setGameState(prev => ({
                            ...prev,
                            typedWord: ''
                          }));
                        }, 2000);
                      }
                    }, 10);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTypedWordSubmit();
                  }
                }}
                placeholder="Type word here..."
                className="bg-white/90 text-black border-white/30 w-48 text-sm sm:text-base"
                disabled={gameState.typedWord === 'HOKA!' || gameState.typedWord === 'UA LOA\'A MUA!' || gameState.showCircleError || gameState.showError}
              />
              <Button 
                onClick={handleTypedWordSubmit}
                disabled={!gameState.typedWord.trim()}
                className="bg-hawaiian-gold hover:bg-hawaiian-deep-gold text-white px-4"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>

        {/* Submit Controls Below Circle */}
        <div className="text-center mb-8 hidden">
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm inline-block">
            <div className="text-white mb-3">Click letters to form words</div>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={handleWordSubmit}
                disabled={!gameState.currentWord}
                className="bg-hawaiian-gold hover:bg-hawaiian-deep-gold text-white px-6"
              >
                Submit
              </Button>
              <Button 
                onClick={handleClearWord}
                disabled={!gameState.currentWord}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Hint Button */}
        <div className="flex justify-center mb-8 hidden">
          <Button 
            onClick={handleHint}
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Lightbulb className="w-5 h-5 mr-2" />
            Hint ({gameState.hintsUsed})
          </Button>
        </div>

        {/* Found Words */}
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm hidden">
          <h2 className="text-xl font-bold text-white mb-4">Found Words:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {gameState.foundWords.map((word, index) => (
              <div key={index} className="bg-hawaiian-red rounded px-1 py-1 text-white font-medium">
                {word}
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* Choice Box for Show All Words */}
      {showChoiceBox && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="absolute h-36 bg-white rounded-lg shadow-xl border-2 flex flex-col items-center justify-center gap-6"
               style={{
                 left: '0',
                 bottom: '0px',
                 transform: 'none',
                 width: '100vw'
               }}>
            <div className="flex gap-4">
              <Button
                onClick={handleRefreshChoice}
                variant="default"
                className="font-bold px-8 py-3 text-lg"
              >
                {t('game.confirmRefresh.confirm')}
              </Button>
              <Button
                onClick={handleQuitChoice}
                variant="outline"
                className="px-8 py-3 text-lg"
              >
                {t('game.confirmRefresh.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Farewell Message */}
      {showFarewell && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="absolute h-36 bg-white rounded-lg shadow-xl border-2 flex items-center justify-center"
               style={{
                 left: '0',
                 bottom: '0px',
                 transform: 'none',
                 width: '100vw',
                 fontFamily: 'cursive'
               }}>
            <h2 className="text-4xl text-gray-800" style={{ fontFamily: 'cursive' }}>
              A Hui Hou!
            </h2>
          </div>
        </div>
      )}

      {showUploader && (
        <WordListUploader
          onWordsUpdated={handleWordsUpdate}
          onClose={() => setShowUploader(false)}
        />
      )}

      {/* Word Display Modal */}
      {showWordDisplay && (
        <Dialog open={showWordDisplay} onOpenChange={setShowWordDisplay}>
          <DialogOverlay className="bg-black/50" />
          <DialogContent className="max-w-4xl w-full h-[90vh] p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">All Words ({displayWords.length} total)</h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const wordText = displayWords.join("\n");
                    navigator.clipboard.writeText(wordText).then(() => {
                      toast({
                        title: "Copied!",
                        description: "All words copied to clipboard"
                      });
                    });
                  }}
                  variant="outline"
                  size="sm"
                >
                  Copy All Words
                </Button>
                <Button
                  onClick={() => setShowWordDisplay(false)}
                  variant="ghost"
                  size="icon"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="h-full">
              <div className="grid grid-cols-4 gap-2 text-sm">
                {displayWords.map((word, index) => (
                  <div key={index} className="p-2 bg-gray-100 rounded">
                    {word}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}

      {showUploader && (
        <WordListUploader 
          onWordsUpdated={handleWordsUpdate}
          onClose={() => setShowUploader(false)}
        />
      )}

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

export default HawaiianWordGame;
