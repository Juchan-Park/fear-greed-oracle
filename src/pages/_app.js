import { useEffect, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS first
import '@solana/wallet-adapter-react-ui/styles.css';
import '../styles/globals.css';

// Solana wallet adapters
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

export default function MyApp({ Component, pageProps }) {
  const endpoint = useMemo(() => 
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'), 
    []
  );

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

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
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
} 