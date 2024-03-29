const express = require('express')
const app = express();
const cors = require("cors")
const cookieParser = require("cookie-parser")
const medicationsRoutes = require('./src/routes/medication')
const authRoutes = require('./src/routes/auth')
const userRoutes = require('./src/routes/user')

const port = process.env.PORT || 5000
const bodyParser = require('body-parser')


var corsOptions = {
  origin:"*",
  // origin:["https://www.yaprescription.com","http://localhost:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 200,
  credentials:true  
}

app.use(cors(corsOptions))
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   // res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, Authorization');
//   // res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//   // res.header("Access-control-Allow-Credentials", true)
//   next();
// });
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