// API Configuration
export const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:8080';

// OAuth Configuration
export const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID;
export const NAVER_REDIRECT_URI = encodeURI('https://localhost.com/callback');

export const KAKAO_CLIENT_ID = process.env.REACT_APP_KAKAO_CLIENT_ID;
export const KAKAO_REDIRECT_URI = encodeURI('https://localhost.com/kakao/callback');

export const APPLE_CLIENT_ID = process.env.REACT_APP_APPLE_CLIENT_ID;
export const APPLE_REDIRECT_URI = encodeURI('https://localhost.com/apple/callback');

// State token for OAuth
export const OAUTH_STATE = 'RANDOM_STATE';
