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
mongoose.connect(process.env.dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})


//Services
async function createTrack(userID, trackData) {

  //Check if the username is already in use

  let user = await User.findById(userID)

  if (user !== null) { //username already in use
    trackData.collaborators.push(user.id)
    let newTrack = await Track.create(trackData);
    if (newTrack.id !== undefined) {
      user.userTracks.push(newTrack.id)
      await user.save()
      return {
        success: true
      }
    } else {
      return {
        success: false,
        error: "Error in creating track, please try again"
      }
    }

  } else {
    return {
      success: false,
      error: "Unknown User ID"
    }
  }





}

async function getInfo(trackID) {
  let track = await Track.findById(trackID)
  if (track) {
    return {
      success: true,
      data: {
        title: track.title,
        id: track.id,
        author: track.author,
        subGoals: {
          total: track.subGoals.length,
          completed: track.subGoals.filter(goal => goal.completed).length
        }
      }
    }
  } else {
    return {
      success: false,
      error: "Could not find track"
    }
  }
}


async function getAllInfo(trackID, userID) {
  let track = await Track.findById(trackID)
  if (track !== undefined) {
    if (track.collaborators.includes(userID)) {
      return {
        success: true,
        data: {
          title: track.title,
          id: track.id,
          author: track.author,
          subGoals: track.subGoals,
          obstacles: track.obstacles
        }
      }
    } else {
      return {
        success: false,
        error: "You don't have permission to view this content"
      }
    }
  } else {
    return {
      success: false,
      error: "Could not find track"
    }
  }
}

async function setCollab(trackID, userID, newData) {
  let name = newData[newData.length - 1]
  let track = await Track.findById(trackID)
  if (track !== undefined) {
    if (track.collaborators[0] == userID) {
      let newCollab = await User.findOne({
        username: name
      })
      if (newCollab.collabTracks !== undefined) {
        newCollab.collabTracks.push(trackID)
        newCollab.save()
        track.collaborators.push(newCollab.id)
        track.save()
      } else {
        return {
          success: false,
          error: "Could not find that user, check the name!"
        }
      }
    } else {
      return {
        success: false,
        error: "You don't have permission to edit this content"
      }
    }
  } else {
    return {
      success: false,
      error: "Could not find track"
    }
  }
}

async function editTrack(trackID, userID, newData) {
  let track = await Track.findById(trackID)
  if (track !== undefined) {
    if (track.collaborators.includes(userID)) {
      track.title = newData.title
      track.subGoals = newData.subGoals
      track.obstacles = newData.obstacles
      await track.save()
      return {
        success: true
      }
    } else {
      return {
        success: false,
        error: "You don't have permission to edit this content"
      }
    }
  } else {
    return {
      success: false,
      error: "Could not find track"
    }
  }
}

async function deleteTrack(trackID, userID) {
  let track = await Track.findById(trackID)
  if (track !== undefined) {
    if (track.collaborators[0] == userID) {

      track.collaborators.forEach(async (collab, i) => {
        if (i !== 0) {
          let author = await User.findById(collab)
          author.collabTracks.splice(users.indexOf(trackID), 1)
          await author.save()
        }
      })
      let author = await User.findById(userID)
      author.userTracks.splice(users.indexOf(trackID), 1)
      await author.save()
      await track.delete()
      return {
        success: true
      }
    } else {
      return {
        success: false,
        error: "You don't have permission to edit this content"
      }
    }
  } else {
    return {
      success: false,
      error: "Could not find track"
    }
  }
}





module.exports = {
  create: createTrack,
  getInfo: getInfo,
  getAllInfo: getAllInfo,
  edit: editTrack,
  setCollab: setCollab,
  delete: deleteTrack

}