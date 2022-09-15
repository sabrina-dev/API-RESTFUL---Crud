const mongoose = require('mongoose')

const User = mongoose.model('User', {
  user_type: String,
  name: String,
  age: Number,
  email: String,
  password: String,
})

module.exports = User