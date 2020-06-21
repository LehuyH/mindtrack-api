// server.js
require('dotenv').config()
const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const app = require('express')();

// listen for requests 
const server = app.listen(8080, () => {
  console.log("Your app is listening on port " + server.address().port);
});



//Services import
app.use(cors())
app.use(bodyParser.json());

app.get("/",(req,res)=>{
    res.send("Mindtrack API is online")
})

//Routes
const apiRoutes = require("./routes/api-routes.js")
app.use('/api',apiRoutes)








