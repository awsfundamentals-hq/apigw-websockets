import ActiveConnectionsComponent from './components/ActiveConnectionsComponent';
import WebSocketComponent from './components/WebSocketComponent';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>WebSocket Demo</h1>
      <WebSocketComponent />
      <ActiveConnectionsComponent />
    </main>
  );
}
