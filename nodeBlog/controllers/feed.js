const fs = require("fs");
const path = require("path");

const Post = require("../models/Post");
const asyncHandler = require("express-async-handler");
const appError = require("../util/appError");
const { getIo } = require("../util/socket");

const POSTS_PER_PAGE = 10;

const getPosts = asyncHandler(async (req, res) => {
  const page_number = req.params.page_number || 1;
  const totalItems = await Post.find().countDocuments();
  const posts = await Post.find()
    .populate("creator")
    .sort({ createdAt: -1 })
    .skip((page_number - 1) * POSTS_PER_PAGE)
    .limit(POSTS_PER_PAGE);

  return res.status(200).json({
    message: "Fetched posts successfully.",
    posts: posts,
    totalItems: totalItems
  });
});

const getPost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const post = await Post.find_post(postId);

  return res.status(200).json({
    message: "Post fetched",
    post: post._doc,
    creator: { _id: req.user.userId, name: req.user.userName }
  });
});

const createPost = asyncHandler(async (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const file = req.file;
  const newPost = new Post({
    title: title,
    content: content,
    creator: req.user.userId,
    imageUrl: file?.path
  });

  await newPost.save();
  getIo().on("connection", (socket) => {
    socket.broadcast.emit("posts", {
      action: "create",
      post: {
        ...newPost._doc,
        creator: { _id: req.user.userId, name: req.user.userName }
      }
    });
  });

  return res.status(201).json({
    message: "post created successfuly",
    post: newPost._doc,
    creator: { _id: req.user.userId, name: req.user.userName }
  });
});

const updatePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const post = await Post.find_post(postId);

  isUserAuthorized(postId, req.user.userId);

  if (req.file) {
    await removeImage(post.imageUrl);
    post.imageUrl = req.file.path;
  }

  post.title = req.title || post.title;
  post.content = req.content || post.content;
  await post.save();

  getIo().on("connection", (socket) => {
    socket.broadcast.emit("posts", {
      action: "update",
      post: {
        ...post._doc,
        creator: { _id: req.user.userId, name: req.user.userName }
      }
    });
  });

  return res.status(200).json({
    message: "Post updated!",
    post: {
      ...post._doc,
      creator: { _id: req.user.userId, name: req.user.userName }
    }
  });
});

const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const post = await Post.find_post(postId);

  isUserAuthorized(postId, req.user.userId);

  if (post.imageUrl) {
    await removeImage(post.imageUrl);
  }

  await Post.findByIdAndDelete(postId);
  getIo().on("connection", (socket) => {
    socket.broadcast.emit("posts", {
      action: "delete",
      postId: postId
    });
  });

  return res
    .status(200)
    .json({ message: "Post deleted successfully.", postId: postId });
});

module.exports = {
  getPosts: getPosts,
  getPost: getPost,
  createPost: createPost,
  updatePost: updatePost,
  deletePost: deletePost
};

const removeImage = asyncHandler(async (imageUrl) => {
  const filePath = path.join(__dirname, "..", imageUrl);
  await fs.unlink(filePath);
});

const isUserAuthorized = (postId, userId) => {
  if (postId.toString() !== userId.toString()) {
    throw new appError(
      "Unauthorized",
      401,
      "You can update or delete your own posts only"
    );
  }
};
