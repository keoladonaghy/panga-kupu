import { useEffect, useState } from 'react'

// StyleSheet-like approach for easier React Native conversion
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
    opacity: animationState === 'sliding' || animationState === 'complete'
      ? 1
      : 0,
    color: 'hsl(35, 85%, 58%)'
  },
  finalText: {
    transform: animationState === 'sliding' || animationState === 'complete'
      ? 'translateX(0)'
      : 'translateX(20px)',
    opacity: animationState === 'complete' ? 1 : 0,
    transition: 'all 0.5s ease-in-out',
    display: 'flex',
    alignItems: 'baseline' as const
  },
  finalLeftText: {
    color: 'hsl(0 0% 96%)'
  },
  finalRightText: {
    color: 'hsl(35, 85%, 58%)',
    textAlign: 'left' as const
  },
  iconsContainer: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '4px'
  }
})

interface HeaderIcon {
  icon: React.ComponentType<{ className?: string; onClick?: () => void }> | string
  onClick: () => void
}

interface HeaderProps {
  // Language animation config
  languages: string[] // e.g., ['Olelo Hawaii', 'Reo Maori', 'Parau Tahiti', 'Gagana Samoa']
  languageDuration?: number // ms per language (default: 1000)

  // Right-side text config
  rightText: string // e.g., 'Tech Workshop'
  gameName: string // e.g., 'Word Finder'

  // Icons config (completely customizable per game)
  icons: HeaderIcon[] // Array of icon components with their click handlers

  // Optional styling
  centerAxisOffset?: string // CSS value for center axis position (default: '50%')
}

const Header = ({
  languages,
  languageDuration = 700,
  rightText,
  gameName,
  icons,
  centerAxisOffset = '50%',
}: HeaderProps) => {
  // Calculate the axis position based on the longest language name
  const longestLanguage = languages.reduce(
    (longest, current) => (current.length > longest.length ? current : longest),
    ''
  )

  // Approximate character width calculation (adjust multiplier as needed)
  const charWidth = 0.65 // roughly 0.65em per character for bold font with letter spacing
  const longestWidth = longestLanguage.length * charWidth
  const gapWidth = 0.5 // 0.5em gap between blocks
  const [animationState, setAnimationState] = useState<
    'initial' | 'fading' | 'sliding' | 'complete'
  >('initial')
  const [currentLanguageIndex, setCurrentLanguageIndex] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  // Create styles object (similar to StyleSheet.create in React Native)
  const styles = createStyles(animationState, longestWidth)

  useEffect(() => {
    // Check if animation has already played this session
    const animationPlayed = sessionStorage.getItem('headerAnimationPlayed')
    if (animationPlayed) {
      setHasAnimated(true)
      setAnimationState('complete')
      return
    }

    // Start the animation sequence
    let timeoutId: NodeJS.Timeout

    const runAnimation = () => {
      // Start with "Reo Moana Code Works" for 2 seconds
      setAnimationState('initial')
      
      setTimeout(() => {
        // Fade out "Code Works"
        setAnimationState('fading')
        
        setTimeout(() => {
          // Fade in "[Game Name]"
          setAnimationState('sliding')
          
          setTimeout(() => {
            // Complete the animation and stay on final state
            setAnimationState('complete')
            setHasAnimated(true)
            sessionStorage.setItem('headerAnimationPlayed', 'true')
          }, 1000) // 1 second for fade in transition
        }, 500) // 0.5 second fade out
      }, 2000) // 2 seconds hold on "Code Works"
    }

    timeoutId = setTimeout(runAnimation, 100)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [languages, languageDuration])

  // Static version for return visits
  if (hasAnimated || sessionStorage.getItem('headerAnimationPlayed')) {
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
              const IconComponent = iconConfig.icon
              if (typeof IconComponent === 'string') {
                return (
                  <span
                    key={index}
                    className="text-2xl cursor-pointer hover:opacity-75"
                    onClick={iconConfig.onClick}
                    style={{ lineHeight: '32px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {IconComponent}
                  </span>
                )
              }
              return (
                <IconComponent
                  key={index}
                  className="h-8 w-8 cursor-pointer text-blue-400 hover:text-blue-300"
                  onClick={iconConfig.onClick}
                />
              )
            })}
          </div>
        </div>
      </>
    )
  }

  const currentLanguage = languages[currentLanguageIndex]

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
            const IconComponent = iconConfig.icon
            if (typeof IconComponent === 'string') {
              return (
                <span
                  key={index}
                  className="text-2xl cursor-pointer hover:opacity-75"
                  onClick={iconConfig.onClick}
                  style={{ lineHeight: '32px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {IconComponent}
                </span>
              )
            }
            return (
              <IconComponent
                key={index}
                className="h-8 w-8 cursor-pointer text-blue-400 hover:text-blue-300"
                onClick={iconConfig.onClick}
              />
            )
          })}
        </div>
      </div>
    </>
  )
}

export default Header
