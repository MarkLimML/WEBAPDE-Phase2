const mongoose = require("mongoose")

let User = mongoose.model("user", {
    username: String,
    password: String
})

module.exports = {
    User
}