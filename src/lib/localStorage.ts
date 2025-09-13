const gameStateKey = 'gameState'

type StoredGameState = {
  guesses: string[][]
  solution: string
}

export const saveGameStateToLocalStorage = (gameState: StoredGameState, language: string, wordLength: number) => {
  const gameStateKeyWithLanguageAndLength = `${gameStateKey}_${language}_${wordLength}`
  localStorage.setItem(gameStateKeyWithLanguageAndLength, JSON.stringify(gameState))
}

export const loadGameStateFromLocalStorage = (language: string, wordLength: number) => {
  const gameStateKeyWithLanguageAndLength = `${gameStateKey}_${language}_${wordLength}`
  const state = localStorage.getItem(gameStateKeyWithLanguageAndLength)
  return state ? (JSON.parse(state) as StoredGameState) : null
}

const gameStatKey = 'gameStats'

export type GameStats = {
  winDistribution: number[]
  gamesFailed: number
  currentStreak: number
  bestStreak: number
  totalGames: number
  successRate: number
}

export type MultiLanguageStats = {
  [languageAndLength: string]: GameStats  // Keys like "hawaiian_5", "hawaiian_6"
}

export const saveStatsToLocalStorage = (gameStats: GameStats, language: string, wordLength: number) => {
  const existingStats = loadAllStatsFromLocalStorage()
  const key = `${language}_${wordLength}`
  existingStats[key] = gameStats
  localStorage.setItem(gameStatKey, JSON.stringify(existingStats))
}

export const loadStatsFromLocalStorage = (language: string, wordLength: number): GameStats | null => {
  const allStats = loadAllStatsFromLocalStorage()
  const key = `${language}_${wordLength}`
  return allStats[key] || null
}

export const loadAllStatsFromLocalStorage = (): MultiLanguageStats => {
  const stats = localStorage.getItem(gameStatKey)
  return stats ? (JSON.parse(stats) as MultiLanguageStats) : {}
}

const languageKey = 'selectedLanguage'

export const saveLanguageToLocalStorage = (language: string) => {
  localStorage.setItem(languageKey, language)
}

export const loadLanguageFromLocalStorage = () => {
  return localStorage.getItem(languageKey) || 'hawaiian'
}