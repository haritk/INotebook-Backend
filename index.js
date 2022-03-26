const express = require("express");
const mongoose = require("mongoose");
var cors = require("Cors")
// Define all routers here.
var userRouter = require('./routes/user');
var noteRouter = require('./routes/note');
// Database name: zirectly.
const url = "mongodb://localhost:27017/notebook";
const connect = mongoose.connect(url);


// Connect to MongoDB server.
connect.then((db) => {
    console.log('Connected to MongoDB server.');
  }, (err) => {
    console.log(err);
  });
// Initialize express app.
var app = express();

app.use(cors());
// Parse requests of content-type - application/json. i.e req.body 
app.use(express.json());
// set port, listen for requests
const PORT = process.env.PORT || 8080;

app.use('/auth', userRouter);
app.use('/note', noteRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});