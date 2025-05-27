import Head from 'next/head';
import FearGreedBettingApp from '../components/FearGreedBettingApp';

export default function Home() {
  return (
    <>
      <Head>
        <title>Fear & Greed Oracle</title>
        <meta name="description" content="Predict Bitcoin's Fear & Greed Index" />
        <link rel="icon" href="/icon.png" />
      </Head>
      <FearGreedBettingApp />
    </>
  );
} 