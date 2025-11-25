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

### 3. Upgraded Refresh token validation 

- For invalid or expired refreshToken
  - Response HttpStatus.UNAUTHORIZED (401)  
- For valid refreshToken
  - Response HttpStatus.OK (200) with { dummyAccessToken, refreshToken, userId, isOnline: true }   
- Testing on Frontend  
  1. Request { refreshToken: dummyRefreshToken }  
      - Expected Response: HttpStatus.UNAUTHORIZED (401) { error: 'Refresh token missing, invalid or expired' }
  2. Request { refreshToken: validRefreshToken }  
      - Expected Response: HttpStatus.OK (200) { dummyAccessToken, newRefreshToken, userId, isOnline: true }

Note: Status codes that never carry message body: 
- 204 (No Content)
- 205 (Reset Content)
- 304 (Not Modified)

### 4. Handle real renewed tokens

- get refreshToken from sessionStorage
- on Response OK save renewed accessToken and refreshToken to sessionStorage
- no Authorization: Bearer header with accessToken sent yet
