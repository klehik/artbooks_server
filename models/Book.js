const mongoose = require('mongoose')

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  writer: { type: String, required: true },
  graphicDesigner: { type: String, required: true },
  description: { type: String, required: true },
  images: [],
  thumbnail: { type: Object, required: true },
  published: { type: Boolean, required: true },
  new: { type: Boolean, required: true },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
})

bookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Book', bookSchema)
