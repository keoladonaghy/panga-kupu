/**
 * KimiKupu-style Header Component for PangaKupu
 * 
 * This is a port of KimiKupu's beautiful header design with:
 * - Diagonal gradient background
 * - Animated title transitions
 * - Enhanced icon styling
 */

import { useEffect, useState } from 'react';

// StyleSheet-like approach (matching KimiKupu pattern)
const createStyles = (animationState: string, longestWidth: number) => ({
  headerGradient: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    pointerEvents: 'none' as const,
    background: 'linear-gradient(135deg, #061428 0%, #0b2a3c 5%, #6d949e 50%, #07253a 80%, #020a14 100%)'
  },
  staticHeaderContainer: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'baseline' as const,
    width: '100%',
    padding: '8px 20px 16px 4px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    fontSize: '14pt',
    fontWeight: 800,
    letterSpacing: '0.3px',
    lineHeight: '1em',
    minHeight: '1.2em',
    position: 'relative' as const
  },
  staticTextContainer: {
    display: 'flex',
    alignItems: 'baseline' as const,
    position: 'relative' as const
  },
  staticLeftTextBlock: {
    width: `${longestWidth}em`,
    textAlign: 'right' as const,
    marginRight: '0.5em',
    display: 'inline-block',
    whiteSpace: 'nowrap' as const,
    overflow: 'visible' as const
  },
  staticLeftText: {
    color: 'hsl(0 0% 96%)'
  },
  staticRightText: {
    color: 'hsl(35, 85%, 58%)',
    textAlign: 'left' as const
  },
  staticIconsContainer: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '4px'
  },
  animatedHeaderContainer: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'baseline' as const,
    width: '100%',
    padding: '8px 20px 16px 4px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    fontSize: '14pt',
    fontWeight: 800,
    letterSpacing: '0.3px',
    lineHeight: '1em',
    minHeight: '1.2em',
    position: 'relative' as const
  },
  animatedTextContainer: {
    display: 'flex',
    alignItems: 'baseline' as const,
    position: 'relative' as const
  },
  leftTextBlock: {
    width: `${longestWidth}em`,
    textAlign: 'right' as const,
    marginRight: '0.5em',
    display: 'inline-block',
    whiteSpace: 'nowrap' as const,
    overflow: 'visible' as const
  },
  persistentLeftText: {
    color: 'hsl(0 0% 96%)'
  },
  rightTextContainer: {
    position: 'relative' as const,
    textAlign: 'left' as const
  },
  codeWorksText: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    transition: 'opacity 1s ease-in-out',
    opacity: animationState === 'initial' || animationState === 'fading' 
      ? (animationState === 'fading' ? 0 : 1)
      : 0,
    color: 'hsl(0 0% 96%)'
  },
  gameNameText: {
    position: 'relative' as const,
    transition: 'opacity 1s ease-in-out',
    opacity: animationState === 'showing' || animationState === 'complete' ? 1 : 0,
    color: 'hsl(35, 85%, 58%)'
  },
  iconsContainer: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '4px'
  }
});

interface HeaderIcon {
  icon: React.ComponentType<{ className?: string; onClick?: () => void }> | string;
  onClick: () => void;
}

interface HeaderProps {
  // Game-specific config
  gameName?: string;
  
  // Icons for right side menu
  icons?: HeaderIcon[];
}

const KimiKupuHeader: React.FC<HeaderProps> = ({
  gameName = "Panga Kupu",
  icons = []
}) => {
  const [animationState, setAnimationState] = useState<'initial' | 'fading' | 'showing' | 'complete'>('initial');
  const [hasAnimated, setHasAnimated] = useState(false);

  // Calculate longest width for proper alignment
  const longestWidth = Math.max('Reo Moana'.length, gameName.length) * 0.6;

  useEffect(() => {
    // Check if animation has already been shown
    const hasShownAnimation = sessionStorage.getItem('kimiKupuHeaderAnimationShown');
    
    if (hasShownAnimation) {
      setAnimationState('complete');
      setHasAnimated(true);
      return;
    }

    // Animation sequence
    const timer1 = setTimeout(() => {
      setAnimationState('fading');
    }, 2000);

    const timer2 = setTimeout(() => {
      setAnimationState('showing');
    }, 3000);

    const timer3 = setTimeout(() => {
      setAnimationState('complete');
      setHasAnimated(true);
      sessionStorage.setItem('kimiKupuHeaderAnimationShown', 'true');
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const styles = createStyles(animationState, longestWidth);

  // Show static version after animation completes
  if (hasAnimated) {
    return (
      <>
        <div style={styles.headerGradient} />
        <div style={styles.staticHeaderContainer}>
          <div style={styles.staticTextContainer}>
            <div style={styles.staticLeftTextBlock}>
              <span style={styles.staticLeftText}>Reo Moana</span>
            </div>
            <span style={styles.staticRightText}>{gameName}</span>
          </div>
          <div style={styles.staticIconsContainer}>
            {icons.map((iconConfig, index) => {
              const IconComponent = iconConfig.icon;
              if (typeof IconComponent === 'string') {
                return (
                  <span
                    key={index}
                    className="text-2xl cursor-pointer hover:opacity-75"
                    onClick={iconConfig.onClick}
                    style={{ 
                      lineHeight: '32px', 
                      width: '32px', 
                      height: '32px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    {IconComponent}
                  </span>
                );
              }
              return (
                <IconComponent
                  key={index}
                  className="h-8 w-8 cursor-pointer text-blue-400 hover:text-blue-300"
                  onClick={iconConfig.onClick}
                />
              );
            })}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={styles.headerGradient} />

      <div style={styles.animatedHeaderContainer}>
        <div style={styles.animatedTextContainer}>
          {/* Always show Reo Moana */}
          <div style={styles.leftTextBlock}>
            <span style={styles.persistentLeftText}>Reo Moana</span>
          </div>
          
          {/* Overlapping right text for smooth transitions */}
          <div style={styles.rightTextContainer}>
            <span style={styles.codeWorksText}>Code Works</span>
            <span style={styles.gameNameText}>{gameName}</span>
          </div>
        </div>

        <div style={styles.iconsContainer}>
          {icons.map((iconConfig, index) => {
            const IconComponent = iconConfig.icon;
            if (typeof IconComponent === 'string') {
              return (
                <span
                  key={index}
                  className="text-2xl cursor-pointer hover:opacity-75"
                  onClick={iconConfig.onClick}
                  style={{ 
                    lineHeight: '32px', 
                    width: '32px', 
                    height: '32px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  {IconComponent}
                </span>
              );
            }
            return (
              <IconComponent
                key={index}
                className="h-8 w-8 cursor-pointer text-blue-400 hover:text-blue-300"
                onClick={iconConfig.onClick}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default KimiKupuHeader;