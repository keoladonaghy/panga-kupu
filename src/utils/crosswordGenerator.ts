
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
  private readonly MAX_WORDS = 8; // Centralized word count limit
  private readonly MIN_FOUNDATION_WORDS = 2; // Minimum foundation words needed
  private readonly MAX_MEDIUM_WORDS = 7; // Maximum medium words to add
  private readonly MAX_SHORT_WORDS = 4; // Maximum short words to add
  private readonly LETTERS_PER_PUZZLE = 7; // Number of letters selected for each puzzle
  
  // Word length constraints
  private readonly MIN_WORD_LENGTH = 3; // Minimum letters per word
  private readonly MAX_WORD_LENGTH = 5; // Maximum letters per word
  private readonly MIN_FOUNDATION_LENGTH = 4; // Minimum letters for foundation words
  private readonly MAX_FOUNDATION_LENGTH = 5; // Maximum letters for foundation words
  private readonly MIN_MEDIUM_LENGTH = 3; // Minimum letters for medium words
  private readonly MAX_MEDIUM_LENGTH = 5; // Maximum letters for medium words
  private readonly SHORT_WORD_LENGTH = 3; // Exact length for short words

  constructor(words: string[], gridSize = 12, maxAttempts = 5000) {
    // Normalize and validate words before processing - remove 'okina characters
    const normalizedWords = words.map(word => {
      // Remove all 'okina character variants
      let normalized = word
        .replace(/'/g, '') // Remove straight quotes
        .replace(/ʻ/g, '') // Remove 'okina
        .replace(/`/g, '') // Remove backticks
        .replace(/'/g, '') // Remove right single quotes
        .replace(/'/g, '') // Remove left single quotes
        .trim();
      
      console.log(`Word normalization: "${word}" -> "${normalized}"`);
      return normalized;
    }).filter(word => word.length > 0); // Remove empty words
    
    console.log('Processed words for crossword:', normalizedWords.length);
    this.words = normalizedWords;
    this.gridSize = gridSize;
    this.maxAttempts = maxAttempts;
  }

  generateCrossword(): CrosswordGrid | null {
    console.log('=== CROSSWORD GENERATION STARTING ===');
    console.log('Total input words:', this.words.length);
    
    // Try different letter combinations until we get at least MAX_WORDS words
    for (let letterAttempt = 0; letterAttempt < 10; letterAttempt++) {
      console.log(`=== LETTER SELECTION ATTEMPT ${letterAttempt + 1}/10 ===`);
      
      // Step 1: Select letters for puzzle
      this.selectRandomLetters();
      console.log('Selected letters:', this.selectedLetters);
      
      // Step 2: Filter words to only use those letters
      this.filterWordsByLetters();
      console.log('Filtered words count:', this.filteredWords.length);
      console.log('Sample filtered words:', this.filteredWords.slice(0, 10));
      
      if (this.filteredWords.length < this.MAX_WORDS) {
        console.log(`WARNING: Not enough words with selected letters for ${this.MAX_WORDS}-word puzzle:`, this.selectedLetters);
        console.log('Available filtered words:', this.filteredWords.length);
        continue; // Try different letters
      }
      
      // Try to build crossword with current letter selection
      for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
        if (attempt % 100 === 0) {
          console.log(`Crossword attempt ${attempt}/${this.maxAttempts} with letter set ${letterAttempt + 1}`);
        }
        const result = this.buildStructuredCrossword();
        if (result && result.words.length >= this.MAX_WORDS) {
          console.log(`=== CROSSWORD GENERATION SUCCESS WITH ${result.words.length} WORDS ===`);
          return result;
        }
      }
      
      console.log(`Letter set ${letterAttempt + 1} failed to produce ${this.MAX_WORDS}+ words. Trying new letters...`);
    }
    
    console.log(`=== CROSSWORD GENERATION FAILED - Could not achieve ${this.MAX_WORDS} words with any letter combination ===`);
    return null;
  }

  private selectRandomLetters(): void {
    // Māori alphabet consists of: a, e, i, o, u (vowels), ā, ē, ī, ō, ū (vowels with kahakō), h, k, m, n, ng, p, r, t, w, wh (consonants)
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const vowelsWithKahako = ['ā', 'ē', 'ī', 'ō', 'ū'];
    const consonants = ['h', 'k', 'm', 'n', 'ng', 'p', 'r', 't', 'w', 'wh'];
    
    let selectedLetters: string[] = [];
    
    // Select at most one vowel with kahakō (40% chance)
    const includeKahakoVowel = Math.random() < 0.4;
    let kahakoVowel: string | null = null;
    if (includeKahakoVowel) {
      kahakoVowel = vowelsWithKahako[Math.floor(Math.random() * vowelsWithKahako.length)];
    }
    
    // Select 7 letters from available letters
    const availableLetters = [...vowels, ...consonants];
    if (kahakoVowel) {
      availableLetters.push(kahakoVowel);
    }
    
    const shuffled = [...availableLetters].sort(() => Math.random() - 0.5);
    selectedLetters = shuffled.slice(0, this.LETTERS_PER_PUZZLE);
    
    this.selectedLetters = selectedLetters;
    
    console.log(`Selected exactly ${this.LETTERS_PER_PUZZLE} letters for crossword:`, this.selectedLetters);
    console.log('Kahakō vowel selected:', kahakoVowel || 'none');
  }

  private filterWordsByLetters(): void {
    this.filteredWords = this.words.filter(word => {
      // Check word length constraints
      if (word.length < this.MIN_WORD_LENGTH || word.length > this.MAX_WORD_LENGTH) {
        return false;
      }
      
      // Check if word contains only the selected letters
      const wordLetters = word.toLowerCase().split('');
      return wordLetters.every(letter => {
        return this.selectedLetters.includes(letter);
      });
    });
  }

  private buildStructuredCrossword(): CrosswordGrid | null {
    const grid: string[][] = Array(11).fill(null).map(() => 
      Array(12).fill('')
    );
    
    const placedWords: CrosswordWord[] = [];
    const usedWords = new Set<string>();

    // Step 1: Start with foundation words
    const foundationWords = this.filteredWords.filter(word => word.length >= this.MIN_FOUNDATION_LENGTH && word.length <= this.MAX_FOUNDATION_LENGTH);
    if (foundationWords.length < this.MIN_FOUNDATION_WORDS) {
      console.log(`Not enough foundation words (${this.MIN_FOUNDATION_LENGTH}-${this.MAX_FOUNDATION_LENGTH} letters)`);
      return null;
    }

    const shuffledFoundation = [...foundationWords].sort(() => Math.random() - 0.5);
    const selectedFoundation = shuffledFoundation.slice(0, 2);
    console.log('Foundation words selected:', selectedFoundation);

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
    console.log('Placed foundation word 1:', firstWord);

    // Place second foundation word vertically
    let wordNumber = 2;
    if (selectedFoundation.length > 1) {
      const secondWord = selectedFoundation[1];
      if (this.tryPlaceIntersectingWord(grid, placedWords, secondWord, usedWords, wordNumber)) {
        wordNumber++;
        console.log('Placed foundation word 2:', secondWord);
      }
    }

    // Step 2: Add medium words
    const mediumWords = this.filteredWords.filter(word => 
      word.length >= this.MIN_MEDIUM_LENGTH && word.length <= this.MAX_MEDIUM_LENGTH && !usedWords.has(word)
    );
    console.log('Available medium words:', mediumWords.length, mediumWords.slice(0, 10));
    
    let mediumWordsAdded = 0;
    for (const word of mediumWords) {
      if (mediumWordsAdded >= this.MAX_MEDIUM_WORDS || placedWords.length >= this.MAX_WORDS) break; // Stop when target reached
      
      console.log(`Trying to place medium word: ${word}`);
      if (this.tryPlaceIntersectingWord(grid, placedWords, word, usedWords, wordNumber)) {
        wordNumber++;
        mediumWordsAdded++;
        console.log(`SUCCESS: Placed medium word ${mediumWordsAdded}:`, word);
      } else {
        console.log(`FAILED: Could not place medium word:`, word);
      }
    }

    // Step 3: Add short words
    const shortWords = this.filteredWords.filter(word => 
      word.length === this.SHORT_WORD_LENGTH && !usedWords.has(word)
    );
    console.log('Available short words:', shortWords.length, shortWords.slice(0, 10));
    
    let shortWordsAdded = 0;
    for (const word of shortWords) {
      if (shortWordsAdded >= this.MAX_SHORT_WORDS || placedWords.length >= this.MAX_WORDS) break;
      
      console.log(`Trying to place short word: ${word}`);
      if (this.tryPlaceIntersectingWord(grid, placedWords, word, usedWords, wordNumber)) {
        wordNumber++;
        shortWordsAdded++;
        console.log(`SUCCESS: Placed short word ${shortWordsAdded}:`, word);
      } else {
        console.log(`FAILED: Could not place short word:`, word);
      }
    }

    console.log(`Crossword complete with ${placedWords.length} words:`);
    console.log(`- Foundation words (${this.MIN_FOUNDATION_LENGTH}-${this.MAX_FOUNDATION_LENGTH}): 2`);
    console.log(`- Medium words (${this.MIN_MEDIUM_LENGTH}-${this.MAX_MEDIUM_LENGTH}): ${mediumWordsAdded}`);
    console.log(`- Short words (${this.SHORT_WORD_LENGTH}): ${shortWordsAdded}`);
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

    // For each existing letter in the grid, try to find words that use it
    for (let row = 0; row < 11 && wordsAdded < maxAdditionalWords; row++) {
      for (let col = 0; col < 12 && wordsAdded < maxAdditionalWords; col++) {
        const existingLetter = grid[row][col];
        
        if (existingLetter !== '') {
          // Try to place words using this letter as an intersection point
          for (const word of availableWords) {
            if (wordsAdded >= maxAdditionalWords) break;
            
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
