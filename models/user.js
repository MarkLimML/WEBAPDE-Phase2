const mongoose = require("mongoose")

let User = mongoose.model("user", {
    type: String,
    username: String,
    password: String,
    totalgrains: Number
})

module.exports = {
    User
}