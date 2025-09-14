// Shared Game Configuration
// This file centralizes all visual and functional constants for easy maintenance
// and consistency across KimiKupu and PangaKupu

export const GAME_CONFIG = {
  // Brand Identity
  brand: {
    primaryColor: 'hsl(35, 85%, 58%)', // Gold/orange for "Panga Kupu" text and buttons
    textColor: 'hsl(0, 0%, 20%)',      // Dark text on buttons
    disabledColor: 'hsl(210, 15%, 50%)', // Disabled button background
    disabledTextColor: 'hsl(0, 0%, 70%)', // Disabled button text
    backgroundColor: 'hsl(0 0% 96%)',   // Light text color
  },

  // Typography
  typography: {
    fontFamily: 'BCSans, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    header: {
      fontSize: '14pt',
      fontWeight: 800,
      letterSpacing: 0.3,
      lineHeight: 1,
    },
    button: {
      fontSize: '14pt',
      fontWeight: 600,
    },
    modal: {
      title: { fontSize: '16pt', fontWeight: 600 },
      body: { fontSize: '14pt', fontWeight: 400 },
      small: { fontSize: '12pt', fontWeight: 400 },
    }
  },

  // Layout & Spacing
  layout: {
    headerHeight: '60px',
    iconSize: '32px',
    iconFontSize: '18pt',
    iconGap: '4px',
    buttonBorderRadius: '8px',
    modalBorderRadius: '8px',
    modalPadding: '24px',
    modalWidth: '320px',
  },

  // Game Buttons (help buttons around the wheel)
  gameButtons: {
    size: '48px',
    iconSize: '32px',
    borderWidth: '1px',
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '8px',
    gap: '8px',
    transition: 'all 0.2s ease',
    hover: {
      scale: 1.1,
    }
  },

  // Header Configuration
  header: {
    background: 'linear-gradient(135deg, #061428 0%, #0b2a3c 5%, #6d949e 50%, #07253a 80%, #020a14 100%)',
    padding: {
      top: '2px',
      bottom: '16px',
      left: '8px',
      right: '20px',
    },
    animation: {
      duration: '1s',
      holdTime: 2000, // ms to hold "Code Works"
      fadeTime: 1000,  // ms to fade transition
    }
  },

  // Modal System
  modal: {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
    },
    container: {
      backgroundColor: 'white',
      border: '1px solid rgb(229, 231, 235)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      borderRadius: '8px',
    },
    button: {
      height: '36px',
      borderRadius: '6px',
      fontSize: '14pt',
      fontWeight: 500,
    }
  },

  // Language Selector Configuration
  languageSelector: {
    position: 'top-right',
    offsetTop: '60px',
    offsetRight: '20px',
    sections: {
      interface: {
        title: 'Interface Language',
        languages: [
          { code: 'haw', name: 'ʻŌlelo Hawaiʻi', disabled: false },
          { code: 'mao', name: 'Te Reo Māori', disabled: true },
          { code: 'en', name: 'English', disabled: false }
        ]
      },
      game: {
        title: 'Word List Language', 
        languages: [
          { code: 'haw', name: 'ʻŌlelo Hawaiʻi', disabled: false },
          { code: 'mao', name: 'Te Reo Māori', disabled: false },
          { code: 'tah', name: 'Reo Tahiti', disabled: true }
        ]
      }
    },
    acknowledgment: 'He mihi nui ki a Mary Boyce nāna i whakapakari ngā kupu Māori.',
  },

  // Game-specific Features (expandable for future)
  features: {
    wordLengths: [4, 5, 6, 7, 8], // Available word lengths
    hints: {
      enabled: true,
      defaultAttempts: 3,
    },
    reveal: {
      enabled: true,
    },
    crossword: {
      enabled: true,
      gridSize: { width: 15, height: 15 },
    }
  },

  // Icon Configuration
  icons: {
    // Shared icons across both games
    info: '📖',
    language: '🌐',
    hint: '💡',      // Lightbulb
    reveal: '👁️',    // Eye
    refresh: '🔄',   // Could be emoji or Lucide component
    clear: '🗑️',     // Trash
    backspace: '⌫',  // Backspace
    
    // Game-specific icons can be added here
    // kimiKupu: { ... },
    // pangaKupu: { ... }
  },

  // Animation & Transitions
  animations: {
    buttonHover: '0.2s ease',
    modalFadeIn: '0.3s ease-out',
    modalFadeOut: '0.2s ease-in',
    headerTransition: '1s ease-in-out',
  }
} as const;

// Helper functions for common styling patterns
export const createButtonStyle = (isActive: boolean, isDisabled: boolean = false) => ({
  backgroundColor: isDisabled 
    ? GAME_CONFIG.brand.disabledColor 
    : (isActive ? GAME_CONFIG.brand.primaryColor : GAME_CONFIG.brand.primaryColor),
  color: isDisabled 
    ? GAME_CONFIG.brand.disabledTextColor 
    : GAME_CONFIG.brand.textColor,
  fontSize: GAME_CONFIG.typography.button.fontSize,
  fontWeight: GAME_CONFIG.typography.button.fontWeight,
  border: `${GAME_CONFIG.gameButtons.borderWidth} solid ${GAME_CONFIG.gameButtons.borderColor}`,
  borderRadius: GAME_CONFIG.gameButtons.borderRadius,
  transition: GAME_CONFIG.animations.buttonHover,
  cursor: isDisabled ? 'not-allowed' : 'pointer',
});

export const createModalStyle = () => ({
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: GAME_CONFIG.modal.overlay.backgroundColor,
    zIndex: GAME_CONFIG.modal.overlay.zIndex,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingTop: GAME_CONFIG.languageSelector.offsetTop,
    paddingRight: GAME_CONFIG.languageSelector.offsetRight,
  },
  container: {
    width: GAME_CONFIG.layout.modalWidth,
    padding: GAME_CONFIG.layout.modalPadding,
    backgroundColor: GAME_CONFIG.modal.container.backgroundColor,
    border: GAME_CONFIG.modal.container.border,
    boxShadow: GAME_CONFIG.modal.container.boxShadow,
    borderRadius: GAME_CONFIG.modal.container.borderRadius,
  }
});

export const createHeaderStyle = () => ({
  background: GAME_CONFIG.header.background,
  fontFamily: GAME_CONFIG.typography.fontFamily,
  fontSize: GAME_CONFIG.typography.header.fontSize,
  fontWeight: GAME_CONFIG.typography.header.fontWeight,
  letterSpacing: GAME_CONFIG.typography.header.letterSpacing,
  lineHeight: GAME_CONFIG.typography.header.lineHeight,
});

// Type exports for TypeScript support
export type GameConfig = typeof GAME_CONFIG;
export type SupportedLanguageCode = 'en' | 'haw' | 'mao' | 'tah';
