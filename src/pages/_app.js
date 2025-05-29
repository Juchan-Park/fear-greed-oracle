import { useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../lib/wagmi';
import '../styles/globals.css';

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // 미니앱 환경 감지
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const isMiniApp = 
        url.pathname.startsWith('/mini') || 
        url.searchParams.get('miniApp') === 'true';

      if (isMiniApp) {
        // 미니앱 전용 로직
        import('@farcaster/frame-sdk').then(({ sdk }) => {
          sdk.actions.ready();
        }).catch(console.error);
      }
    }
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </WagmiProvider>
  );
} 