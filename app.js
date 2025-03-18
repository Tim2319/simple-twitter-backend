const express = require('express')
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
const routes = require('./route')
const { socketServer } = require('./utils/socket')
const swaggerRoutes = require('./routes/swagger')
require('dotenv').config()

const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server)
const PORT = process.env.PORT || 3000

// Create upload directory if not exists
const uploadDir = path.join(__dirname, 'public', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

app.use('/uploads', express.static(uploadDir))

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}

app.use(cors(corsOptions))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

socketServer(server)

app.use(routes)
app.use('/api-docs', swaggerRoutes)

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    status: 'error',
    message: error.message || 'Something broke!'
  })
})

io.on('connection', socket => {
  console.log('New WebSocket connection')
})
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

module.exports = app
