'use client';

import { useEffect, useState } from 'react';
import { lingoAPI } from '@/lib/lingo-api';

export default function TestAPIPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Testing API connection...');
        const healthResult = await lingoAPI.checkHealth();
        console.log('Health check result:', healthResult);
        
        if (healthResult.success) {
          setResult(healthResult.data);
        } else {
          setError(healthResult.error || 'Unknown error');
        }
      } catch (err) {
        console.error('API test error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      {loading && <p>Loading...</p>}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      )}
      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>Success: {JSON.stringify(result)}</p>
        </div>
      )}
    </div>
  );
}