const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const consola = require("consola");
const { DB, PORT } = require("./config");
const userRoute = require("./route/User");
const passport = require("passport");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(morgan("dev"));
app.use(passport.initialize());
require("./middlewares/passport")(passport);
app.use("/user", userRoute);
const startApp = async () => {
  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    consola.success({ message: `Connected to MongoDB  ${DB}`, badge: true });
    app.listen(PORT, () => {
      consola.success(`Server is listening on ${PORT}`);
    });
  } catch (error) {
    consola.error({
      message: `Error while connecting mongodb:${error}`,
      badge: true,
    });
    startApp();
  }
};

startApp();
