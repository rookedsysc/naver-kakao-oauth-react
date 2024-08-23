// src/components/Login.js

import React from 'react';

const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID; // 네이버 개발자 센터에서 발급받은 Client ID
const NAVER_REDIRECT_URI = encodeURI('http://localhost:3000/callback'); // 리다이렉션 URI

const KAKAO_CLIENT_ID = process.env.REACT_APP_KAKAO_CLIENT_ID; // 카카오 Client ID
const KAKAO_REDIRECT_URI = encodeURI('http://localhost:3000/kakao/callback'); // 카카오 리다이렉션 URI

const state = "RANDOM_STATE"; // 상태 토큰

const Login = () => {
  const handleNaverLogin = () => {
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${NAVER_REDIRECT_URI}&state=${state}`;
    window.location.href = naverAuthUrl;
  };

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;
    window.location.href = kakaoAuthUrl;
  };

  return (
      <div>
        <button onClick={handleKakaoLogin}>Login with Kakao</button>
        <button onClick={handleNaverLogin}>Login with Naver</button>
      </div>
  );
};

export default Login;
