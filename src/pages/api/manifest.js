export default function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjEyMzQ1LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCJ9",
      payload: "eyJkb21haW4iOiJmZWFyLWdyZWVkLW9yYWNsZS1nZ2FscDRhbTctMHhkYXZlcy1wcm9qZWN0cy52ZXJjZWwuYXBwIn0",
      signature: "MHg..."
    },
    frame: {
      version: "1",
      name: "Fear & Greed Oracle",
      iconUrl: "https://fear-greed-oracle-ggalp4am7-0xdaves-projects.vercel.app/icon.png",
      splashImageUrl: "https://fear-greed-oracle-ggalp4am7-0xdaves-projects.vercel.app/splash.png",
      splashBackgroundColor: "#1a1b23",
      homeUrl: "https://fear-greed-oracle-ggalp4am7-0xdaves-projects.vercel.app",
      webhookUrl: "https://fear-greed-oracle-ggalp4am7-0xdaves-projects.vercel.app/api/webhook"
    },
    capabilities: {
      solana: {
        version: "1.0.0"
      }
    }
  };

  res.status(200).json(manifest);
} 