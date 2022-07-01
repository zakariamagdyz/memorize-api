import express, { Request } from 'express';
import {
  configurePostBody,
  createOnePost,
  deleteOnePost,
  getAllPosts,
  getOnePost,
  resizePostImage,
  streaming,
  updateOnePost,
  uploadPostImage,
} from '../controllers/post.controller';
import protectRoutes from '../middlewares/protectRoutes';
import validate from '../middlewares/validateResource';
import verifyRoles from '../middlewares/verifyRole';
import { PostSchema } from '../schemas/post.schema';
import { roles } from '../utils/utlities';

// docs

/**
 * @openapi
 * /api/v1/Posts:
 *  get:
 *    description: Get all Posts (first 20 result for page 1) , use Page, limit, fields, sort for specific results
 *    tags: [Posts]
 *    parameters:
 *      - name: page
 *        in: query
 *        description: page number
 *        example: 2
 *      - name: limit
 *        in: query
 *        description: limit of Posts per page
 *        example: 8
 *      - name: fields
 *        in: query
 *        description: select some fields from Posts
 *        example: name
 *      - name: sort
 *        in: query
 *        description: sort Posts by some fields
 *        example: -price
 *    responses:
 *       200:
 *         description: return first 20 Posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Posts"
 *
 *
 *
 *
 */

const Router = express.Router();

Router.get('/streaming', streaming);

//TODO: active protect middleware
Router.use(protectRoutes);

Router.route('/')
  .get(getAllPosts)
  .post(
    uploadPostImage,
    validate(PostSchema),
    configurePostBody,
    resizePostImage,
    createOnePost
  );

Router.use(verifyRoles(roles.Admin));

Router.route('/:id').get(getOnePost).patch(updateOnePost).delete(deleteOnePost);

export default Router;
