const mongoose = require("mongoose")

let Question = mongoose.model("question", {
    category: String,
    question: String,
    choices: [String],
    correctans: Number
})

module.exports = {
    Question
}