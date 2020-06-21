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


async function getAllInfo(trackID,userID){
  let track = await Track.findById(trackID)
  if(track !== undefined){
    if(track.collaborators.includes(userID)){
    return {success:true, data:{title:track.title,id:track.id,author:track.author,subGoals:track.subGoals,obstacles:track.obstacles}}
    }else{
      return {success:false, error:"You don't have permission to view this content"}
    }
  }else{
    return {success:false,error:"Could not find track"}
  }
}

async function editTrack(trackID,userID,newData){
  let track = await Track.findById(trackID)
  if(track !== undefined){
    if(track.collaborators.includes(userID)){
     track = newData
     track.save()
     return {success:true}
    }else{
      return {success:false, error:"You don't have permission to edit this content"}
    }
  }else{
    return {success:false,error:"Could not find track"}
  }
}






module.exports = {
  create: createTrack,
  getInfo: getInfo,
  getAllInfo:getAllInfo,
  edit: editTrack

}