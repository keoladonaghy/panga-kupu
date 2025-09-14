import React, { useEffect, useState } from 'react'

// Simple header with just background and icons
const createStyles = () => ({
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
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'baseline' as const,
    width: '100%',
    paddingTop: '2px',
    paddingBottom: '16px',
    paddingLeft: '8px',
    paddingRight: '20px',
    minHeight: '1.2em'
  },
  reoMoanaText: {
    color: 'hsl(0 0% 96%)',
    fontFamily: 'BCSans, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: 0.3,
    lineHeight: 1
  },
  codeWorksText: {
    color: 'hsl(0 0% 96%)',
    fontFamily: 'BCSans, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: 0.3,
    lineHeight: 1,
    transition: 'opacity 1s ease-in-out'
  },
  gameTitleText: {
    color: 'hsl(35, 85%, 58%)',
    fontFamily: 'BCSans, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: 0.3,
    lineHeight: 1,
    transition: 'opacity 1s ease-in-out'
  },
  iconsContainer: {
    display: 'flex',
    alignItems: 'baseline' as const,
    gap: '4px'
  }
})

interface HeaderIcon {
  icon: React.ComponentType<{ className?: string; onClick?: () => void }> | string
  onClick: () => void
}

interface HeaderProps {
  // Icons config (completely customizable per game)
  icons: HeaderIcon[] // Array of icon components with their click handlers
  // Game title for animation
  gameTitle: string // e.g., 'Panga Kupu'
}

const Header = ({ icons, gameTitle }: HeaderProps) => {
  const [animationState, setAnimationState] = useState<'initial' | 'fading' | 'complete'>('initial')
  const [hasAnimated, setHasAnimated] = useState(false)

  // Create styles object (similar to StyleSheet.create in React Native)
  const styles = createStyles()

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
        // Fade out "Code Works" over 1 second
        setAnimationState('fading')
        
        setTimeout(() => {
          // Complete animation and fade in game title
          setAnimationState('complete')
          setHasAnimated(true)
          sessionStorage.setItem('headerAnimationPlayed', 'true')
        }, 1000) // 1 second fade out
      }, 2000) // 2 seconds hold on "Code Works"
    }

    timeoutId = setTimeout(runAnimation, 100)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  // Static version for return visits
  if (hasAnimated || sessionStorage.getItem('headerAnimationPlayed')) {
    return (
      <>
        <div style={styles.headerGradient} />

        <div style={styles.headerContainer}>
          <div>
            <span style={styles.reoMoanaText}>Reo Moana </span>
            <span style={styles.gameTitleText}>{gameTitle}</span>
          </div>
          <div style={styles.iconsContainer}>
            {icons.map((iconConfig, index) => {
              const IconComponent = iconConfig.icon
              if (typeof IconComponent === 'string') {
                return (
                  <span
                    key={index}
                    onClick={iconConfig.onClick}
                    style={{ 
                      fontSize: 18,
                      cursor: 'pointer', 
                      opacity: 1,
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
                )
              }
              return (
                <div
                  key={index}
                  onClick={iconConfig.onClick}
                  style={{
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    color: '#60A5FA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconComponent />
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div style={styles.headerGradient} />

      <div style={styles.headerContainer}>
        <div>
          <span style={styles.reoMoanaText}>Reo Moana </span>
          <span style={{
            ...styles.codeWorksText,
            opacity: animationState === 'fading' ? 0 : 1
          }}>Code Works</span>
          <span style={{
            ...styles.gameTitleText,
            opacity: animationState === 'complete' ? 1 : 0
          }}>{gameTitle}</span>
        </div>
        <div style={styles.iconsContainer}>
          {icons.map((iconConfig, index) => {
            const IconComponent = iconConfig.icon
            if (typeof IconComponent === 'string') {
              return (
                <span
                  key={index}
                  onClick={iconConfig.onClick}
                  style={{ 
                    fontSize: 18,
                    cursor: 'pointer', 
                    opacity: 1,
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
              )
            }
            return (
              <div
                key={index}
                onClick={iconConfig.onClick}
                style={{
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  color: '#60A5FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconComponent />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default Header