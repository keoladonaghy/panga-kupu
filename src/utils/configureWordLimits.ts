import { updateWordLimitsForLanguage, validateWordLimits, type LanguageWordLimits, type AllLanguageLimits } from '@/config/languageWordLimits';

/**
 * Utility function to easily configure word length limits for different languages
 * This provides a convenient interface for updating language-specific settings
 */

export interface WordLimitConfiguration {
  language: 'haw' | 'mao' | 'en';
  minWordLength: number;
  maxWordLength: number;
}

/**
 * Configure word limits for a specific language
 * @param config - Configuration object with language and word length limits
 * @returns Updated configuration for all languages
 * @throws Error if limits are invalid
 */
export function configureWordLimits(config: WordLimitConfiguration): AllLanguageLimits {
  const limits: LanguageWordLimits = {
    minWordLength: config.minWordLength,
    maxWordLength: config.maxWordLength
  };

  // Validate the limits
  if (!validateWordLimits(limits)) {
    throw new Error(
      `Invalid word limits for ${config.language}: ` +
      `minWordLength (${config.minWordLength}) must be >= 1 and ` +
      `maxWordLength (${config.maxWordLength}) must be >= minWordLength and <= 15`
    );
  }

  return updateWordLimitsForLanguage(config.language, limits);
}

/**
 * Configure word limits for multiple languages at once
 * @param configs - Array of configuration objects
 * @returns Updated configuration for all languages
 */
export function configureMultipleWordLimits(configs: WordLimitConfiguration[]): AllLanguageLimits {
  let result = updateWordLimitsForLanguage('haw', { minWordLength: 3, maxWordLength: 5 });
  
  for (const config of configs) {
    const limits: LanguageWordLimits = {
      minWordLength: config.minWordLength,
      maxWordLength: config.maxWordLength
    };

    if (!validateWordLimits(limits)) {
      throw new Error(
        `Invalid word limits for ${config.language}: ` +
        `minWordLength (${config.minWordLength}) must be >= 1 and ` +
        `maxWordLength (${config.maxWordLength}) must be >= minWordLength and <= 15`
      );
    }

    result = updateWordLimitsForLanguage(config.language, limits);
  }

  return result;
}

/**
 * Quick presets for common word length configurations
 */
export const WORD_LIMIT_PRESETS = {
  // Very short words only
  SHORT: { minWordLength: 3, maxWordLength: 4 },
  
  // Standard range (default)
  STANDARD: { minWordLength: 3, maxWordLength: 5 },
  
  // Medium range
  MEDIUM: { minWordLength: 3, maxWordLength: 6 },
  
  // Long words included
  LONG: { minWordLength: 4, maxWordLength: 8 },
  
  // Very flexible range
  FLEXIBLE: { minWordLength: 2, maxWordLength: 10 }
} as const;

/**
 * Apply a preset configuration to a language
 * @param language - Target language
 * @param preset - Preset name
 * @returns Updated configuration for all languages
 */
export function applyPresetToLanguage(
  language: 'haw' | 'mao' | 'en', 
  preset: keyof typeof WORD_LIMIT_PRESETS
): AllLanguageLimits {
  const limits = WORD_LIMIT_PRESETS[preset];
  return configureWordLimits({
    language,
    ...limits
  });
}