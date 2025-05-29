import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { TrendingUp, TrendingDown, Clock, Coins, Trophy, AlertCircle, Activity, Users, MessageCircle, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';

const FearGreedBettingApp = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Farcaster 사용자 정보 (SDK context에서 가져옴)
  const [farcasterUser, setFarcasterUser] = useState(null);
  const [farcasterContext, setFarcasterContext] = useState(null);
  
  const [currentIndex, setCurrentIndex] = useState(55);
  const [indexTrend, setIndexTrend] = useState('neutral');
  const [selectedBet, setSelectedBet] = useState(null);
  const [betAmount, setBetAmount] = useState(1);
  const [betComment, setBetComment] = useState('');
  const [timeLeft, setTimeLeft] = useState(86400); // 24시간 카운트다운
  const [totalUpBets, setTotalUpBets] = useState(299);
  const [totalDownBets, setTotalDownBets] = useState(194);
  const [userBets, setUserBets] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [yesterdayAverage, setYesterdayAverage] = useState(50); // 어제 평균값
  const [recentBets, setRecentBets] = useState([
    { user: '0xb548...', direction: 'up', amount: 10, time: 'just now', comment: 'Bitcoin to the moon! 🚀' },
    { user: '0x916f...', direction: 'up', amount: 5, time: 'just now', comment: 'Bullish on crypto' },
    { user: '0x26c4...', direction: 'up', amount: 1, time: 'just now', comment: '' },
    { user: '0x4593...', direction: 'down', amount: 5, time: 'just now', comment: 'Market correction incoming' },
  ]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timezone, setTimezone] = useState('');
  const [isFarcasterEnvironment, setIsFarcasterEnvironment] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Farcaster SDK 초기화 및 사용자 정보 가져오기
  useEffect(() => {
    console.log('FearGreedBettingApp: Starting Farcaster SDK initialization...');
    
    const initializeFarcaster = async () => {
      try {
        // iframe 환경 감지
        const isInIframe = window.self !== window.top;
        setIsFarcasterEnvironment(isInIframe);
        
        console.log('Environment check:', { isInIframe, userAgent: navigator.userAgent });
        
        if (isInIframe) {
          console.log('Running in iframe (likely Farcaster)');
          
          // Farcaster SDK 로드 시도
          try {
            const { sdk } = await import('@farcaster/frame-sdk');
            console.log('Farcaster SDK imported successfully');
            
            // SDK 초기화
            await sdk.actions.ready();
            console.log('Farcaster SDK ready called');
            
            // 사용자 정보 가져오기
            if (sdk.context?.user) {
              console.log('Farcaster user found:', sdk.context.user);
              setFarcasterUser(sdk.context.user);
              setFarcasterContext(sdk.context);
            } else {
              console.log('No user in Farcaster context, setting demo user');
              setFarcasterUser({ fid: 'demo', username: 'demo_user' });
            }
          } catch (sdkError) {
            console.error('Error loading Farcaster SDK:', sdkError);
            setFarcasterUser({ fid: 'demo', username: 'demo_user' });
          }
        } else {
          console.log('Running standalone (not in iframe)');
          setFarcasterUser({ fid: 'demo', username: 'demo_user' });
        }
        
        setIsInitializing(false);
      } catch (error) {
        console.error('Error initializing Farcaster:', error);
        setFarcasterUser({ fid: 'demo', username: 'demo_user' });
        setIsInitializing(false);
      }
    };

    // 짧은 지연 후 초기화 (DOM이 완전히 로드되도록)
    const timer = setTimeout(initializeFarcaster, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Farcaster 환경에서 자동 연결 확인
  useEffect(() => {
    if (isFarcasterEnvironment && farcasterUser) {
      console.log('Farcaster environment with user detected');
      console.log('Wallet connection status:', { isConnected, address });
      
      // Farcaster Frame Connector가 자동으로 지갑을 연결하므로 별도 연결 시도 불필요
      if (isConnected) {
        console.log('Farcaster Ethereum wallet automatically connected!');
      }
    }
  }, [isFarcasterEnvironment, farcasterUser, isConnected, address]);

  // 현재 시간 및 타임존 업데이트
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      
      // 타임존 정보 가져오기
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const timeZoneAbbr = new Intl.DateTimeFormat('en', {
        timeZoneName: 'short'
      }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value || 'UTC';
      
      setTimezone(timeZoneAbbr);
    };
    
    updateTime(); // 초기 실행
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
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
        const amounts = [1, 5, 10];
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

  const formatCurrentTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${ampm} ${displayHours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} (${timezone})`;
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
    if (!farcasterUser || (!farcasterUser.fid && farcasterUser.fid !== 'demo')) {
      alert('Please open this app in Farcaster to start betting!');
      return;
    }

    // Farcaster 환경에서는 자동 연결되므로 더 친화적인 메시지
    if (!isConnected && farcasterUser.fid !== 'demo') {
      if (isFarcasterEnvironment) {
        alert('Farcaster Ethereum wallet is connecting... Please wait a moment and try again!');
      } else {
        alert('Please connect your wallet to place bets!');
      }
      return;
    }

    const newBet = {
      direction,
      amount: betAmount,
      timestamp: Date.now(),
      odds: direction === 'up' ? calculateOdds().up : calculateOdds().down,
      comment: betComment,
      user: farcasterUser.fid === 'demo' 
        ? 'Demo User' 
        : (farcasterUser?.username || farcasterUser?.displayName || `FID: ${farcasterUser?.fid}` || 'Anonymous')
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
  const SemicircleGauge = ({ value, size = 280 }) => {
    const radius = size / 2 - 20;
    const centerX = size / 2;
    const centerY = size / 2 - 20; // 중심을 위로 이동 (위쪽 반원)
    
    // 반원 경로 생성 (위쪽 반원 - 180도 뒤집음)
    const createArc = (startAngle, endAngle, color) => {
      const start = polarToCartesian(centerX, centerY, radius, endAngle - 90);
      const end = polarToCartesian(centerX, centerY, radius, startAngle - 90);
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
    
    // 바늘 위치 계산 (0-100을 180도로 매핑, 위쪽 반원)
    const needleAngle = (value / 100) * 180 - 90;
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
      </svg>
    );
  };

  const odds = calculateOdds();

  console.log('FearGreedBettingApp: Rendering, isInitializing:', isInitializing);

  if (isInitializing) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #581c87 0%, #1e3a8a 50%, #312e81 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '2px solid transparent',
            borderTop: '2px solid #22d3ee',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Loading Mini App...</div>
          <div style={{ fontSize: '14px', color: '#22d3ee' }}>Initializing Farcaster SDK...</div>
        </div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #581c87 0%, #1e3a8a 50%, #312e81 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '448px',
        margin: '0 auto',
        padding: '24px 16px',
        boxSizing: 'border-box'
      }}>
        {/* 헤더 with 지갑 버튼 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '24px' 
        }}>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #22d3ee 0%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 8px 0'
            }}>
              Fear & Greed Oracle
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              fontSize: '14px',
              color: '#d1d5db'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} />
                <span>Ends in {formatTime(timeLeft)}</span>
              </div>
              <div style={{ fontSize: '14px', color: '#d1d5db' }}>
                {formatCurrentTime(currentTime)}
              </div>
            </div>
          </div>

          {/* 지갑 연결 버튼 (우측 상단) */}
          {!isConnected && farcasterUser?.fid !== 'demo' && (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              style={{
                background: 'linear-gradient(90deg, #06b6d4 0%, #2563eb 100%)',
                color: 'white',
                fontWeight: '600',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              Connect
            </button>
          )}
        </div>

        {/* Fear & Greed Index 게이지 with 차트 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <Activity size={20} color="#22d3ee" />
              <span style={{ fontSize: '18px', fontWeight: '600' }}>Current Index</span>
            </div>
            
            {/* 반원 게이지 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <SemicircleGauge value={currentIndex} size={280} />
            </div>
            
            {/* 인덱스 숫자와 라벨 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: getIndexColor(currentIndex)
              }}>
                {currentIndex}
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: getIndexColor(currentIndex)
              }}>
                {getIndexLabel(currentIndex)}
              </div>
            </div>

            {/* 차트 (Current Index 섹션 내부) */}
            {chartData.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ height: '120px', display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="90%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis hide />
                      <YAxis hide domain={[0, 100]} />
                      <ReferenceLine y={yesterdayAverage} stroke="#fbbf24" strokeDasharray="3 3" strokeWidth={2} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* vs yesterday avg */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#d1d5db',
                  marginTop: '12px'
                }}>
                  {indexTrend === 'up' && <TrendingUp size={16} color="#22c55e" />}
                  {indexTrend === 'down' && <TrendingDown size={16} color="#ef4444" />}
                  <span>vs yesterday avg: {yesterdayAverage}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 베팅 섹션 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Trophy size={20} color="#eab308" />
            <span style={{ fontSize: '18px', fontWeight: '600' }}>Place Your Bet</span>
          </div>
          
          {/* 베팅 풀 정보 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
              <div style={{ color: '#22c55e', fontSize: '14px', fontWeight: '500' }}>UP Pool</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totalUpBets.toLocaleString()} USDC</div>
              <div style={{ fontSize: '12px', color: '#d1d5db' }}>Odds: {odds.up}x</div>
            </div>
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{ color: '#ef4444', fontSize: '14px', fontWeight: '500' }}>DOWN Pool</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totalDownBets.toLocaleString()} USDC</div>
              <div style={{ fontSize: '12px', color: '#d1d5db' }}>Odds: {odds.down}x</div>
            </div>
          </div>

          {/* 베팅 금액 설정 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              Bet Amount (USDC)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 5, 10].map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: betAmount === amount ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)',
                    color: betAmount === amount ? 'white' : '#d1d5db'
                  }}
                  onMouseEnter={(e) => {
                    if (betAmount !== amount) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (betAmount !== amount) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                >
                  {amount} USDC
                </button>
              ))}
            </div>
          </div>

          {/* 코멘트 입력 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              Comment (optional)
            </label>
            <input
              type="text"
              value={betComment}
              onChange={(e) => setBetComment(e.target.value)}
              maxLength={100}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Share your prediction..."
            />
          </div>

          {/* 베팅 버튼 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <button
              onClick={() => handleBet('up')}
              style={{
                background: 'linear-gradient(90deg, #22c55e 0%, #10b981 100%)',
                color: 'white',
                fontWeight: 'bold',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '16px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(90deg, #16a34a 0%, #059669 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(90deg, #22c55e 0%, #10b981 100%)';
              }}
            >
              <TrendingUp size={20} />
              BET UP
            </button>
            <button
              onClick={() => handleBet('down')}
              style={{
                background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                fontWeight: 'bold',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '16px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
              }}
            >
              <TrendingDown size={20} />
              BET DOWN
            </button>
          </div>
        </div>

        {/* 최근 베팅 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Users size={20} color="#a855f7" />
            <span style={{ fontSize: '18px', fontWeight: '600' }}>Recent Bets</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentBets.map((bet, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} color="#9ca3af" />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{bet.user}</span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: bet.direction === 'up' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: bet.direction === 'up' ? '#22c55e' : '#ef4444'
                    }}>
                      {bet.direction.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{bet.amount} USDC</div>
                </div>
                {bet.comment && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#d1d5db'
                  }}>
                    <MessageCircle size={12} />
                    <span>{bet.comment}</span>
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{bet.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 사용자 베팅 히스토리 */}
        {userBets.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <Coins size={20} color="#eab308" />
              <span style={{ fontSize: '18px', fontWeight: '600' }}>Your Bets</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {userBets.slice(-3).reverse().map((bet, index) => (
                <div key={index} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: bet.direction === 'up' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: bet.direction === 'up' ? '#22c55e' : '#ef4444'
                      }}>
                        {bet.direction.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '14px' }}>{bet.amount} USDC</span>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>@{bet.odds}x</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {new Date(bet.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {bet.comment && (
                    <div style={{ fontSize: '14px', color: '#d1d5db', marginTop: '4px' }}>{bet.comment}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 베팅 성공 모달 */}
        {selectedBet && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 50
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #581c87 0%, #1e3a8a 100%)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '384px',
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Trophy size={32} color="#22c55e" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Bet Placed!</h3>
                <p style={{ color: '#d1d5db', marginBottom: '16px' }}>
                  You bet {selectedBet.amount} USDC on {selectedBet.direction.toUpperCase()}
                </p>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '14px', color: '#d1d5db' }}>Potential Payout</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>
                    {(selectedBet.amount * parseFloat(selectedBet.odds)).toFixed(0)} USDC
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBet(null)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(90deg, #06b6d4 0%, #2563eb 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '16px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(90deg, #0891b2 0%, #1d4ed8 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(90deg, #06b6d4 0%, #2563eb 100%)';
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 푸터 정보 */}
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#9ca3af',
          marginTop: '24px'
        }}>
          <div style={{ marginBottom: '8px' }}>
            {isFarcasterEnvironment ? '🟢 Farcaster Mini App' : '🔵 Standalone Mode'}
            {farcasterUser && farcasterUser.fid !== 'demo' && (
              <span style={{ marginLeft: '8px' }}>• User: {farcasterUser.username || farcasterUser.fid}</span>
            )}
            {isConnected && (
              <span style={{ marginLeft: '8px' }}>• Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
            )}
          </div>
          <div>
            Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Loading...'}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FearGreedBettingApp; 