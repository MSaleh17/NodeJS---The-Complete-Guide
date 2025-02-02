const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const appError = require("../util/appError");

const saltRounds = 12;

const signUp = asyncHandler(async (req, res) => {
  const userName = req.body.userName;
  const email = req.body.email;
  const password = req.body.password;

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = new User({
    userName: userName,
    email: email,
    password: hashedPassword
  });

  await newUser.save();
  return res.status(201).json({ message: "User created!" });
});

const signIn = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let isPasswordCorrect;

  const user = await User.findOne({ email: email });
  if (user) {
    isPasswordCorrect = await bcrypt.compare(password, user.password);
  }

  if (!user || !isPasswordCorrect) {
    throw new appError("Login fail", 401, "email or password is not correct");
  }

  const token = await jwt.sign(
    {
      userName: user.userName,
      email: user.email,
      userId: user._id
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES
    }
  );

  return res.status(200).json({ token: token });
});

module.exports = {
  signUp: signUp,
  signIn: signIn
};
