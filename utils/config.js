require('dotenv').config()

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET
const NODE_ENV = process.env.NODE_ENV

module.exports = {
  PORT,
  MONGODB_URI,
  FIREBASE_STORAGE_BUCKET,
  NODE_ENV,
}
