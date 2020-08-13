const mongoose = require('mongoose');
var Schema = new mongoose.Schema;
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
 
});
//console.log(UserSchema);
const User = mongoose.model('User', UserSchema);
//console.log(User);
module.exports = User;