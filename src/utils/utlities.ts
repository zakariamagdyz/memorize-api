export const msgs = {
  EMAIL_SUCCESS: 'Email has successfully sent, Please check your inbox.',
  EMAIL_FAILURE:
    'Something went wrong when sending the email, Please try again later',
  LOGIN_FAILURE: 'Incorrect email or password',
  COOKIE_NOT_FOUND: 'No credentials sent!',
  COOKIE_NOT_VALID: 'Invalid credentials, please login again',
  NO_ACTIVATION_TOKEN: 'There is no activation token, Please check your inbox',
  EMAIL_NOT_FOUND: 'No user found with that email',
  USER_NOT_FOUND: 'NO user found with that ID',
  USER_EXIST:
    'This user already exist, visit /forgotpassword to reset your password.',
  RESET_TOKEN_FAILURE: 'Invalid or expired token',
  UPDATE_PASS_FAILURE: 'The current password is incorrect',
  NOT_LOGGED_IN: 'You are not logged in, Please login to get access',
  ROLE_ERROR: "You don't have permission to perform this action",
  UPGRADE_AT:
    'Your access token has expired , Please upgrade it with your refresh token',
};

export const httpCode = {
  SERVER_ERROR: 500,
  UNAUTHORIZED: 401,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  ACCEPTED: 201,
  OK: 200,
  NO_CONTENT: 204,
  UPGRADE_AT: 426,
};

export const roles = {
  Admin: 2000,
  User: 2001,
  Editor: 2003,
};

export const pagination = {
  page: 1,
  limit: 20,
};

export const selectFields = <T>(obj: T, fields: (keyof T)[]) => {
  const newObj = {} as T;
  let k: keyof T;
  for (k in obj) {
    if (fields.includes(k)) newObj[k] = obj[k];
  }
  return newObj;
};

export const omitFields = <T>(obj: T, fields: (keyof T)[]) => {
  const newObj = {} as T;
  let k: keyof T;
  for (k in obj) {
    if (fields.includes(k)) continue;
    newObj[k] = obj[k];
  }
  return newObj;
};
