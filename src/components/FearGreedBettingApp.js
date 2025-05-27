import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function FearGreedBettingApp() {
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize app
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-2">Fear & Greed Oracle</h1>
        <p className="text-gray-400">Predict Bitcoin's Fear & Greed Index and earn SOL rewards</p>
      </header>

      <main className="max-w-4xl mx-auto">
        {!connected ? (
          <div className="text-center p-8 bg-gray-800 rounded-lg">
            <p className="mb-4">Connect your wallet to start betting</p>
            <button className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700">
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Betting interface will go here */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Current Market</h2>
              {/* Market data will go here */}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 