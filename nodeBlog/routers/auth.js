const { Router } = require("express");

const authController = require("../controllers/auth");
const {
  signUpValidator,
  signInValidator
} = require("../util/validator/authValidator");

const router = Router();

router.put("/signUp", signUpValidator, authController.signUp);

router.post("/signIn", signInValidator, authController.signIn);

module.exports = router;
