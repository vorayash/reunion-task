const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
    autopopulate: {
      maxDepth: 1,
    },
  },
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  likes: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      autopopulate: {
        maxDepth: 1,
      },
    },
  ],
  comments: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Comment",
      autopopulate: {
        maxDepth: 1,
      },
    },
  ],
  postedAt: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.plugin(require("mongoose-autopopulate"));

const PostModel = mongoose.model("Post", PostSchema);

module.exports = PostModel;
