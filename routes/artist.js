const express = require('express')
const router = express.Router()

const User = require('../models/User')
const { APIError } = require('../errors/error')
const { StatusCodes } = require('http-status-codes')

router.get('/', async (req, res) => {
  const artists = await User.find({ role: 'artist' }).populate({
    path: 'books',
    match: { published: true },
  })

  res.status(StatusCodes.OK).json({ data: artists })
})

module.exports = router
