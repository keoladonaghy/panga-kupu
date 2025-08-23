
import { getWordLimitsForLanguage, type LanguageWordLimits } from '@/config/languageWordLimits';

export interface CrosswordWord {
  word: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
  number: number;
}

export interface CrosswordGrid {
  words: CrosswordWord[];
  grid: string[][];
  gridSize: number;
  selectedLetters: string[]; // Add the selected letters to the result
}

interface Intersection {
  word1Index: number;
  word2Index: number;
  char1Index: number;
  char2Index: number;
  commonChar: string;
}

export class CrosswordGenerator {
  private words: string[];
  private gridSize: number;
  private maxAttempts: number;
  private selectedLetters: string[] = [];
  private filteredWords: string[] = [];
  private language: 'haw' | 'mao' | 'tah' | 'en'; // Add language parameter
  private wordLimits: LanguageWordLimits; // Add word limits
  private readonly MAX_WORDS = 8; // Centralized word count limit
  private readonly MIN_FOUNDATION_WORDS = 2; // Minimum foundation words needed
  private readonly MAX_MEDIUM_WORDS = 7; // Maximum medium words to add
  private readonly MAX_SHORT_WORDS = 4; // Maximum short words to add
  private readonly LETTERS_PER_PUZZLE = 7; // Number of letters selected for each puzzle
  
  // Word category constraints

  constructor(words: string[], gridSize: number = 12, language: 'haw' | 'mao' | 'tah' | 'en' = 'haw', customWordLimits?: LanguageWordLimits) {
    this.words = words;
    this.gridSize = gridSize;
    this.language = language;
    this.wordLimits = customWordLimits || getWordLimitsForLanguage(language);
    this.maxAttempts = 1000;
    // Log the word limits being used for this language
    console.log(`Using word limits for ${language}:`, this.wordLimits);
    
    // Normalize and validate words - preserve 'okina for Hawaiian and Tahitian, remove for others
    const normalizedWords = words.map(word => {
      let normalized = word.trim();
      
      if (this.language !== 'haw' && this.language !== 'tah') {
        // For non-Hawaiian/Tahitian languages, remove 'okina character variants
        normalized = normalized
          .replace(/'/g, '') // Remove straight quotes
          .replace(/ʻ/g, '') // Remove 'okina
          .replace(/`/g, '') // Remove backticks
          .replace(/'/g, '') // Remove right single quotes
          .replace(/'/g, '') // Remove left single quotes
      } else {
        // For Hawaiian and Tahitian, normalize other quote variants to proper 'okina/eta
        normalized = normalized
          .replace(/'/g, this.language === 'tah' ? '\u2018' : 'ʻ') // Convert straight quotes to 'eta or 'okina
          .replace(/`/g, this.language === 'tah' ? '\u2018' : 'ʻ') // Convert backticks to 'eta or 'okina
          .replace(/'/g, this.language === 'tah' ? '\u2018' : 'ʻ') // Convert right single quotes to 'eta or 'okina
          .replace(/'/g, this.language === 'tah' ? '\u2018' : 'ʻ') // Convert left single quotes to 'eta or 'okina
      }
      
      console.log(`Word normalization (${this.language}): "${word}" -> "${normalized}"`);
      return normalized;
    }).filter(word => word.length > 0); // Remove empty words
    
    console.log('Processed words for crossword:', normalizedWords.length);
    this.words = normalizedWords;
  }

  generateCrossword(): CrosswordGrid | null {
    console.log('=== CROSSWORD GENERATION STARTING ===');
    console.log('Total input words:', this.words.length);
    console.log('Language:', this.language);
    console.log('Word limits:', this.wordLimits);
    
    // Try different letter combinations until we get at least MAX_WORDS words AND at least 2 five-letter words
    for (let letterAttempt = 0; letterAttempt < 10; letterAttempt++) {
      console.log(`=== LETTER SELECTION ATTEMPT ${letterAttempt + 1}/10 ===`);
      
      // Step 1: Select letters for puzzle
      this.selectRandomLetters();
      console.log('Selected letters:', this.selectedLetters);
      
      // Step 2: Filter words to only use those letters
      this.filterWordsByLetters();
      console.log('Filtered words count:', this.filteredWords.length);
      console.log('Sample filtered words:', this.filteredWords.slice(0, 10));
      
      // Check if we have enough five-letter words specifically - BUT only if max length allows it
      const fiveLetterWords = this.filteredWords.filter(word => word.length === 5);
      const maxPossibleLength = Math.min(5, this.wordLimits.maxWordLength);
      const longestWords = this.filteredWords.filter(word => word.length === maxPossibleLength);
      console.log(`Five-letter words available: ${fiveLetterWords.length}`);
      console.log(`Longest possible words (${maxPossibleLength} letters): ${longestWords.length}`);
      console.log('Sample longest words:', longestWords.slice(0, 5));
      
      if (this.filteredWords.length < this.MAX_WORDS) {
        console.log(`WARNING: Not enough words with selected letters for ${this.MAX_WORDS}-word puzzle:`, this.selectedLetters);
        console.log('Available filtered words:', this.filteredWords.length);
        continue; // Try different letters
      }
      
      // Modify the five-letter requirement based on max word length
      const requiredLongWords = this.wordLimits.maxWordLength >= 5 ? 2 : 0;
      if (this.wordLimits.maxWordLength >= 5 && fiveLetterWords.length < requiredLongWords) {
        console.log(`WARNING: Not enough five-letter words with selected letters:`, fiveLetterWords.length);
        continue; // Try different letters
      } else if (this.wordLimits.maxWordLength < 5) {
        console.log(`INFO: Skipping five-letter requirement since max length is ${this.wordLimits.maxWordLength}`);
      }
      
      // Try to build crossword with current letter selection
      for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
        if (attempt % 100 === 0) {
          console.log(`Crossword attempt ${attempt}/${this.maxAttempts} with letter set ${letterAttempt + 1}`);
        }
        const result = this.buildStructuredCrossword();
        if (result && result.words.length >= this.MAX_WORDS) {
          // Verify the required long words based on language constraints
          if (this.wordLimits.maxWordLength >= 5) {
            const resultFiveLetterWords = result.words.filter(word => word.word.length === 5);
            if (resultFiveLetterWords.length >= 2) {
              console.log(`=== CROSSWORD GENERATION SUCCESS WITH ${result.words.length} WORDS (${resultFiveLetterWords.length} five-letter words) ===`);
              return result;
            } else {
              console.log(`WARNING: Generated puzzle only has ${resultFiveLetterWords.length} five-letter words, continuing...`);
            }
          } else {
            // For languages with shorter max length, just check we have enough words
            console.log(`=== CROSSWORD GENERATION SUCCESS WITH ${result.words.length} WORDS (max length: ${this.wordLimits.maxWordLength}) ===`);
            return result;
          }
        }
      }
      
      console.log(`Letter set ${letterAttempt + 1} failed to produce ${this.MAX_WORDS}+ words. Trying new letters...`);
    }
    
    const failureReason = this.wordLimits.maxWordLength >= 5 
      ? `${this.MAX_WORDS} words with 2+ five-letter words`
      : `${this.MAX_WORDS} words`;
    console.log(`=== CROSSWORD GENERATION FAILED - Could not achieve ${failureReason} ===`);
    return null;
  }

  /**
   * Calculate the proportion of words in the list that contain macron vowels
   */
  private calculateMacronProportion(): number {
    const wordsWithMacrons = this.words.filter(word => 
      /[āēīōū]/.test(word)
    ).length;
    const proportion = wordsWithMacrons / this.words.length;
    console.log(`Macron analysis: ${wordsWithMacrons}/${this.words.length} words (${(proportion * 100).toFixed(1)}%) contain macrons`);
    return proportion;
  }

  /**
   * Count total vowels (with or without macron) in a word
   */
  private countVowels(word: string): number {
    const vowelPattern = /[aeiouāēīōū]/gi;
    const matches = word.match(vowelPattern);
    return matches ? matches.length : 0;
  }

  private selectRandomLetters(): void {
    console.log('=== SELECTING RANDOM LETTERS ===');
    console.log('Current language:', this.language);
    
    let vowels: string[];
    let vowelsWithKahako: string[];
    let consonants: string[];
    
    if (this.language === 'haw') {
      // Hawaiian alphabet consists of: a, e, i, o, u (vowels), ā, ē, ī, ō, ū (vowels with kahakō), h, k, l, m, n, p, w, ʻ (consonants + ʻokina)
      vowels = ['a', 'e', 'i', 'o', 'u'];
      vowelsWithKahako = ['ā', 'ē', 'ī', 'ō', 'ū'];
      consonants = ['h', 'k', 'l', 'm', 'n', 'p', 'w', 'ʻ'];
    } else if (this.language === 'tah') {
      // Tahitian alphabet consists of: a, e, i, o, u (vowels), ā, ē, ī, ō, ū (vowels with kahakō), f, h, m, n, p, r, t, v, ' (consonants + 'eta)
      vowels = ['a', 'e', 'i', 'o', 'u'];
      vowelsWithKahako = ['ā', 'ē', 'ī', 'ō', 'ū'];
      consonants = ['f', 'h', 'm', 'n', 'p', 'r', 't', 'v', '\u2018'];
    } else {
      // Māori alphabet consists of: a, e, i, o, u (vowels), ā, ē, ī, ō, ū (vowels with kahakō), h, k, m, n, ng, p, r, t, w, wh (consonants)
      vowels = ['a', 'e', 'i', 'o', 'u'];
      vowelsWithKahako = ['ā', 'ē', 'ī', 'ō', 'ū'];
      consonants = ['h', 'k', 'm', 'n', 'ng', 'p', 'r', 't', 'w', 'wh'];
    }
    
    let selectedLetters: string[] = [];
    
    // Enhanced macron selection based on word list proportion
    const macronProportion = this.calculateMacronProportion();
    
    // Dynamic probability: use the actual proportion of words with macrons, with minimum 40%
    const macronChance = Math.max(0.4, macronProportion * 0.9);
    
    // Allow multiple macron vowels if they're prevalent in the word list
    // But never more than 2 different ones to avoid making puzzles too difficult
    const maxMacronVowels = Math.min(2, macronProportion > 0.5 ? 2 : 1);
    
    console.log(`Macron selection: ${(macronChance * 100).toFixed(1)}% chance, max ${maxMacronVowels} different vowels`);
    
    // Select macron vowels based on distribution (for all languages)
    const selectedMacronVowels: string[] = [];
    
    if (this.language === 'mao') {
      // Māori: Systematic approach based on word distribution
      
      // Step 1: Determine if puzzle should contain digraphs (22% of words have them)
      const shouldHaveDigraphs = Math.random() < 0.22;
      const digraphsToInclude: string[] = [];
      
      if (shouldHaveDigraphs) {
        // ng: 12.41%, wh: 10.89%, both: 1.12%
        const ngChance = 12.41 / 22; // ~56% of digraph puzzles should have ng
        const whChance = 10.89 / 22; // ~49% of digraph puzzles should have wh
        const bothChance = 1.12 / 22; // ~5% should have both
        
        const random = Math.random();
        if (random < bothChance) {
          digraphsToInclude.push('ng', 'wh');
        } else if (random < ngChance) {
          digraphsToInclude.push('ng');
        } else {
          digraphsToInclude.push('wh');
        }
      }
      
      // Step 2: Select macron vowels based on actual word data frequencies
      // Māori frequencies: ā(18%), ē(3.5%), ī(2.75%), ō(5%), ū(3.5%)
      // Total: ~32.75% of words have macrons
      const macronRandom = Math.random();
      
      console.log(`Māori macron selection - Random value: ${macronRandom}`);
      
      if (macronRandom < 0.3275) {
        console.log('Māori: Selecting macron vowel based on frequency data');
        
        // Weight selection by actual frequencies within the 32.75% that have macrons
        const weightedSelection = Math.random();
        
        // ā: 18% of total = 55% of macron selections (18/32.75)
        // ō: 5% of total = 15.3% of macron selections (5/32.75)
        // ē: 3.5% of total = 10.7% of macron selections (3.5/32.75)
        // ū: 3.5% of total = 10.7% of macron selections (3.5/32.75)
        // ī: 2.75% of total = 8.4% of macron selections (2.75/32.75)
        
        if (weightedSelection < 0.55) {
          selectedMacronVowels.push('ā');
          console.log('Māori: Selected ā (most common macron - 18%)');
        } else if (weightedSelection < 0.703) {
          selectedMacronVowels.push('ō');
          console.log('Māori: Selected ō (second most common - 5%)');
        } else if (weightedSelection < 0.810) {
          selectedMacronVowels.push('ē');
          console.log('Māori: Selected ē (third most common - 3.5%)');
        } else if (weightedSelection < 0.916) {
          selectedMacronVowels.push('ū');
          console.log('Māori: Selected ū (fourth most common - 3.5%)');
        } else {
          selectedMacronVowels.push('ī');
          console.log('Māori: Selected ī (least common - 2.75%)');
        }
      } else {
        console.log('Māori: No macron vowels selected (67.25% chance)');
      }
      
      console.log('Digraphs to include:', digraphsToInclude);
      console.log('Selected macron vowels:', selectedMacronVowels);
      
      // Step 3: Build letter set - enforce 5-vowel maximum
      const digraphs = ['ng', 'wh'];
      const otherConsonants = consonants.filter(c => !digraphs.includes(c));
      
      if (selectedMacronVowels.length > 0) {
        // If we have a macron vowel, only include 4 regular vowels to maintain 5-vowel limit
        const shuffledVowels = [...vowels].sort(() => Math.random() - 0.5);
        selectedLetters.push(...shuffledVowels.slice(0, 4));
        selectedLetters.push(...selectedMacronVowels);
        console.log('Māori: Using 4 regular vowels + 1 macron vowel = 5 total vowels');
      } else {
        // If no macron vowels, use all 5 regular vowels
        selectedLetters.push(...vowels);
        console.log('Māori: Using all 5 regular vowels, no macrons');
      }
      
      // Add selected digraphs
      selectedLetters.push(...digraphsToInclude);
      
      // Fill remaining slots with other consonants
      const remainingSlots = this.LETTERS_PER_PUZZLE - selectedLetters.length;
      const shuffledConsonants = [...otherConsonants].sort(() => Math.random() - 0.5);
      selectedLetters.push(...shuffledConsonants.slice(0, remainingSlots));
      
      // Final shuffle to randomize letter order
      selectedLetters = selectedLetters.sort(() => Math.random() - 0.5);
    } else if (this.language === 'tah') {
      // Tahitian: Updated based on actual word data frequencies
      // Macron frequencies: ā(10%), ē(0.2%), ī(0%), ō(2.5%), ū(2%)
      // Total: ~14.7% of words have macrons
      
      const macronRandom = Math.random();
      
      console.log(`Tahitian macron selection - Random value: ${macronRandom}`);
      
      // Use actual frequency data - ~14.7% of words have macrons
      if (macronRandom < 0.147) {
        console.log('Tahitian: Selecting macron vowel based on frequency data');
        
        // Weight selection by actual frequencies within the 14.7% that have macrons
        const weightedSelection = Math.random();
        
        // ā: 10% of total = 68% of macron selections (10/14.7)
        // ō: 2.5% of total = 17% of macron selections (2.5/14.7)
        // ū: 2% of total = 13.6% of macron selections (2.0/14.7)  
        // ē: 0.2% of total = 1.4% of macron selections (0.2/14.7)
        // ī: 0% = 0% of macron selections
        
        if (weightedSelection < 0.68) {
          selectedMacronVowels.push('ā');
          console.log('Tahitian: Selected ā (most common macron - 10%)');
        } else if (weightedSelection < 0.85) {
          selectedMacronVowels.push('ō');
          console.log('Tahitian: Selected ō (second most common - 2.5%)');
        } else if (weightedSelection < 0.986) {
          selectedMacronVowels.push('ū');
          console.log('Tahitian: Selected ū (third most common - 2%)');
        } else {
          selectedMacronVowels.push('ē');
          console.log('Tahitian: Selected ē (rare - 0.2%)');
        }
      } else {
        console.log('Tahitian: No macron vowels selected (85.3% chance)');
      }
      
      console.log('Tahitian: Final selected macron vowels:', selectedMacronVowels);
      
      // Handle 'eta (glottal stop) selection - 44% of words have it
      const shouldIncludeEta = Math.random() < 0.44;
      
      console.log('Should include \'eta:', shouldIncludeEta);
      
      // Build letter set (no digraphs for Tahitian, similar to Hawaiian)
      // IMPORTANT: Enforce 5-vowel maximum by replacing one regular vowel if macron is selected
      
      if (selectedMacronVowels.length > 0) {
        // If we have a macron vowel, only include 4 regular vowels to maintain 5-vowel limit
        const shuffledVowels = [...vowels].sort(() => Math.random() - 0.5);
        selectedLetters.push(...shuffledVowels.slice(0, 4));
        selectedLetters.push(...selectedMacronVowels);
        console.log('Tahitian: Using 4 regular vowels + 1 macron vowel = 5 total vowels');
      } else {
        // If no macron vowels, use all 5 regular vowels
        selectedLetters.push(...vowels);
        console.log('Tahitian: Using all 5 regular vowels, no macrons');
      }
      
      // Separate 'eta from other consonants
      const etaChar = '\u2018'; // U+2018
      const otherConsonants = consonants.filter(c => c !== etaChar);
      
      // Add 'eta if selected
      if (shouldIncludeEta) {
        selectedLetters.push(etaChar);
      }
      
      // Fill remaining slots with other consonants
      const remainingSlots = this.LETTERS_PER_PUZZLE - selectedLetters.length;
      const shuffledConsonants = [...otherConsonants].sort(() => Math.random() - 0.5);
      selectedLetters.push(...shuffledConsonants.slice(0, remainingSlots));
      
      // Final shuffle to randomize letter order
      selectedLetters = selectedLetters.sort(() => Math.random() - 0.5);
    } else {
      // Hawaiian: Systematic approach based on word distribution (same as Māori but no digraphs)
      
      // Select macron vowels based on actual word data frequencies
      // Hawaiian frequencies: ā(12%), ē(1%), ī(1.5%), ō(4%), ū(3.74%)
      // Total: ~22.24% of words have macrons
      const macronRandom = Math.random();
      
      console.log(`Hawaiian macron selection - Random value: ${macronRandom}`);
      
      if (macronRandom < 0.2224) {
        console.log('Hawaiian: Selecting macron vowel based on frequency data');
        
        // Weight selection by actual frequencies within the 22.24% that have macrons
        const weightedSelection = Math.random();
        
        // ā: 12% of total = 54% of macron selections (12/22.24)
        // ō: 4% of total = 18% of macron selections (4/22.24)
        // ū: 3.74% of total = 16.8% of macron selections (3.74/22.24)
        // ī: 1.5% of total = 6.7% of macron selections (1.5/22.24)
        // ē: 1% of total = 4.5% of macron selections (1/22.24)
        
        if (weightedSelection < 0.54) {
          selectedMacronVowels.push('ā');
          console.log('Hawaiian: Selected ā (most common macron - 12%)');
        } else if (weightedSelection < 0.72) {
          selectedMacronVowels.push('ō');
          console.log('Hawaiian: Selected ō (second most common - 4%)');
        } else if (weightedSelection < 0.888) {
          selectedMacronVowels.push('ū');
          console.log('Hawaiian: Selected ū (third most common - 3.74%)');
        } else if (weightedSelection < 0.955) {
          selectedMacronVowels.push('ī');
          console.log('Hawaiian: Selected ī (fourth most common - 1.5%)');
        } else {
          selectedMacronVowels.push('ē');
          console.log('Hawaiian: Selected ē (least common - 1%)');
        }
      } else {
        console.log('Hawaiian: No macron vowels selected (77.76% chance)');
      }
      
      console.log('Selected macron vowels:', selectedMacronVowels);
      
      // Build letter set (no digraphs for Hawaiian)
      // IMPORTANT: Enforce 5-vowel maximum by replacing one regular vowel if macron is selected
      
      if (selectedMacronVowels.length > 0) {
        // If we have a macron vowel, only include 4 regular vowels to maintain 5-vowel limit
        const shuffledVowels = [...vowels].sort(() => Math.random() - 0.5);
        selectedLetters.push(...shuffledVowels.slice(0, 4));
        selectedLetters.push(...selectedMacronVowels);
        console.log('Hawaiian: Using 4 regular vowels + 1 macron vowel = 5 total vowels');
      } else {
        // If no macron vowels, use all 5 regular vowels
        selectedLetters.push(...vowels);
        console.log('Hawaiian: Using all 5 regular vowels, no macrons');
      }
      
      // Fill remaining slots with consonants
      const remainingSlots = this.LETTERS_PER_PUZZLE - selectedLetters.length;
      const shuffledConsonants = [...consonants].sort(() => Math.random() - 0.5);
      selectedLetters.push(...shuffledConsonants.slice(0, remainingSlots));
      
      // Final shuffle to randomize letter order
      selectedLetters = selectedLetters.sort(() => Math.random() - 0.5);
    }
    
    this.selectedLetters = selectedLetters;
    
    console.log(`Selected exactly ${this.LETTERS_PER_PUZZLE} letters for ${this.language} crossword:`, this.selectedLetters);
    console.log('Macron vowels selected:', selectedMacronVowels.length > 0 ? selectedMacronVowels : 'none');
    if (this.language === 'mao') {
      const hasNg = this.selectedLetters.includes('ng');
      const hasWh = this.selectedLetters.includes('wh');
      console.log('Digraphs included - ng:', hasNg, 'wh:', hasWh);
    }
  }

  private filterWordsByLetters(): void {
    this.filteredWords = this.words.filter(word => {
      // Check word length constraints using language-specific limits
      if (word.length < this.wordLimits.minWordLength || word.length > this.wordLimits.maxWordLength) {
        return false;
      }
      
      // Vowel limit rule for Hawaiian, Tahitian, and Māori: no more than 5 vowels per word
      if (this.language === 'haw' || this.language === 'tah' || this.language === 'mao') {
        const vowelCount = this.countVowels(word);
        if (vowelCount > 5) {
          console.log(`Filtering out word "${word}" - has ${vowelCount} vowels (limit: 5)`);
          return false;
        }
      }
      
      // Check if word contains only the selected letters
      const wordLetters = this.parseWordIntoLetters(word.toLowerCase());
      return wordLetters.every(letter => {
        return this.selectedLetters.includes(letter);
      });
    });
    
    console.log(`Filtered to ${this.filteredWords.length} words using selected letters`);
  }

  /**
   * Parse a word into its constituent letters, handling digraphs for Māori
   */
  private parseWordIntoLetters(word: string): string[] {
    if (this.language !== 'mao') {
      // For Hawaiian and Tahitian, simple character split is fine
      return word.split('');
    }

    // For Māori, handle digraphs ng and wh
    const letters: string[] = [];
    let i = 0;
    
    while (i < word.length) {
      // Check for digraphs first
      if (i < word.length - 1) {
        const twoChar = word.substring(i, i + 2);
        if (twoChar === 'ng' || twoChar === 'wh') {
          letters.push(twoChar);
          i += 2;
          continue;
        }
      }
      
      // Single character
      letters.push(word.charAt(i));
      i++;
    }
    
    return letters;
  }

  // Helper: determine if a word uses Māori digraphs
  private isDigraphWord(word: string): boolean {
    if (this.language !== 'mao') return false;
    return word.includes('wh') || word.includes('ng');
  }

  private buildStructuredCrossword(): CrosswordGrid | null {
    const grid: string[][] = Array(11).fill(null).map(() => 
      Array(12).fill('')
    );
    
    const placedWords: CrosswordWord[] = [];
    const usedWords = new Set<string>();

    // Step 1: Start with foundation words - adapt based on max word length
    const maxFoundationLength = Math.min(5, this.wordLimits.maxWordLength);
    const foundationWords = this.filteredWords.filter(word => word.length >= 4 && word.length <= maxFoundationLength);
    
    // Digraph balance: cap Māori digraph words to 50% of the puzzle
    const maxDigraphWords = this.language === 'mao' ? Math.ceil(this.MAX_WORDS * 0.5) : 0;
    let digraphWordsPlaced = 0;
    
    // For languages with max length >= 5, prioritize five-letter words
    // For languages with max length < 5, use the longest available words
    let selectedFoundation: string[];
    
    if (this.wordLimits.maxWordLength >= 5) {
      const fiveLetterWords = this.filteredWords.filter(word => word.length === 5);
      if (fiveLetterWords.length < 2) {
        console.log(`Not enough five-letter words available: ${fiveLetterWords.length}`);
        return null;
      }
      const fiveLetterNonDigraph = fiveLetterWords.filter(w => !this.isDigraphWord(w));
      const fiveLetterDigraph = fiveLetterWords.filter(w => this.isDigraphWord(w));
      if (fiveLetterNonDigraph.length > 0 && fiveLetterWords.length >= 2) {
        // Ensure at least one foundation word is non-digraph when possible
        const first = fiveLetterNonDigraph[Math.floor(Math.random() * fiveLetterNonDigraph.length)];
        const poolForSecond = fiveLetterWords.filter(w => w !== first);
        const second = poolForSecond[Math.floor(Math.random() * poolForSecond.length)];
        selectedFoundation = [first, second];
      } else {
        // Fallback: any two
        selectedFoundation = [...fiveLetterWords].sort(() => Math.random() - 0.5).slice(0, 2);
      }
      console.log('Foundation words selected (ensuring mix if possible):', selectedFoundation);
    } else {
      // For shorter max lengths, use the longest available words
      const longestWords = this.filteredWords.filter(word => word.length === maxFoundationLength);
      if (longestWords.length < 2) {
        console.log(`Not enough ${maxFoundationLength}-letter words available: ${longestWords.length}`);
        return null;
      }
      selectedFoundation = [...longestWords].sort(() => Math.random() - 0.5).slice(0, 2);
      console.log(`Foundation words selected (ensuring 2 ${maxFoundationLength}-letter words):`, selectedFoundation);
    }

    // Place first foundation word horizontally in center
    const firstWord = selectedFoundation[0];
    const centerRow = Math.floor(11 / 2);
    const startCol = Math.floor((12 - firstWord.length) / 2);

    this.placeWord(grid, firstWord, centerRow, startCol, 'across');
    placedWords.push({
      word: firstWord,
      row: centerRow,
      col: startCol,
      direction: 'across',
      number: 1
    });
    usedWords.add(firstWord);
    if (this.isDigraphWord(firstWord)) { digraphWordsPlaced++; }
    console.log('Placed foundation word 1:', firstWord);

    // Place second foundation word vertically
    let wordNumber = 2;
    if (selectedFoundation.length > 1) {
      const secondWord = selectedFoundation[1];
      if (this.tryPlaceIntersectingWord(grid, placedWords, secondWord, usedWords, wordNumber)) {
        wordNumber++;
        if (this.isDigraphWord(secondWord)) { digraphWordsPlaced++; }
        console.log('Placed foundation word 2:', secondWord);
      }
    }

    // Step 2: Add medium words
    const mediumWords = this.filteredWords.filter(word => 
      word.length >= this.wordLimits.minWordLength && word.length <= this.wordLimits.maxWordLength && !usedWords.has(word)
    );
    console.log('Available medium words:', mediumWords.length, mediumWords.slice(0, 10));
    
    let mediumWordsAdded = 0;
    for (const word of mediumWords) {
      if (mediumWordsAdded >= this.MAX_MEDIUM_WORDS || placedWords.length >= this.MAX_WORDS) break; // Stop when target reached
      if (this.language === 'mao' && this.isDigraphWord(word) && digraphWordsPlaced >= maxDigraphWords) {
        continue;
      }
      console.log(`Trying to place medium word: ${word}`);
      if (this.tryPlaceIntersectingWord(grid, placedWords, word, usedWords, wordNumber)) {
        wordNumber++;
        mediumWordsAdded++;
        if (this.isDigraphWord(word)) { digraphWordsPlaced++; }
        console.log(`SUCCESS: Placed medium word ${mediumWordsAdded}:`, word);
      } else {
        console.log(`FAILED: Could not place medium word:`, word);
      }
    }

    // Step 3: Add short words
    const shortWords = this.filteredWords.filter(word => 
      word.length === 3 && !usedWords.has(word)
    );
    console.log('Available short words:', shortWords.length, shortWords.slice(0, 10));
    
    let shortWordsAdded = 0;
    for (const word of shortWords) {
      if (shortWordsAdded >= this.MAX_SHORT_WORDS || placedWords.length >= this.MAX_WORDS) break;
      if (this.language === 'mao' && this.isDigraphWord(word) && digraphWordsPlaced >= maxDigraphWords) {
        continue;
      }
      console.log(`Trying to place short word: ${word}`);
      if (this.tryPlaceIntersectingWord(grid, placedWords, word, usedWords, wordNumber)) {
        wordNumber++;
        shortWordsAdded++;
        if (this.isDigraphWord(word)) { digraphWordsPlaced++; }
        console.log(`SUCCESS: Placed short word ${shortWordsAdded}:`, word);
      } else {
        console.log(`FAILED: Could not place short word:`, word);
      }
    }

    console.log(`Crossword complete with ${placedWords.length} words:`);
    console.log(`- Foundation words (4-${this.wordLimits.maxWordLength}): 2`);
    console.log(`- Medium words (${this.wordLimits.minWordLength}-${this.wordLimits.maxWordLength}): ${mediumWordsAdded}`);
    console.log(`- Short words (3): ${shortWordsAdded}`);
    console.log('All placed words:', placedWords.map(w => `${w.word} (${w.word.length})`));

    // Step 4: Post-processing - systematically try to add more words using existing letters
    console.log('=== STARTING POST-PROCESSING ===');
    
    // Multiple passes to find more words using newly placed letters
    for (let pass = 1; pass <= 3; pass++) {
      console.log(`Post-processing pass ${pass}:`);
      const wordsBeforePass = placedWords.length;
      this.addWordsUsingExistingLetters(grid, placedWords, usedWords, wordNumber);
      const wordsAddedThisPass = placedWords.length - wordsBeforePass;
      wordNumber += wordsAddedThisPass;
      
      console.log(`Pass ${pass} added ${wordsAddedThisPass} words`);
      
      // Stop if we've reached our target or no new words were added
      if (placedWords.length >= this.MAX_WORDS || wordsAddedThisPass === 0) {
        break;
      }
    }
    
    console.log(`=== POST-PROCESSING COMPLETE - Final count: ${placedWords.length} words ===`);

    // Only return success if we have at least MAX_WORDS words
    return placedWords.length >= this.MAX_WORDS ? {
      words: placedWords,
      grid,
      gridSize: this.gridSize,
      selectedLetters: this.selectedLetters
    } : null;
  }

  private tryPlaceIntersectingWord(
    grid: string[][],
    placedWords: CrosswordWord[],
    newWord: string,
    usedWords: Set<string>,
    wordNumber: number
  ): boolean {
    // Collect all possible valid placements first
    const validPlacements: Array<{
      row: number;
      col: number;
      direction: 'across' | 'down';
      compactness: number;
    }> = [];

    // Try to intersect with each placed word at single letters
    for (const placedWord of placedWords) {
      // Find common letters between words
      for (let newCharIndex = 0; newCharIndex < newWord.length; newCharIndex++) {
        for (let placedCharIndex = 0; placedCharIndex < placedWord.word.length; placedCharIndex++) {
          if (newWord[newCharIndex].toLowerCase() === placedWord.word[placedCharIndex].toLowerCase()) {
            const newDirection = placedWord.direction === 'across' ? 'down' : 'across';
            let newRow: number, newCol: number;

            if (newDirection === 'down') {
              newRow = placedWord.row - newCharIndex;
              newCol = placedWord.col + placedCharIndex;
            } else {
              newRow = placedWord.row + placedCharIndex;
              newCol = placedWord.col - newCharIndex;
            }

            if (this.isValidPlacement(grid, newWord, newRow, newCol, newDirection, false)) {
              // Calculate how compact this placement would be
              const compactness = this.calculateCompactness(placedWords, newWord, newRow, newCol, newDirection);
              validPlacements.push({
                row: newRow,
                col: newCol,
                direction: newDirection,
                compactness
              });
            }
          }
        }
      }
    }

    // Sort by compactness (lower is better - means more balanced)
    validPlacements.sort((a, b) => a.compactness - b.compactness);

    // Use the most compact placement
    if (validPlacements.length > 0) {
      const bestPlacement = validPlacements[0];
      this.placeWord(grid, newWord, bestPlacement.row, bestPlacement.col, bestPlacement.direction);
      placedWords.push({
        word: newWord,
        row: bestPlacement.row,
        col: bestPlacement.col,
        direction: bestPlacement.direction,
        number: wordNumber
      });
      usedWords.add(newWord);
      return true;
    }

    return false;
  }

  private isValidPlacement(
    grid: string[][],
    word: string,
    row: number,
    col: number,
    direction: 'across' | 'down',
    isFirstWord = false
  ): boolean {
    // Check bounds
    if (direction === 'across') {
      if (row < 0 || row >= 11 || col < 0 || col + word.length > 12) {
        return false;
      }
    } else {
      if (col < 0 || col >= 12 || row < 0 || row + word.length > 11) {
        return false;
      }
    }

    // Check word boundaries first - ensure space before and after
    if (!this.hasWordBoundaries(grid, word, row, col, direction)) {
      return false;
    }

    let hasIntersection = false;
    let intersectionCount = 0;

    // Check each position
    for (let i = 0; i < word.length; i++) {
      const checkRow = direction === 'across' ? row : row + i;
      const checkCol = direction === 'across' ? col + i : col;
      const currentCell = grid[checkRow][checkCol];

      if (currentCell !== '') {
        // Must match existing letter for intersection
        if (currentCell !== word[i]) {
          return false;
        }
        hasIntersection = true;
        intersectionCount++;
      } else {
        // Check no adjacent letters (except at intersections)
        if (!this.hasProperSpacing(grid, checkRow, checkCol, direction)) {
          return false;
        }
      }
    }

    // First word doesn't need intersection, others need exactly one
    return isFirstWord || (hasIntersection && intersectionCount === 1);
  }

  private hasWordBoundaries(
    grid: string[][],
    word: string,
    row: number,
    col: number,
    direction: 'across' | 'down'
  ): boolean {
    if (direction === 'across') {
      // Check space before word
      if (col > 0 && grid[row][col - 1] !== '') {
        return false;
      }
      // Check space after word
      if (col + word.length < 12 && grid[row][col + word.length] !== '') {
        return false;
      }
    } else {
      // Check space above word
      if (row > 0 && grid[row - 1][col] !== '') {
        return false;
      }
      // Check space below word
      if (row + word.length < 11 && grid[row + word.length][col] !== '') {
        return false;
      }
    }
    return true;
  }

  private hasProperSpacing(
    grid: string[][],
    row: number,
    col: number,
    direction: 'across' | 'down'
  ): boolean {
    // Check adjacent cells perpendicular to word direction
    // Letters from different words should never touch unless they intersect
    
    if (direction === 'across') {
      // For horizontal words, check above and below
      if (row > 0 && grid[row - 1][col] !== '') {
        return false; // Letter above would touch without intersecting
      }
      if (row < 11 - 1 && grid[row + 1][col] !== '') {
        return false; // Letter below would touch without intersecting
      }
    } else {
      // For vertical words, check left and right
      if (col > 0 && grid[row][col - 1] !== '') {
        return false; // Letter to left would touch without intersecting
      }
      if (col < 12 - 1 && grid[row][col + 1] !== '') {
        return false; // Letter to right would touch without intersecting
      }
    }
    
    return true;
  }

  private addWordsUsingExistingLetters(
    grid: string[][],
    placedWords: CrosswordWord[],
    usedWords: Set<string>,
    wordNumber: number
  ): void {
    let currentWordNumber = wordNumber;
    let wordsAdded = 0;
    const maxAdditionalWords = this.MAX_WORDS; // Limit additional words to match target

    // Get all available words that aren't already used
    const availableWords = this.filteredWords.filter(word => !usedWords.has(word));
    console.log(`Post-processing: ${availableWords.length} available words to try`);
    const maxDigraphWords = this.language === 'mao' ? Math.ceil(this.MAX_WORDS * 0.5) : 0;

    // For each existing letter in the grid, try to find words that use it
    for (let row = 0; row < 11 && wordsAdded < maxAdditionalWords; row++) {
      for (let col = 0; col < 12 && wordsAdded < maxAdditionalWords; col++) {
        const existingLetter = grid[row][col];
        
        if (existingLetter !== '') {
          // Try to place words using this letter as an intersection point
          for (const word of availableWords) {
            if (wordsAdded >= maxAdditionalWords) break;
            if (this.language === 'mao' && this.isDigraphWord(word)) {
              const currentDigraphCount = placedWords.filter(w => this.isDigraphWord(w.word)).length;
              if (currentDigraphCount >= maxDigraphWords) {
                continue;
              }
            }
            
            // Find all positions where this letter appears in the word
            for (let charIndex = 0; charIndex < word.length; charIndex++) {
              if (word[charIndex].toLowerCase() === existingLetter.toLowerCase()) {
                // Try both directions
                for (const direction of ['across', 'down'] as const) {
                  let newRow: number, newCol: number;
                  
                  if (direction === 'across') {
                    newRow = row;
                    newCol = col - charIndex;
                  } else {
                    newRow = row - charIndex;
                    newCol = col;
                  }

                  // Check if this placement would be valid and doesn't conflict
                  if (this.isValidPostProcessingPlacement(grid, word, newRow, newCol, direction)) {
                    console.log(`POST-PROCESSING: Adding ${word} using letter ${existingLetter} at (${row},${col})`);
                    this.placeWord(grid, word, newRow, newCol, direction);
                    placedWords.push({
                      word: word,
                      row: newRow,
                      col: newCol,
                      direction: direction,
                      number: currentWordNumber++
                    });
                    usedWords.add(word);
                    wordsAdded++;
                    
                    // Remove this word from available words to avoid reprocessing
                    const wordIndex = availableWords.indexOf(word);
                    if (wordIndex > -1) {
                      availableWords.splice(wordIndex, 1);
                    }
                    break; // Move to next word
                  }
                }
                if (usedWords.has(word)) break; // Word was placed, move to next word
              }
            }
            if (usedWords.has(word)) break; // Word was placed, move to next word
          }
        }
      }
    }
    
    console.log(`Post-processing added ${wordsAdded} additional words`);
  }

  private isValidPostProcessingPlacement(
    grid: string[][],
    word: string,
    row: number,
    col: number,
    direction: 'across' | 'down'
  ): boolean {
    // Check bounds
    if (direction === 'across') {
      if (row < 0 || row >= 11 || col < 0 || col + word.length > 12) {
        return false;
      }
    } else {
      if (col < 0 || col >= 12 || row < 0 || row + word.length > 11) {
        return false;
      }
    }

    let hasIntersection = false;

    // Check each position of the word
    for (let i = 0; i < word.length; i++) {
      const checkRow = direction === 'across' ? row : row + i;
      const checkCol = direction === 'across' ? col + i : col;
      const currentCell = grid[checkRow][checkCol];
      const wordChar = word[i];

      if (currentCell !== '') {
        // Must match existing letter exactly for valid intersection
        if (currentCell.toLowerCase() !== wordChar.toLowerCase()) {
          return false;
        }
        hasIntersection = true;
      } else {
        // For empty cells, check that no adjacent letters touch unless intersecting
        if (!this.hasProperSpacingForNewLetter(grid, checkRow, checkCol, direction)) {
          return false;
        }
      }
    }

    // Must have at least one intersection with existing letters
    if (!hasIntersection) {
      return false;
    }

    // Check word boundaries - ensure proper word separation
    return this.hasWordBoundaries(grid, word, row, col, direction);
  }

  private hasProperSpacingForNewLetter(
    grid: string[][],
    row: number,
    col: number,
    wordDirection: 'across' | 'down'
  ): boolean {
    // Check adjacent cells perpendicular to word direction
    // Letters from different words should never touch unless they intersect
    
    if (wordDirection === 'across') {
      // For horizontal words, check above and below
      if (row > 0 && grid[row - 1][col] !== '') {
        return false; // Letter above would touch without intersecting
      }
      if (row < 11 - 1 && grid[row + 1][col] !== '') {
        return false; // Letter below would touch without intersecting
      }
    } else {
      // For vertical words, check left and right
      if (col > 0 && grid[row][col - 1] !== '') {
        return false; // Letter to left would touch without intersecting
      }
      if (col < 12 - 1 && grid[row][col + 1] !== '') {
        return false; // Letter to right would touch without intersecting
      }
    }
    
    return true;
  }

  private calculateCompactness(
    placedWords: CrosswordWord[],
    newWord: string,
    newRow: number,
    newCol: number,
    newDirection: 'across' | 'down'
  ): number {
    // Calculate the bounding box of all words including the new word
    let minRow = newRow;
    let maxRow = newDirection === 'across' ? newRow : newRow + newWord.length - 1;
    let minCol = newCol;
    let maxCol = newDirection === 'across' ? newCol + newWord.length - 1 : newCol;

    // Extend bounding box to include all existing words
    for (const word of placedWords) {
      minRow = Math.min(minRow, word.row);
      maxRow = Math.max(maxRow, word.direction === 'across' ? word.row : word.row + word.word.length - 1);
      minCol = Math.min(minCol, word.col);
      maxCol = Math.max(maxCol, word.direction === 'across' ? word.col + word.word.length - 1 : word.col);
    }

    // Calculate the area of the bounding box (smaller is more compact)
    const width = maxCol - minCol + 1;
    const height = maxRow - minRow + 1;
    const area = width * height;

    // Also consider distance from center of grid as a tiebreaker
    const centerRow = Math.floor(11 / 2);
    const centerCol = Math.floor(12 / 2);
    const newWordCenterRow = newDirection === 'across' ? newRow : newRow + Math.floor(newWord.length / 2);
    const newWordCenterCol = newDirection === 'across' ? newCol + Math.floor(newWord.length / 2) : newCol;
    const distanceFromCenter = Math.abs(newWordCenterRow - centerRow) + Math.abs(newWordCenterCol - centerCol);

    // Combine area (primary) with distance from center (secondary)
    return area * 1000 + distanceFromCenter;
  }

  private placeWord(
    grid: string[][],
    word: string,
    row: number,
    col: number,
    direction: 'across' | 'down'
  ): void {
    for (let i = 0; i < word.length; i++) {
      const placeRow = direction === 'across' ? row : row + i;
      const placeCol = direction === 'across' ? col + i : col;
      // Convert to uppercase but preserve 'okina as left single quotation mark
      const char = word[i] === '\u2018' ? '\u2018' : word[i].toUpperCase();
      grid[placeRow][placeCol] = char;
    }
  }
}
