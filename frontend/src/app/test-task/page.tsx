'use client';

import { useEffect, useState } from 'react';
import { lingoAPI } from '@/lib/lingo-api';

export default function TestTaskPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const testTaskCreation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing task creation...');
      const taskResult = await lingoAPI.createTask(
        '[TEAM: web_design] Create a modern e-commerce website design',
        'high'
      );
      console.log('Task creation result:', taskResult);
      
      if (taskResult.success) {
        setTaskId(taskResult.data?.task_id || null);
        setResult(taskResult.data);
      } else {
        setError(taskResult.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Task creation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testTaskStatus = async () => {
    if (!taskId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing task status check...');
      const statusResult = await lingoAPI.getTaskStatus(taskId);
      console.log('Task status result:', statusResult);
      
      if (statusResult.success) {
        setResult(statusResult.data);
      } else {
        setError(statusResult.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Task status error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Task API Test</h1>
      <div className="space-y-4">
        <button
          onClick={testTaskCreation}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
        
        {taskId && (
          <button
            onClick={testTaskStatus}
            disabled={loading}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Task Status'}
          </button>
        )}
      </div>
      
      {loading && <p className="mt-4">Processing...</p>}
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      )}
      {result && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>Result: {JSON.stringify(result)}</p>
        </div>
      )}
      {taskId && (
        <div className="mt-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p>Task ID: {taskId}</p>
        </div>
      )}
    </div>
  );
}