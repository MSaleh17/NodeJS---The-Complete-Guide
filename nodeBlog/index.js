const express = require("express");
const { connect } = require("mongoose");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routers/auth");
const feedRoutes = require("./routers/feed");
const errorMidleware = require("./middleware/errorMidleware");
const { socketInit } = require("./util/socket");
const appError = require("./util/appError");

const app = express();

app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/v1", authRoutes);
app.use("/api/v1", feedRoutes);

app.use("*", (req, res, next) => {
  next(new appError("Invalid url", 400, `This url is not exist: ${req.url}`));
});

app.use(errorMidleware);

connect(process.env.MONGODB_URL).then((con) => {
  const httpServer = app.listen(process.env.PORT);
  socketInit(httpServer);
});

process.on("unhandledRejection", (err) => {
  throw err;
});

process.on("uncaughtException", (err) => {
  console.log(`uncaught rejection: ${err.name}, ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
