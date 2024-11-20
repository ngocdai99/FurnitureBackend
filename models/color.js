const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const color = new Schema({
    id: {type: ObjectId},
    colorName: {
        type: String,
        required: true,
        unique: true,
        // trim: true,
        // maxLength: 30,
        // minLength: 6,
        default: 'Original'
    },
})

module.exports = mongoose.models.color || mongoose.model("color", color)