const { Router } = require("express");

const isAuth = require("../middleware/is_auth");
const feedControllers = require("../controllers/feed");
const postValidator = require("../util/validator/postValidator");
const uploads = require("../util/uploads");

const router = Router();

router.get("/posts", isAuth, feedControllers.getPosts);

router.get(
  "/post/:postId",
  isAuth,
  postValidator.getPostValidator,
  feedControllers.getPost
);
router.post(
  "/post",
  isAuth,
  uploads.single("avatar"),
  postValidator.createPostValidator,
  feedControllers.createPost
);
router.put(
  "/post/:postId",
  isAuth,
  uploads.single("avatar"),
  postValidator.updatePostValidator,
  feedControllers.updatePost
);
router.delete(
  "/post/:postId",
  isAuth,
  postValidator.deletePostValidator,
  feedControllers.deletePost
);

module.exports = router;
