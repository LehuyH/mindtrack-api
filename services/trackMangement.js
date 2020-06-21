//Load Modules
const mongoose = require("mongoose")
const fs = require('fs')
const bcrypt = require('bcrypt')
const validator = require('validator');
const jwt = require('jsonwebtoken')


//Models
let User = require("../models/user.js")
let Track = require("../models/track.js");


//Connect to DB
mongoose.connect(process.env.dbURL,{useNewUrlParser: true,useUnifiedTopology:true})


//Services
async function createTrack(userID,trackData) {

  //Check if the username is already in use
 
  let user = await User.findById(userID)
   
  if (user !== null) { //username already in use
    trackData.collaborators.push(user.id)
    let newTrack = await Track.create(trackData);
    if(newTrack.id !== undefined){
        user.userTracks.push(newTrack.id)
        await user.save()
        return {success:true}
    }else{
        return {success:false,error:"Error in creating track, please try again"}
    }
   
  } else {
    return {
        success: false,
        error: "Unknown User ID"
      }
  }

  



}

async function getInfo(trackID){
  let track = await Track.findById(trackID)
  if(track !== undefined){
    return {success:true, data:{title:track.title,id:track.id,author:track.author,subGoals:{total:track.subGoals.length,completed:track.subGoals.filter(goal => goal.completed).length}}}
  }else{
    return {success:false,error:"Could not find track"}
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
  create: createTrack,
  getInfo: getInfo,

}