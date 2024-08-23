## Overview 

백엔드에서 인가코드를 받고 Naver or Kakao에서 인가 코드를 받은 후 인가코드를 활용해서 RestAPI 방식으로 로그인할 때, [인가코드 발급]까지의 로직을 담고 있습니다. 

## How To Start

1. .env 파일 생성

아래 key : value 구조로 .env 파일 루트 폴더에 생성

```properties
REACT_APP_NAVER_CLIENT_ID=YOUR_NAVER_CLIENT_ID
REACT_APP_KAKAO_CLIENT_ID=YOUR_KAKAO_CLIENT_ID
```

2. 실행

```console
npm start
```
