const express = require('express')
const app = express();
const cors = require("cors")
const cookieParser = require("cookie-parser")
const medicationsRoutes = require('./src/routes/medication')
const authRoutes = require('./src/routes/auth')

const port = process.env.PORT || 5000
const bodyParser = require('body-parser')
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested, Content-Type, Accept Authorization"
    )
    if (req.method === "OPTIONS") {
      res.header(
        "Access-Control-Allow-Methods",
        "POST, PUT, PATCH, GET, DELETE"
      )
      return res.status(200).json({})
    }
    next()
  });
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())
app.use(cookieParser())

app.use('/auth', authRoutes)
app.use('/api/medication', medicationsRoutes)


app.listen((process.env.PORT || 5000), ()=>{
    console.log("listening on " + port);
})

module.exports = app;