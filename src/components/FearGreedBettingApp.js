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
    if (index <= 25) return '#ef4444'; // red-500
    if (index <= 45) return '#f97316'; // orange-500
    if (index <= 55) return '#eab308'; // yellow-500
    if (index <= 75) return '#84cc16'; // lime-500
    return '#22c55e'; // green-500
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
    <div 
      style={{
        minHeight: '100vh',
        height: '100%',
        background: 'linear-gradient(135deg, #581c87 0%, #1e3a8a 50%, #312e81 100%)',
        color: 'white',
        padding: '16px',
        paddingBottom: '32px'
      }}
    >
      <div style={{ maxWidth: '448px', margin: '0 auto', minHeight: 'calc(100vh - 32px)' }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Fear &amp; Greed Oracle</h1>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>Predict Bitcoin&apos;s Fear &amp; Greed Index</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px' }}>
          {/* 카운트다운 */}
          <div 
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <Clock style={{ width: '20px', height: '20px' }} />
              <span style={{ fontSize: '14px' }}>Settlement in</span>
            </div>
            <div style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: 'bold', color: '#22d3ee' }}>
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* 현재 지수 + 차트 */}
          <div 
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(4px)'
            }}
          >
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  border: '2px solid transparent',
                  borderTop: '2px solid #22d3ee',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 8px'
                }}></div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Loading Fear &amp; Greed Index...</div>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Current Fear &amp; Greed Index</div>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '4px', color: getIndexColor(currentIndex) }}>
                    {currentIndex}
                  </div>
                  <div style={{ fontSize: '14px', color: getIndexColor(currentIndex) }}>
                    {getIndexLabel(currentIndex)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    {indexTrend === 'up' && <TrendingUp style={{ width: '20px', height: '20px', color: '#22c55e' }} />}
                    {indexTrend === 'down' && <TrendingDown style={{ width: '20px', height: '20px', color: '#ef4444' }} />}
                    {lastUpdate && (
                      <span style={{ fontSize: '12px', opacity: 0.6 }}>
                        Updated: {lastUpdate.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* 미니 차트 */}
                <div style={{ height: '80px', width: '100%' }}>
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
                <div style={{ textAlign: 'center', fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>30-day trend</div>
              </>
            )}
          </div>

          {/* 실시간 베팅 내역 */}
          <div 
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Activity style={{ width: '16px', height: '16px', color: '#22d3ee' }} />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Live Bets</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {recentBets.map((bet, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  fontSize: '12px', 
                  backgroundColor: 'rgba(55, 65, 81, 0.3)', 
                  borderRadius: '4px', 
                  padding: '4px 8px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#9ca3af' }}>{bet.user}</span>
                    {bet.direction === 'up' ? 
                      <TrendingUp style={{ width: '12px', height: '12px', color: '#4ade80' }} /> : 
                      <TrendingDown style={{ width: '12px', height: '12px', color: '#f87171' }} />
                    }
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '600' }}>{bet.amount} SOL</span>
                    <span style={{ color: '#9ca3af' }}>{bet.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 베팅 금액 선택 */}
          <div 
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div style={{ fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>Bet Amount (SOL)</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0.01, 0.05, 0.1].map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: betAmount === amount ? '#06b6d4' : '#374151',
                    color: betAmount === amount ? '#000' : '#fff'
                  }}
                >
                  {amount} SOL
                </button>
              ))}
            </div>
          </div>

          {/* 베팅 풀 정보 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.2)', 
              border: '1px solid rgba(34, 197, 94, 0.5)', 
              borderRadius: '12px', 
              padding: '12px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <TrendingUp style={{ width: '16px', height: '16px', color: '#4ade80' }} />
                <span style={{ fontSize: '14px' }}>UP Pool</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{totalUpBets.toFixed(2)} SOL</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Odds: {odds.up}x</div>
            </div>
            <div style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.2)', 
              border: '1px solid rgba(239, 68, 68, 0.5)', 
              borderRadius: '12px', 
              padding: '12px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <TrendingDown style={{ width: '16px', height: '16px', color: '#f87171' }} />
                <span style={{ fontSize: '14px' }}>DOWN Pool</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{totalDownBets.toFixed(2)} SOL</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Odds: {odds.down}x</div>
            </div>
          </div>

          {/* 지갑 연결 / 베팅 버튼 */}
          {!connected ? (
            <div style={{ textAlign: 'center' }}>
              <WalletMultiButton style={{
                width: '100%',
                background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)',
                padding: '16px',
                borderRadius: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: 'scale(1)',
                fontSize: '16px'
              }} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => handleBet('up')}
                style={{
                  background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                  padding: '16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: 'scale(1)',
                  color: 'white'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <TrendingUp style={{ width: '20px', height: '20px' }} />
                  BET UP
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>{odds.up}x payout</div>
              </button>
              <button
                onClick={() => handleBet('down')}
                style={{
                  background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)',
                  padding: '16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  transform: 'scale(1)',
                  color: 'white'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <TrendingDown style={{ width: '20px', height: '20px' }} />
                  BET DOWN
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>{odds.down}x payout</div>
              </button>
            </div>
          )}

          {/* 내 베팅 기록 */}
          {userBets.length > 0 && (
            <div 
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                backdropFilter: 'blur(4px)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Trophy style={{ width: '16px', height: '16px' }} />
                <span style={{ fontSize: '14px', fontWeight: '600' }}>My Positions</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {userBets.slice(-3).map((bet, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(55, 65, 81, 0.5)', 
                    borderRadius: '8px', 
                    padding: '8px' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {bet.direction === 'up' ? 
                        <TrendingUp style={{ width: '16px', height: '16px', color: '#4ade80' }} /> : 
                        <TrendingDown style={{ width: '16px', height: '16px', color: '#f87171' }} />
                      }
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{bet.direction.toUpperCase()}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{bet.amount} SOL</div>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>{bet.odds}x odds</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FearGreedBettingApp; 