/**
 * Mock JWT Token Generator for Testing
 * Generates realistic JWT tokens for local testing without actual Apple authentication
 */

/**
 * Base64 URL encoding (without padding)
 */
function base64UrlEncode(str) {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Create a mock JWT header
 * JWT 형식: header.payload.signature
 */
function createMockJwtHeader() {
  const header = {
    alg: "RS256",
    kid: "AIDOPK1", // Apple Key ID format
    typ: "JWT",
  };
  return base64UrlEncode(JSON.stringify(header));
}

/**
 * Create a mock JWT payload with Apple ID token claims
 * Apple ID Token 구조를 모방
 */
function createMockJwtPayload(options = {}) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "https://appleid.apple.com",
    aud: options.clientId || "ac.dnd-14th-1",
    exp: now + 3600, // 1시간 유효
    iat: now,
    sub: options.sub || "001234.567890.abcdef",
    email: options.email || "user@example.com",
    email_verified: true,
    is_private_email: options.is_private_email !== undefined ? options.is_private_email : false,
    real_user_status: 2,
    nonce_supported: true,
    c_hash: "hash_value_123",
    at_hash: "access_token_hash",
  };
  return base64UrlEncode(JSON.stringify(payload));
}

/**
 * Create a mock JWT signature
 * 실제 서명이 아닌 모의 서명 (로컬 테스트용)
 */
function createMockJwtSignature() {
  // 실제 RSA-256 서명은 아니지만, JWT 형식에는 맞음
  // 백엔드에서 검증할 때는 실제 Apple 공개키를 사용해야 함
  const signature =
    "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c.rFWwbAJlHf8Kq0WPlgTxg5Bwcxz2Z1jVkAz9G9p5c";
  return base64UrlEncode(signature);
}

/**
 * Generate a mock Apple ID Token (JWT format)
 * 실제 Apple 서버 없이 로컬에서 테스트할 수 있는 모의 토큰 생성
 *
 * @param {Object} options - Token 커스터마이징 옵션
 * @param {string} options.clientId - Apple Client ID (기본값: ac.dnd-14th-1)
 * @param {string} options.sub - Subject (User ID) (기본값: 001234.567890.abcdef)
 * @param {string} options.email - User email (기본값: user@example.com)
 * @param {boolean} options.is_private_email - Private email 사용 여부
 * @returns {string} JWT 형식의 모의 ID Token
 *
 * @example
 * // 기본 토큰 생성
 * const token = generateMockIdToken();
 *
 * // 커스텀 옵션으로 생성
 * const token = generateMockIdToken({
 *   sub: "user123.abc.def",
 *   email: "john@example.com",
 *   is_private_email: true
 * });
 */
export function generateMockIdToken(options = {}) {
  const header = createMockJwtHeader();
  const payload = createMockJwtPayload(options);
  const signature = createMockJwtSignature();

  // JWT 형식: header.payload.signature
  return `${header}.${payload}.${signature}`;
}

/**
 * Generate a mock Authorization Code
 * Authorization Code Flow용 모의 코드
 * 실제로는 Apple 서버에서 발급하는 코드의 형식을 모방
 *
 * @returns {string} 모의 Authorization Code
 *
 * @example
 * const code = generateMockAuthCode();
 * // "001234.567890.abcdef" 형식
 */
export function generateMockAuthCode() {
  // Apple의 Authorization Code 형식: xxx.yyy.zzz
  const part1 = Math.random().toString(36).substring(2, 8).padEnd(6, "0");
  const part2 = Math.random().toString(36).substring(2, 8).padEnd(6, "0");
  const part3 = Math.random().toString(36).substring(2, 8).padEnd(6, "0");

  return `${part1}.${part2}.${part3}`;
}

/**
 * Decode a JWT token (for debugging purposes only)
 * JWT를 디코딩하여 payload를 확인 (디버깅용)
 *
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null if invalid
 *
 * @example
 * const token = generateMockIdToken();
 * const payload = decodeJwt(token);
 * console.log(payload.sub); // "001234.567890.abcdef"
 */
export function decodeJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("Invalid JWT format: expected 3 parts (header.payload.signature)");
      return null;
    }

    const payload = parts[1];
    // Base64 URL decoding
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Validate mock JWT format
 * 모의 JWT의 기본 형식이 올바른지 검증
 * 실제 서명 검증은 하지 않음 (로컬 테스트용)
 *
 * @param {string} token - JWT token to validate
 * @returns {boolean} true if token has valid JWT format
 *
 * @example
 * const token = generateMockIdToken();
 * console.log(validateMockJwt(token)); // true
 */
export function validateMockJwt(token) {
  const parts = token.split(".");

  // JWT는 3개 부분으로 나뉘어야 함: header.payload.signature
  if (parts.length !== 3) {
    console.warn(`Invalid JWT format: expected 3 parts, got ${parts.length}`);
    return false;
  }

  // 각 부분이 비어있지 않아야 함
  if (parts.some((part) => !part)) {
    console.warn("Invalid JWT: empty parts detected");
    return false;
  }

  // payload는 valid JSON이어야 함
  const payload = decodeJwt(token);
  if (!payload) {
    console.warn("Invalid JWT: failed to decode payload");
    return false;
  }

  return true;
}
