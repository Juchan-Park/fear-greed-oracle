import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function FearGreedBettingApp() {
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(true);
  const [fearGreedIndex, setFearGreedIndex] = useState(null);
  const [betAmount, setBetAmount] = useState(0.1);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Farcaster SDK 초기화
        if (typeof window !== 'undefined') {
          const { sdk } = await import('@farcaster/frame-sdk');
          await sdk.actions.ready();
          console.log('Farcaster SDK ready called');
        }
      } catch (error) {
        console.log('Not in Farcaster environment or SDK error:', error);
      }

      // Simulate Fear & Greed Index data
      const mockData = {
        value: 42,
        classification: "Fear",
        timestamp: new Date().toISOString(),
        change24h: -5
      };
      setFearGreedIndex(mockData);
      setLoading(false);
    };

    initializeApp();
  }, []);

  const getIndexColor = (value) => {
    if (value <= 25) return 'text-red-500';
    if (value <= 45) return 'text-orange-500';
    if (value <= 55) return 'text-yellow-500';
    if (value <= 75) return 'text-green-400';
    return 'text-green-500';
  };

  const getIndexBg = (value) => {
    if (value <= 25) return 'from-red-600 to-red-800';
    if (value <= 45) return 'from-orange-600 to-red-600';
    if (value <= 55) return 'from-yellow-600 to-orange-600';
    if (value <= 75) return 'from-green-600 to-yellow-600';
    return 'from-green-500 to-green-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-md mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Fear & Greed Oracle
            </h1>
            <p className="text-sm sm:text-base text-gray-300 mb-4">
              Predict Bitcoin&apos;s Fear & Greed Index and earn SOL rewards
            </p>
            <div className="flex justify-center">
              <WalletMultiButton className="!bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !text-sm !px-4 !py-2" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-6">
        {/* Fear & Greed Index Display */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <h2 className="text-lg font-bold mb-4 text-center">Current Fear & Greed Index</h2>
          
          {fearGreedIndex && (
            <div className="text-center">
              <div className={`inline-block p-6 rounded-full bg-gradient-to-br ${getIndexBg(fearGreedIndex.value)} mb-4`}>
                <div className="text-3xl font-bold text-white">
                  {fearGreedIndex.value}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className={`text-lg font-semibold ${getIndexColor(fearGreedIndex.value)}`}>
                  {fearGreedIndex.classification}
                </div>
                <div className="text-sm text-gray-400">
                  24h Change: <span className={fearGreedIndex.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {fearGreedIndex.change24h >= 0 ? '+' : ''}{fearGreedIndex.change24h}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full bg-gradient-to-r ${getIndexBg(fearGreedIndex.value)} transition-all duration-500`}
                  style={{ width: `${fearGreedIndex.value}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Extreme Fear</span>
                <span>Extreme Greed</span>
              </div>
            </div>
          )}
        </div>

        {/* Betting Interface */}
        {connected ? (
          <div className="space-y-6">
            {/* Prediction Panel */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-lg font-bold mb-4">Make Your Prediction</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bet Amount (SOL)</label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    min="0.01"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Prediction for next 24h</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPrediction('up')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        prediction === 'up' 
                          ? 'border-green-500 bg-green-500/20 text-green-400' 
                          : 'border-gray-600 hover:border-green-500'
                      }`}
                    >
                      <div className="text-xl mb-1">📈</div>
                      <div className="font-semibold text-sm">Index Will Rise</div>
                      <div className="text-xs text-gray-400">2.1x multiplier</div>
                    </button>
                    
                    <button
                      onClick={() => setPrediction('down')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        prediction === 'down' 
                          ? 'border-red-500 bg-red-500/20 text-red-400' 
                          : 'border-gray-600 hover:border-red-500'
                      }`}
                    >
                      <div className="text-xl mb-1">📉</div>
                      <div className="font-semibold text-sm">Index Will Fall</div>
                      <div className="text-xs text-gray-400">1.8x multiplier</div>
                    </button>
                  </div>
                </div>

                <button
                  disabled={!prediction}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed py-3 rounded-lg font-semibold text-sm transition-all"
                >
                  Place Bet ({betAmount} SOL)
                </button>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-lg font-bold mb-4">Live Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300 text-sm">Total Pool</span>
                  <span className="font-bold text-base">1,247.5 SOL</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300 text-sm">Active Bets</span>
                  <span className="font-bold text-base">342</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300 text-sm">Your Winnings</span>
                  <span className="font-bold text-base text-green-400">+12.4 SOL</span>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2 text-sm">Recent Predictions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm p-2 bg-gray-700/30 rounded">
                      <span>📈 Rise</span>
                      <span className="text-green-400">+2.1 SOL</span>
                    </div>
                    <div className="flex justify-between text-sm p-2 bg-gray-700/30 rounded">
                      <span>📉 Fall</span>
                      <span className="text-red-400">-1.0 SOL</span>
                    </div>
                    <div className="flex justify-between text-sm p-2 bg-gray-700/30 rounded">
                      <span>📈 Rise</span>
                      <span className="text-green-400">+3.2 SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-lg font-bold mb-3">Connect Your Wallet</h3>
            <p className="text-sm text-gray-400 mb-4">
              Connect your Solana wallet to start making predictions and earning rewards
            </p>
            <WalletMultiButton className="!bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !text-sm !px-4 !py-2" />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-gray-700/50 py-4">
        <div className="max-w-md mx-auto px-4 text-center text-gray-400">
          <p className="text-xs">Powered by Solana • Built for Farcaster</p>
        </div>
      </footer>
    </div>
  );
} 