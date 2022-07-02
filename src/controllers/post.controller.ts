import { NextFunction, Request, Response } from 'express';
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
  getAllHandler,
  getOneHandler,
} from '../utils/factoryControllers';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import HttpError from '../utils/customErrors';
import * as fs from 'fs/promises';
import path, { resolve } from 'path';
import { roles } from '../utils/utlities';
//////////////////////////////////////////

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new HttpError('Not an image! Please upload only images.', 400));
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// we use upload.fields if we have mixed fields to handle
export const uploadPostImage = upload.single('image');

export const resizePostImage = catchAsync(async (req, res, next) => {
  // update or create without image
  if (!req.file) return next();
  // 1) Cover image
  // add to req.body to update the image location in db
  req.body.image = `post-${res.locals.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(2000, 1333) // best resolution for cover image
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/posts/${req.body.image}`);

  return next();
});

export const configurePostBody =
  (type: 'forUpdate' | 'forCreate') =>
  (req: Request, res: Response, next: NextFunction) => {
    // Check for image
    if (type === 'forCreate' && !req.file) {
      return next(new HttpError('image is required to create a memory', 400));
    }
    req.body.creator = res.locals.user._id;

    if (req.body.tags) {
      req.body.tags = req.body.tags.split(',');
    }
    next();
  };

export const verifyUserForAction = catchAsync(async (req, res, next) => {
  const post = await getAPostHandler({ elementId: req.params.id });
  // Check if user is a creator of the post Or user is an admin
  if (
    res.locals.user._id === post.creator._id.toString() ||
    res.locals.user.roles.includes(roles.Admin)
  ) {
    next();
  } else {
    return next(
      new HttpError("You Don't have permission to perform this action", 403)
    );
  }
});

export const likeHandler = catchAsync(async (req, res, next) => {
  const post = await getAPostHandler({ elementId: req.params.id });
  const isUserliked = post.likeCount.some(
    (id) => id.toString() === res.locals.user._id
  );

  if (isUserliked) {
    //eslint-disable-next-line
    //@ts-ignore
    post.likeCount.pull(res.locals.user._id);
  } else {
    post.likeCount.push(res.locals.user._id);
  }
  const newPost = await post.save();
  res.status(200).send(newPost);
});

export const getAllPosts = getAllHandler(getAllPostsHandler);
export const getOnePost = getOneHandler(getAPostHandler);
export const createOnePost = createOneHandler(createAPostHanlder);
export const updateOnePost = catchAsync(async (req, res) => {
  // delete an old image if user attach it with body
  if (req.file) {
    const oldPost = await getAPostHandler({ elementId: req.params.id });

    if (oldPost.image) {
      await fs.unlink(
        path.join(__dirname, '/../..', '/public/img/posts', oldPost.image)
      );
    }
  }

  const post = await updateAPostHandler({
    elementId: req.params.id,
    body: req.body,
  });

  res.status(200).json(post);
});

export const deleteOnePost = catchAsync(async (req, res) => {
  const post = await deleteAPostHandler({ elementId: req.params.id });
  // delete an image from disk
  if (post.image) {
    await fs.unlink(
      path.join(__dirname, '/../..', '/public/img/posts', post.image)
    );
  }
  res.sendStatus(204);
});

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
