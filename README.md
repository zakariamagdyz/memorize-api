## auth contoller

---

1. signup
   1. Check for request schema by zod
   2. Filter the body from unwanted fields like role
   3. Check if user email exist in DB before sending an active link
   4. Create JWT token with filterd request data and send it by email
2. Active account Handler
   1. Check if token exist in request body
   2. Check if token is valid and verify it
   3. Create new user in db
3. login
   1. Check for request schema by zod
   2. Check if user exist in DB by it's email
   3. Check if password match with hashed one in db
   4. Create & send accessToken and Refresh token
4. Security flow
   1. We use refresh token rotation and multi login support
   2. There are 2 different situations to generate Tokens
      1. After authentication
         1. createTokenByCredentials
            1. Check if there is a cookie jwt token send by browser(when user try to login after he has already logged in)
               1. If Cookie exist
                  1. verify cookie token and get user from DB
                  2. delete the old token from db
                  3. generate tokens
               2. if No Cookie exist:
                  1. generate tokens
      2. After AT expiration
         1. refreshTokenHandler
            1. Check if there is a cookie jwt token
            2. get user by RT
               1. if user doen't exist (reuse detection)
                  1. verify cookie token:
                  2. find user by email and clear Rts in DB & Cookie
                  3. throw httperror invalid credential
               2. if user exist
                  1. verify token if its expired:
                     1. delete old one & clear cookie
                     2. return httperror
                  2. generate tokens
   3. Methods
      1. Handle refresh token
      2. generate tokens
         1. Create filterd user data to send it to the client (hide role format)
         2. create new RT & AT
         3. replace old RT in DB if exist or add new one
         4. set jwt cookie for RT with cookie options
         5. Send RT with cookie and AT & User data by json body
5. forgot password
6. reset password
7. logout
8. updateMyPassword
