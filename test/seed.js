const { ObjectID } = require("mongodb");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const CommentModel = require("../models/comment");
const PostModel = require("../models/post");
const {app} = require('./../server');
const bcrypt = require("bcrypt");

const userOneID = new ObjectID();
const userTwoID = new ObjectID();

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}


const posts = [
  {
    user: userOneID,
    _id: new ObjectID(),
    title: "First Post",
    description: "First post description",
  },
  {
    user: userTwoID,
    _id: new ObjectID(),
    title: "Second Post",
    description: "Second post description",
  },
];

const users = [
  {
    _id: userOneID,
    name:"person 1",
    email: "person1@gmail.com",
    password: "",
    username: "person1",
    posts:[posts[0]._id]
  },
  {
    _id: userTwoID,
    name: "person 2",
    email: "person2@gmail.com",
    password: "",
    username: "person2",
    posts:[posts[1]._id]
  },
];

hashPassword("Password1").then((pass)=>{
      users[0].password = pass;
      users[1].password = pass;
  }).catch()


var addDummyPosts = (done) => {
  PostModel.deleteMany({})
    .then(() => {
      return PostModel.insertMany(posts);
    })
    .then(() => done());
};

var addDummyUsers = (done) => {

  UserModel.deleteMany({})
    .then(() => {
      var userOne = new UserModel(users[0]).save();
      var userTwo = new UserModel(users[1]).save();

      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};

module.exports = {
  posts,
  addDummyPosts,
  users,
  addDummyUsers,
};
