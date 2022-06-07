import express from 'express';
import {
  createOneProduct,
  deleteOneproduct,
  getAllProducts,
  getOneProduct,
  updateOneProduct,
} from '../controllers/prodcut.controller';
import validate from '../middlewares/validateResource';
import { productSchema } from '../schemas/product.schema';

// docs

/**
 * @openapi
 * /api/v1/products:
 *  get:
 *    description: Get all products (first 20 result for page 1) , use Page, limit, fields, sort for specific results
 *    tags: [Products]
 *    parameters:
 *      - name: page
 *        in: query
 *        description: page number
 *        example: 2
 *      - name: limit
 *        in: query
 *        description: limit of products per page
 *        example: 8
 *      - name: fields
 *        in: query
 *        description: select some fields from products
 *        example: name
 *      - name: sort
 *        in: query
 *        description: sort products by some fields
 *        example: -price
 *    responses:
 *       200:
 *         description: return first 20 products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/products"
 *
 *
 *
 *
 */

const Router = express.Router();

Router.route('/')
  .get(getAllProducts)
  .post(validate(productSchema), createOneProduct);

Router.route('/:id')
  .get(getOneProduct)
  .patch(updateOneProduct)
  .delete(deleteOneproduct);

export default Router;
