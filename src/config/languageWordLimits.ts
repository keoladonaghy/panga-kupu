export interface LanguageWordLimits {
  minWordLength: number;
  maxWordLength: number;
}

export interface AllLanguageLimits {
  haw: LanguageWordLimits;
  mao: LanguageWordLimits;
  tah: LanguageWordLimits;
  en: LanguageWordLimits;
}

// Default word length limits for each language
export const DEFAULT_WORD_LIMITS: AllLanguageLimits = {
  haw: {
    minWordLength: 3,
    maxWordLength: 4  // Reset back to 4
  },
  mao: {
    minWordLength: 3,
    maxWordLength: 5  // Stays at 5
  },
  tah: {
    minWordLength: 3,
    maxWordLength: 5  // Same as Māori for now
  },
  en: {
    minWordLength: 3,
    maxWordLength: 5
  }
};

// Function to get word limits for a specific language
export const getWordLimitsForLanguage = (language: 'haw' | 'mao' | 'tah' | 'en'): LanguageWordLimits => {
  return DEFAULT_WORD_LIMITS[language];
};

// Function to update word limits for a specific language
export const updateWordLimitsForLanguage = (
  language: 'haw' | 'mao' | 'tah' | 'en', 
  limits: LanguageWordLimits
): AllLanguageLimits => {
  return {
    ...DEFAULT_WORD_LIMITS,
    [language]: limits
  };
};

// Validation function to ensure limits are reasonable
export const validateWordLimits = (limits: LanguageWordLimits): boolean => {
  return (
    limits.minWordLength >= 1 &&
    limits.maxWordLength >= limits.minWordLength &&
    limits.maxWordLength <= 15 // Reasonable upper bound
  );
};