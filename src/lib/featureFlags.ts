/**
 * Feature Flag System for A/B Testing and Gradual Rollouts
 * 
 * This system allows us to test intersection quality improvements
 * against the original algorithm with real users.
 */

export interface FeatureFlags {
  // Core quality features
  enableQualityImprovements: boolean;
  enableQualityValidation: boolean;
  enableQualityLogging: boolean;
  
  // Quality thresholds
  minQualityThreshold: number;
  preferMiddleIntersections: boolean;
  
  // A/B testing
  enableABTesting: boolean;
  abTestGroup: 'control' | 'treatment' | 'auto';
  abTestPercentage: number; // What % get treatment
  
  // Performance
  maxQualityAttempts: number;
  enablePerformanceLogging: boolean;
}

// Default configuration
const DEFAULT_FLAGS: FeatureFlags = {
  enableQualityImprovements: true,
  enableQualityValidation: true,
  enableQualityLogging: false, // Turn off by default in production
  
  minQualityThreshold: 60,
  preferMiddleIntersections: true,
  
  enableABTesting: true,
  abTestGroup: 'auto', // Automatically assign based on percentage
  abTestPercentage: 50, // 50% get improved algorithm
  
  maxQualityAttempts: 50,
  enablePerformanceLogging: false
};

// Local storage keys
const STORAGE_KEYS = {
  AB_TEST_GROUP: 'pangaKupu_abTestGroup',
  USER_FLAGS: 'pangaKupu_featureFlags',
  PERFORMANCE_DATA: 'pangaKupu_performanceData'
} as const;

export class FeatureFlagManager {
  private static instance: FeatureFlagManager;
  private flags: FeatureFlags;
  private abTestGroup: 'control' | 'treatment';
  
  private constructor() {
    this.flags = this.loadFlags();
    this.abTestGroup = this.determineABTestGroup();
    this.logFlags();
  }
  
  static getInstance(): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager();
    }
    return FeatureFlagManager.instance;
  }
  
  /**
   * Get current feature flags
   */
  getFlags(): FeatureFlags {
    return { ...this.flags };
  }
  
  /**
   * Get current A/B test group
   */
  getABTestGroup(): 'control' | 'treatment' {
    return this.abTestGroup;
  }
  
  /**
   * Check if quality improvements are enabled for this user
   */
  shouldUseQualityImprovements(): boolean {
    if (!this.flags.enableABTesting) {
      return this.flags.enableQualityImprovements;
    }
    
    return this.abTestGroup === 'treatment' && this.flags.enableQualityImprovements;
  }
  
  /**
   * Override flags for testing (development only)
   */
  overrideFlags(overrides: Partial<FeatureFlags>): void {
    if (process.env.NODE_ENV === 'development') {
      this.flags = { ...this.flags, ...overrides };
      this.saveFlags();
      console.log('🔧 Feature flags overridden:', overrides);
    }
  }
  
  /**
   * Force user into specific A/B test group (development only)
   */
  forceABTestGroup(group: 'control' | 'treatment'): void {
    if (process.env.NODE_ENV === 'development') {
      this.abTestGroup = group;
      localStorage.setItem(STORAGE_KEYS.AB_TEST_GROUP, group);
      console.log(`🧪 Forced into A/B test group: ${group}`);
    }
  }
  
  /**
   * Record performance metrics for analysis
   */
  recordPerformanceMetric(metric: {
    generationTime: number;
    qualityScore?: number;
    wordsPlaced: number;
    abTestGroup: string;
    timestamp: number;
  }): void {
    if (!this.flags.enablePerformanceLogging) return;
    
    try {
      const existingData = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.PERFORMANCE_DATA) || '[]'
      );
      
      existingData.push(metric);
      
      // Keep only last 100 entries to avoid storage bloat
      if (existingData.length > 100) {
        existingData.splice(0, existingData.length - 100);
      }
      
      localStorage.setItem(STORAGE_KEYS.PERFORMANCE_DATA, JSON.stringify(existingData));
    } catch (error) {
      console.error('Failed to record performance metric:', error);
    }
  }
  
  /**
   * Get performance analytics data
   */
  getPerformanceData(): any[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PERFORMANCE_DATA) || '[]');
    } catch {
      return [];
    }
  }
  
  /**
   * Clear all stored data (useful for testing)
   */
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🧹 Cleared all feature flag data');
  }
  
  private loadFlags(): FeatureFlags {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_FLAGS);
      if (stored) {
        const parsedFlags = JSON.parse(stored);
        return { ...DEFAULT_FLAGS, ...parsedFlags };
      }
    } catch (error) {
      console.warn('Failed to load feature flags from storage:', error);
    }
    
    return { ...DEFAULT_FLAGS };
  }
  
  private saveFlags(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_FLAGS, JSON.stringify(this.flags));
    } catch (error) {
      console.error('Failed to save feature flags:', error);
    }
  }
  
  private determineABTestGroup(): 'control' | 'treatment' {
    // Check if user already assigned to a group
    const existingGroup = localStorage.getItem(STORAGE_KEYS.AB_TEST_GROUP);
    if (existingGroup === 'control' || existingGroup === 'treatment') {
      return existingGroup;
    }
    
    // Handle manual override
    if (this.flags.abTestGroup !== 'auto') {
      const group = this.flags.abTestGroup;
      localStorage.setItem(STORAGE_KEYS.AB_TEST_GROUP, group);
      return group;
    }
    
    // Assign based on percentage (sticky assignment)
    const random = Math.random() * 100;
    const group = random < this.flags.abTestPercentage ? 'treatment' : 'control';
    
    localStorage.setItem(STORAGE_KEYS.AB_TEST_GROUP, group);
    return group;
  }
  
  private logFlags(): void {
    if (this.flags.enableQualityLogging) {
      console.log('🚩 Feature Flags Loaded:');
      console.log('  Quality Improvements:', this.shouldUseQualityImprovements());
      console.log('  A/B Test Group:', this.abTestGroup);
      console.log('  Min Quality Threshold:', this.flags.minQualityThreshold);
      console.log('  Prefer Middle Intersections:', this.flags.preferMiddleIntersections);
    }
  }
}

// Convenience functions for easy access
export const getFeatureFlags = (): FeatureFlags => {
  return FeatureFlagManager.getInstance().getFlags();
};

export const shouldUseQualityImprovements = (): boolean => {
  return FeatureFlagManager.getInstance().shouldUseQualityImprovements();
};

export const getABTestGroup = (): 'control' | 'treatment' => {
  return FeatureFlagManager.getInstance().getABTestGroup();
};

export const recordPerformance = (metric: {
  generationTime: number;
  qualityScore?: number;
  wordsPlaced: number;
}): void => {
  FeatureFlagManager.getInstance().recordPerformanceMetric({
    ...metric,
    abTestGroup: getABTestGroup(),
    timestamp: Date.now()
  });
};

// Development helpers
export const devOverrideFlags = (overrides: Partial<FeatureFlags>): void => {
  FeatureFlagManager.getInstance().overrideFlags(overrides);
};

export const devForceABGroup = (group: 'control' | 'treatment'): void => {
  FeatureFlagManager.getInstance().forceABTestGroup(group);
};

export const devClearData = (): void => {
  FeatureFlagManager.getInstance().clearAllData();
};

export default FeatureFlagManager;