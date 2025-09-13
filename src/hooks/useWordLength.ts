import { useState, useEffect } from 'react'
import { calculateMaxAttempts } from '../config/gameConfig'

const WORD_LENGTH_STORAGE_KEY = 'kimiKupuWordLength'

export interface UseWordLengthResult {
  wordLength: number
  setWordLength: (length: number) => void
  getMaxAttempts: (length?: number) => number
}

export const useWordLength = (initialLength = 5): UseWordLengthResult => {
  const [wordLength, setWordLengthState] = useState(() => {
    // Try to load from localStorage on initialization
    const stored = localStorage.getItem(WORD_LENGTH_STORAGE_KEY)
    if (stored) {
      const parsed = parseInt(stored)
      if (!isNaN(parsed) && (parsed === 5 || parsed === 6)) {
        return parsed
      }
    }
    return initialLength
  })

  const setWordLength = (length: number) => {
    setWordLengthState(length)
    localStorage.setItem(WORD_LENGTH_STORAGE_KEY, length.toString())
  }

  const getMaxAttempts = (length?: number) => {
    return calculateMaxAttempts(length || wordLength)
  }

  return {
    wordLength,
    setWordLength,
    getMaxAttempts
  }
}