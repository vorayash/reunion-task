const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "reuniontaskassignment";
const fetchuser = require("../middleware/fetchuser");
const mongoose = require('mongoose')

const UserModel = require("../models/user");


router.post("/register", (req, res) => {

  const { username, email, password, password2 } = req.body;
  let errors = [];

  if (!username || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.json({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.json("error", {
      errors,
      username,
      email,
      password,
      password2,
    });
  } else {
    UserModel.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.status(200).json({"register":{ errors, username, email, password }});
      } else {
        const newUser = new UserModel({
          username,
          email,
          password,
        });

        newUser.save();
      }
    });
  }
});


//Authenticate a user using: POST "/api/auth/login". No login require

router.post('/authenticate', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists()
], async (req, res) => {

  //If there are errors, return bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  //Check wether the user with this email exist already
  try {
      let success = false;
      let user = await UserModel.findOne({ email: req.body.email });
      if (!user) {
          success = false;
          return res.status(400).json({ success, error: "Please login with correct credentials" })
      }
      const passwordCompare = await bcrypt.compare(req.body.password, user.password);
      if (!passwordCompare) {
          success = false;
          return res.status(400).json({ success, error: "Please login with correct credentials" })

      }

      const data = {
          user: {
              id: user.id
          }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      // res.json(user);
      res.json(authtoken);
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
  }

})


router.post("/follow/:userId", fetchuser, async (req, res) => {
  try {
    //If there are errors , return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await UserModel.findById(req.user.id);
    const otherUser = await UserModel.findOne({"username": req.params.userId});


    if(user.follows.findIndex((u) => String(u._id) == String(otherUser._id))!=-1)
    {
      return res.status(409).send(`User already following ${otherUser.username}`)
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
    const otherUser = await UserModel.findOne({"username": req.params.userId});

    if(user.follows.findIndex((u) => String(u._id) == String(otherUser._id))==-1)
    {
      return res.send(`User already not following ${otherUser.username}`)
    }

    const otherUserIndex = user.follows.findIndex((u) => String(u._id) == String(otherUser._id));
    const userIndex = otherUser.followers.findIndex((u) => String(u._id) == String(user._id));

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

    res.json({"name": user.name, "followers":user.followers.length, "followings": user.follows.length});
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }  
});


module.exports = router;
