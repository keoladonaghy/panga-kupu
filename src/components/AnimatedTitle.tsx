import { useEffect, useRef, useState } from 'react';

const AnimatedTitle = () => {
  const leftRef = useRef<HTMLSpanElement>(null);
  const leftBoxRef = useRef<HTMLSpanElement>(null);
  const moanaRef = useRef<HTMLSpanElement>(null);
  const wordsRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  
  const [animationState, setAnimationState] = useState<'initial' | 'cycling' | 'sliding' | 'complete'>('initial');
  const [leftBoxWidth, setLeftBoxWidth] = useState(0);

  useEffect(() => {
    const left = leftRef.current;
    const leftBox = leftBoxRef.current;
    const moana = moanaRef.current;
    const words = wordsRef.current;
    const measure = measureRef.current;

    if (!left || !leftBox || !moana || !words || !measure) return;
    
    const candidates = ['ʻŌlelo', 'Kupu', 'Parau']; // Only words that cycle in leftBox
    const measureText = (text: string): number => {
      measure.textContent = text;
      return measure.getBoundingClientRect().width;
    };

    // Calculate and set left box width
    const calculatedWidth = Math.ceil(Math.max(...candidates.map(measureText))) + 10;
    setLeftBoxWidth(calculatedWidth);
    leftBox.style.width = calculatedWidth + 'px';


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
      
      // Slide Moana to the left anchor point
      moana.classList.add('slide-to-anchor');

      const handleAnimationEnd = () => {
        // Position Word Finder next to final Moana position
        words.style.left = '0.5em';
        words.classList.add('fade-in-1s');
        setAnimationState('complete');
      };

      moana.addEventListener('animationend', handleAnimationEnd, { once: true });
    }, 6000);

    // Cleanup function
    return () => {
      if (moana) {
        moana.removeEventListener('animationend', () => {});
      }
    };
  }, []);

  return (
    <>
      <style>
        {`
          .title-frame {
            --title-x: 0;
            position: relative;
            left: var(--title-x);
            width: fit-content;
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
            font-size: 16pt;
            font-weight: 800;
            letter-spacing: 0.3px;
            line-height: 1em;
            height: calc(1em + 1px);
            margin: 4px 0 0 0;
            border: 2px solid black;
          }

          .animated-title-left-box {
            display: inline-block;
            width: var(--left-box-width);
            text-align: right;
            height: 1em;
            position: relative;
          }

          .animated-title-left {
            display: inline-block;
            color: hsl(14 85% 50%);
            font-size: 1em;
            line-height: 1em;
            height: 1em;
            margin: 0;
            padding: 0;
            white-space: nowrap;
          }

          .animated-title-moana {
            display: inline-block;
            color: hsl(220 85% 25%);
            position: absolute;
            left: calc(var(--left-box-width) + 0.5em);
            top: -1px;
            font-size: 1em;
            line-height: 1em;
            height: 1em;
            margin: 0;
            padding: 0;
            white-space: nowrap;
          }

          .animated-title-words {
            display: inline-block;
            color: hsl(14 85% 50%);
            position: absolute;
            top: 0;
            opacity: 0;
            font-size: 1em;
            line-height: 1em;
            height: 1em;
            margin: 0;
            padding: 0;
            white-space: nowrap;
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

          .slide-to-anchor {
            animation: slideToAnchor 1s ease-in-out forwards;
          }

          @keyframes slideToAnchor {
            to { transform: translateX(calc(-1 * (var(--left-box-width) + 0.5em))); }
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
      
      <div className="title-frame" style={{ '--left-box-width': `${leftBoxWidth}px` } as React.CSSProperties}>
        <span ref={leftBoxRef} className="animated-title-left-box">
          <span ref={leftRef} className="animated-title-left">ʻŌlelo</span>
        </span>
        <span ref={moanaRef} className="animated-title-moana">Moana</span>
        <span ref={wordsRef} className="animated-title-words">Word Finder</span>
      </div>

      <span ref={measureRef} className="animated-title-measure">X</span>
    </>
  );
};

export default AnimatedTitle;