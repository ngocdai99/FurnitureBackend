var express = require('express');
var optionRouter = express.Router();
var optionModel = require("../models/option")



optionRouter.post('/add', async function (request, response) {
    try {
        const { sizeId, productId, price, optionName } = request.body
        const newOption = { sizeId, productId, price, optionName };
        console.log('newOption', newOption)
        await optionModel.create(newOption);
        response.status(200).json({ status: true, message: "Create new option completed", option: newOption });

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Create option failed' })
    }
})


// - Thay đổi thông tin option theo id,
optionRouter.put('/update', async function (request, response) {
    try {
        const { _id, price, optionName } = request.body

        const updateData = {};

        if (price) updateData.price = price;
        if (optionName) updateData.optionName = optionName;


        const item = await optionModel.findByIdAndUpdate(_id, updateData, { new: true })
        if (item != null) {
            response.status(200).json({ status: true, message: "Update completed", item });
        } else {
            response.status(200).json({ status: false, message: "Not found optionId" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' })
    }
})
// lấy toàn bộ option của một sản phẩm thông qua productId
optionRouter.get('/list-options-by-productid', async function (request, response) {
    try {
        const { productId } = request.query
        const list = await optionModel.find({ productId: productId });
        response.status(200).json({ status: true, message: "Get options by productId completed", options: list });

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Get options by productId failed' })
    }
})










module.exports = optionRouter