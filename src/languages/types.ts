// Language system types

export interface LanguageConfig {
  language: string
  wordLength: number
  tries: number
  gameName: string
  googleAnalytics?: string
}

export interface UnifiedWordEntry {
  word: string
  definition?: string
  frequency?: number
  category?: string
}

export interface LanguageData {
  config: LanguageConfig
  words: string[]  // Legacy format
  unifiedWords: UnifiedWordEntry[]  // New unified format
  orthography: string[]
  validGuesses?: string[]
}

export interface LanguageRegistryEntry {
  name: string
  displayName: string
  code: string
  config: LanguageConfig
  enabled: boolean
  features: {
    definitions: boolean
    multipleWordLengths: boolean
  }
}