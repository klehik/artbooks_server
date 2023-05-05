const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is a required field'],
  },
  email: {
    type: String,
    required: [true, 'Email is a required field'],
    // eslint-disable-next-line no-useless-escape
    match: /.+\@.+\..+/,
  },
  passwordHash: String,
  role: { type: String, required: true, enum: ['admin', 'artist'] },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  },
})

const User = mongoose.model('User', userSchema)

module.exports = User
