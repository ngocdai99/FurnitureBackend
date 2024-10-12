var express = require('express');
var optionRouter = express.Router();
var optionModel = require("../models/option")

const JWT = require('jsonwebtoken');
const config = require("../utils/configEnv");



optionRouter.post('/add', async function (request, response) {

    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { sizeId, productId, price, optionName } = request.body
                    const newOption = { sizeId, productId, price, optionName };
                    console.log('newOption', newOption)
                    await optionModel.create(newOption);
                    response.status(200).json({ status: true, message: "Create new option completed", option: newOption });
                }
            })

        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Create option failed', message: error.message })
    }
})


// - Thay đổi thông tin option theo id,
optionRouter.put('/update', async function (request, response) {

    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
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
                }
            })

        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Update option failed', message: error.message })
    }
})
// lấy toàn bộ option của một sản phẩm thông qua productId
optionRouter.get('/list-options-by-productid', async function (request, response) {

    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { productId } = request.query
                    const list = await optionModel.find({ productId: productId });
                    response.status(200).json({ status: true, message: "Get options by productId completed", options: list });
                }
            })

        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Get options by productId failed', message: error.message })
    }
})










module.exports = optionRouter