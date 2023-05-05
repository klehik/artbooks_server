const { StatusCodes } = require('http-status-codes')

const errorHandling = (err, req, res, next) => {
  console.log(err.message)
  res.status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: err.message,
  })
}

module.exports = { errorHandling }
