'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

export default function TestNotificationPage() {
  const { data: session } = useSession();
  const [title, setTitle] = useState('Test Notification');
  const [description, setDescription] = useState('This is a test notification');
  const [type, setType] = useState('system');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      setError('You must be logged in to send a notification');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await axios.post('/api/test-notification', {
        userId: session.user.id,
        title,
        description,
        type
      });
      
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Test Notification System</h1>
      
      {!session ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          You must be logged in to use this feature.
        </div>
      ) : (
        <>
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
            <p>Current user: {session.user?.name || session.user?.email}</p>
            <p>User ID: {session.user?.id}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Notification Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Notification Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Notification Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="system">System</option>
                <option value="task">Task</option>
                <option value="mention">Mention</option>
                <option value="team">Team</option>
                <option value="onboarding">Onboarding</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Test Notification'}
            </button>
          </form>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {result && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
              <p className="font-bold">Success!</p>
              <p>{result.message}</p>
              <pre className="mt-2 text-xs overflow-auto bg-gray-100 p-2 rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
      
      <div className="mt-8 border-t pt-4">
        <h2 className="text-xl font-bold mb-4">Debugging Tips</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Make sure you have an active SSE connection open in another tab</li>
          <li>Check the browser console for any errors</li>
          <li>Check the server logs for any errors</li>
          <li>The notification should appear in real-time if everything is working correctly</li>
        </ul>
      </div>
    </div>
  );
}
