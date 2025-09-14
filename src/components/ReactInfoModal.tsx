import React from 'react';
import { GAME_CONFIG, createModalStyle } from '@/config/gameConfig';

interface ReactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReactInfoModal: React.FC<ReactInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const modalStyles = createModalStyle();
  const { overlay: overlayStyle, container: modalStyle } = modalStyles;

  // Adjust modal positioning for info modal (centered instead of top-right)
  const infoOverlayStyle: React.CSSProperties = {
    ...overlayStyle,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '0',
    paddingRight: '20px',
    paddingLeft: '20px',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '16px'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontWeight: GAME_CONFIG.typography.modal.title.fontWeight,
    color: 'rgb(17, 24, 39)',
    marginBottom: '8px',
    fontSize: GAME_CONFIG.typography.modal.title.fontSize
  };

  const textStyle: React.CSSProperties = {
    fontSize: GAME_CONFIG.typography.modal.body.fontSize,
    color: 'rgb(75, 85, 99)',
    lineHeight: 1.5,
    marginBottom: '0'
  };

  const closeButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    fontSize: GAME_CONFIG.typography.button.fontSize,
    fontWeight: GAME_CONFIG.typography.button.fontWeight,
    backgroundColor: GAME_CONFIG.brand.primaryColor,
    color: 'white',
    border: 'none',
    borderRadius: GAME_CONFIG.modal.button.borderRadius,
    cursor: 'pointer',
    marginTop: '16px',
    transition: GAME_CONFIG.animations.buttonHover,
  };

  return (
    <div style={infoOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div>
          <h2 style={{
            ...sectionTitleStyle,
            fontSize: '18pt',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            How to Play - Pehea e pāʻani ai
          </h2>
        </div>

        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>Crossword Puzzle</h4>
          <p style={textStyle}>
            Find words in the crossword grid by tapping letters to form words. 
            Words can be horizontal or vertical.
          </p>
        </div>
        
        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>Special Characters</h4>
          <p style={textStyle}>
            Long-press vowel keys (A, E, I, O, U) to access macron characters (Ā, Ē, Ī, Ō, Ū).
            The 'okina (ʻ) is available on the keyboard.
          </p>
        </div>
        
        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>Word Validation</h4>
          <p style={textStyle}>
            Valid words will be highlighted when found. The game includes 
            Hawaiian, Māori, Tahitian, and Samoan vocabulary.
          </p>
        </div>

        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>Progress</h4>
          <p style={textStyle}>
            Your goal is to find all the words in the puzzle. 
            Progress is tracked and words found are saved.
          </p>
        </div>

        <button
          onClick={onClose}
          style={closeButtonStyle}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ReactInfoModal;