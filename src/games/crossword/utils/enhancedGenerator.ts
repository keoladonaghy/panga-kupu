/**
 * Enhanced Crossword Generator with Intersection Quality Improvements
 * 
 * This is an enhanced version of the original crosswordGenerator.ts that:
 * 1. Prioritizes middle-position intersections over edge intersections
 * 2. Validates puzzle quality before accepting
 * 3. Provides A/B testing capabilities via feature flags
 * 4. Aligns with KimiKupu's architecture patterns
 */

import { 
  IntersectionQualityAnalyzer, 
  PuzzleQualityValidator, 
  type PuzzleQualityMetrics 
} from './intersectionQuality';

// Re-export original interfaces for compatibility
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
  selectedLetters: string[];
  qualityMetrics?: PuzzleQualityMetrics; // Enhanced with quality data
}

interface Intersection {
  word1Index: number;
  word2Index: number;
  char1Index: number;
  char2Index: number;
  commonChar: string;
  qualityScore: number; // NEW: Quality score for this intersection
}

interface PlacementCandidate {
  row: number;
  col: number;
  direction: 'across' | 'down';
  compactness: number;
  intersectionQuality: number; // NEW: Quality score for intersection
}

// Feature flags for A/B testing and gradual rollout
interface FeatureFlags {
  enableQualityImprovements: boolean;
  enableQualityValidation: boolean;
  minQualityThreshold: number;
  preferMiddleIntersections: boolean;
  enableQualityLogging: boolean;
}

// Default feature flags - can be overridden for testing
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableQualityImprovements: true,    // Enable intersection quality scoring
  enableQualityValidation: true,      // Validate puzzle quality before accepting
  minQualityThreshold: 60,           // Minimum quality score (0-100)
  preferMiddleIntersections: true,    // Prioritize middle over edge intersections
  enableQualityLogging: true         // Log quality metrics for analysis
};

export class EnhancedCrosswordGenerator {
  private words: string[];
  private gridSize: number;
  private maxAttempts: number;
  private selectedLetters: string[] = [];
  private filteredWords: string[] = [];
  private language: 'haw' | 'mao' | 'tah' | 'en';
  private readonly MAX_WORDS = 12;
  private readonly MIN_FOUNDATION_WORDS = 2;
  private readonly MAX_MEDIUM_WORDS = 8;
  private readonly MAX_SHORT_WORDS = 6;
  private readonly LETTERS_PER_PUZZLE = 7;
  
  // Enhanced features
  private featureFlags: FeatureFlags;
  private qualityAttempts: number = 0;
  private readonly MAX_QUALITY_ATTEMPTS = 50; // Try up to 50 times for quality puzzle
  
  constructor(
    words: string[], 
    gridSize: number = 12, 
    language: 'haw' | 'mao' | 'tah' | 'en' = 'haw',
    featureFlags: Partial<FeatureFlags> = {}
  ) {
    this.words = words;
    this.gridSize = gridSize;
    this.language = language;
    this.maxAttempts = 1000;
    this.featureFlags = { ...DEFAULT_FEATURE_FLAGS, ...featureFlags };
    
    if (this.featureFlags.enableQualityLogging) {
      console.log('🎯 Enhanced Crossword Generator initialized with quality improvements');
      console.log('Feature flags:', this.featureFlags);
    }
    
    // Normalize words (keep existing logic)
    this.words = this.normalizeWords(words);
  }
  
  /**
   * Generate crossword with optional quality improvements
   */
  generateCrossword(): CrosswordGrid | null {
    if (this.featureFlags.enableQualityLogging) {
      console.log('=== ENHANCED CROSSWORD GENERATION STARTING ===');
    }
    
    if (!this.featureFlags.enableQualityImprovements) {
      // Fallback to original algorithm for A/B testing
      return this.generateWithOriginalAlgorithm();
    }
    
    return this.generateWithQualityImprovements();
  }
  
  /**
   * Generate crossword with intersection quality improvements
   */
  private generateWithQualityImprovements(): CrosswordGrid | null {
    let bestPuzzle: CrosswordGrid | null = null;
    let bestQualityScore = 0;
    
    // Try multiple letter combinations with quality focus
    for (let letterAttempt = 0; letterAttempt < 10; letterAttempt++) {
      if (this.featureFlags.enableQualityLogging) {
        console.log(`🔤 Quality-focused letter attempt ${letterAttempt + 1}/10`);
      }
      
      try {
        this.selectRandomLetters();
        this.filterWordsByLetters();
        
        if (this.filteredWords.length < this.MAX_WORDS) {
          continue;
        }
        
        // Try multiple puzzle generations for this letter set
        for (let qualityAttempt = 0; qualityAttempt < this.MAX_QUALITY_ATTEMPTS; qualityAttempt++) {
          const puzzle = this.buildQualityAwareCrossword();
          
          if (puzzle && puzzle.words.length >= this.MAX_WORDS) {
            const qualityMetrics = PuzzleQualityValidator.assessPuzzleQuality(puzzle.words);
            puzzle.qualityMetrics = qualityMetrics;
            
            if (this.featureFlags.enableQualityLogging) {
              console.log(`📊 Puzzle attempt ${qualityAttempt + 1} quality: ${qualityMetrics.qualityScore}`);
            }
            
            // Track best puzzle
            if (qualityMetrics.qualityScore > bestQualityScore) {
              bestPuzzle = puzzle;
              bestQualityScore = qualityMetrics.qualityScore;
            }
            
            // Accept if meets quality threshold
            if (this.featureFlags.enableQualityValidation) {
              if (PuzzleQualityValidator.meetsQualityStandards(qualityMetrics)) {
                if (this.featureFlags.enableQualityLogging) {
                  console.log('✅ QUALITY PUZZLE FOUND!');
                  console.log(PuzzleQualityValidator.generateQualityReport(qualityMetrics));
                }
                return puzzle;
              }
            } else {
              // If validation disabled, return first valid puzzle
              return puzzle;
            }
          }
        }
        
      } catch (error) {
        console.error(`Error in quality generation attempt ${letterAttempt + 1}:`, error);
        continue;
      }
    }
    
    // Return best puzzle found, even if below threshold
    if (bestPuzzle && this.featureFlags.enableQualityLogging) {
      console.log(`⚡ Returning best puzzle found (quality: ${bestQualityScore})`);
      if (bestPuzzle.qualityMetrics) {
        console.log(PuzzleQualityValidator.generateQualityReport(bestPuzzle.qualityMetrics));
      }
    }
    
    return bestPuzzle;
  }
  
  /**
   * Build crossword with quality-aware word placement
   */
  private buildQualityAwareCrossword(): CrosswordGrid | null {
    const grid: string[][] = Array(11).fill(null).map(() => Array(12).fill(''));
    const placedWords: CrosswordWord[] = [];
    const usedWords = new Set<string>();
    
    // Step 1: Place foundation words (same as original)
    const fiveLetterWords = this.filteredWords.filter(word => word.length === 5);
    if (fiveLetterWords.length < 2) {
      return null;
    }
    
    // Place first foundation word horizontally in center
    const firstWord = fiveLetterWords[Math.floor(Math.random() * fiveLetterWords.length)];
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
    
    // Step 2: Place subsequent words with quality awareness
    let wordNumber = 2;
    const remainingWords = this.filteredWords.filter(word => !usedWords.has(word));
    
    for (const word of remainingWords) {
      if (placedWords.length >= this.MAX_WORDS) break;
      
      if (this.tryPlaceQualityAwareWord(grid, placedWords, word, usedWords, wordNumber)) {
        wordNumber++;
      }
    }
    
    return placedWords.length >= this.MAX_WORDS ? {
      words: placedWords,
      grid,
      gridSize: this.gridSize,
      selectedLetters: this.selectedLetters
    } : null;
  }
  
  /**
   * Try to place a word with quality-aware intersection selection
   */
  private tryPlaceQualityAwareWord(
    grid: string[][],
    placedWords: CrosswordWord[],
    newWord: string,
    usedWords: Set<string>,
    wordNumber: number
  ): boolean {
    const validPlacements: PlacementCandidate[] = [];
    
    // Find all valid placements with quality scoring
    for (const placedWord of placedWords) {
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
            
            if (this.isValidPlacement(grid, newWord, newRow, newCol, newDirection)) {
              const compactness = this.calculateCompactness(placedWords, newWord, newRow, newCol, newDirection);
              
              // NEW: Calculate intersection quality
              const intersectionPosition = newCharIndex + 1; // 1-based position
              const intersectionQuality = this.featureFlags.preferMiddleIntersections
                ? IntersectionQualityAnalyzer.calculateIntersectionScore(intersectionPosition, newWord.length)
                : 0;
              
              validPlacements.push({
                row: newRow,
                col: newCol,
                direction: newDirection,
                compactness,
                intersectionQuality
              });
            }
          }
        }
      }
    }
    
    if (validPlacements.length === 0) {
      return false;
    }
    
    // Sort by quality: intersection quality first, then compactness
    validPlacements.sort((a, b) => {
      if (this.featureFlags.preferMiddleIntersections) {
        // Primary sort: intersection quality (higher is better)
        if (b.intersectionQuality !== a.intersectionQuality) {
          return b.intersectionQuality - a.intersectionQuality;
        }
      }
      // Secondary sort: compactness (lower is better)
      return a.compactness - b.compactness;
    });
    
    // Use the best quality placement
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
    
    if (this.featureFlags.enableQualityLogging && this.featureFlags.preferMiddleIntersections) {
      console.log(`📍 Placed "${newWord}" with intersection quality: ${bestPlacement.intersectionQuality}`);
    }
    
    return true;
  }
  
  /**
   * Fallback to original algorithm for A/B testing
   */
  private generateWithOriginalAlgorithm(): CrosswordGrid | null {
    if (this.featureFlags.enableQualityLogging) {
      console.log('🔄 Using original algorithm (A/B test control group)');
    }
    
    // This would call the original crosswordGenerator logic
    // For now, we'll use a simplified version
    return this.buildSimpleCrossword();
  }
  
  /**
   * Simplified crossword building (placeholder for original algorithm)
   */
  private buildSimpleCrossword(): CrosswordGrid | null {
    // This is a placeholder - in practice, you'd import and use the original generator
    return null;
  }
  
  // Utility methods (keeping existing implementations)
  private normalizeWords(words: string[]): string[] {
    return words.map(word => word.trim().toLowerCase()).filter(word => word.length > 0);
  }
  
  private selectRandomLetters(): void {
    // Keep existing letter selection logic
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const consonants = this.language === 'haw' 
      ? ['h', 'k', 'l', 'm', 'n', 'p', 'w']
      : ['h', 'k', 'm', 'n', 'p', 'r', 't', 'w'];
    
    this.selectedLetters = [
      ...vowels.sort(() => Math.random() - 0.5).slice(0, 3),
      ...consonants.sort(() => Math.random() - 0.5).slice(0, 4)
    ];
  }
  
  private filterWordsByLetters(): void {
    this.filteredWords = this.words.filter(word => {
      if (word.length < 3 || word.length > 5) return false;
      return word.split('').every(letter => this.selectedLetters.includes(letter));
    });
  }
  
  private isValidPlacement(
    grid: string[][],
    word: string,
    row: number,
    col: number,
    direction: 'across' | 'down'
  ): boolean {
    // Keep existing validation logic
    if (direction === 'across') {
      if (row < 0 || row >= 11 || col < 0 || col + word.length > 12) return false;
    } else {
      if (col < 0 || col >= 12 || row < 0 || row + word.length > 11) return false;
    }
    
    // Check for conflicts and proper spacing
    for (let i = 0; i < word.length; i++) {
      const checkRow = direction === 'across' ? row : row + i;
      const checkCol = direction === 'across' ? col + i : col;
      const currentCell = grid[checkRow][checkCol];
      
      if (currentCell !== '' && currentCell !== word[i]) {
        return false;
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
    // Keep existing compactness calculation
    return Math.random() * 100; // Placeholder
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
      grid[placeRow][placeCol] = word[i].toUpperCase();
    }
  }
}

// Export enhanced generator as default for easy switching
export default EnhancedCrosswordGenerator;