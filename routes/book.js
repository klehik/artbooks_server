const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/User')
const Book = require('../models/Book')
const { APIError } = require('../errors/error')
const { StatusCodes } = require('http-status-codes')

const multerUpload = require('../db/multer')
const sharp = require('sharp')
const { bucket } = require('../db/firebase')
const { isAdmin, isAuthenticated } = require('../middleware/auth')

router.post('/', multerUpload, isAuthenticated, async (req, res) => {
  // only authenticated users can upload
  if (req.files) {
    const bookData = req.body
    const dirName = bookData.title.replace(/\s/g, '')

    // save uploaded images to firebase
    const images = await Promise.all(
      req.files.map(async (file, index) => {
        // save file
        const filename = `images/${dirName}/${Date.now()}--${file.originalname}`
        const fbFile = bucket.file(filename)
        await fbFile.save(file.buffer, {
          predefinedAcl: 'publicRead',
        })
        // get url
        const metaData = await fbFile.getMetadata()
        const url = metaData[0].mediaLink

        return { url: url, filename: filename }
      })
    )

    // convert first image to webp for thumbnail
    const thumbnail = await sharp(req.files[0].buffer)
      .toFormat('webp')
      .toBuffer()

    const thumbnailFilename = `images/${dirName}/${Date.now()}--thumbnail`
    const fbThumbnail = bucket.file(thumbnailFilename)
    await fbThumbnail.save(thumbnail, {
      predefinedAcl: 'publicRead',
    })
    // get url for thumbnail
    const thumbnailMetaData = await fbThumbnail.getMetadata()
    const thumbnailUrl = thumbnailMetaData[0].mediaLink
    const thumbnailObj = { url: thumbnailUrl, filename: thumbnailFilename }

    const user = await User.findOne({ _id: req.user.id })
    const book = await Book.create({
      images: images,
      thumbnail: thumbnailObj,
      user: user.id,
      ...bookData,
      published: false,
      new: true,
    })
    user.books = user.books.concat(book.id)
    await user.save()
    res
      .status(StatusCodes.CREATED)
      .json({ message: 'Book submitted', data: book })
  } else {
  }
})

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)
  const search = req.query.search
  let sort = req.query.sort || ''

  // Pagecount
  const count = await Book.countDocuments({
    title: { $regex: search, $options: 'i' },
    artist: { $regex: search, $options: 'i' },
  })

  const pageCount = Math.ceil(count / limit)
  const books = page * limit

  // Query
  let query
  if (req.isAuthenticated() && req.user.role === 'admin') {
    query = { title: { $regex: search, $options: 'i' } }
  } else {
    query = {
      published: true,
      title: { $regex: search, $options: 'i' },
    }
  }

  const allBooks = await Book.find(query).limit(books).populate('user')
  console.log(page < pageCount, page, pageCount)
  res.status(StatusCodes.OK).json({ data: allBooks, hasMore: page < pageCount })
})

router.get('/dashboard', isAuthenticated, async (req, res) => {
  // Logged users sees own books on dashboard, admin sees all

  console.log(req.user.role === 'admin')
  if (req.user.role === 'admin') {
    const books = await Book.find({}).populate('user')
    res.status(StatusCodes.OK).json({ data: books })
  } else {
    const books = await Book.find({ user: req.user.id }).populate('user')
    res.status(StatusCodes.OK).json({ data: books })
  }
})

router.get('/:id', async (req, res) => {
  console.log(req.params.id)
  const book = await Book.findById(req.params.id)
  res.status(StatusCodes.OK).json({ data: book })
})

router.delete('/:id', isAdmin, async (req, res) => {
  // Only admin can delete
  const book = await Book.findById(req.params.id)
  const user = await User.findById(book.user)
  user.books = user.books.filter((b) => b.toString() !== book.id.toString())

  await user.save()
  await Book.findByIdAndDelete(book.id)

  book.images.forEach(async (img) => {
    await bucket.file(img.filename).delete()
  })
  return res
    .status(StatusCodes.OK)
    .json({ message: `${book.title} deleted`, data: book })
})

router.put('/:id', isAdmin, async (req, res) => {
  // Only admin can modify
  const update = { $set: req.body }
  const book = await Book.findByIdAndUpdate(req.params.id, update, {
    new: true,
  }).populate('user')
  res
    .status(StatusCodes.OK)
    .json({ message: `${book.title} updated`, data: book })
})

module.exports = router
