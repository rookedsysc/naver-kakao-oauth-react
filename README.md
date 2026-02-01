## Overview

Naver, Kakao, Apple OAuth 인증시 프론트에서 authorization token을 받은 후 백엔드로 전송해서 RestAPI 방식으로 로그인할 때, [인가코드 발급]까지의 로직을 담고 있습니다.

## How To Start

### 1. .env 파일 생성

`.env.example`을 참조하여 루트 폴더에 `.env` 파일을 생성합니다.

```properties
# Naver OAuth
REACT_APP_NAVER_CLIENT_ID=your_naver_client_id

# Kakao OAuth
REACT_APP_KAKAO_CLIENT_ID=your_kakao_client_id

# Apple Sign In
REACT_APP_APPLE_CLIENT_ID=your_apple_client_id
REACT_APP_APPLE_TEAM_ID=your_apple_team_id
REACT_APP_APPLE_KEY_ID=your_apple_key_id

# Backend API
REACT_APP_BACKEND_API_URL=http://localhost:8080
```

### 2. hosts 파일 설정

Apple Sign In은 redirect URI로 `localhost`를 허용하지 않으므로 `localhost.com`을 사용해야 합니다.

```bash
sudo vi /etc/hosts
```

아래 내용을 추가합니다.

```
127.0.0.1 localhost.com
```

저장 후 DNS 캐시를 갱신합니다.

```bash
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
```

정상 등록 확인:

```bash
ping -c 1 localhost.com
# PING localhost.com (127.0.0.1) 이 출력되면 성공
```

### 3. HTTPS 인증서 셋업

Apple Sign In은 HTTPS 환경이 필수입니다. `mkcert`를 사용하여 로컬 SSL 인증서를 생성합니다.

```bash
chmod +x scripts/setup-https.sh && ./scripts/setup-https.sh
```

스크립트가 수행하는 작업:
1. `mkcert` 설치 (Homebrew 사용)
2. 로컬 CA(인증 기관) 설치
3. `localhost`, `127.0.0.1`, `localhost.com` 에 대한 SSL 인증서를 `conf/ssl/` 디렉토리에 생성

### 4. Apple Developer 설정

[Apple Developer Console](https://developer.apple.com/account/resources/identifiers/list/serviceId)에서 Service ID를 등록합니다.

| 항목 | 값 |
|------|-----|
| Identifier | `.env`의 `REACT_APP_APPLE_CLIENT_ID`와 동일 |
| Return URLs | `https://localhost.com/apple/callback` |
| Domains | `localhost.com` |

### 5. 실행

443 포트는 root 권한이 필요하므로 `sudo`로 실행합니다.

```bash
sudo npm run start:dev
```

브라우저에서 `https://localhost.com` 에 접속하여 "Login with Apple" 버튼을 클릭합니다.

## Apple OAuth 인증 플로우

```
[브라우저]                    [Apple]                    [백엔드]
    |                           |                           |
    |-- 1. 로그인 버튼 클릭 ---->|                           |
    |   (response_type=         |                           |
    |    code id_token)         |                           |
    |                           |                           |
    |<-- 2. redirect ----------|                           |
    |   #id_token=eyJ...        |                           |
    |   &code=xxx               |                           |
    |                           |                           |
    |-- 3. id_token 전송 ------------------------------>|
    |   POST /open-api/v1/auth/apple                   |
    |   { idToken: "eyJ..." }                          |
    |                           |                           |
    |<-- 4. 인증 결과 ----------------------------------|
    |   { accessToken, refreshToken, userId }          |
```

### 핵심 파라미터

| 파라미터 | 값 | 설명 |
|---------|-----|------|
| `response_type` | `code id_token` | authorization code와 JWT id_token 동시 요청 |
| `response_mode` | `fragment` | URL hash(`#`)로 토큰을 수신 |
| `scope` | `openid` | id_token 발급에 필수 |

### Authorization Code vs ID Token

| 구분 | Authorization Code | ID Token (JWT) |
|------|-------------------|----------------|
| 형식 | 단순 문자열 | `header.payload.signature` |
| 길이 | ~64자 | 500자 이상 |
| 점(.) 개수 | 3개 | 2개 |
| 용도 | 서버에서 토큰 교환용 | 직접 서명 검증 가능 |

백엔드가 JWT 서명 검증 방식을 사용하므로, 프론트엔드에서는 **id_token**을 전송해야 합니다.

## Components & API

### Frontend Components

| Component | Path | 역할 |
|-----------|------|------|
| Login | `src/components/Login.js` | 로그인 화면 (Naver, Kakao, Apple) |
| AppleCallback | `src/components/AppleCallback.js` | Apple 콜백 처리 및 id_token 백엔드 전송 |
| Callback | `src/components/Callback.js` | Naver OAuth 콜백 처리 |
| KakaoCallback | `src/components/KakaoCallback.js` | Kakao OAuth 콜백 처리 |

### Backend API

| Endpoint | Method | Request Body | 역할 |
|----------|--------|--------------|------|
| `/open-api/v1/auth/apple` | POST | `{ deviceId, platform, packageName, idToken }` | Apple Sign In 처리 |

### Environment Variables

| 변수 | 설명 |
|------|------|
| `REACT_APP_NAVER_CLIENT_ID` | Naver OAuth Client ID |
| `REACT_APP_KAKAO_CLIENT_ID` | Kakao OAuth Client ID |
| `REACT_APP_APPLE_CLIENT_ID` | Apple Sign In Client ID (Service ID) |
| `REACT_APP_APPLE_TEAM_ID` | Apple Developer Team ID |
| `REACT_APP_APPLE_KEY_ID` | Apple Key ID |
| `REACT_APP_BACKEND_API_URL` | 백엔드 API 서버 URL (기본값: `http://localhost:8080`) |

### Redirect URIs (HTTPS)

| Provider | URI |
|----------|-----|
| Naver | `https://localhost.com/callback` |
| Kakao | `https://localhost.com/kakao/callback` |
| Apple | `https://localhost.com/apple/callback` |

## Troubleshooting

### `INVALID_ID_TOKEN: 예상된 점(.)의 개수: 2개, 실제: 3개`

프론트엔드에서 `authorization_code`를 `idToken` 필드에 담아 보내고 있는 경우 발생합니다.
`response_type`에 `id_token`이 포함되어 있는지, `AppleCallback`에서 `id_token`을 우선 사용하는지 확인하세요.

### Apple 로그인 버튼 클릭 후 `invalid_request` 에러

Apple Developer Console에서 Service ID의 Return URLs에 `https://localhost.com/apple/callback`이 등록되어 있는지 확인하세요.

### `NET::ERR_CERT_AUTHORITY_INVALID` (브라우저 인증서 경고)

`mkcert -install`이 정상 실행되었는지 확인하세요. Chrome의 경우 브라우저를 재시작해야 할 수 있습니다.
