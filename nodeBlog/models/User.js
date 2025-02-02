const { Schema, model } = require("mongoose");

const User = new Schema({
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  }
});

module.exports = model("User", User);
