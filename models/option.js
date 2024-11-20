const mongoose = require("mongoose")
const { type } = require("os")
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const option = new Schema({
    id: {type: ObjectId},
    colorId:  {type: ObjectId, ref: 'color'},
    productId:  {type: ObjectId, ref: 'product'},
    image: {type: String},
    price: {type: Number},
    optionName: {
        type: String,
        required: true,
        // unique: true,
        // trim: true,
        // maxLength: 30,
        // minLength: 6,
        default: 'Defaul option name'
    }
})

module.exports = mongoose.models.option || mongoose.model("option", option)