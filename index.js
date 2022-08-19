const express = require('express')
const app = express();

const port = process.env.PORT || 5000
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use('/api/medication', require('./src/routes/medication'))

app.listen(port, ()=>{
    console.log("listening on " + port);
})