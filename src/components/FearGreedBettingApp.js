import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function FearGreedBettingApp() {
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(true);
  const [fearGreedIndex, setFearGreedIndex] = useState(null);
  const [betAmount, setBetAmount] = useState(0.01);
  const [prediction, setPrediction] = useState(null);
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 59, seconds: 41 });
  const [liveBets, setLiveBets] = useState([]);

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
        value: 37,
        classification: "Fear",
        timestamp: new Date().toISOString(),
        change24h: -5,
        lastUpdated: "오전 12:24:10"
      };
      setFearGreedIndex(mockData);

      // Mock live bets
      const mockBets = [
        { address: "0x76f8...", amount: "0.1 SOL", direction: "down", time: "just now" },
        { address: "0x1a2b...", amount: "0.05 SOL", direction: "up", time: "2 min ago" },
        { address: "0x3c4d...", amount: "0.1 SOL", direction: "down", time: "5 min ago" },
        { address: "0x5e6f...", amount: "0.01 SOL", direction: "up", time: "8 min ago" },
      ];
      setLiveBets(mockBets);

      setLoading(false);
    };

    initializeApp();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getIndexColor = (value) => {
    if (value <= 25) return 'text-red-400';
    if (value <= 45) return 'text-orange-400';
    if (value <= 55) return 'text-yellow-400';
    if (value <= 75) return 'text-green-400';
    return 'text-green-400';
  };

  // Wave chart component (simplified)
  const WaveChart = () => (
    <svg viewBox="0 0 300 60" className="w-full h-12">
      <path
        d="M0,30 Q25,20 50,25 T100,30 T150,25 T200,30 T250,25 T300,30"
        stroke="#22d3ee"
        strokeWidth="2"
        fill="none"
        className="animate-pulse"
      />
    </svg>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
      {/* Header */}
      <header className="text-center py-6 px-4">
        <h1 className="text-2xl font-bold mb-2">Fear & Greed Oracle</h1>
        <p className="text-purple-200 text-sm">Predict Bitcoin's Fear & Greed Index</p>
      </header>

      <main className="max-w-md mx-auto px-4 space-y-4">
        {/* Settlement Countdown */}
        <div className="bg-purple-800/40 backdrop-blur-sm rounded-2xl p-4 border border-purple-600/30">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full border-2 border-purple-300 flex items-center justify-center">
                <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
              </div>
              <span className="text-purple-200 text-sm">Settlement in</span>
            </div>
            <div className="text-3xl font-bold text-cyan-400">
              {String(countdown.hours).padStart(2, '0')}:
              {String(countdown.minutes).padStart(2, '0')}:
              {String(countdown.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Current Fear & Greed Index */}
        <div className="bg-purple-800/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-600/30">
          <h2 className="text-center text-purple-200 mb-4">Current Fear & Greed Index</h2>
          
          {fearGreedIndex && (
            <div className="text-center">
              <div className="text-6xl font-bold text-orange-400 mb-2">
                {fearGreedIndex.value}
              </div>
              <div className="text-xl font-semibold text-orange-400 mb-4">
                {fearGreedIndex.classification}
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-green-400 mb-4">
                <span>📈</span>
                <span>Updated: {fearGreedIndex.lastUpdated}</span>
              </div>

              {/* Wave Chart */}
              <div className="mb-2">
                <WaveChart />
              </div>
              <div className="text-sm text-purple-300">30-day trend</div>
            </div>
          )}
        </div>

        {/* Live Bets */}
        <div className="bg-purple-800/40 backdrop-blur-sm rounded-2xl p-4 border border-purple-600/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-cyan-400">📊</span>
            <h3 className="text-lg font-semibold">Live Bets</h3>
          </div>
          
          <div className="space-y-2">
            {liveBets.map((bet, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-purple-300">{bet.address}</span>
                  <span className={bet.direction === 'up' ? 'text-green-400' : 'text-red-400'}>
                    {bet.direction === 'up' ? '📈' : '📉'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{bet.amount}</div>
                  <div className="text-purple-400 text-xs">{bet.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Betting Interface */}
        {connected ? (
          <div className="space-y-4">
            {/* Bet Amount Selection */}
            <div className="bg-purple-800/40 backdrop-blur-sm rounded-2xl p-4 border border-purple-600/30">
              <h3 className="text-center text-purple-200 mb-4">Bet Amount (SOL)</h3>
              <div className="grid grid-cols-3 gap-3">
                {[0.01, 0.05, 0.1].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                      betAmount === amount
                        ? 'bg-cyan-500 text-white'
                        : 'bg-purple-700/50 text-purple-200 hover:bg-purple-600/50'
                    }`}
                  >
                    {amount} SOL
                  </button>
                ))}
              </div>
            </div>

            {/* UP/DOWN Pools */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPrediction('up')}
                className={`bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-4 border-2 transition-all ${
                  prediction === 'up' ? 'border-green-400' : 'border-green-600/50'
                }`}
              >
                <div className="text-green-200 text-sm mb-1">📈 UP Pool</div>
                <div className="text-2xl font-bold text-white mb-1">2.45 SOL</div>
                <div className="text-green-200 text-sm">Odds: 0.78x</div>
              </button>

              <button
                onClick={() => setPrediction('down')}
                className={`bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-4 border-2 transition-all ${
                  prediction === 'down' ? 'border-red-400' : 'border-red-600/50'
                }`}
              >
                <div className="text-red-200 text-sm mb-1">📉 DOWN Pool</div>
                <div className="text-2xl font-bold text-white mb-1">1.92 SOL</div>
                <div className="text-red-200 text-sm">Odds: 1.28x</div>
              </button>
            </div>

            {/* Place Bet Button */}
            {prediction && (
              <button
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-4 rounded-2xl font-semibold text-lg transition-all border border-purple-500/50"
              >
                Place Bet ({betAmount} SOL)
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-4 rounded-2xl font-semibold text-lg transition-all border border-purple-500/50 flex items-center justify-center gap-2">
              <span>🔗</span>
              Connect Solana Wallet
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 py-4 text-center">
        <p className="text-xs text-purple-300">Powered by Solana • Built for Farcaster</p>
      </footer>
    </div>
  );
} 