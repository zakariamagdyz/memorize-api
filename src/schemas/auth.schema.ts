import { string, object, TypeOf } from 'zod';

/**
 * @openapi
 * components:
 *  schemas:
 *    UserInput:
 *        type: object
 *        required:
 *             - name
 *             - email
 *             - password
 *             - passwordConfirm
 *        properties:
 *            name:
 *               type: string
 *            email:
 *               type: string
 *               format: email
 *            password:
 *               type: string
 *               minimum: 8
 *               format: password
 *            passwordConfirm:
 *               type: string
 *               minimum: 8
 *               format: password
 *
 *    User:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *        name:
 *          type: string
 *        email:
 *          type: string
 *          exmaple: name@mail.com
 *        roles:
 *         type: array
 *         items:
 *           type: number
 *         example: [2201]
 *
 *
 *    SendUserCredentials:
 *        type: object
 *        properties:
 *           accessToken:
 *              type: string
 *           user:
 *             $ref: "#/components/schemas/User"
 *
 *
 *    HttpError:
 *        type: object
 *        properties:
 *           status:
 *              type: string
 *              example: fail
 *           message:
 *              type: string
 *              example: invalid input, try again with right input
 *    ServerError:
 *        type: object
 *        properties:
 *           status:
 *              type: string
 *              example: error
 *           message:
 *              type: string
 *              example: Something went wrong
 *
 *
 */

////////////////////////////////////////////////
// User-schema
///////////////////////////////////////////////
export const userSchema = object({
  body: object({
    name: string({ required_error: 'Name is required' }).max(
      60,
      'Name has maxinum size of 60 characters'
    ),
    email: string({ required_error: 'Email is required' })
      .email('Not a valid email address')
      .max(80, 'Email has maxinum size of 60 characters'),
    password: string({ required_error: 'Password is required' })
      .min(8, 'password has minumum size of 8 characters')
      .max(50, 'password has maximum size of 50 characters'),
    passwordConfirm: string({ required_error: 'passwordConfirm is required' })
      .min(8, 'password has minumum size of 8 characters')
      .max(50, 'password has maximum size of 50 characters'),
  }).refine((data) => data.password === data.passwordConfirm, {
    message: "Two password don't match",
    path: ['passwordConfirm'],
  }),
});

export type zodUserSchema = Omit<
  TypeOf<typeof userSchema>['body'],
  'passwordConfirm'
>;

////////////////////////////////////////////////
// Activate account schema
///////////////////////////////////////////////

export const activateAccountSchema = object({
  body: object({
    activateToken: string({ required_error: 'activateToken is required' }),
  }),
});

////////////////////////////////////////////////
// login-schema
///////////////////////////////////////////////
export const loginSchema = object({
  body: object({
    email: string({ required_error: 'name is required' })
      .email('Not a valid email address')
      .min(8, 'password has minumum size of 8 characters')
      .max(50, 'password has maximum size of 50 characters'),
    password: string({ required_error: 'password is required' })
      .min(8, 'password has minumum size of 8 characters')
      .max(50, 'password has maximum size of 50 characters'),
  }),
});

////////////////////////////////////////////////
// forgotPassword-schema
///////////////////////////////////////////////
export const forgotPasswordSchema = object({
  body: object({
    email: string({ required_error: 'email is required' })
      .email('Not a valid email address')
      .min(8, 'password has minumum size of 8 characters')
      .max(50, 'password has maximum size of 50 characters'),
  }),
});

////////////////////////////////////////////////
// ResetPassword-schema
///////////////////////////////////////////////
export const resetPasswordSchema = object({
  body: object({
    password: string({ required_error: 'password is required' })
      .min(8, 'password has minumum size of 8 characters')
      .max(50, 'password has maximum size of 50 characters'),
    passwordConfirm: string({ required_error: 'passwordConfirm is required' })
      .min(8, 'password has minumum size of 8 characters')
      .max(50, 'password has maximum size of 50 characters'),
  }).refine((data) => data.password === data.passwordConfirm, {
    message: "Two passwords don't match",
    path: ['passwordConfirm'],
  }),
  params: object({
    resetToken: string({ required_error: 'resetToken is required' }),
  }),
});

////////////////////////////////////////////////
// updatePassword-schema
///////////////////////////////////////////////
export const updatePasswordSchema = object({
  body: object({
    currentPassword: string({ required_error: 'currentPassword is required' })
      .min(8, 'password has minumum size of 8 characters')
      .max(50, 'password has maximum size of 50 characters'),

    newPassword: string({ required_error: 'currentPassword is required' })
      .min(8, 'password has minumum size of 8 characters')
      .max(50, 'password has maximum size of 50 characters'),
    passwordConfirm: string({ required_error: 'passwordConfirm is required' })
      .min(8, 'password has minumum size of 8 characters')
      .max(50, 'password has maximum size of 50 characters'),
  }).refine((data) => data.passwordConfirm === data.newPassword, {
    message: "Two passwords don't match",
    path: ['passwordConfirm'],
  }),
});
