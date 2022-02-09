const express = require('express')
const crypto = require('crypto')
const passport = require('passport')
const bcrypt = require('bcrypt')

const bcryptSaltRounds = 10

const errors = require('../lib/custom_errors')

const BadParamsError = errors.BadParmsError
const BadCredentialsError = errors.BadCredentialsError

const User = require('../models/user')

// will restrict route access unless token is passed
// will set res.user
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

router.post('/sign-up', (req, res, next) => {
  // will start a promise chain and handle
  Promise.resolve(req.body.credentials)
    // will not allow requests if the passwords do not match
    // will not allow empty string as password
    .then(credentials => {
      if (!credentials ||
      !credentials.password ||
    credentials.password !== credentials.password_confirmation) {
      throw new BadParamsError()
      }
    })
    // will generate a hash from the password and return a promise
    .then(() => bcrypt.hash(req.body.credentials.password, bcryptSaltRounds))
    .then(hash => {
      // will return params to create a user
      return {
        email: req.body.credentials.email,
        hashedPassword: hash
      }
    })
    // create user
    .then(user => User.create(user))
    // will send the created user object back with status 201
    // `hashedPassword`will not be sent because it is transformed in the user model
    .then(user => res.status(201).json({ user: user.toObject() }))
    // pass any errors to the error handler
    .catch(next)
})


module.exports = router
