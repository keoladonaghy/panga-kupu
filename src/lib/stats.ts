import { GameStats } from './localStorage'

// Calculate max attempts based on word length
const calculateMaxAttempts = (wordLength: number): number => {
  return wordLength + 1  // 5-letter = 6 attempts, 6-letter = 7 attempts
}

// In stats array elements 0-5 are successes in 1-6 trys

export const addStatsForCompletedGame = (
  gameStats: GameStats,
  count: number,
  wordLength: number
) => {
  // Count is number of incorrect guesses before end.
  const stats = { ...gameStats }
  stats.totalGames += 1
  const maxAttempts = calculateMaxAttempts(wordLength)
  if (count >= maxAttempts) {
    // A fail situation
    stats.currentStreak = 0
    stats.gamesFailed += 1
  } else {
    stats.winDistribution[count] += 1
    stats.currentStreak += 1
    if (stats.bestStreak < stats.currentStreak) {
      stats.bestStreak = stats.currentStreak
    }
  }
  stats.successRate = getSuccessRate(stats)
  // Removed saveStatsToLocalStorage call - App.tsx handles this now
  return stats
}

export const getDefaultStats = (wordLength: number): GameStats => {
  const maxAttempts = calculateMaxAttempts(wordLength)
  return {
    winDistribution: Array(maxAttempts).fill(0),
    gamesFailed: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalGames: 0,
    successRate: 0,
  }
}

export const loadStats = (wordLength: number) => {
  return getDefaultStats(wordLength)
}

const getSuccessRate = (gameStats: GameStats) => {
  const { totalGames, gamesFailed } = gameStats

  return Math.round(
    (100 * (totalGames - gamesFailed)) / Math.max(totalGames, 1)
  )
}