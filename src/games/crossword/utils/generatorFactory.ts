/**
 * Crossword Generator Factory
 * 
 * This factory determines which generator to use based on feature flags
 * and provides a unified interface for both original and enhanced generators.
 */

import { CrosswordGenerator } from '../../../utils/crosswordGenerator';
import { EnhancedCrosswordGenerator } from './enhancedGenerator';
import { shouldUseQualityImprovements, getFeatureFlags, recordPerformance } from '../../../lib/featureFlags';
import type { CrosswordGrid } from './enhancedGenerator';

export class CrosswordGeneratorFactory {
  
  /**
   * Create the appropriate generator based on feature flags
   */
  static createGenerator(
    words: string[], 
    gridSize: number = 12, 
    language: 'haw' | 'mao' | 'tah' | 'en' = 'haw'
  ): CrosswordGenerator | EnhancedCrosswordGenerator {
    
    if (shouldUseQualityImprovements()) {
      const flags = getFeatureFlags();
      return new EnhancedCrosswordGenerator(words, gridSize, language, {
        enableQualityImprovements: flags.enableQualityImprovements,
        enableQualityValidation: flags.enableQualityValidation,
        minQualityThreshold: flags.minQualityThreshold,
        preferMiddleIntersections: flags.preferMiddleIntersections,
        enableQualityLogging: flags.enableQualityLogging
      });
    } else {
      return new CrosswordGenerator(words, gridSize, language);
    }
  }
  
  /**
   * Generate crossword with performance tracking
   */
  static async generateCrosswordWithTracking(
    words: string[], 
    gridSize: number = 12, 
    language: 'haw' | 'mao' | 'tah' | 'en' = 'haw'
  ): Promise<CrosswordGrid | null> {
    
    const startTime = performance.now();
    const generator = this.createGenerator(words, gridSize, language);
    
    try {
      const result = generator.generateCrossword();
      const endTime = performance.now();
      const generationTime = endTime - startTime;
      
      // Record performance metrics for analysis
      if (result) {
        recordPerformance({
          generationTime,
          qualityScore: (result as any).qualityMetrics?.qualityScore,
          wordsPlaced: result.words.length
        });
        
        if (getFeatureFlags().enablePerformanceLogging) {
          console.log(`⚡ Generated crossword in ${generationTime.toFixed(2)}ms`);
          console.log(`📊 Words placed: ${result.words.length}`);
          if ((result as any).qualityMetrics) {
            console.log(`🎯 Quality score: ${(result as any).qualityMetrics.qualityScore}`);
          }
        }
      }
      
      return result;
      
    } catch (error) {
      console.error('Crossword generation failed:', error);
      return null;
    }
  }
  
  /**
   * Get generator info for debugging
   */
  static getGeneratorInfo(): {
    type: 'original' | 'enhanced';
    flags: any;
    abTestGroup: string;
  } {
    const flags = getFeatureFlags();
    return {
      type: shouldUseQualityImprovements() ? 'enhanced' : 'original',
      flags,
      abTestGroup: shouldUseQualityImprovements() ? 'treatment' : 'control'
    };
  }
}

export default CrosswordGeneratorFactory;