
const passport = require('passport')
//const { Strategy: TwitterStrategy } = require('passport-twitter')
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Strategy: FacebookStrategy } = require('passport-facebook')
var GitHubStrategy = require('passport-github').Strategy;
const { FACEBOOK_CONFIG, GOOGLE_CONFIG, GITHUB_CONFIG } = require('../config/config')
var User = require('../models/user');
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
module.exports = () => {

  // Allowing passport to serialize and deserialize users into sessions
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
      done(err, user);
    });
  });

  // The function that is called when an OAuth provider sends back user 
  // information.  Normally, you would save the user to the database here
  // in a callback that was customized for each provider.
  const callbackFaceBook = function (accessToken, refreshToken, profile, done) {
    console.log(profile);
    User.findOrCreate(profile.name.givenName + ' ' + profile.name.familyName, profile.emails[0].value, profile.id, profile.photos[0].value, profile.provider, null, accessToken, function (err, user) {
      if (err) { 
        console.log("Error: Passport.js: "+err)
        return done(err); 
      }
      done(null, user);
    });
  }
  const callbackGoogle = function (accessToken, refreshToken, profile, done) {
    console.log(profile);
    User.findOrCreate(profile.name.givenName + ' ' + profile.name.familyName, profile.emails[0].value, profile.id, profile.photos[0].value, profile.provider, null, accessToken, function (err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
  const callbackGitHub = function (accessToken, refreshToken, profile, done) {
    console.log(profile);
    User.findOrCreate(profile.displayName, profile.emails[0].value, profile.id, profile.photos[0].value, profile.provider, profile.profileUrl, accessToken, function (err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }

  // Adding each OAuth provider's strategy to passport
  //passport.use(new TwitterStrategy(TWITTER_CONFIG, callback))
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CONFIG.clientID,
    clientSecret: GOOGLE_CONFIG.clientSecret,
    callbackURL: GOOGLE_CONFIG.callbackURL,

  }, callbackGoogle));
  passport.use(new FacebookStrategy({

    clientID: FACEBOOK_CONFIG.clientID,
    clientSecret: FACEBOOK_CONFIG.clientSecret,
    callbackURL: FACEBOOK_CONFIG.callbackURL,
    profileFields: ['id', 'name', 'email', 'picture.type(large)', 'profileUrl'],
  }, callbackFaceBook))
  passport.use(new GitHubStrategy({
    clientID: GITHUB_CONFIG.clientID,
    clientSecret: GITHUB_CONFIG.clientSecret,
    callbackURL: GITHUB_CONFIG.callbackURL,
    //passReqToCallback: true, // req object on auth is passed as first arg
    scope: ['user:email'],
  }, callbackGitHub));

  passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'Glitchfy960318'
  },
    function (jwtPayload, done) {
      console.log("jwtPayload");
      console.log(jwtPayload);
      //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
      return User.getUserById(jwtPayload, function (err, user) {
        if (err) { return done(err); }
        done(null, user);
      })
      // .then(user => {
      //   return cb(null, user);
      // })
      // .catch(err => {
      //   return cb(err);
      // });
    }
  ));
}