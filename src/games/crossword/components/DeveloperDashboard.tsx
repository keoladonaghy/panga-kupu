/**
 * Developer Dashboard for Crossword Quality Monitoring
 * 
 * This component provides real-time monitoring of crossword generation
 * quality improvements and A/B testing results.
 */

import React, { useState, useEffect } from 'react';
import { 
  FeatureFlagManager, 
  devOverrideFlags, 
  devForceABGroup, 
  devClearData,
  getABTestGroup 
} from '../../../lib/featureFlags';
import { PuzzleQualityValidator } from '../utils/intersectionQuality';
import type { FeatureFlags } from '../../../lib/featureFlags';

interface DashboardProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const DeveloperDashboard: React.FC<DashboardProps> = ({ isVisible, onToggle }) => {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [abTestGroup, setAbTestGroup] = useState<string>('');
  
  useEffect(() => {
    if (isVisible) {
      const flagManager = FeatureFlagManager.getInstance();
      setFlags(flagManager.getFlags());
      setPerformanceData(flagManager.getPerformanceData());
      setAbTestGroup(getABTestGroup());
    }
  }, [isVisible]);
  
  const refreshData = () => {
    const flagManager = FeatureFlagManager.getInstance();
    setFlags(flagManager.getFlags());
    setPerformanceData(flagManager.getPerformanceData());
    setAbTestGroup(getABTestGroup());
  };
  
  const handleFlagOverride = (key: keyof FeatureFlags, value: any) => {
    devOverrideFlags({ [key]: value });
    refreshData();
  };
  
  const handleABTestOverride = (group: 'control' | 'treatment') => {
    devForceABGroup(group);
    refreshData();
  };
  
  const clearAllData = () => {
    devClearData();
    refreshData();
  };
  
  const getPerformanceStats = () => {
    if (performanceData.length === 0) return null;
    
    const treatmentData = performanceData.filter(d => d.abTestGroup === 'treatment');
    const controlData = performanceData.filter(d => d.abTestGroup === 'control');
    
    const avgTime = (data: any[]) => data.reduce((sum, d) => sum + d.generationTime, 0) / data.length;
    const avgQuality = (data: any[]) => {
      const withQuality = data.filter(d => d.qualityScore != null);
      return withQuality.length > 0 
        ? withQuality.reduce((sum, d) => sum + d.qualityScore, 0) / withQuality.length 
        : null;
    };
    
    return {
      treatment: {
        count: treatmentData.length,
        avgTime: avgTime(treatmentData),
        avgQuality: avgQuality(treatmentData)
      },
      control: {
        count: controlData.length,
        avgTime: avgTime(controlData),
        avgQuality: avgQuality(controlData)
      }
    };
  };
  
  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded shadow-lg hover:bg-blue-700"
        style={{ zIndex: 1000 }}
      >
        🔧 Dev
      </button>
    );
  }
  
  const stats = getPerformanceStats();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🔧 Developer Dashboard</h2>
          <button 
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>
        
        {/* Current Status */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Current Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-medium">A/B Test Group</div>
              <div className="text-lg">{abTestGroup}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-medium">Quality Improvements</div>
              <div className="text-lg">{flags?.enableQualityImprovements ? '✅ Enabled' : '❌ Disabled'}</div>
            </div>
          </div>
        </div>
        
        {/* A/B Test Controls */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">A/B Test Controls</h3>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => handleABTestOverride('control')}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Force Control Group
            </button>
            <button
              onClick={() => handleABTestOverride('treatment')}
              className="px-3 py-2 bg-blue-200 hover:bg-blue-300 rounded"
            >
              Force Treatment Group
            </button>
            <button
              onClick={clearAllData}
              className="px-3 py-2 bg-red-200 hover:bg-red-300 rounded"
            >
              Clear All Data
            </button>
          </div>
        </div>
        
        {/* Performance Statistics */}
        {stats && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Performance Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-medium text-blue-800">Treatment Group (Enhanced)</h4>
                <div className="mt-2 text-sm">
                  <div>Samples: {stats.treatment.count}</div>
                  <div>Avg Generation Time: {stats.treatment.avgTime?.toFixed(2)}ms</div>
                  <div>Avg Quality Score: {stats.treatment.avgQuality?.toFixed(1) || 'N/A'}</div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-800">Control Group (Original)</h4>
                <div className="mt-2 text-sm">
                  <div>Samples: {stats.control.count}</div>
                  <div>Avg Generation Time: {stats.control.avgTime?.toFixed(2)}ms</div>
                  <div>Avg Quality Score: {stats.control.avgQuality?.toFixed(1) || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Feature Flag Overrides */}
        {flags && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Feature Flag Overrides</h3>
            <div className="grid grid-cols-2 gap-4">
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={flags.enableQualityImprovements}
                    onChange={(e) => handleFlagOverride('enableQualityImprovements', e.target.checked)}
                    className="mr-2"
                  />
                  Enable Quality Improvements
                </label>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={flags.enableQualityValidation}
                    onChange={(e) => handleFlagOverride('enableQualityValidation', e.target.checked)}
                    className="mr-2"
                  />
                  Enable Quality Validation
                </label>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={flags.preferMiddleIntersections}
                    onChange={(e) => handleFlagOverride('preferMiddleIntersections', e.target.checked)}
                    className="mr-2"
                  />
                  Prefer Middle Intersections
                </label>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={flags.enableQualityLogging}
                    onChange={(e) => handleFlagOverride('enableQualityLogging', e.target.checked)}
                    className="mr-2"
                  />
                  Enable Quality Logging
                </label>
              </div>
              
              <div>
                <label className="block">
                  <span className="text-sm">Min Quality Threshold</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={flags.minQualityThreshold}
                    onChange={(e) => handleFlagOverride('minQualityThreshold', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{flags.minQualityThreshold}</span>
                </label>
              </div>
              
              <div>
                <label className="block">
                  <span className="text-sm">A/B Test Percentage</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={flags.abTestPercentage}
                    onChange={(e) => handleFlagOverride('abTestPercentage', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{flags.abTestPercentage}%</span>
                </label>
              </div>
              
            </div>
          </div>
        )}
        
        {/* Recent Performance Data */}
        {performanceData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Recent Generations</h3>
            <div className="max-h-40 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1">Time</th>
                    <th className="text-left py-1">Group</th>
                    <th className="text-left py-1">Gen Time</th>
                    <th className="text-left py-1">Quality</th>
                    <th className="text-left py-1">Words</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.slice(-10).reverse().map((data, index) => (
                    <tr key={index} className="border-b">
                      <td>{new Date(data.timestamp).toLocaleTimeString()}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-xs ${
                          data.abTestGroup === 'treatment' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {data.abTestGroup}
                        </span>
                      </td>
                      <td>{data.generationTime.toFixed(1)}ms</td>
                      <td>{data.qualityScore?.toFixed(1) || 'N/A'}</td>
                      <td>{data.wordsPlaced}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          💡 This dashboard is only available in development mode
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;