const mongoose = require("mongoose")
const { type } = require("os")
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const order = new Schema({
    id: {type: ObjectId},
    userId:  {type: ObjectId, ref: 'user'},
    totalAmount:  {type: Number},
    createdDate: {type: Date, default: Date.now},
    status: { type: String, default: 'PENDING' },

})

module.exports = mongoose.models.order || mongoose.model("order", order)