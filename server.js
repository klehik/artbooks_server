const config = require('./utils/config')
const app = require('./app')
const connectMongoDB = require('./db/connectMongoDB')

connectMongoDB(config.MONGODB_URI)

const port = config.PORT || 8080

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
