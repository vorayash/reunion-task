const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");

const UserModel = require("../models/user");

router.post("/register", async (req, res) => {
  let user = await UserModel.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username }],
  });
  if (user) {
    return res.json({ msg: "Email or username already exists" });
  }

  const { username, name, email } = req.body;

  const salt = await bcrypt.genSalt(10);
  const secPass = await bcrypt.hash(req.body.password, salt);

  const newUser = new UserModel({
    username,
    name,
    email,
    password: secPass,
  });

  await newUser.save();

  res.send("User registered!");
});

router.post(
  "/authenticate",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    //If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let success = false;
      let user = await UserModel.findOne({ email: req.body.email });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "Please login with correct credentials" });
      }
      const passwordCompare = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!passwordCompare) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "Please login with correct credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, process.env.JWT_SECRET);
      success = true;
      res.json(authtoken);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

router.post("/follow/:userId", fetchuser, async (req, res) => {
  try {
    //If there are errors , return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await UserModel.findById(req.user.id);
    const otherUser = await UserModel.findOne({ username: req.params.userId });

    if (
      user.follows.findIndex((u) => String(u._id) == String(otherUser._id)) !=
      -1
    ) {
      return res
        .status(409)
        .send(`User already following ${otherUser.username}`);
    }

    user.follows.push(otherUser);
    otherUser.followers.push(user);

    await user.save();
    await otherUser.save();

    res.send(`User is now following ${otherUser.username}`);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

router.post("/unfollow/:userId", fetchuser, async (req, res) => {
  try {
    //If there are errors , return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await UserModel.findById(req.user.id);
    const otherUser = await UserModel.findOne({ username: req.params.userId });

    if (
      user.follows.findIndex((u) => String(u._id) == String(otherUser._id)) ==
      -1
    ) {
      return res.send(`User already not following ${otherUser.username}`);
    }

    const otherUserIndex = user.follows.findIndex(
      (u) => String(u._id) == String(otherUser._id)
    );
    const userIndex = otherUser.followers.findIndex(
      (u) => String(u._id) == String(user._id)
    );

    user.follows.splice(otherUserIndex, 1);
    otherUser.followers.splice(userIndex, 1);

    await user.save();
    await otherUser.save();

    res.send(`User is no longer following ${otherUser.username}`);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

router.get("/user", fetchuser, async (req, res) => {
  try {
    //If there are errors , return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await UserModel.findById(req.user.id);

    if (!user) return res.status(404).send("user not found");

    res.json({
      name: user.name,
      followers: user.followers.length,
      followings: user.follows.length,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
