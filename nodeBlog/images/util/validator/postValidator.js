const { body, param } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

const titleValidator = () =>
  body("title", "Post title cant not be empty").trim().notEmpty();
const contentValidator = () =>
  body("content", "Post content cant not be empty").trim().notEmpty();

const postIdValidator = () =>
  param("postId").isMongoId().withMessage("Invalid course id format");

const createPostValidator = [
  titleValidator(),
  contentValidator(),
  validatorMiddleware
];

const updatePostValidator = [postIdValidator(), validatorMiddleware];

const deletePostValidator = [postIdValidator(), validatorMiddleware];

const getPostValidator = [postIdValidator(), validatorMiddleware];

module.exports = {
  createPostValidator: createPostValidator,
  updatePostValidator: updatePostValidator,
  deletePostValidator: deletePostValidator,
  getPostValidator: getPostValidator
};
