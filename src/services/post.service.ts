import PostModel from '../models/post.model';
import {
  createOneService,
  deleteOneService,
  getAllService,
  getOneService,
  updateOneService,
} from '../utils/factoryServices';

export const getAllPostsHandler = getAllService(PostModel);
export const getAPostHandler = getOneService(PostModel);
export const createAPostHanlder = createOneService(PostModel);
export const updateAPostHandler = updateOneService(PostModel);
export const deleteAPostHandler = deleteOneService(PostModel);
