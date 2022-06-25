import { Response } from 'express';
import {
  createAPostHanlder,
  deleteAPostHandler,
  getAllPostsHandler,
  getAPostHandler,
  updateAPostHandler,
} from '../services/post.service';
import catchAsync from '../utils/catchAsync';
import {
  createOneHandler,
  deleteOneHandler,
  getAllHandler,
  getOneHandler,
  updateOneHandler,
} from '../utils/factoryControllers';

export const getAllPosts = getAllHandler(getAllPostsHandler);
export const getOnePost = getOneHandler(getAPostHandler);
export const createOnePost = createOneHandler(createAPostHanlder);
export const updateOnePost = updateOneHandler(updateAPostHandler);
export const deleteOnePost = deleteOneHandler(deleteAPostHandler);

// SSE emplementation
export const streaming = catchAsync(async (req, res) => {
  console.log('hola');
  res.setHeader('Content-Type', 'text/event-stream');

  send(res);
});

function send(res: Response) {
  const facts = { hola: 'ddf' };
  const data = `data: ${JSON.stringify(facts)}\n\n`;

  res.write(data);

  setTimeout(() => send(res), 1000);
}
