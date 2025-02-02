const jwt = require("jsonwebtoken");

const asyncHandler = require("express-async-handler");
const appError = require("../util/appError");

module.exports = asyncHandler(async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new appError(
      "Login fail",
      401,
      "you are not login, please login and try again"
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new appError(
      "Login fail",
      401,
      "you are not login, please login and try again"
    );
  }

  const decodedToken = await jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (!decodedToken) {
    throw new appError(
      "Login fail",
      401,
      "you are not login, please login and try again"
    );
  }

  req.user.userId = decodedToken.userId;
  req.user.userName = decodedToken.userName;
  next();
});
