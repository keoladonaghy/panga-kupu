import { BaseModal } from './BaseModal'

type Props = {
  isOpen: boolean
  handleClose: () => void
}

export const InfoModal = ({ isOpen, handleClose }: Props) => {
  return (
    <BaseModal
      title="How to Play - Pehea e pāʻani ai"
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <div className="space-y-4 text-left">
        <div>
          <h4 className="font-semibold text-gray-900">Crossword Puzzle</h4>
          <p className="text-sm text-gray-600">
            Find words in the crossword grid by tapping letters to form words. 
            Words can be horizontal or vertical.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900">Special Characters</h4>
          <p className="text-sm text-gray-600">
            Long-press vowel keys (A, E, I, O, U) to access macron characters (Ā, Ē, Ī, Ō, Ū).
            The 'okina (ʻ) is available on the keyboard.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900">Word Validation</h4>
          <p className="text-sm text-gray-600">
            Valid words will be highlighted when found. The game includes 
            Hawaiian, Māori, Tahitian, and Samoan vocabulary.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900">Progress</h4>
          <p className="text-sm text-gray-600">
            Your goal is to find all the words in the puzzle. 
            Progress is tracked and words found are saved.
          </p>
        </div>
      </div>
    </BaseModal>
  )
}