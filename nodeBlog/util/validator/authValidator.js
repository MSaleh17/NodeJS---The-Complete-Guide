const { body } = require("express-validator");
const User = require("../../models/User");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

const isEmailAlreadyExists = async (email) => {
  const user = await User.findOne({ email: email });
  if (user) {
    throw new Error("E-mail already in use");
  }
  return true;
};

const signUpValidator = [
  body("userName", "Not a valid e-mail username").trim().notEmpty(),
  body("email", "Not a valid e-mail address")
    .notEmpty()
    .isEmail()
    .custom(isEmailAlreadyExists)
    .withMessage("E-mail already in use")
    .normalizeEmail(),
  body(
    "password",
    "The password must be at least 8 characters, lowercase, uppercase, numbers, and symbol"
  )
    .notEmpty()
    .isStrongPassword(),
  validatorMiddleware
];

const signInValidator = [
  body("email", "Not a valid e-mail address").notEmpty().isEmail(),
  body("password", "Password required").notEmpty(),
  validatorMiddleware
];

module.exports = {
  signUpValidator: signUpValidator,
  signInValidator: signInValidator
};
