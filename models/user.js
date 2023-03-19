const mongoose = require("mongoose");
require("mongoose-type-email");
const findOrCreate = require("mongoose-findorcreate");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    unique: true,
    minLength: 2,
  },
  name: {
    type: String,
    require: true,
    minLength: 2,
  },
  email: {
    type: mongoose.SchemaTypes.Email,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  followers: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      autopopulate: {
        maxDepth: 1,
      },
    },
  ],
  follows: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      autopopulate: {
        maxDepth: 1,
      },
    },
  ],
  posts: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Post",
      autopopulate: {
        maxDepth: 2,
      },
    },
  ],
  liked_posts: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Post",
      autopopulate: {
        maxDepth: 1,
      },
    },
  ],
});

UserSchema.plugin(require("mongoose-autopopulate"));
UserSchema.plugin(findOrCreate);

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
