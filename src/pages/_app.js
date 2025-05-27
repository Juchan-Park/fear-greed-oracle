import { useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import '../styles/globals.css';

// Solana wallet adapters
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

export default function MyApp({ Component, pageProps }) {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta');

  useEffect(() => {
    // 미니앱 환경 감지
    const url = new URL(window.location.href);
    const isMiniApp = 
      url.pathname.startsWith('/mini') || 
      url.searchParams.get('miniApp') === 'true';

    if (isMiniApp) {
      // 미니앱 전용 로직
      import('@farcaster/frame-sdk').then(({ sdk }) => {
        sdk.actions.ready();
      });
    }
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
} 