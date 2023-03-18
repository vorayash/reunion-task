if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const connectTomongo = require('./db')
const express = require("express");
// const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const cors = require("cors");
const ejs = require("ejs");
// const session = require("express-session");
// const flash = require("connect-flash");
// const passport = require("passport");
var bodyParser = require('body-parser')

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Database Connection
connectTomongo();


// //Static
// app.use(express.static("public"));

// // EJS
// app.use(expressLayouts);
// app.set("view engine", "ejs");

//Cors
app.use(cors());

// Express body parser
// app.use(express.urlencoded({ extended: true }));

// // Express session
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// // Passport middleware
// app.use(passport.initialize());
// app.use(passport.session());

// Connect flash (for errors)
// app.use(flash());

//For Put and Delete
//app.use(methodOverride("_method"));

// Global variables (for errors)
// app.use((req, res, next) => {
//   res.locals.success_msg = req.flash("success_msg");
//   res.locals.error_msg = req.flash("error_msg");
//   res.locals.error = req.flash("error");
//   next();
// });

//Routes
const userRouter = require("./routes/user.js");
const postRouter = require("./routes/post.js");
// const storyRouter = require("./routes/story.js");


app.use("/api", userRouter);
app.use("/api", postRouter);

//Listen Port
const port = process.env.PORT|| 8000
app.listen(port, () => {
  console.log("Server is listening on port", `${port}`);
});

module.exports = app;
