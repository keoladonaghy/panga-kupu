export interface LanguageWordLimits {
  minWordLength: number;
  maxWordLength: number;
}

export interface AllLanguageLimits {
  haw: LanguageWordLimits;
  mao: LanguageWordLimits;
  en: LanguageWordLimits;
}

// Default word length limits for each language
export const DEFAULT_WORD_LIMITS: AllLanguageLimits = {
  haw: {
    minWordLength: 3,
    maxWordLength: 5  // Updated from 4 to 5
  },
  mao: {
    minWordLength: 3,
    maxWordLength: 5  // Stays at 5
  },
  en: {
    minWordLength: 3,
    maxWordLength: 5
  }
};

// Function to get word limits for a specific language
export const getWordLimitsForLanguage = (language: 'haw' | 'mao' | 'en'): LanguageWordLimits => {
  return DEFAULT_WORD_LIMITS[language];
};

// Function to update word limits for a specific language
export const updateWordLimitsForLanguage = (
  language: 'haw' | 'mao' | 'en', 
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