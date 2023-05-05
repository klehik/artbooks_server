const { StatusCodes } = require('http-status-codes')

const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    next()
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })
  }
}

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })
  }
}

module.exports = { isAdmin, isAuthenticated }
