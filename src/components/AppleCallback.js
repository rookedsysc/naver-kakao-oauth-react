// src/components/AppleCallback.js

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BACKEND_API_URL } from "../config/constants";

const AppleCallback = () => {
  const location = useLocation();
  const [authStatus, setAuthStatus] = useState("processing");
  const [message, setMessage] = useState("Processing Apple Sign In...");

  useEffect(() => {
    handleAppleCallback();
  }, [location.search, location.hash]);

  const handleAppleCallback = async () => {
    try {
      // response_mode에 따라 다른 위치에서 파라미터 확인:
      // - fragment: URL hash (#) 에서 파라미터 수신
      // - query: URL query string (?) 에서 파라미터 수신
      // - form_post: POST body로 수신 (apple-callback.html 경유)
      const searchParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(location.hash.replace("#", ""));
      const sessionData = sessionStorage.getItem("appleAuthData");

      let code, state, user, id_token, error;

      // 1. URL hash (fragment)에서 먼저 확인 (response_mode=fragment)
      code = hashParams.get("code");
      state = hashParams.get("state");
      user = hashParams.get("user");
      id_token = hashParams.get("id_token");
      error = hashParams.get("error");

      // 2. Query string에서 확인 (response_mode=query 또는 fallback)
      if (!code && !id_token && !error) {
        code = searchParams.get("code");
        state = searchParams.get("state");
        user = searchParams.get("user");
        id_token = searchParams.get("id_token");
        error = searchParams.get("error");
      }

      // 3. Session Storage에서도 확인 (form_post 경유 fallback)
      if (sessionData && !id_token && !code) {
        const data = JSON.parse(sessionData);
        code = data.code;
        state = data.state;
        user = data.user;
        id_token = data.id_token;
        error = data.error;
      }

      console.log("Apple OAuth Response:", {
        code,
        state,
        user,
        id_token,
        error,
      });

      // Apple OAuth 응답 검증
      if (error) {
        const errorMessages = {
          invalid_request: "Invalid request to Apple",
          invalid_client: "Invalid client configuration",
          invalid_grant: "Invalid authorization grant",
          unauthorized_client: "Unauthorized client",
          unsupported_response_type: "Unsupported response type",
          invalid_scope: "Invalid scope requested",
          server_error: "Apple server error",
          temporarily_unavailable: "Apple service temporarily unavailable",
          access_denied: "Access denied by user",
        };
        const message =
          errorMessages[error] || `Apple Sign In failed: ${error}`;
        setAuthStatus("error");
        setMessage(message);
        console.warn("Apple OAuth error:", error);
        return;
      }

      // Authorization code 또는 id_token이 필요
      const hasAuthCode = !!code;
      const hasIdToken = !!id_token;

      if (!hasAuthCode && !hasIdToken) {
        setAuthStatus("error");
        setMessage(
          "No authorization code or ID token received from Apple. Please try again.",
        );
        console.warn("Apple response missing both code and id_token:", {
          code,
          id_token,
          state,
          user,
        });
        return;
      }

      // 백엔드는 JWT 형식의 id_token만 검증 가능
      // authorization_code는 Apple 토큰 엔드포인트에서 교환이 필요하므로 지원하지 않음
      if (!hasIdToken) {
        setAuthStatus("error");
        setMessage(
          "ID Token not received from Apple. Only authorization code was provided, which requires server-side token exchange.",
        );
        console.warn("Apple OAuth: Only authorization code received, id_token required", {
          hasCode: hasAuthCode,
          hasIdToken: hasIdToken,
        });
        return;
      }

      console.log("Apple OAuth token extracted:", {
        tokenType: "id_token",
        hasCode: hasAuthCode,
        hasIdToken: hasIdToken,
      });

      await sendAuthTokenToBackend(id_token);
    } catch (error) {
      setAuthStatus("error");
      setMessage(`Error during Apple Sign In: ${error.message}`);
      console.error("Apple Sign In error:", error);
    }
  };

  const sendAuthTokenToBackend = async (token) => {
    try {
      const requestBody = {
        deviceId: "web-browser",
        platform: "IOS",
        packageName: "com.photocard.master",
        idToken: token,
      };

      console.log("Sending to backend:", {
        ...requestBody,
        idToken: `${requestBody.idToken.substring(0, 20)}...`, // 로그에서 민감정보 마스킹
      });

      const response = await fetch(
        `${BACKEND_API_URL}/open-api/v1/auth/apple`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      console.log("Backend response status:", response.status);
      const data = await response.json();
      console.log("Backend response:", data);

      if (!response.ok) {
        throw new Error(
          `Backend error: ${data.message || response.statusText}`,
        );
      }

      if (data.status === 200 && data.data) {
        const { accessToken, refreshToken, userId, isNewUser } = data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userId", userId);
        localStorage.setItem("isNewUser", isNewUser.toString());

        setAuthStatus("success");
        setMessage(data.message || "Apple Sign In successful!");

        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        throw new Error(data.message || "Unexpected response structure");
      }
    } catch (error) {
      setAuthStatus("error");
      setMessage(`Authentication failed: ${error.message}`);
      console.error("Backend error:", error);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>Apple Sign In</h1>
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          borderRadius: "8px",
          backgroundColor:
            authStatus === "success"
              ? "#d4edda"
              : authStatus === "error"
                ? "#f8d7da"
                : "#e7f3ff",
          color:
            authStatus === "success"
              ? "#155724"
              : authStatus === "error"
                ? "#721c24"
                : "#004085",
          minHeight: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <p>
          <strong>{message}</strong>
        </p>
        {authStatus === "error" && (
          <p style={{ marginTop: "10px", fontSize: "14px" }}>
            <a
              href="/"
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              Back to login
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default AppleCallback;
