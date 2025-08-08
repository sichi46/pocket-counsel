// apps/web/src/components/SystemStatus.tsx
import React, { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';

interface SystemStats {
  success: boolean;
  stats: {
    documents: number;
    chunks: number;
    embeddings: number;
  };
  type: string;
}

export const SystemStatus: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check health
        const healthResult = await trpc.health.query();
        setHealth(healthResult);

        // Get stats
        const statsResult = await trpc.getStats.query();
        setStats(statsResult);
      } catch (err) {
        console.error('Error checking system status:', err);
        setError(err instanceof Error ? err.message : 'Failed to check system status');
      } finally {
        setIsLoading(false);
      }
    };

    checkSystemStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm text-gray-600">Checking system status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-400 mr-2">⚠️</div>
          <span className="text-sm text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 System Status</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Health Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-green-800">System Health</span>
          </div>
          <div className="text-xs text-green-700 space-y-1">
            <div>Status: {health?.status || 'Unknown'}</div>
            <div>Environment: {health?.environment || 'Unknown'}</div>
            <div>Database: {health?.database || 'Unknown'}</div>
            {health?.timestamp && (
              <div>Last Check: {new Date(health.timestamp).toLocaleString()}</div>
            )}
            {health?.rag && (
              <div>RAG Type: {health.rag.type}</div>
            )}
          </div>
        </div>

        {/* System Stats */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-blue-800">RAG Statistics</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <div>Documents: {stats?.stats?.documents || 0}</div>
            <div>Chunks: {stats?.stats?.chunks || 0}</div>
            <div>Embeddings: {stats?.stats?.embeddings || 0}</div>
            <div>Type: {stats?.type || 'Unknown'}</div>
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">🔗 API Endpoints</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Health: <code className="bg-gray-100 px-1 rounded">https://health-6otymacelq-uc.a.run.app</code></div>
          <div>API: <code className="bg-gray-100 px-1 rounded">https://api-6otymacelq-uc.a.run.app</code></div>
        </div>
      </div>

      {/* Model Information */}
      {health?.models && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">🤖 AI Model</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Model: {health.models.generative}</div>
            <div>Provider: {health.models.provider}</div>
          </div>
        </div>
      )}
    </div>
  );
};
