'use client';

import React, { useEffect, useState } from 'react';

interface Connection {
  connectionId: string;
  timestamp: number;
}

const ActiveConnectionsComponent: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/connections`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch connections');
        }
        const data = await response.json();
        setConnections(data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching connections');
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Active Connections
      </h2>
      {connections.length === 0 ? (
        <p className="text-gray-600">No active connections</p>
      ) : (
        <ul className="space-y-3">
          {connections.map((connection) => (
            <li
              key={connection.connectionId}
              className="bg-gray-50 rounded-md p-4 hover:bg-gray-100 transition duration-150 ease-in-out"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  ID: {connection.connectionId}
                </span>
                <span className="text-xs text-gray-500">
                  Connected at:{' '}
                  {new Date(connection.timestamp).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActiveConnectionsComponent;
