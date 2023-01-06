const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const mongoose=require('mongoose');
const multer = require ('multer');
const aws = require ('aws-sdk')
const router = require('./routes/route');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use (multer().any())
 mongoose.connect("mongodb+srv://kakarot:7r9d5ckARYXY2cDi@cluster0.ecdqowc.mongodb.net/group47database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )


app.use('/', router);

app.use(function (req, res) {
    return res.status(404).send({status: false, message: 'Path not found'})
})

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});