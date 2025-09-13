// Language registry for game languages
import { LanguageRegistryEntry } from './types'

// Simple registry for crossword game - can be expanded later
const LANGUAGE_REGISTRY: LanguageRegistryEntry[] = [
  {
    name: 'hawaiian',
    displayName: 'ʻŌlelo Hawaiʻi',
    code: 'haw',
    enabled: true,
    config: {
      language: 'ʻŌlelo Hawaiʻi',
      wordLength: 5,
      tries: 6,
      gameName: 'Panga Kupu'
    },
    features: {
      definitions: false,
      multipleWordLengths: true
    }
  },
  {
    name: 'maori',
    displayName: 'Te Reo Māori',
    code: 'mao',
    enabled: true,
    config: {
      language: 'Te Reo Māori',
      wordLength: 5,
      tries: 6,
      gameName: 'Panga Kupu'
    },
    features: {
      definitions: false,
      multipleWordLengths: true
    }
  },
  {
    name: 'tahitian',
    displayName: 'Reo Tahiti',
    code: 'tah',
    enabled: true,
    config: {
      language: 'Reo Tahiti',
      wordLength: 5,
      tries: 6,
      gameName: 'Panga Kupu'
    },
    features: {
      definitions: false,
      multipleWordLengths: false
    }
  }
]

export const getAvailableLanguages = (): string[] => {
  return LANGUAGE_REGISTRY.filter(lang => lang.enabled).map(lang => lang.name)
}

export const getDefaultLanguage = (): string => {
  return 'hawaiian'
}

export const getLanguageByName = (name: string): LanguageRegistryEntry | undefined => {
  return LANGUAGE_REGISTRY.find(lang => lang.name === name)
}

export const getAllLanguageNames = (): string[] => {
  return LANGUAGE_REGISTRY.map(lang => lang.name)
}

export const getKimiKupuLanguages = (): LanguageRegistryEntry[] => {
  return LANGUAGE_REGISTRY.filter(lang => lang.enabled)
}

export const getLanguageCodeMap = (): Record<string, string> => {
  const map: Record<string, string> = {}
  LANGUAGE_REGISTRY.forEach(lang => {
    map[lang.name] = lang.code
  })
  return map
}