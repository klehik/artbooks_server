const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const LocalStrategy = require('passport-local')

const User = require('../models/User')
const { APIError } = require('../errors/error')
const { StatusCodes } = require('http-status-codes')

passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    try {
      const user = await User.findOne({ username })
      const passwordCorrect =
        user === null
          ? false
          : await bcrypt.compare(password, user.passwordHash)

      if (!(user && passwordCorrect)) {
        return cb(null, false, { message: 'Incorrect username or password.' })
      }
      return cb(null, user)
    } catch (err) {
      return cb(err)
    }
  })
)

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, {
      id: user.id,
      username: user.username,
      role: user.role,
    })
  })
})

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user)
  })
})

router.get('/user', async (req, res) => {
  res.status(StatusCodes.OK).json(req.user)
})

router.post(
  '/login',
  passport.authenticate('local', {
    failureMessage: true,
  }),
  function (req, res) {
    res
      .status(StatusCodes.OK)
      .json({ message: `${req.user.username} logged in`, user: req.user })
  }
)

router.post('/logout', (req, res) => {
  const user = req.user
  req.logout((err) => {
    if (err) {
      throw new APIError(`Log out failed`, StatusCodes.CONFLICT)
    } else {
      res.status(StatusCodes.OK).json({ message: `logged out` })
    }
  })
})

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body
  const userExists = await User.findOne({ username })
  const emailExists = await User.findOne({ email })
  if (userExists || emailExists) {
    throw new APIError(`User already exists`, StatusCodes.CONFLICT)
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    email,
    passwordHash,
    role: 'artist',
  })

  const savedUser = await user.save()

  res
    .status(StatusCodes.CREATED)
    .json({ message: `${savedUser.username} registered`, user: savedUser })
})

module.exports = router
