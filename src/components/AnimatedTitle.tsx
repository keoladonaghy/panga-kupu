import { useEffect, useRef, useState } from 'react';

const AnimatedTitle = () => {
  const leftRef = useRef<HTMLSpanElement>(null);
  const leftBoxRef = useRef<HTMLSpanElement>(null);
  const moanaRef = useRef<HTMLSpanElement>(null);
  const wordsRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  
  const [animationState, setAnimationState] = useState<'initial' | 'cycling' | 'sliding' | 'complete'>('initial');
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Temporarily disabled daily check - always show animation
    setShouldAnimate(true);
    
    const left = leftRef.current;
    const leftBox = leftBoxRef.current;
    const moana = moanaRef.current;
    const words = wordsRef.current;
    const measure = measureRef.current;

    if (!left || !leftBox || !moana || !words || !measure) return;
    
    // Only run animation if shouldAnimate is true
    if (!shouldAnimate) return;
    
    const candidates = ['ʻŌlelo', 'Kupu', 'Parau', 'Word Finder'];
    const measureText = (text: string): number => {
      measure.textContent = text;
      return measure.getBoundingClientRect().width;
    };

    // Set the width of the left box to accommodate all possible words
    leftBox.style.width = Math.ceil(Math.max(...candidates.map(measureText))) + 'px';

    const dissolveCycle = (txt: string, tStart: number) => {
      setTimeout(() => {
        left.textContent = txt;
        left.classList.remove('fade-out-1s');
        left.classList.add('fade-in-1s');
      }, tStart);
      
      setTimeout(() => {
        left.classList.remove('fade-in-1s');
        left.classList.add('fade-out-1s');
      }, tStart + 1000);
    };

    // Start animation sequence
    setTimeout(() => {
      left.classList.add('fade-out-1s');
      setAnimationState('cycling');
    }, 1000);

    dissolveCycle('Kupu', 2000);
    dissolveCycle('Parau', 4000);

    setTimeout(() => {
      setAnimationState('sliding');
      left.style.display = 'none';
      
      const header = leftBox.parentElement;
      if (header) {
        const gapPx = parseFloat(getComputedStyle(header).columnGap || getComputedStyle(header).gap || '0') || 0;
        const offset = leftBox.getBoundingClientRect().width + gapPx;
        moana.style.setProperty('--offset', offset + 'px');
        moana.classList.add('slide-full-left');

        const handleAnimationEnd = () => {
          const headerRect = header.getBoundingClientRect();
          const moanaRect = moana.getBoundingClientRect();
          const fs = parseFloat(getComputedStyle(moana).fontSize);
          words.style.left = (moanaRect.right - headerRect.left + 0.5 * fs) + 'px';
          words.classList.add('fade-in-1s');
          setAnimationState('complete');
        };

        moana.addEventListener('animationend', handleAnimationEnd, { once: true });
      }
    }, 6000);

    // Cleanup function
    return () => {
      if (moana) {
        moana.removeEventListener('animationend', () => {});
      }
    };
  }, [shouldAnimate]);

  return (
    <>
      <style>
        {`
          .animated-title-container {
            --deep-orange: 14 85% 50%;
            --dark-blue: 220 85% 25%;
            position: relative;
            display: flex;
            align-items: flex-start;
            gap: 0.4rem;
            font-weight: 800;
            letter-spacing: 0.3px;
            height: calc(1em + 1px);
            line-height: 1em;
            margin: 4px 0 0 12px;
            overflow: visible;
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
            font-size: 16pt;
          }

          .animated-title-left-box {
            display: inline-flex;
            justify-content: flex-end;
            overflow: visible;
            height: 1em;
            padding-left: 8px;
          }

          .animated-title-left,
          .animated-title-moana,
          .animated-title-words {
            display: inline-block;
            font-size: 1em;
            line-height: 1em;
            height: 1em;
            margin: 0;
            padding: 0;
            white-space: nowrap;
          }

          .animated-title-left {
            color: hsl(var(--deep-orange));
          }

          .animated-title-moana {
            color: hsl(var(--dark-blue));
            position: relative;
          }

          .animated-title-words {
            color: hsl(var(--deep-orange));
            opacity: 0;
            position: absolute;
            top: 0;
            left: 0;
          }

          .fade-in-1s {
            animation: fadeIn 1s ease-out forwards;
          }

          .fade-out-1s {
            animation: fadeOut 1s ease-in forwards;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }

          .slide-full-left {
            animation: slideLeftFull 1s ease-in-out forwards;
          }

          @keyframes slideLeftFull {
            to { transform: translateX(calc(-1 * var(--offset))); }
          }

          .animated-title-measure {
            position: absolute;
            left: -9999px;
            top: -9999px;
            visibility: hidden;
            white-space: nowrap;
            font-weight: 800;
            letter-spacing: 0.3px;
            font-size: 1em;
            line-height: 1em;
            height: 1em;
          }
        `}
      </style>
      
      <header className="animated-title-container" aria-live="polite">
        <span ref={leftBoxRef} className="animated-title-left-box">
          <span ref={leftRef} className="animated-title-left">ʻŌlelo</span>
        </span>
        <span ref={moanaRef} className="animated-title-moana">Moana</span>
        <span ref={wordsRef} className="animated-title-words">Word Finder</span>
      </header>

      <span ref={measureRef} className="animated-title-measure">X</span>
    </>
  );
};

export default AnimatedTitle;