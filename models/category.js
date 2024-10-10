const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const category = new Schema({
    id: {type: ObjectId},
    name: {
        type: String,
        // required: true,
        // unique: true,
        // trim: true,
        // maxLength: 30,
        // minLength: 6,
        default: 'Nothing'
    },
    image: {type: String},
  
})

module.exports = mongoose.models.category || mongoose.model("category", category)