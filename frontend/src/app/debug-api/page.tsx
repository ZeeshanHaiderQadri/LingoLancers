'use client';

import { useEffect, useState } from 'react';
import { lingoAPI } from '@/lib/lingo-api';

export default function DebugAPIPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const debugAPI = async () => {
      try {
        // Log the base URL
        console.log('Base URL:', (lingoAPI as any).baseUrl);
        
        // Try to access the health endpoint directly
        const response = await fetch(`${(lingoAPI as any).baseUrl}/health`);
        const data = await response.json();
        setResult(data);
      } catch (err) {
        console.error('API debug error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    debugAPI();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Debug</h1>
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