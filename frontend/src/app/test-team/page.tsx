'use client';

import { useEffect, useState } from 'react';
import { lingoAPI } from '@/lib/lingo-api';

export default function TestTeamPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testTeamLaunch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing team launch...');
      const teamResult = await lingoAPI.launchTeam(
        'web_design',
        'Create a modern e-commerce website design',
        'high'
      );
      console.log('Team launch result:', teamResult);
      
      if (teamResult.success) {
        setResult(teamResult.data);
      } else {
        setError(teamResult.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Team launch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Team Launch Test</h1>
      <button
        onClick={testTeamLaunch}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Launching...' : 'Launch Web Design Team'}
      </button>
      
      {loading && <p className="mt-4">Launching team...</p>}
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      )}
      {result && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>Success: {JSON.stringify(result)}</p>
        </div>
      )}
    </div>
  );
}