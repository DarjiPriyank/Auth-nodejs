const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");
// registration
router.post("/register", async (req, res) => {
  try {
    const { username, password, email, name } = req.body;
    console.log(req.body);
    // console.log(checkUsername(username))
    const usernameTaken = await checkUsername(req.body.username);
    if (!usernameTaken) {
      return res
        .status(400)
        .json({ message: "Username alredy taken", success: false });
    }
    const emailAddressTaken = await checkEmail(req.body.email);
    if (!emailAddressTaken) {
      return res
        .status(400)
        .json({ message: "Email address alredy taken", success: false });
    }
    const salt = await bcrypt.genSalt();
    const hashpassword = await bcrypt.hash(password, salt);
    console.log(hashpassword);
    const newUser = User({
      name,
      username,
      email,
      password: hashpassword,
    });
    await newUser.save();
    return res.status(201).json({ message: "account created", success: true });
  } catch (e) {
    console.log("Registeration:" + e);
    return res
      .status(500)
      .json({ message: "Unable to create account", success: false });
  }
});

// Login
router.post("/login", async (req, res) => {
  let { username, password } = req.body;
  console.log(username + " " + password);
  let user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({
      message: "Username not found",
      success: false,
    });
  }

  let isMatch = bcrypt.compare(password, user.password);
  console.log(isMatch);
  if (isMatch) {
    let token = jwt.sign(
      {
        user_id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        // role: user.role
      },
      SECRET_KEY,
      { expiresIn: "7 Days" }
    );
    return res.status(200).json({ token: `Bearer ${token}`, message: "done" });
  } else {
    return res
      .status(400)
      .json({ message: "Incorrect Password", success: false });
  }
});
// after login
router.get(
  "/home",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // {}
    const userData = (user) => {
      return {
        username: user.username,
        email: user.email,
        name: user.name,
      };
    };
    console.log(userData(req.user));
    return res.json({
      message: "welcome user",
      success: true,
      user: userData(req.user),
    });
  }
);
// utils methods
const checkUsername = async (username) => {
  const user = await User.findOne({ username: username });
  return user ? false : true;
};

const checkEmail = async (email) => {
  let user = await User.findOne({ email: email });
  return user ? false : true;
};

module.exports = router;
