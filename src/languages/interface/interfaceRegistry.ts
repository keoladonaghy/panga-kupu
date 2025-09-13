// Interface language registry
import { InterfaceLanguageEntry } from './types'

const INTERFACE_LANGUAGE_REGISTRY: InterfaceLanguageEntry[] = [
  {
    name: 'english',
    displayName: 'English',
    enabled: true
  },
  {
    name: 'hawaiian',
    displayName: 'ʻŌlelo Hawaiʻi',
    enabled: false // Can be enabled later
  },
  {
    name: 'maori',
    displayName: 'Te Reo Māori',
    enabled: false // Can be enabled later
  }
]

export const getEnabledInterfaceLanguages = (): InterfaceLanguageEntry[] => {
  return INTERFACE_LANGUAGE_REGISTRY.filter(lang => lang.enabled)
}

export const getInterfaceLanguageByName = (name: string): InterfaceLanguageEntry | undefined => {
  return INTERFACE_LANGUAGE_REGISTRY.find(lang => lang.name === name)
}

export const getDefaultInterfaceLanguage = (): InterfaceLanguageEntry => {
  return INTERFACE_LANGUAGE_REGISTRY.find(lang => lang.name === 'english') || INTERFACE_LANGUAGE_REGISTRY[0]
}