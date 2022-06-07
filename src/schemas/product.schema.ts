import { number, object, string, TypeOf } from 'zod';

/**
 * @openapi
 * components:
 *    schemas:
 *      product:
 *         type: object
 *         properties:
 *           name:
 *             type: string
 *           description:
 *             type: string
 *           price:
 *            type: number
 *
 *      pageInfo:
 *         type: object
 *         properties:
 *            count:
 *               type: number
 *            pages:
 *               type: number
 *            limit:
 *               type: number
 *            next:
 *               type: string
 *            prev:
 *               type: string
 *
 *      products:
 *          type: object
 *          properties:
 *             info:
 *                  $ref: "#/components/schemas/pageInfo"
 *             results:
 *                type: array
 *                items:
 *                  $ref: "#/components/schemas/product"
 *
 *
 *
 *
 */

export const productSchema = object({
  body: object({
    name: string({ required_error: 'Product name is required' }),
    description: string({ required_error: 'description is requierd' }),
    price: number({ required_error: 'number is required' }),
  }),
});

export type ProductInput = TypeOf<typeof productSchema>['body'];
