const mongoose = require("mongoose")
const { type } = require("os")
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const order = new Schema({
    id: {type: ObjectId},
    userId:  {type: ObjectId, ref: 'user'},
    totalAmount:  {type: Number},
    createdAt: {type: Date, default: Date.now},
    status: { type: String, default: 'Pending confirmed' },

})

module.exports = mongoose.models.order || mongoose.model("order", order)