const express = require('express')
const router = express.Router()
const passport = require('passport')
const authController = require('../Auth/controller')

// Setting up the passport middleware for each of the OAuth providers
const twitterAuth = passport.authenticate('twitter')
const googleAuth = passport.authenticate('google', {
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ],
  session: false,
})
const facebookAuth = passport.authenticate('facebook', { session: false })
const githubAuth = passport.authenticate('github', { session: false })

// This custom middleware allows us to attach the socket id to the session.
// With the socket id attached we can send back the right user info to 
// the right socket
const addSocketIdtoSession = (req, res, next) => {
  console.log("Socket")
  req.session.socketId = req.query.socketId
  next()
}

// Routes that are triggered by the React client
router.get('/twitter', addSocketIdtoSession, twitterAuth)
router.get('/google', addSocketIdtoSession, googleAuth)
router.get('/facebook', addSocketIdtoSession, facebookAuth)
router.get('/github', addSocketIdtoSession, githubAuth)

// Routes that are triggered by callbacks from OAuth providers once 
// the user has authenticated successfully
router.get('/twitter/callback', twitterAuth, authController.twitter)
router.get('/google/callback', googleAuth, authController.google)
router.get('/facebook/callback', facebookAuth, authController.facebook)
router.get('/github/callback', githubAuth, authController.github)

module.exports = router