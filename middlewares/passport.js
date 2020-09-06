const { SECRET_KEY } = require("../config");
const User = require("../models/User");

var JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = SECRET_KEY;
module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, async (payload, done) => {
      console.log("payload:" + payload.user_id);
      await User.findById({ _id: payload.user_id })
        .then((user) => {
          if (user) {
            // logger
            return done(null, user);
          }
          // logger
          return done(null, false);
        })
        .catch((err) => {
          // logger
          console.log(err);
          return done(null, false);
        });
    })
  );
};
