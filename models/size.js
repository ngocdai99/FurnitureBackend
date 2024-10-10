const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const size = new Schema({
    id: {type: ObjectId},
    sizeName: {
        type: String,
        required: true,
        // unique: true,
        // trim: true,
        // maxLength: 30,
        // minLength: 6,
        default: 'Nothing'
    },
})

module.exports = mongoose.models.size || mongoose.model("size", size)