if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const connectTomongo = require("./db");
const express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Database Connection
connectTomongo();

app.use(cors());

//Routes
const userRouter = require("./routes/user.js");
const postRouter = require("./routes/post.js");

app.use("/api", userRouter);
app.use("/api", postRouter);

//Listen Port
const port = process.env.PORT;
app.listen(port, () => {
  console.log("Server is listening on port", `${port}`);
});

module.exports = { app };
