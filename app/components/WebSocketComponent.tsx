'use client';

import React, { useCallback, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface Connection {
  connectionId: string;
  timestamp: number;
}

interface Message {
  message: string;
  from: string;
  to: string;

  connectionId?: string;
}

const ActiveConnectionsComponent: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    if (websocketUrl) {
      const newSocket = new WebSocket(websocketUrl);

      newSocket.onopen = () => {
        console.log('WebSocket connection established');
        setSocket(newSocket);
      };

      newSocket.onmessage = (event) => {
        console.log('Received message:', event.data);
        const data: Message = JSON.parse(event.data);
        if (data.message) {
          toast(data.message, {
            duration: 3000,
            position: 'top-right',
            style: {
              background: '#333',
              color: '#fff',
            },
          });
        }
        if (data.connectionId) {
          console.info(`Own connectionId: ${data.connectionId}`);
          setConnectionId(data.connectionId);
        }
      };

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      newSocket.onclose = () => {
        console.log('WebSocket connection closed');
        setSocket(null);
      };

      return () => {
        newSocket.close();
      };
    } else {
      console.error('NEXT_PUBLIC_WEBSOCKET_URL is not defined');
    }
  }, []);

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
        // Sort connections by connectionId
        const sortedConnections = data.sort((a, b) =>
          a.connectionId.localeCompare(b.connectionId)
        );
        setConnections(sortedConnections);
        setLoading(false);
      } catch (err) {
        setError('Error fetching connections');
        setLoading(false);
      }
    };

    // Initial fetch
    fetchConnections();

    // Set up polling every 3 seconds
    const intervalId = setInterval(fetchConnections, 3000);

    // Clean up function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const sendMessage = useCallback(
    (connectionId: string) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const message = {
          action: 'send',
          connectionId: connectionId,
          message: 'Hello World',
        };
        socket.send(JSON.stringify(message));
        toast.success(`Sent "Hello World" to ${connectionId}`);
      } else {
        toast.error('WebSocket is not connected');
      }
    },
    [socket]
  );

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
        className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div>
      <Toaster />
      <h2 className="text-2xl font-semibold text-gray-100 mb-4">
        Active Connections
      </h2>
      {connections.length === 0 ? (
        <p className="text-gray-400">No active connections</p>
      ) : (
        <ul className="space-y-3">
          {connections.map((connection) => (
            <li
              key={connection.connectionId}
              className={`rounded-md p-4 hover:bg-gray-700 transition duration-150 ease-in-out cursor-pointer ${
                connection.connectionId === connectionId
                  ? 'bg-blue-900 hover:bg-blue-800'
                  : 'bg-gray-800'
              }`}
              onClick={() => sendMessage(connection.connectionId)}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-300">
                  ID: {connection.connectionId}
                  {connection.connectionId === connectionId && (
                    <span className="ml-2 text-xs font-semibold text-blue-300">
                      (This is us!)
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-400 mt-1">
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
