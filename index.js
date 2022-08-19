const express = require('express')
const app = express();
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use('/api/medication', require('./src/routes/medication'))

app.listen(5000, ()=>{
    console.log("listening");
})