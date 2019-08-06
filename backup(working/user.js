const mongoose = require("mongoose")

let User = mongoose.model("user", {
    type: String,
    username: String,
    password: String,
    highscore: Number
})

module.exports = {
    User
}