import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TrendingUp, TrendingDown, Clock, Coins, Trophy, AlertCircle, Activity, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const FearGreedBettingApp = () => {
  const { publicKey, connected } = useWallet();
  const [currentIndex, setCurrentIndex] = useState(55);
  const [indexTrend, setIndexTrend] = useState('neutral');
  const [selectedBet, setSelectedBet] = useState(null);
  const [betAmount, setBetAmount] = useState(0.01);
  const [timeLeft, setTimeLeft] = useState(86400); // 24시간 카운트다운
  const [totalUpBets, setTotalUpBets] = useState(2.99);
  const [totalDownBets, setTotalDownBets] = useState(1.94);
  const [userBets, setUserBets] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [recentBets, setRecentBets] = useState([
    { user: '0xb548...', direction: 'up', amount: 0.1, time: 'just now' },
    { user: '0x916f...', direction: 'up', amount: 0.1, time: 'just now' },
    { user: '0x26c4...', direction: 'up', amount: 0.01, time: 'just now' },
    { user: '0x4593...', direction: 'up', amount: 0.05, time: 'just now' },
  ]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Farcaster SDK 초기화
  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (typeof window !== 'undefined') {
          const { sdk } = await import('@farcaster/frame-sdk');
          await sdk.actions.ready();
          console.log('Farcaster SDK ready called');
        }
      } catch (error) {
        console.log('Not in Farcaster environment or SDK error:', error);
      }
    };

    initializeApp();
  }, []);

  // Fear & Greed Index 시뮬레이션
  const fetchFearGreedIndex = async () => {
    try {
      setIsLoading(true);
      
      // 시뮬레이션 데이터
      const simulatedIndex = Math.max(0, Math.min(100, 55 + (Math.random() - 0.5) * 20));
      setCurrentIndex(Math.round(simulatedIndex));
      setLastUpdate(new Date());
      
      // 시뮬레이션 차트 데이터
      const simulatedChart = [];
      for (let i = 29; i >= 0; i--) {
        simulatedChart.push({
          time: 29 - i,
          value: Math.max(0, Math.min(100, 55 + (Math.random() - 0.5) * 40))
        });
      }
      setChartData(simulatedChart);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchFearGreedIndex();
  }, []);

  // 카운트다운 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 86400);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fear & Greed Index 업데이트 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFearGreedIndex();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // 트렌드 계산
  useEffect(() => {
    if (chartData.length >= 2) {
      const current = chartData[chartData.length - 1]?.value || currentIndex;
      const previous = chartData[chartData.length - 2]?.value || currentIndex;
      
      if (current > previous) setIndexTrend('up');
      else if (current < previous) setIndexTrend('down');
      else setIndexTrend('neutral');
    }
  }, [chartData, currentIndex]);

  // 실시간 베팅 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% 확률로 새 베팅 추가
        const directions = ['up', 'down'];
        const amounts = [0.01, 0.05, 0.1];
        const newBet = {
          user: `0x${Math.random().toString(16).substr(2, 4)}...`,
          direction: directions[Math.floor(Math.random() * directions.length)],
          amount: amounts[Math.floor(Math.random() * amounts.length)],
          time: 'just now'
        };
        
        setRecentBets(prev => [newBet, ...prev.slice(0, 3)]);
        
        // 베팅 풀 업데이트
        if (newBet.direction === 'up') {
          setTotalUpBets(prev => prev + newBet.amount);
        } else {
          setTotalDownBets(prev => prev + newBet.amount);
        }
      }
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getIndexColor = (index) => {
    if (index <= 25) return 'text-red-500';
    if (index <= 45) return 'text-orange-500';
    if (index <= 55) return 'text-yellow-500';
    if (index <= 75) return 'text-lime-500';
    return 'text-green-500';
  };

  const getIndexLabel = (index) => {
    if (index <= 25) return 'Extreme Fear';
    if (index <= 45) return 'Fear';
    if (index <= 55) return 'Neutral';
    if (index <= 75) return 'Greed';
    return 'Extreme Greed';
  };

  const calculateOdds = () => {
    const upOdds = (totalDownBets / totalUpBets).toFixed(2);
    const downOdds = (totalUpBets / totalDownBets).toFixed(2);
    return { up: upOdds, down: downOdds };
  };

  const handleBet = (direction) => {
    if (!connected) {
      alert('Please connect your wallet first!');
      return;
    }

    const newBet = {
      direction,
      amount: betAmount,
      timestamp: Date.now(),
      odds: direction === 'up' ? calculateOdds().up : calculateOdds().down
    };

    setUserBets(prev => [...prev, newBet]);
    
    if (direction === 'up') {
      setTotalUpBets(prev => prev + betAmount);
    } else {
      setTotalDownBets(prev => prev + betAmount);
    }

    setSelectedBet(newBet);
  };

  const odds = calculateOdds();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* 헤더 */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold mb-2">Fear &amp; Greed Oracle</h1>
          <p className="text-sm opacity-80">Predict Bitcoin&apos;s Fear &amp; Greed Index</p>
        </div>

        {/* 카운트다운 */}
        <div className="bg-black/30 rounded-xl p-4 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm">Settlement in</span>
          </div>
          <div className="text-2xl font-mono font-bold text-cyan-400">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* 현재 지수 + 차트 */}
        <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-2"></div>
              <div className="text-sm opacity-80">Loading Fear &amp; Greed Index...</div>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <div className="text-sm opacity-80 mb-2">Current Fear &amp; Greed Index</div>
                <div className={`text-3xl font-bold mb-1 ${getIndexColor(currentIndex)}`}>
                  {currentIndex}
                </div>
                <div className={`text-sm ${getIndexColor(currentIndex)}`}>
                  {getIndexLabel(currentIndex)}
                </div>
                <div className="flex justify-center items-center gap-2 mt-2">
                  {indexTrend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                  {indexTrend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
                  {lastUpdate && (
                    <span className="text-xs opacity-60">
                      Updated: {lastUpdate.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
              
              {/* 미니 차트 */}
              <div className="h-20 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#06b6d4" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <XAxis hide />
                    <YAxis hide domain={[0, 100]} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-xs opacity-60 mt-1">30-day trend</div>
            </>
          )}
        </div>

        {/* 실시간 베팅 내역 */}
        <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold">Live Bets</span>
          </div>
          <div className="space-y-1">
            {recentBets.map((bet, index) => (
              <div key={index} className="flex justify-between items-center text-xs bg-gray-700/30 rounded px-2 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{bet.user}</span>
                  {bet.direction === 'up' ? 
                    <TrendingUp className="w-3 h-3 text-green-400" /> : 
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  }
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{bet.amount} SOL</span>
                  <span className="text-gray-400">{bet.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 베팅 금액 선택 */}
        <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-sm mb-3 text-center">Bet Amount (SOL)</div>
          <div className="flex gap-2">
            {[0.01, 0.05, 0.1].map(amount => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  betAmount === amount
                    ? 'bg-cyan-500 text-black'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {amount} SOL
              </button>
            ))}
          </div>
        </div>

        {/* 베팅 풀 정보 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm">UP Pool</span>
            </div>
            <div className="text-lg font-bold">{totalUpBets.toFixed(2)} SOL</div>
            <div className="text-xs opacity-80">Odds: {odds.up}x</div>
          </div>
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-sm">DOWN Pool</span>
            </div>
            <div className="text-lg font-bold">{totalDownBets.toFixed(2)} SOL</div>
            <div className="text-xs opacity-80">Odds: {odds.down}x</div>
          </div>
        </div>

        {/* 지갑 연결 / 베팅 버튼 */}
        {!connected ? (
          <div className="text-center">
            <WalletMultiButton className="!w-full !bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !py-4 !rounded-xl !font-semibold !transition-all !transform hover:!scale-[1.02]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleBet('up')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-4 rounded-xl font-semibold transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5" />
                BET UP
              </div>
              <div className="text-xs opacity-80">{odds.up}x payout</div>
            </button>
            <button
              onClick={() => handleBet('down')}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 py-4 rounded-xl font-semibold transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingDown className="w-5 h-5" />
                BET DOWN
              </div>
              <div className="text-xs opacity-80">{odds.down}x payout</div>
            </button>
          </div>
        )}

        {/* 내 베팅 기록 */}
        {userBets.length > 0 && (
          <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-semibold">My Positions</span>
            </div>
            <div className="space-y-2">
              {userBets.slice(-3).map((bet, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-700/50 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    {bet.direction === 'up' ? 
                      <TrendingUp className="w-4 h-4 text-green-400" /> : 
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    }
                    <span className="text-sm font-semibold">{bet.direction.toUpperCase()}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{bet.amount} SOL</div>
                    <div className="text-xs opacity-80">{bet.odds}x odds</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 경고 메시지 */}
        <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-200">
              <div className="font-semibold mb-1">Risk Warning</div>
              <div>This is a betting game. Only bet what you can afford to lose.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FearGreedBettingApp; 