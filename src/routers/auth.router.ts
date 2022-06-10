import express from 'express';
import {
  activateAccountHanlder,
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  resetPasswordHandler,
  signupHandler,
  updatePasswordHandler,
} from '../controllers/auth.controller';
import protectRoutes from '../middlewares/protectRoutes';
import validate from '../middlewares/validateResource';
import {
  activateAccountSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  userSchema,
} from '../schemas/auth.schema';

const Router = express.Router();

////////////////////////////////////
// documentation
////////////////////////////////////
// signup path
/**
 * @openapi
 * /api/v1/auth/signup:
 *   post:
 *     description: Send user data to recive an activate account email
 *     tags: [Auth]
 *     requestBody:
 *       description: Send user data name, email, password, passwordConfirm
 *       required: true
 *       content:
 *         application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserInput"
 *     responses:
 *         200:
 *           description: Email sent successfully
 *           content:
 *             text/plain:
 *               schema:
 *                type: string
 *                example: Email has successfully sent, Please check your inbox.
 *         500:
 *            description: Email failed to send successfully
 *            content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                        status:
 *                           type: string
 *                           example: error
 *                        message:
 *                           type: string
 *                           example: something went wrong while sending an email
 *
 *
 */

// activate-account path
/**
 * @openapi
 * /api/v1/auth/activate-account:
 *   post:
 *    description: send activate token, to activate user account
 *    tags: [Auth]
 *    requestBody:
 *      description: activate account token
 *      required: true
 *      content:
 *        appplication/json:
 *          schema:
 *            type: object
 *            properties:
 *             activateToken:
 *                 type: string
 *                 format: jwt
 *    responses:
 *          200:
 *           description: get access token & refresh token & user data
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/SendUserCredentials"
 *           headers:
 *              set-Cookie:
 *                 description:  refresh token
 *                 schema:
 *                    type: string
 *                    example: jwt=abcd1234;path=/; httpOnly
 *          401:
 *              description: token is invalid
 *              content:
 *               application/json:
 *                 schema:
 *                      $ref: "#/components/schemas/HttpError"
 *
 *          400:
 *              description: input is invalid
 *              content:
 *               application/json:
 *                 schema:
 *                      $ref: "#/components/schemas/HttpError"
 *
 *          500:
 *             description: server error
 *             content:
 *              application/json:
 *                schema:
 *                   $ref: "#/components/schemas/ServerError"
 *
 *
 *
 *
 *
 *
 *
 *
 */

// login
/**
 * @openapi
 *  /api/v1/auth/login:
 *    post:
 *      description: login user with email and password
 *      tags: [Auth]
 *      requestBody:
 *          description: email and password
 *          required: true
 *          content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [email, password]
 *               properties:
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *                   minimum: 8
 *      responses:
 *          200:
 *            description: user logged in successfully
 *            content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/SendUserCredentials"
 *            headers:
 *              set-Cookie:
 *                 description:  refresh token
 *                 schema:
 *                    type: string
 *                    example: jwt=abcd1234;path=/; httpOnly
 *          400:
 *            description: invalid input
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/HttpError'
 *
 *          401:
 *            description: operation error
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/HttpError'
 *
 *
 *
 *
 */

// refresh-token

/**
 * @openapi
 * /api/v1/auth/refresh-token:
 *   get:
 *     description: upgrade expired access token with refresh token
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *        200:
 *            description: user logged in successfully
 *            content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/SendUserCredentials"
 *            headers:
 *              set-Cookie:
 *                 description:  refresh token
 *                 schema:
 *                    type: string
 *                    example: jwt=abcd1234;path=/; httpOnly
 *
 *        401:
 *         description: operation error
 *         content:
 *            application/json:
 *                schema:
 *                  $ref: '#/components/schemas/HttpError'
 *        400:
 *          description: refresh token is invalid
 *          content:
 *            application/json:
 *             schema:
 *                 $ref: '#/components/schemas/HttpError'
 *
 *
 */

// logout

/**
 * @openapi
 * /api/v1/auth/logout:
 *   get:
 *     description: logout user (delete refresh token)
 *     tags: [Auth]
 *     security:
 *         - bearerAuth: []
 *     responses:
 *        200:
 *         description: logged out successfully
 *        401:
 *         description: no refresh token found
 *         content:
 *          application/json:
 *                schema:
 *                  $ref: "#/components/schemas/HttpError"
 *
 */

// forgot password
/**
 * @openapi
 *  /api/v1/auth/forgot-password:
 *    patch:
 *      description: add your email to receive an email with your reset token
 *      tags: [Auth]
 *      requestBody:
 *        description: add your email
 *        required: true
 *        content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: mail@exmple.com
 *      responses:
 *            200:
 *             description: forgot password mail sent successfully
 *             content:
 *               text/plain:
 *                 schema:
 *                   type: string
 *                   example: email has sent successfully
 *            400:
 *             description: invalid email input
 *             content:
 *              application/json:
 *                schema:
 *                  $ref: "#/components/schemas/HttpError"
 *
 *            500:
 *             description: email faild to sent
 *             content:
 *              application/json:
 *                schema:
 *                  $ref: "#/components/schemas/ServerError"
 *
 *
 */

// reset password

/**
 * @openapi
 * /api/v1/auth/reset-password/{resetToken}:
 *  patch:
 *    description: send reset token and new password to reset your password
 *    tags: [Auth]
 *    parameters:
 *     - name: resetToken
 *       in: path
 *       description: resetToken that you has recieved by email
 *       required: true
 *    requestBody:
 *        description: new password with it's confirmation
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required: [password, passwordConfirm]
 *              properties:
 *                password:
 *                  type: string
 *                  minimum: 8
 *                passwordConfirm:
 *                   type: string
 *                   minimum: 8
 *    responses:
 *         200:
 *            description: user logged in successfully
 *            content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/SendUserCredentials"
 *            headers:
 *              set-Cookie:
 *                 description:  refresh token
 *                 schema:
 *                    type: string
 *                    example: jwt=abcd1234;path=/; httpOnly
 *         400:
 *            description: invalid or expired token
 *            content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/HttpError"
 *
 *
 */

// update password
/**
 * @openapi
 * /api/v1/auth/update-my-password:
 *   patch:
 *    description: update your password, old password is required
 *    tags: [Auth]
 *    security:
 *       - bearerAuth: []
 *    requestBody:
 *      description: send your old password with new password and it's confirmation
 *      required: true
 *      content:
 *         application/json:
 *           schema:
 *            type: object
 *            required: [currentPassword, newPassword, passwordConfirm]
 *            properties:
 *               currentPassword:
 *                   type: string
 *                   minimum: 8
 *               newPassword:
 *                   type: string
 *                   minimum: 8
 *               passwordConfirm:
 *                   type: string
 *                   minimum: 8
 *    responses:
 *        200:
 *            description: user logged in successfully
 *            content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/SendUserCredentials"
 *            headers:
 *              set-Cookie:
 *                 description:  refresh token
 *                 schema:
 *                    type: string
 *                    example: jwt=abcd1234;path=/; httpOnly
 *
 *        400:
 *          description: operation error
 *          content:
 *           application/json:
 *                schema:
 *                  $ref: "#/components/schemas/HttpError"
 *
 *
 *
 */
/////////////////////
// Routes
/////////////

Router.post('/signup', validate(userSchema), signupHandler);
Router.post(
  '/activate-account',
  validate(activateAccountSchema),
  activateAccountHanlder
);

Router.post('/login', validate(loginSchema), loginHandler);
Router.get('/refresh-token', refreshTokenHandler);
Router.get('/logout', protectRoutes, logoutHandler);
Router.patch(
  '/forgot-password',
  validate(forgotPasswordSchema),
  forgotPasswordHandler
);
Router.patch(
  '/reset-password/:resetToken',
  validate(resetPasswordSchema),
  resetPasswordHandler
);
Router.patch(
  '/update-my-password',
  protectRoutes,
  validate(updatePasswordSchema),
  updatePasswordHandler
);

export default Router;
