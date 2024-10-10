const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const user = new Schema({
    id: {type: ObjectId},
    name: {
        type: String,
        required: true,
        // unique: true,
        // trim: true,
        // maxLength: 30,
        // minLength: 6,
        default: 'Nothing'
    },
    image: {type: String},
    email: {type: String},
    password: {type: String},
    age: {type: Number},
    address:  {type: String}
})

module.exports = mongoose.models.user || mongoose.model("user", user)