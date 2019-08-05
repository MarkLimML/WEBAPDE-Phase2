const mongoose = require("mongoose")

let User = mongoose.model("user", {
    username: String,
    password: String,
    highscore: Number
})

module.exports = {
    User
}