var express = require('express');
var router = express.Router();
var passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy;
const jwt      = require('jsonwebtoken');
var User = require('../models/user');
var Config = require('../config/config')
var env = require('../config/env')
const url = require('url'); 


passport.use(new FacebookStrategy({

    clientID: Config.config.facebookAuth.clientID,
    clientSecret: Config.config.facebookAuth.clientSecret,
    callbackURL: Config.config.facebookAuth.callbackURL,
    profileFields: ['id', 'name', 'email', 'photos'],
},
    function (accessToken, refreshToken, profile, done) {
        console.log('req.user');
        User.findOrCreate(profile.name.givenName + ' ' + profile.name.familyName, profile.emails[0].value, profile.id, profile.photos[0].value, accessToken, function (err, user) {
            if (err) { return done(err); }
            done(null, user);
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',function (req, res, next) {

    passport.authenticate('facebook', {session: false}, (err, user, info) => {
        //console.log(user);
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Login failed',
                user   : user
            });
        }

        req.login(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }
            
            const token = jwt.sign(user.toJSON(),'your_jwt_secret');
            //console.log("user");
            res.setHeader('Content-Type', 'application/json');
            // res.json({user,})
            
          
            return res.redirect(env.frontendPath() + '/profile/'+token);;
        });
    })
    (req, res);

});




module.exports = router;