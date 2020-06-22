const mongoose = require("mongoose")

var trackSchema = new mongoose.Schema({
  title: String,
  author: String,
  subGoals: {
    type: Array
  },
  collaborators: {
    type: Array
  }
});
module.exports = mongoose.model('Track', trackSchema);