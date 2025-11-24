## JWT Authentication incremental build

### 1. Send refresh token on Login button

- handleLoginClick 
  - get refreshToken from sessionStorage   
  - send POST request { refreshToken } to api/auth/refresh
- Response { dummyAccessToken, dummyRefreshToken }
  - save to sessionStorage 
- Handle WS message - Write to console.log

### 2. Refresh token validation 

- Response Status code 200 (OK)
  - RefreshToken in Request was valid - login successfull
- Response Status code 201 (Created)
  - RefreshToken in Request was invalid or expired - password login required
- Ony log Status code received
