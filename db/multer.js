const multer = require('multer')
const path = require('path')
const { APIError } = require('../errors/error')

const checkFileType = function (file, cb) {
  // Allowed file extensions
  const fileTypes = /jpeg|jpg|png|gif|svg/
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase())
  const mimeType = fileTypes.test(file.mimetype)
  if (mimeType && extName) {
    return cb(null, true)
  } else {
    cb(new APIError('Wrong file format'))
  }
}

const multerUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb)
  },
  // Max 10 images
}).array('images', 10)

module.exports = multerUpload
