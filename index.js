const express = require('express')
const asyncHandler = require('express-async-handler')
const connectDB = require('./config/db')

const app = express()

//allow api to connect with react front end
const cors = require('cors')
app.use(cors())

connectDB()

//express body parser for raw json
app.use(express.json())


app.get('/', (req, res)=> res.send('API RUNNING'))
const PORT = process.env.PORT || 5000

/*Using routes */
app.use('/api/auth', require("./routes/authRoutes"))
app.use('/api/users', require("./routes/userRoutes"))

app.listen(PORT, ()=>console.log(`Server started on ${PORT}`))