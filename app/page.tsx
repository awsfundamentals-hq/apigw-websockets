import Image from 'next/image';
import WebSocketComponent from './components/WebSocketComponent';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-2 animate-fade-in">
          Amazon API Gateway
        </h1>
        <h2 className="text-2xl font-semibold text-center mb-6 text-[#FF9900]">
          WebSocket Gateway
        </h2>
        <div className="flex justify-center mb-12">
          <Image
            src="/animation.gif"
            alt="WebSocket Animation"
            width={600}
            height={200}
            className="rounded-lg shadow-lg"
          />
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <WebSocketComponent />
        </div>
      </div>
    </main>
  );
}
