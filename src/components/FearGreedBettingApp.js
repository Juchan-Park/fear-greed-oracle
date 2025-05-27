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
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #3730a3 100%)',
          color: 'white'
        }}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen text-white p-4"
      style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #3730a3 100%)',
        color: 'white'
      }}
    >
      {/* Header */}
      <header className="text-center py-6">
        <h1 className="text-3xl font-bold mb-2">Fear &amp; Greed Oracle</h1>
        <p className="text-purple-200 text-lg">Predict Bitcoin&apos;s Fear &amp; Greed Index</p>
      </header>

      <main className="max-w-md mx-auto space-y-4">
        {/* Settlement Countdown */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-6 border"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderColor: 'rgba(71, 85, 105, 0.5)'
          }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-white text-lg">Settlement in</span>
            </div>
            <div 
              className="text-4xl font-bold"
              style={{ color: '#22d3ee' }}
            >
              {String(countdown.hours).padStart(2, '0')}:
              {String(countdown.minutes).padStart(2, '0')}:
              {String(countdown.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Current Fear & Greed Index */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-6 border"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderColor: 'rgba(71, 85, 105, 0.5)'
          }}
        >
          <h2 className="text-center text-white text-xl mb-6">Current Fear &amp; Greed Index</h2>
          
          {fearGreedIndex && (
            <div className="text-center">
              <div 
                className="text-8xl font-bold mb-2"
                style={{ color: '#fbbf24' }}
              >
                {fearGreedIndex.value}
              </div>
              <div 
                className="text-2xl font-semibold mb-4"
                style={{ color: '#fbbf24' }}
              >
                {fearGreedIndex.classification}
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm mb-6" style={{ color: '#f87171' }}>
                <span>📉</span>
                <span>Updated: {fearGreedIndex.lastUpdated}</span>
              </div>

              {/* Wave Chart */}
              <div className="mb-3">
                <WaveChart />
              </div>
              <div className="text-sm" style={{ color: '#9ca3af' }}>30-day trend</div>
            </div>
          )}
        </div>

        {/* Live Bets */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-4 border"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderColor: 'rgba(71, 85, 105, 0.5)'
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span style={{ color: '#22d3ee' }}>📊</span>
            <h3 className="text-xl font-semibold">Live Bets</h3>
          </div>
          
          <div className="space-y-3">
            {liveBets.map((bet, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: '#9ca3af' }}>{bet.address}</span>
                  <span className="text-sm" style={{ color: '#34d399' }}>📈</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{bet.amount}</div>
                  <div className="text-xs" style={{ color: '#9ca3af' }}>{bet.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bet Amount Selection */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-4 border"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderColor: 'rgba(71, 85, 105, 0.5)'
          }}
        >
          <h3 className="text-center text-white text-xl mb-4">Bet Amount (SOL)</h3>
          <div className="grid grid-cols-3 gap-3">
            {[0.01, 0.05, 0.1].map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount)}
                className="py-4 px-4 rounded-xl font-bold text-lg transition-all"
                style={{
                  backgroundColor: betAmount === amount ? '#06b6d4' : '#374151',
                  color: betAmount === amount ? '#000' : '#fff'
                }}
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
            className="rounded-2xl p-6 border-2 transition-all"
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              borderColor: prediction === 'up' ? '#2dd4bf' : 'rgba(13, 148, 136, 0.5)'
            }}
          >
            <div className="text-sm mb-2 flex items-center gap-1" style={{ color: '#a7f3d0' }}>
              <span>📈</span>
              <span>UP Pool</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">2.99 SOL</div>
            <div className="text-sm" style={{ color: '#a7f3d0' }}>Odds: 0.65x</div>
          </button>

          <button
            onClick={() => setPrediction('down')}
            className="rounded-2xl p-6 border-2 transition-all"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              borderColor: prediction === 'down' ? '#a855f7' : 'rgba(124, 58, 237, 0.5)'
            }}
          >
            <div className="text-sm mb-2 flex items-center gap-1" style={{ color: '#ddd6fe' }}>
              <span>📉</span>
              <span>DOWN Pool</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">1.94 SOL</div>
            <div className="text-sm" style={{ color: '#ddd6fe' }}>Odds: 1.54x</div>
          </button>
        </div>

        {/* Connect Wallet / Place Bet Button */}
        {connected ? (
          prediction && (
            <button
              className="w-full py-4 rounded-2xl font-bold text-xl transition-all border"
              style={{
                background: 'linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)',
                borderColor: 'rgba(124, 58, 237, 0.5)',
                color: 'white'
              }}
            >
              Place Bet ({betAmount} SOL)
            </button>
          )
        ) : (
          <button 
            className="w-full py-4 rounded-2xl font-bold text-xl transition-all border flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)',
              borderColor: 'rgba(124, 58, 237, 0.5)',
              color: 'white'
            }}
          >
            <span>🔗</span>
            <span>Connect Solana Wallet</span>
          </button>
        )}
      </main>
    </div>
  );
} 