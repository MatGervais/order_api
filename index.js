const express = require('express')
const app = express();
const cors = require("cors")
const cookieParser = require("cookie-parser")
const medicationsRoutes = require('./src/routes/medication')
const authRoutes = require('./src/routes/auth')
const userRoutes = require('./src/routes/user')

const port = process.env.PORT || 5000
const bodyParser = require('body-parser')


// var corsOptions = {
//   origin:["https://www.yaprescription.com","http://localhost:3000"],
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   preflightContinue: false,
//   optionsSuccessStatus: 200,
//   credentials:true,

  
// }

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
  });
app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())
app.use(cookieParser())

app.use('/auth', authRoutes)
app.use('/api/medication', medicationsRoutes)
app.use('/api/user', userRoutes)


app.listen((process.env.PORT || 5000), ()=>{
    console.log("listening on " + port);
})

module.exports = app;