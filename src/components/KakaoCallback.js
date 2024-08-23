// src/components/KakaoCallback.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const KakaoCallback = () => {
  const location = useLocation();
  const [authCode, setAuthCode] = useState(null); // 인가 코드를 저장할 상태

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (code) {
      setAuthCode(code); // 인가 코드를 상태에 저장
    } else if (error) {
      setAuthCode('Error occurred while receiving authorization code');
    }
  }, [location]);

  return (
    <div>
      <h1>Kakao Authorization Code Received</h1>
      {authCode ? (
        <p>Your Kakao authorization code is: <strong>{authCode}</strong></p>
      ) : (
        <p>No authorization code received.</p>
      )}
    </div>
  );
};

export default KakaoCallback;
