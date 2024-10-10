const mongoose = require("mongoose")
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const order_detail = new Schema({
    id: { type: ObjectId },
    orderId: { type: ObjectId, ref: 'order' },
    optionId: { type: ObjectId, ref: 'option' },
    productId: { type: ObjectId, ref: 'product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
});


module.exports = mongoose.models.order_detail || mongoose.model("order_detail", order_detail)