const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const option = new Schema({
    id: {type: ObjectId},
    sizeId:  {type: ObjectId, ref: 'size'},
    productId:  {type: ObjectId, ref: 'product'},
    price: {type: Number},
    optionName: {
        type: String,
        required: true,
        // unique: true,
        // trim: true,
        // maxLength: 30,
        // minLength: 6,
        default: 'Nothing'
    }
})

module.exports = mongoose.models.option || mongoose.model("option", option)