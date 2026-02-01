// src/components/Login.js

import { useState } from "react";
import {
  APPLE_CLIENT_ID,
  APPLE_REDIRECT_URI,
  BACKEND_API_URL,
  KAKAO_CLIENT_ID,
  KAKAO_REDIRECT_URI,
  NAVER_CLIENT_ID,
  NAVER_REDIRECT_URI,
  OAUTH_STATE,
} from "../config/constants";
import { generateMockIdToken } from "../utils/tokenGenerator";

const Login = () => {
  const [isTestingApple, setIsTestingApple] = useState(false);

  const handleNaverLogin = () => {
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${NAVER_REDIRECT_URI}&state=${OAUTH_STATE}`;
    window.location.href = naverAuthUrl;
  };

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;
    window.location.href = kakaoAuthUrl;
  };

  const handleAppleLogin = () => {
    // response_type에 id_token 포함 필수 (백엔드가 JWT 검증만 지원)
    // response_mode=fragment로 URL hash에서 토큰 수신
    // scope=openid는 id_token 발급에 필요
    const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${APPLE_CLIENT_ID}&redirect_uri=${APPLE_REDIRECT_URI}&response_type=code%20id_token&response_mode=fragment&scope=openid&state=${OAUTH_STATE}`;
    window.location.href = appleAuthUrl;
  };

  const handleTestAppleSignup = async () => {
    setIsTestingApple(true);
    try {
      // JWT 형식의 모의 ID Token 생성
      // 형식: header.payload.signature (점 2개 포함)
      const mockIdToken = generateMockIdToken({
        clientId: APPLE_CLIENT_ID,
        sub: "001234.test.abcdef",
        email: "test@example.com",
      });

      console.log(
        "Generated mock ID Token:",
        mockIdToken.substring(0, 50) + "...",
      );

      const response = await fetch(
        `${BACKEND_API_URL}/open-api/v1/auth/apple`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deviceId: "web-browser",
            platform: "WEB",
            packageName: "com.photocard.master",
            idToken: mockIdToken,
          }),
        },
      );

      const data = await response.json();
      console.log("Apple signup test response:", data);

      if (data.status === 200 && data.data) {
        const { accessToken, refreshToken, userId, isNewUser } = data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userId", userId);
        localStorage.setItem("isNewUser", isNewUser);
        alert(
          `✅ Test signup successful!\nUser ID: ${userId}\nNew User: ${isNewUser}`,
        );
      } else {
        alert(`❌ Unexpected response: ${data.message}`);
      }
    } catch (error) {
      console.error("Test signup error:", error);
      alert(`❌ Test failed: ${error.message}`);
    } finally {
      setIsTestingApple(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <button
        onClick={handleKakaoLogin}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        Login with Kakao
      </button>
      <button
        onClick={handleNaverLogin}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        Login with Naver
      </button>
      <button
        onClick={handleAppleLogin}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        Login with Apple
      </button>
      <hr style={{ width: "100%", margin: "20px 0" }} />
      <button
        onClick={handleTestAppleSignup}
        disabled={isTestingApple}
        style={{
          padding: "10px 20px",
          fontSize: "14px",
          cursor: isTestingApple ? "not-allowed" : "pointer",
          backgroundColor: "#fbbf24",
          border: "none",
          borderRadius: "4px",
          opacity: isTestingApple ? 0.6 : 1,
        }}
      >
        {isTestingApple ? "Testing..." : "🧪 Test Apple Signup"}
      </button>
    </div>
  );
};

export default Login;
