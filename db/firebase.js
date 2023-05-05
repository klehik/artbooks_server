const { FIREBASE_STORAGE_BUCKET } = require('../utils/config')

const { initializeApp, cert } = require('firebase-admin/app')
const { getStorage } = require('firebase-admin/storage')

const serviceAccount = require('../serviceAccount.json')

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: FIREBASE_STORAGE_BUCKET,
})

const bucket = getStorage().bucket()

module.exports = {
  bucket,
}
