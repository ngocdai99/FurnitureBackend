const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const favorite = new Schema({
    id: {type: ObjectId},
    userId:  {type: ObjectId, ref: 'user'},
    productId:  {type: ObjectId, ref: 'product'},
    addAt: {type: Date, default: Date.now}

})

module.exports = mongoose.models.favorite || mongoose.model("favorite", favorite)