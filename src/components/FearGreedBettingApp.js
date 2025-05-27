import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function FearGreedBettingApp() {
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(true);
  const [fearGreedIndex, setFearGreedIndex] = useState(null);
  const [betAmount, setBetAmount] = useState(0.01);
  const [prediction, setPrediction] = useState(null);
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 54, seconds: 56 });
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
        value: 55,
        classification: "Neutral",
        timestamp: new Date().toISOString(),
        change24h: 2,
        lastUpdated: "오전 12:34:11"
      };
      setFearGreedIndex(mockData);

      // Mock live bets
      const mockBets = [
        { address: "0xb548...", amount: "0.1 SOL", direction: "up", time: "just now" },
        { address: "0x916f...", amount: "0.1 SOL", direction: "up", time: "just now" },
        { address: "0x26c4...", amount: "0.01 SOL", direction: "up", time: "just now" },
        { address: "0x4593...", amount: "0.05 SOL", direction: "up", time: "just now" },
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

  // Wave chart component matching the reference
  const WaveChart = () => (
    <svg viewBox="0 0 400 80" className="w-full h-16">
      <path
        d="M0,40 Q20,30 40,35 T80,40 T120,30 T160,45 T200,35 T240,40 T280,30 T320,45 T360,35 T400,40"
        stroke="#22d3ee"
        strokeWidth="2"
        fill="none"
        className="animate-pulse"
      />
    </svg>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white p-4">
      {/* Header */}
      <header className="text-center py-6">
        <h1 className="text-3xl font-bold mb-2">Fear &amp; Greed Oracle</h1>
        <p className="text-purple-200 text-lg">Predict Bitcoin&apos;s Fear &amp; Greed Index</p>
      </header>

      <main className="max-w-md mx-auto space-y-4">
        {/* Settlement Countdown */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-white text-lg">Settlement in</span>
            </div>
            <div className="text-4xl font-bold text-cyan-400">
              {String(countdown.hours).padStart(2, '0')}:
              {String(countdown.minutes).padStart(2, '0')}:
              {String(countdown.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Current Fear & Greed Index */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-center text-white text-xl mb-6">Current Fear &amp; Greed Index</h2>
          
          {fearGreedIndex && (
            <div className="text-center">
              <div className="text-8xl font-bold text-yellow-400 mb-2">
                {fearGreedIndex.value}
              </div>
              <div className="text-2xl font-semibold text-yellow-400 mb-4">
                {fearGreedIndex.classification}
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-red-400 mb-6">
                <span>📉</span>
                <span>Updated: {fearGreedIndex.lastUpdated}</span>
              </div>

              {/* Wave Chart */}
              <div className="mb-3">
                <WaveChart />
              </div>
              <div className="text-sm text-gray-400">30-day trend</div>
            </div>
          )}
        </div>

        {/* Live Bets */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-cyan-400">📊</span>
            <h3 className="text-xl font-semibold">Live Bets</h3>
          </div>
          
          <div className="space-y-3">
            {liveBets.map((bet, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">{bet.address}</span>
                  <span className="text-green-400 text-sm">📈</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{bet.amount}</div>
                  <div className="text-gray-400 text-xs">{bet.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bet Amount Selection */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
          <h3 className="text-center text-white text-xl mb-4">Bet Amount (SOL)</h3>
          <div className="grid grid-cols-3 gap-3">
            {[0.01, 0.05, 0.1].map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount)}
                className={`py-4 px-4 rounded-xl font-bold text-lg transition-all ${
                  betAmount === amount
                    ? 'bg-cyan-500 text-black'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
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
            className={`bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 border-2 transition-all ${
              prediction === 'up' ? 'border-teal-400' : 'border-teal-600/50'
            }`}
          >
            <div className="text-teal-200 text-sm mb-2 flex items-center gap-1">
              <span>📈</span>
              <span>UP Pool</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">2.99 SOL</div>
            <div className="text-teal-200 text-sm">Odds: 0.65x</div>
          </button>

          <button
            onClick={() => setPrediction('down')}
            className={`bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 border-2 transition-all ${
              prediction === 'down' ? 'border-purple-400' : 'border-purple-600/50'
            }`}
          >
            <div className="text-purple-200 text-sm mb-2 flex items-center gap-1">
              <span>📉</span>
              <span>DOWN Pool</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">1.94 SOL</div>
            <div className="text-purple-200 text-sm">Odds: 1.54x</div>
          </button>
        </div>

        {/* Connect Wallet / Place Bet Button */}
        {connected ? (
          prediction && (
            <button
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-4 rounded-2xl font-bold text-xl transition-all border border-purple-500/50"
            >
              Place Bet ({betAmount} SOL)
            </button>
          )
        ) : (
          <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-4 rounded-2xl font-bold text-xl transition-all border border-purple-500/50 flex items-center justify-center gap-3">
            <span>🔗</span>
            <span>Connect Solana Wallet</span>
          </button>
        )}
      </main>
    </div>
  );
} 