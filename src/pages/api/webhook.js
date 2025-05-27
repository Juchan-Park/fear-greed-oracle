export default function handler(req, res) {
  if (req.method === 'POST') {
    // Farcaster 웹훅 처리
    const { type, data } = req.body;
    
    console.log('Webhook received:', type, data);
    
    // 이벤트 처리 로직
    switch (type) {
      case 'mini_app_install':
        // 앱 설치 이벤트
        break;
      case 'mini_app_uninstall':
        // 앱 제거 이벤트
        break;
      default:
        break;
    }
    
    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 