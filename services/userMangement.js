//Load Modules
const mongoose = require("mongoose")
const fs = require('fs')
const bcrypt = require('bcrypt')
const validator = require('validator');
const jwt = require('jsonwebtoken')


//Models
let User = require("../models/user.js")

//Connect to DB
mongoose.connect(process.env.dbURL,{useNewUrlParser: true,useUnifiedTopology:true})


//Services
async function createUser(username,password,name) {

  //Check if the username is already in use
 
  let user = await User.findOne({username: username})
   
  if (user !== null) { //username already in use
    return {
      success: false,
      error: "This username is already in use"
    }
  } else {
    if (validator.isAlphanumeric(username)) { // Make sure username is an username
      //username not in use, hash password and store in database
      const hashedPassword = await bcrypt.hash(password, 10)
      //Starting info to store
      let data = {
        fullName:name,
        username: username,
        password: hashedPassword,
        collabTracks: [],
        userTracks: []
      }
      //Wrtie to DB
      await User.create(data);
      return await loginUser(username, password)
    }else{ // Not valid username
      return {success: false,error: "Username must be Alphanumeric"}
    }
  }

  



}

async function getUser(username){
  let user = await User.findOne({username: username}) 
  if(user !== undefined){
    return {success:true, data:{username:user.username,fullName:user.fullName,userTracks:user.userTracks,collabTracks:user.collabTracks}}
  }else{
    return {success:false,error:"Could not find user"}
  }
}

async function loginUser(username, password) {
 
  //Check if the username exists
 
  let user = await User.findOne({username: username})

  if (user !== null) { //username exists
  
      //Compare hashes
       if(await bcrypt.compare(password, user.password)){
         //Generate a web token
        const token = jwt.sign({id:user.id,username:user.username,fullName: user.fullName, random: await bcrypt.genSalt(10)}, process.env.SECERT, { expiresIn: '1h' })
        return {success: true,token:token}
       }else{ //Invalid password
       
        return {success: false,error: "Invalid Password"}
       }
    
  } else {
    return {success: false,error: "Invalid username"}
  }

  



}



module.exports = {
  create: createUser,
  login: loginUser,
  get : getUser
}