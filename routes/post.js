const express = require("express");
const fetchuser = require("../middleware/fetchuser.js");
const CommentModel = require("../models/comment.js");
const PostModel = require("../models/post.js");
const UserModel = require("../models/user.js");
const router = express.Router();

router.post("/posts", fetchuser, async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  const post = await new PostModel({ user: req.user.id, ...req.body });

  if (!user) return res.status(404).send("user not found");

  user.posts.push(post);

  user.save();
  post.save();

  res.json({
    post_id: post._id,
    title: post.title,
    description: post.description,
    created_time: post.postedAt,
  });
});

router.delete("/posts/:postId", fetchuser, async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  const post = await PostModel.findById(req.params.postId);

  if (!post) return res.status(404).send("post not found");

  const postIndex = user.posts.findIndex(
    (p) => String(p._id) == String(post._id)
  );
  if (postIndex == -1) return res.status(404).send("post not found");

  user.posts.splice(postIndex, 1);
  await PostModel.deleteOne({ _id: req.params.postId });

  await user.save();

  res.send("post deleted successfully");
});

router.post("/like/:postId", fetchuser, async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  const post = await PostModel.findById(req.params.postId);

  if (
    user.liked_posts.findIndex((p) => String(p._id) == String(post._id)) != -1
  )
    return res.status(409).send("post already liked");

  if (!post) return res.status(404).send("post not found");

  post.likes.push(user);
  user.liked_posts.push(post);

  await user.save();
  await post.save();
  res.send("post liked successfully");
});

router.post("/unlike/:postId", fetchuser, async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  const post = await PostModel.findById(req.params.postId);

  if (
    user.liked_posts.findIndex((p) => String(p._id) == String(post._id)) == -1
  )
    return res.status(409).send("post already unliked");

  if (!post) return res.status(404).send("post not found");

  const likeIndex = post.likes.findIndex((u) => String(u._id) == user._id);
  user.liked_posts.splice(likeIndex, 1);
  post.likes.splice(likeIndex, 1);

  await user.save();
  await post.save();
  res.send("post unliked successfully");
});

router.post("/comment/:postId", fetchuser, async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  const post = await PostModel.findById(req.params.postId);

  if (!post) return res.status(404).send("post not found");

  const comment = await CommentModel.create({
    user,
    content: req.body.comment,
  });

  post.comments.push(comment);
  await post.save();

  res.send(comment._id);
});

router.get("/posts/:postId", fetchuser, async (req, res) => {
  const post = await PostModel.findById(req.params.postId);

  if (!post) return res.status(404).send("post not found");

  const { title, description, likes, comments } = post;

  res.json({
    title,
    description,
    likes: likes.length,
    comments: comments.length,
  });
});

router.get("/all_posts", fetchuser, async (req, res) => {
  let posts = await PostModel.find({ user: req.user.id }).sort({
    postedAt: "desc",
  });

  posts = posts.map((p) => {
    let { _id, title, desc: description, likes, postedAt } = p;
    comments = p.comments.map((c) => c.content);

    return {
      _id,
      title,
      desc: description,
      created_at: postedAt,
      comments,
      likes: likes.length,
    };
  });

  res.send(posts);
});

module.exports = router;
