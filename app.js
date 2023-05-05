const express = require('express')
const app = express()
const passport = require('passport')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const logger = require('morgan')
require('express-async-errors')
const config = require('./utils/config')
const authRouter = require('./routes/auth')
const artistRouter = require('./routes/artist')
const bookRouter = require('./routes/book')
const { errorHandling } = require('./middleware/error')
const cors = require('cors')
app.use(logger('dev'))

const production = true ? process.env.NODE_ENV == 'production' : false

app.use(
  cors({
    credentials: true,
    origin: production
      ? 'https://ccc-gilt.vercel.app'
      : 'http://localhost:3000',
  })
)
console.log(process.env.NODE_ENV)
app.use(
  session({
    name: 'session_id',
    secret: config.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: production ? true : false,
      sameSite: production ? 'none' : 'lax',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
    store: new MongoDBStore({
      uri: config.MONGODB_URI,
      collection: 'passport-sessions',
    }),
  })
)
app.set('trust proxy', 1)
app.use(passport.authenticate('session'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/auth', authRouter)
app.use('/artists', artistRouter)
app.use('/book', bookRouter)

app.use(errorHandling)
module.exports = app
