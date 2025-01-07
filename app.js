const express = require('express')
const cors = require('cors')
const app = express()
const routes = require('routes')
require('dotenv').config()
const PORT = process.env.PORT || 3306

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(routes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

module.exports = app
