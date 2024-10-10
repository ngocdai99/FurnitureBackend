const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const product = new Schema({
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
    description: {type: String},
    price: {type: Number},
    image: {type: String},
    rating: {type: Number},
    voting: {type: Number},
    quantity: {type: Number},
    categoryId: {type: ObjectId, ref: 'category'}
  
})

module.exports = mongoose.models.product || mongoose.model("product", product)