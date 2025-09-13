// Interface language types

export interface InterfaceTexts {
  loading: string
  game: {
    title: string
    subtitle?: string
    messages: {
      notEnoughLetters: string
      wordNotFound: string
      gameLost: string
      gameWon: string
    }
  }
  instructions: {
    title: string
    howToPlay: string
    examples: string
    close: string
  }
  languageDropdown: {
    interfaceLanguage: string
    gameLanguage: string
    ok: string
    cancel: string
  }
  stats: {
    title: string
    totalGames: string
    successRate: string
    currentStreak: string
    bestStreak: string
    distribution: string
    share: string
  }
}

export interface InterfaceLanguageEntry {
  name: string
  displayName: string
  enabled: boolean
}