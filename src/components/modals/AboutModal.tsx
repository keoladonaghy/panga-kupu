import { BaseModal } from './BaseModal'

type Props = {
  isOpen: boolean
  handleClose: () => void
}

export const AboutModal = ({ isOpen, handleClose }: Props) => {
  return (
    <BaseModal
      title="About Panga Kupu"
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <div className="space-y-4 text-left">
        <div>
          <p className="text-sm text-gray-600">
            Panga Kupu is a crossword puzzle game featuring Indigenous Pacific languages 
            including Hawaiian, Māori, Tahitian, and Samoan vocabularies.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900">About the Languages</h4>
          <p className="text-sm text-gray-600">
            This game celebrates the rich linguistic heritage of Pacific Island cultures. 
            Each language has its own unique orthography and character sets, including 
            macrons and the 'okina.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900">Educational Purpose</h4>
          <p className="text-sm text-gray-600">
            Panga Kupu aims to promote language learning and cultural awareness 
            through interactive gameplay.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900">Acknowledgments</h4>
          <p className="text-sm text-gray-600">
            Mahalo to all the language communities and educators who contribute 
            to preserving and sharing these precious languages.
          </p>
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-gray-500">
            Part of the Reo Moana language game platform
          </p>
        </div>
      </div>
    </BaseModal>
  )
}