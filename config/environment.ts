export const ENV = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  isProduction: process.env.NODE_ENV === 'production',
  appName: 'StadiumOS AI',
  appVersion: '1.0.0',
};
