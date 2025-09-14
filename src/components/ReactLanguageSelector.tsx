import React, { useState } from 'react';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import type { SupportedLanguage } from '@/contexts/LanguageContext';
import { GAME_CONFIG, createModalStyle } from '@/config/gameConfig';

interface ReactLanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReactLanguageSelector: React.FC<ReactLanguageSelectorProps> = ({ isOpen, onClose }) => {
  const { 
    interfaceLanguage, 
    gameLanguage, 
    setInterfaceLanguage, 
    setGameLanguage
  } = useLanguageContext();
  const { t } = useTranslation();

  // Local state for pending selections
  const [pendingInterfaceLanguage, setPendingInterfaceLanguage] = useState<SupportedLanguage>(interfaceLanguage);
  const [pendingGameLanguage, setPendingGameLanguage] = useState<SupportedLanguage>(gameLanguage);

  const interfaceLanguages = GAME_CONFIG.languageSelector.sections.interface.languages;
  const gameLanguages = GAME_CONFIG.languageSelector.sections.game.languages;

  // Handle applying changes
  const handleApply = () => {
    setInterfaceLanguage(pendingInterfaceLanguage);
    setGameLanguage(pendingGameLanguage);
    onClose();
  };

  // Handle canceling changes
  const handleCancel = () => {
    setPendingInterfaceLanguage(interfaceLanguage);
    setPendingGameLanguage(gameLanguage);
    onClose();
  };

  // Reset pending changes when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPendingInterfaceLanguage(interfaceLanguage);
      setPendingGameLanguage(gameLanguage);
    }
  }, [isOpen, interfaceLanguage, gameLanguage]);

  if (!isOpen) return null;

  const modalStyles = createModalStyle();
  const { overlay: overlayStyle, container: modalStyle } = modalStyles;

  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontWeight: GAME_CONFIG.typography.modal.title.fontWeight,
    color: 'rgb(17, 24, 39)',
    marginBottom: '12px',
    fontSize: GAME_CONFIG.typography.modal.title.fontSize
  };

  const radioGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const radioItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const radioButtonStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid rgb(209, 213, 219)',
    backgroundColor: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const radioButtonCheckedStyle: React.CSSProperties = {
    ...radioButtonStyle,
    borderColor: GAME_CONFIG.brand.primaryColor,
    backgroundColor: GAME_CONFIG.brand.primaryColor
  };

  const radioButtonInnerStyle: React.CSSProperties = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'white'
  };

  const radioLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    cursor: 'pointer',
    color: 'rgb(55, 65, 81)'
  };

  const radioLabelDisabledStyle: React.CSSProperties = {
    ...radioLabelStyle,
    color: 'rgb(156, 163, 175)',
    cursor: 'not-allowed'
  };

  const acknowledgmentStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'rgb(107, 114, 128)',
    fontStyle: 'italic',
    borderTop: '1px solid rgb(243, 244, 246)',
    paddingTop: '12px',
    marginBottom: '16px'
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid rgb(229, 231, 235)'
  };

  const buttonBaseStyle: React.CSSProperties = {
    flex: 1,
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '6px',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease'
  };

  const cancelButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: 'white',
    color: 'rgb(55, 65, 81)',
    border: '1px solid rgb(209, 213, 219)'
  };

  const applyButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: GAME_CONFIG.brand.primaryColor,
    color: 'white'
  };


  return (
    <div style={overlayStyle} onClick={handleCancel}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Interface Language Section */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>{GAME_CONFIG.languageSelector.sections.interface.title}</h3>
          <div style={radioGroupStyle}>
            {interfaceLanguages.map((lang) => (
              <div key={lang.code} style={radioItemStyle}>
                <div
                  style={pendingInterfaceLanguage === lang.code ? radioButtonCheckedStyle : radioButtonStyle}
                  onClick={() => !lang.disabled && setPendingInterfaceLanguage(lang.code as SupportedLanguage)}
                >
                  {pendingInterfaceLanguage === lang.code && <div style={radioButtonInnerStyle} />}
                </div>
                <label
                  style={lang.disabled ? radioLabelDisabledStyle : radioLabelStyle}
                  onClick={() => !lang.disabled && setPendingInterfaceLanguage(lang.code as SupportedLanguage)}
                >
                  {lang.name}
                  {lang.disabled && (
                    <span style={{ fontSize: '12px', color: 'rgb(156, 163, 175)', marginLeft: '4px' }}>
                      (under development)
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Game Language Section */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>{GAME_CONFIG.languageSelector.sections.game.title}</h3>
          <div style={radioGroupStyle}>
            {gameLanguages.map((lang) => (
              <div key={lang.code} style={radioItemStyle}>
                <div
                  style={pendingGameLanguage === lang.code ? radioButtonCheckedStyle : radioButtonStyle}
                  onClick={() => !lang.disabled && setPendingGameLanguage(lang.code as SupportedLanguage)}
                >
                  {pendingGameLanguage === lang.code && <div style={radioButtonInnerStyle} />}
                </div>
                <label
                  style={lang.disabled ? radioLabelDisabledStyle : radioLabelStyle}
                  onClick={() => !lang.disabled && setPendingGameLanguage(lang.code as SupportedLanguage)}
                >
                  {lang.name}
                  {lang.disabled && (
                    <span style={{ fontSize: '12px', color: 'rgb(156, 163, 175)', marginLeft: '4px' }}>
                      (under development)
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Thank you message to Mary Boyce */}
        <div style={acknowledgmentStyle}>
          {GAME_CONFIG.languageSelector.acknowledgment}
        </div>

        {/* Action Buttons */}
        <div style={buttonContainerStyle}>
          <button
            onClick={handleCancel}
            style={cancelButtonStyle}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            style={applyButtonStyle}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReactLanguageSelector;