const mongoose = require("mongoose")

let Question = mongoose.model("question", {
    category: String,
    question: String,
    choices: Array,
    correctans: Number
})

module.exports = {
    User
}