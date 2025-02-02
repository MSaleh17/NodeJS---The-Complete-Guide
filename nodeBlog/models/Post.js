const { Schema, model } = require("mongoose");
const appError = require("../util/appError");

const Post = Schema(
  {
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    creator: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    imageUrl: {
      type: String
    }
  },
  { timestamps: true }
);

Post.statics.find_post = async function (postId) {
  const post = await this.findById(postId);
  if (!post) {
    throw new appError("Post not found", 404, "No course exist with this id");
  }
  return post;
};

module.exports = model("Post", Post);
