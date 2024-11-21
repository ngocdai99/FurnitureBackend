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
    price: {type: Number, default: 50},
    image: {type: [String]},
    rating: {type: Number, default: 5},
    voting: {type: Number, default: 0},
    quantity: {type: Number, default: 10},
    categoryId: {type: ObjectId, ref: 'category'}
  
})

module.exports = mongoose.models.product || mongoose.model("product", product)