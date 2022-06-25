import { object, string, TypeOf } from 'zod';

/**
 * @openapi
 * components:
 *    schemas:
 *      post:
 *         type: object
 *         properties:
 *           title:
 *             type: string
 *           message:
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
 *      posts:
 *          type: object
 *          properties:
 *             info:
 *                  $ref: "#/components/schemas/pageInfo"
 *             results:
 *                type: array
 *                items:
 *                  $ref: "#/components/schemas/post"
 *
 *
 *
 *
 */

export const PostSchema = object({
  body: object({
    title: string({ required_error: 'Title name is required' }),
    message: string({ required_error: 'Message is requierd' }),
    tags: string({ required_error: 'Tags is required' }).array(),
  }),
});

export type PostInputSchema = TypeOf<typeof PostSchema>['body'];
