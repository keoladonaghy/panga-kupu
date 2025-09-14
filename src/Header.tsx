import React, { useEffect, useState } from 'react'
import { GAME_CONFIG, createHeaderStyle } from '@/config/gameConfig'

// Simple header with just background and icons
const createStyles = () => {
  const headerStyle = createHeaderStyle()
  
  return {
    headerGradient: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      pointerEvents: 'none' as const,
      background: GAME_CONFIG.header.background
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between' as const,
      alignItems: 'baseline' as const,
      width: '100%',
      paddingTop: GAME_CONFIG.header.padding.top,
      paddingBottom: GAME_CONFIG.header.padding.bottom,
      paddingLeft: GAME_CONFIG.header.padding.left,
      paddingRight: GAME_CONFIG.header.padding.right,
      minHeight: '1.2em'
    },
    reoMoanaText: {
      color: GAME_CONFIG.brand.backgroundColor,
      fontFamily: GAME_CONFIG.typography.fontFamily,
      fontSize: GAME_CONFIG.typography.header.fontSize,
      fontWeight: GAME_CONFIG.typography.header.fontWeight,
      letterSpacing: GAME_CONFIG.typography.header.letterSpacing,
      lineHeight: GAME_CONFIG.typography.header.lineHeight
    },
    codeWorksText: {
      color: GAME_CONFIG.brand.backgroundColor,
      fontFamily: GAME_CONFIG.typography.fontFamily,
      fontSize: GAME_CONFIG.typography.header.fontSize,
      fontWeight: GAME_CONFIG.typography.header.fontWeight,
      letterSpacing: GAME_CONFIG.typography.header.letterSpacing,
      lineHeight: GAME_CONFIG.typography.header.lineHeight,
      transition: GAME_CONFIG.animations.headerTransition
    },
    gameTitleText: {
      color: GAME_CONFIG.brand.primaryColor,
      fontFamily: GAME_CONFIG.typography.fontFamily,
      fontSize: GAME_CONFIG.typography.header.fontSize,
      fontWeight: GAME_CONFIG.typography.header.fontWeight,
      letterSpacing: GAME_CONFIG.typography.header.letterSpacing,
      lineHeight: GAME_CONFIG.typography.header.lineHeight,
      transition: GAME_CONFIG.animations.headerTransition
    },
    iconsContainer: {
      display: 'flex',
      alignItems: 'baseline' as const,
      gap: GAME_CONFIG.layout.iconGap
    }
  }
}

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
        }, GAME_CONFIG.header.animation.fadeTime) // fade out time
      }, GAME_CONFIG.header.animation.holdTime) // hold time for "Code Works"
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
                      fontSize: GAME_CONFIG.layout.iconFontSize,
                      cursor: 'pointer', 
                      opacity: 1,
                      lineHeight: GAME_CONFIG.layout.iconSize, 
                      width: GAME_CONFIG.layout.iconSize, 
                      height: GAME_CONFIG.layout.iconSize, 
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
                    width: GAME_CONFIG.layout.iconSize,
                    height: GAME_CONFIG.layout.iconSize,
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