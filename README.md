## JWT Authentication incremental build

### 1. Send refresh token on Login button

- handleLoginClick 
  - get refreshToken from sessionStorage   
  - send POST request { refreshToken } to api/auth/refresh
- Response { dummyAccessToken, dummyRefreshToken }
  - save to sessionStorage 
- Handle WS message - Write to console.log

