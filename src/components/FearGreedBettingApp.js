import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TrendingUp, TrendingDown, Clock, Coins, Trophy, AlertCircle, Activity, Users, MessageCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';

const FearGreedBettingApp = () => {
  const { publicKey, connected } = useWallet();
  const [currentIndex, setCurrentIndex] = useState(55);
  const [indexTrend, setIndexTrend] = useState('neutral');
  const [selectedBet, setSelectedBet] = useState(null);
  const [betAmount, setBetAmount] = useState(0.01);
  const [betComment, setBetComment] = useState('');
  const [timeLeft, setTimeLeft] = useState(86400); // 24시간 카운트다운
  const [totalUpBets, setTotalUpBets] = useState(2.99);
  const [totalDownBets, setTotalDownBets] = useState(1.94);
  const [userBets, setUserBets] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [yesterdayAverage, setYesterdayAverage] = useState(50); // 어제 평균값
  const [recentBets, setRecentBets] = useState([
    { user: '0xb548...', direction: 'up', amount: 0.1, time: 'just now', comment: 'Bitcoin to the moon! 🚀' },
    { user: '0x916f...', direction: 'up', amount: 0.1, time: 'just now', comment: 'Bullish on crypto' },
    { user: '0x26c4...', direction: 'up', amount: 0.01, time: 'just now', comment: '' },
    { user: '0x4593...', direction: 'down', amount: 0.05, time: 'just now', comment: 'Market correction incoming' },
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
      
      // 어제 평균값 계산 (시뮬레이션)
      const yesterdayData = simulatedChart.slice(0, 24);
      const avgYesterday = yesterdayData.reduce((sum, item) => sum + item.value, 0) / yesterdayData.length;
      setYesterdayAverage(Math.round(avgYesterday));
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
        const comments = ['', 'HODL strong!', 'Market looks bullish', 'Time to buy the dip', 'Feeling lucky today', 'Let\'s go!'];
        const newBet = {
          user: `0x${Math.random().toString(16).substr(2, 4)}...`,
          direction: directions[Math.floor(Math.random() * directions.length)],
          amount: amounts[Math.floor(Math.random() * amounts.length)],
          time: 'just now',
          comment: comments[Math.floor(Math.random() * comments.length)]
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
      odds: direction === 'up' ? calculateOdds().up : calculateOdds().down,
      comment: betComment
    };

    setUserBets(prev => [...prev, newBet]);
    
    if (direction === 'up') {
      setTotalUpBets(prev => prev + betAmount);
    } else {
      setTotalDownBets(prev => prev + betAmount);
    }

    setSelectedBet(newBet);
    setBetComment(''); // 코멘트 초기화
  };

  // 반원 게이지 컴포넌트
  const SemicircleGauge = ({ value, size = 200 }) => {
    const radius = size / 2 - 20;
    const centerX = size / 2;
    const centerY = size / 2;
    
    // 반원 경로 생성
    const createArc = (startAngle, endAngle, color) => {
      const start = polarToCartesian(centerX, centerY, radius, endAngle);
      const end = polarToCartesian(centerX, centerY, radius, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
    };
    
    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    };
    
    // 바늘 위치 계산 (0-100을 180도로 매핑)
    const needleAngle = (value / 100) * 180;
    const needleEnd = polarToCartesian(centerX, centerY, radius - 10, needleAngle);
    
    return (
      <svg width={size} height={size / 2 + 40} style={{ overflow: 'visible' }}>
        {/* 배경 반원 */}
        <path
          d={createArc(0, 180)}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* 색상 구간들 */}
        <path d={createArc(0, 36)} fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />
        <path d={createArc(36, 72)} fill="none" stroke="#f97316" strokeWidth="12" strokeLinecap="round" />
        <path d={createArc(72, 108)} fill="none" stroke="#eab308" strokeWidth="12" strokeLinecap="round" />
        <path d={createArc(108, 144)} fill="none" stroke="#84cc16" strokeWidth="12" strokeLinecap="round" />
        <path d={createArc(144, 180)} fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" />
        
        {/* 바늘 */}
        <line
          x1={centerX}
          y1={centerY}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* 중심점 */}
        <circle cx={centerX} cy={centerY} r="6" fill="white" />
        
        {/* 숫자 표시 */}
        <text
          x={centerX}
          y={centerY + 30}
          textAnchor="middle"
          fill="white"
          fontSize="24"
          fontWeight="bold"
        >
          {value}
        </text>
      </svg>
    );
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
        {/* 헤더 with 지갑 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Fear &amp; Greed Oracle</h1>
            <p style={{ fontSize: '14px', opacity: 0.8 }}>Predict Bitcoin&apos;s Fear &amp; Greed Index</p>
          </div>
          <div style={{ minWidth: '120px' }}>
            <WalletMultiButton style={{
              background: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              minWidth: '100px'
            }} />
          </div>
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

          {/* 현재 지수 + 반원 게이지 + 차트 */}
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
                  <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '16px' }}>Current Fear &amp; Greed Index</div>
                  
                  {/* 반원 게이지 */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                    <SemicircleGauge value={currentIndex} size={200} />
                  </div>
                  
                  <div style={{ fontSize: '18px', color: getIndexColor(currentIndex), fontWeight: '600', marginBottom: '8px' }}>
                    {getIndexLabel(currentIndex)}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    {indexTrend === 'up' && <TrendingUp style={{ width: '16px', height: '16px', color: '#22c55e' }} />}
                    {indexTrend === 'down' && <TrendingDown style={{ width: '16px', height: '16px', color: '#ef4444' }} />}
                    {lastUpdate && (
                      <span style={{ fontSize: '12px', opacity: 0.6 }}>
                        Updated: {lastUpdate.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* 차트 with 기준선 */}
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
                      <ReferenceLine 
                        y={yesterdayAverage} 
                        stroke="#fbbf24" 
                        strokeDasharray="3 3" 
                        strokeWidth={1}
                        label={{ value: `Yesterday: ${yesterdayAverage}`, position: 'topRight', fontSize: 10, fill: '#fbbf24' }}
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

          {/* 베팅 풀 정보 (위로 이동) */}
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

          {/* 실시간 베팅 내역 (아래로 이동) */}
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
                  padding: '6px 8px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <span style={{ color: '#9ca3af', minWidth: '60px' }}>{bet.user}</span>
                    {bet.direction === 'up' ? 
                      <TrendingUp style={{ width: '12px', height: '12px', color: '#4ade80' }} /> : 
                      <TrendingDown style={{ width: '12px', height: '12px', color: '#f87171' }} />
                    }
                    {bet.comment && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        padding: '2px 6px',
                        borderRadius: '8px',
                        flex: 1,
                        maxWidth: '120px'
                      }}>
                        <MessageCircle style={{ width: '10px', height: '10px', color: '#22d3ee' }} />
                        <span style={{ 
                          color: '#e5e7eb', 
                          fontSize: '10px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {bet.comment}
                        </span>
                      </div>
                    )}
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
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
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
            
            {/* 코멘트 입력 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', marginBottom: '6px', opacity: 0.8 }}>Comment (optional)</div>
              <input
                type="text"
                value={betComment}
                onChange={(e) => setBetComment(e.target.value)}
                placeholder="Add a comment to your bet..."
                maxLength={50}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: 'white',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* 베팅 버튼 */}
          {connected ? (
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
          ) : (
            <div style={{ textAlign: 'center', fontSize: '14px', opacity: 0.8, padding: '16px' }}>
              Connect your wallet to start betting
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
                      {bet.comment && (
                        <span style={{ fontSize: '12px', opacity: 0.7, fontStyle: 'italic' }}>
                          &quot;{bet.comment}&quot;
                        </span>
                      )}
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