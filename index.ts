const express = require('express')
const app = express();
const cors = require("cors")
const cookieParser = require("cookie-parser")
const medicationsRoutes = require('./src/routes/medication')
const authRoutes = require('./src/routes/auth')
import { Routes } from "./src/routes/routes";

const port = process.env.PORT || 5000
const bodyParser = require('body-parser')


var corsOptions = {
  origin:"*",
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())
app.use(cookieParser())

const routes = new Routes();
routes.routes(app)

// app.use('/auth', authRoutes)
// app.use('/api/medication', medicationsRoutes)


app.listen((process.env.PORT || 5000), ()=>{
    console.log("listening on " + port);
})

module.exports = app;