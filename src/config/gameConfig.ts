// Game configuration constants and utilities

export const GAME_CONFIG = {
  // Storage keys for different data types
  storageKeys: {
    languageSettings: 'kimiKupuLanguageSettings',
    gameState: 'gameState',
    gameStats: 'gameStats',
    interfaceLanguage: 'kimiKupuInterfaceLanguage'
  },
  
  // Default game settings
  defaults: {
    wordLength: 5,
    maxAttempts: 6,
    language: 'hawaiian',
    interfaceLanguage: 'english'
  },

  // Word length configuration
  wordLengths: {
    5: { maxAttempts: 6, label: '5-letter words' },
    6: { maxAttempts: 7, label: '6-letter words' }
  }
}

// Calculate max attempts based on word length
export const calculateMaxAttempts = (wordLength: number): number => {
  return GAME_CONFIG.wordLengths[wordLength as keyof typeof GAME_CONFIG.wordLengths]?.maxAttempts || wordLength + 1
}

// Get available word length options
export const getWordLengthOptions = () => {
  return Object.entries(GAME_CONFIG.wordLengths).map(([length, config]) => ({
    value: parseInt(length),
    label: config.label
  }))
}

// Game feature flags
export const FEATURES = {
  definitions: true,
  multipleWordLengths: true,
  statistics: true,
  languageSwitching: true
}