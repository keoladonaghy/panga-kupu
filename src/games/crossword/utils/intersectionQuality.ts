/**
 * Intersection Quality Analyzer for Enhanced Crossword Generation
 * 
 * This module provides quality scoring for crossword puzzle intersections
 * to improve player experience by ensuring helpful word placement.
 */

export interface IntersectionQuality {
  position: number;
  wordLength: number;
  qualityScore: number;
  isEdgePosition: boolean;
  isMiddlePosition: boolean;
}

export interface PuzzleQualityMetrics {
  totalWords: number;
  edgeOnlyWords: number;
  middleIntersectionWords: number;
  multipleIntersectionWords: number;
  averageIntersectionsPerWord: number;
  qualityScore: number;
}

export class IntersectionQualityAnalyzer {
  
  /**
   * Calculate the quality score for an intersection position
   * Higher scores indicate better hint potential for players
   */
  static calculateIntersectionScore(position: number, wordLength: number): number {
    const middle = Math.ceil(wordLength / 2);
    const distanceFromEdge = Math.min(position - 1, wordLength - position);
    
    // Prioritize middle positions significantly
    // Position 3 in a 5-letter word gets highest score
    const baseScore = distanceFromEdge * 15;
    
    // Bonus for true middle positions
    const middleBonus = position === middle ? 10 : 0;
    
    // Penalty for edge positions (1 or last)
    const edgePenalty = (position === 1 || position === wordLength) ? -20 : 0;
    
    return Math.max(0, baseScore + middleBonus + edgePenalty);
  }
  
  /**
   * Analyze the quality of a specific intersection
   */
  static analyzeIntersection(position: number, wordLength: number): IntersectionQuality {
    const isEdgePosition = position === 1 || position === wordLength;
    const isMiddlePosition = position >= 2 && position <= wordLength - 1;
    const qualityScore = this.calculateIntersectionScore(position, wordLength);
    
    return {
      position,
      wordLength,
      qualityScore,
      isEdgePosition,
      isMiddlePosition
    };
  }
  
  /**
   * Find all intersections for a word in a crossword grid
   */
  static findWordIntersections(
    targetWord: { word: string; row: number; col: number; direction: 'across' | 'down' },
    allWords: Array<{ word: string; row: number; col: number; direction: 'across' | 'down' }>
  ): IntersectionQuality[] {
    const intersections: IntersectionQuality[] = [];
    
    for (const otherWord of allWords) {
      if (targetWord === otherWord) continue;
      
      // Check if words intersect
      const intersection = this.findIntersectionPoint(targetWord, otherWord);
      if (intersection) {
        const quality = this.analyzeIntersection(intersection.position, targetWord.word.length);
        intersections.push(quality);
      }
    }
    
    return intersections;
  }
  
  /**
   * Find the intersection point between two words
   */
  private static findIntersectionPoint(
    word1: { word: string; row: number; col: number; direction: 'across' | 'down' },
    word2: { word: string; row: number; col: number; direction: 'across' | 'down' }
  ): { position: number; char: string } | null {
    // Only check perpendicular intersections
    if (word1.direction === word2.direction) return null;
    
    const [across, down] = word1.direction === 'across' ? [word1, word2] : [word2, word1];
    
    // Check if they intersect geometrically
    const acrossEnd = across.col + across.word.length - 1;
    const downEnd = down.row + down.word.length - 1;
    
    if (across.row >= down.row && across.row <= downEnd &&
        down.col >= across.col && down.col <= acrossEnd) {
      
      const acrossPos = down.col - across.col + 1;
      const downPos = across.row - down.row + 1;
      
      // Check if characters match
      if (across.word[acrossPos - 1]?.toLowerCase() === down.word[downPos - 1]?.toLowerCase()) {
        const targetPosition = word1.direction === 'across' ? acrossPos : downPos;
        return {
          position: targetPosition,
          char: across.word[acrossPos - 1]
        };
      }
    }
    
    return null;
  }
}

export class PuzzleQualityValidator {
  
  /**
   * Assess the overall quality of a crossword puzzle
   */
  static assessPuzzleQuality(
    words: Array<{ word: string; row: number; col: number; direction: 'across' | 'down' }>
  ): PuzzleQualityMetrics {
    let edgeOnlyWords = 0;
    let middleIntersectionWords = 0;
    let multipleIntersectionWords = 0;
    let totalIntersections = 0;
    
    for (const word of words) {
      const intersections = IntersectionQualityAnalyzer.findWordIntersections(word, words);
      totalIntersections += intersections.length;
      
      if (intersections.length >= 2) {
        multipleIntersectionWords++;
      }
      
      const hasMiddleIntersection = intersections.some(i => i.isMiddlePosition);
      const hasOnlyEdgeIntersections = intersections.length > 0 && intersections.every(i => i.isEdgePosition);
      
      if (hasMiddleIntersection) {
        middleIntersectionWords++;
      }
      
      if (hasOnlyEdgeIntersections) {
        edgeOnlyWords++;
      }
    }
    
    const averageIntersectionsPerWord = words.length > 0 ? totalIntersections / words.length : 0;
    
    // Calculate overall quality score (0-100)
    const qualityScore = this.calculateOverallQualityScore({
      totalWords: words.length,
      edgeOnlyWords,
      middleIntersectionWords,
      multipleIntersectionWords,
      averageIntersectionsPerWord,
      qualityScore: 0 // Will be set below
    });
    
    return {
      totalWords: words.length,
      edgeOnlyWords,
      middleIntersectionWords,
      multipleIntersectionWords,
      averageIntersectionsPerWord,
      qualityScore
    };
  }
  
  /**
   * Calculate an overall quality score for the puzzle
   */
  private static calculateOverallQualityScore(metrics: Omit<PuzzleQualityMetrics, 'qualityScore'>): number {
    let score = 100;
    
    // Penalties for poor intersection quality
    const edgeOnlyPenalty = metrics.edgeOnlyWords * 15; // -15 points per edge-only word
    const lowIntersectionPenalty = metrics.averageIntersectionsPerWord < 1.5 ? 25 : 0;
    
    // Bonuses for good intersection quality
    const middleIntersectionBonus = Math.min(metrics.middleIntersectionWords * 5, 30);
    const multipleIntersectionBonus = Math.min(metrics.multipleIntersectionWords * 8, 40);
    
    score = score - edgeOnlyPenalty - lowIntersectionPenalty + middleIntersectionBonus + multipleIntersectionBonus;
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Check if a puzzle meets minimum quality standards
   */
  static meetsQualityStandards(metrics: PuzzleQualityMetrics): boolean {
    return (
      metrics.qualityScore >= 60 &&           // Overall quality threshold
      metrics.edgeOnlyWords <= 3 &&           // Max 3 edge-only words
      metrics.middleIntersectionWords >= 4 &&  // At least 4 words with middle intersections
      metrics.averageIntersectionsPerWord >= 1.2 // Good connectivity
    );
  }
  
  /**
   * Generate a detailed quality report
   */
  static generateQualityReport(metrics: PuzzleQualityMetrics): string {
    const report = [
      `Puzzle Quality Report (Score: ${metrics.qualityScore}/100)`,
      `─────────────────────────────────────────────────`,
      `Total Words: ${metrics.totalWords}`,
      `Words with Middle Intersections: ${metrics.middleIntersectionWords} (${(metrics.middleIntersectionWords/metrics.totalWords*100).toFixed(1)}%)`,
      `Words with Multiple Intersections: ${metrics.multipleIntersectionWords} (${(metrics.multipleIntersectionWords/metrics.totalWords*100).toFixed(1)}%)`,
      `Edge-Only Words: ${metrics.edgeOnlyWords} (${(metrics.edgeOnlyWords/metrics.totalWords*100).toFixed(1)}%)`,
      `Average Intersections per Word: ${metrics.averageIntersectionsPerWord.toFixed(2)}`,
      `Quality Rating: ${this.getQualityRating(metrics.qualityScore)}`
    ];
    
    return report.join('\n');
  }
  
  private static getQualityRating(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  }
}