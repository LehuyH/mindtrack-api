const mongoose = require("mongoose")

var userSchema = new mongoose.Schema({
  fullName: String,
  username: {type:String,unique:true},
  password: String,
  collabTracks: {type:Array},
  userTracks:  {type:Array}
});
module.exports = mongoose.model('User', userSchema );
  