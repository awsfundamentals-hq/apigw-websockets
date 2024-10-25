'use client';

import { useEffect } from 'react';

export default function WebSocketComponent() {
  useEffect(() => {
    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    if (websocketUrl) {
      const socket = new WebSocket(websocketUrl);

      socket.onopen = () => {
        console.log('WebSocket connection established');
      };

      socket.onmessage = (event) => {
        console.log('Received message:', event.data);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
      };

      // Clean up the WebSocket connection when the component unmounts
      return () => {
        socket.close();
      };
    } else {
      console.error('NEXT_PUBLIC_WEBSOCKET_URL is not defined');
    }
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return null; // This component doesn't render anything
}
