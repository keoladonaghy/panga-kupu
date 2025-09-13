// Interface language loader
import { InterfaceTexts } from './types'

export class InterfaceLanguageLoader {
  static async loadInterfaceTexts(languageName: string): Promise<InterfaceTexts> {
    try {
      // For now, only English is supported
      if (languageName !== 'english') {
        languageName = 'english'  // fallback to English
      }
      
      const module = await import(`./data/en.json`)
      return module.default as InterfaceTexts
    } catch (error) {
      console.error(`Failed to load interface texts for ${languageName}:`, error)
      
      // Fallback to basic English texts
      return {
        loading: 'Loading...',
        game: {
          title: 'Panga Kupu',
          messages: {
            notEnoughLetters: 'Not enough letters',
            wordNotFound: 'Word not found',
            gameLost: 'Game over!',
            gameWon: 'Congratulations!'
          }
        },
        instructions: {
          title: 'How to Play',
          howToPlay: 'Find words in the crossword',
          examples: 'Examples',
          close: 'Close'
        },
        languageDropdown: {
          interfaceLanguage: 'Interface Language',
          gameLanguage: 'Game Language',
          ok: 'OK',
          cancel: 'Cancel'
        },
        stats: {
          title: 'Statistics',
          totalGames: 'Total Games',
          successRate: 'Success Rate',
          currentStreak: 'Current Streak',
          bestStreak: 'Best Streak',
          distribution: 'Distribution',
          share: 'Share'
        }
      }
    }
  }
}