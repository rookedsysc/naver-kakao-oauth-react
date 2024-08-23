// src/components/Login.js

import React from 'react';

const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID; // 네이버 개발자 센터에서 발급받은 Client ID
const REDIRECT_URI = encodeURI('http://localhost:3000/callback'); // 리다이렉션 URI
const state = "RANDOM_STATE"; // 상태 토큰

const Login = () => {
  const handleLogin = () => {
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state}`;
    window.location.href = naverAuthUrl;
  };

  return (
    <div>
      <button onClick={handleLogin}>Login with Naver</button>
    </div>
  );
};

export default Login;
