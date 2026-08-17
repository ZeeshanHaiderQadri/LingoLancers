'use client';

import { useEffect, useState } from 'react';

export default function TestDirectAPIPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testDirectAPI = async () => {
      try {
        // Test the health endpoint directly
        console.log('Testing health endpoint directly...');
        const healthResponse = await fetch('http://localhost:8002/health');
        const healthData = await healthResponse.json();
        console.log('Health response:', healthData);
        
        // Test the tasks endpoint directly
        console.log('Testing tasks endpoint directly...');
        const taskResponse = await fetch('http://localhost:8002/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: 'test_user',
            request: '[TEAM: web_design] Test task',
            priority: 'normal'
          }),
        });
        
        if (!taskResponse.ok) {
          const errorText = await taskResponse.text();
          console.error('Tasks endpoint error:', errorText);
          throw new Error(`HTTP ${taskResponse.status}: ${taskResponse.statusText} - ${errorText}`);
        }
        
        const taskData = await taskResponse.json();
        console.log('Tasks response:', taskData);
        
        setResult({ health: healthData, task: taskData });
      } catch (err) {
        console.error('Direct API test error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testDirectAPI();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Direct API Test</h1>
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