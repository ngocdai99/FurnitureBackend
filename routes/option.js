const express = require('express');
const optionRouter = express.Router();
const optionModel = require("../models/option")

const JWT = require('jsonwebtoken');
const config = require("../utils/configEnv");


/**
 * @swagger
 * /option/add:
 *   post:
 *     summary: Create new option
 *     tags: [Option]
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sizeId:
 *                 type: string
 *                 description: Size ID of option
 *                 example: 6706bc829b23d9ba0556997d
 *               productId:
 *                 type: string
 *                 description: Product ID of option
 *                 example: 6706bca29b23d9ba05569982
 *               price:
 *                 type: number
 *                 description: Option price
 *                 example: 10000
 *               optionName:
 *                 type: string
 *                 description: Option name
 *                 example: Mercury size L
 *     responses:
 *       200:
 *         description: Create option successfully
 *       403: 
 *         description: HTTP 403 Forbidden,verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 *       401:
 *         description: 401, Unauthorized
 *       400: 
 *         description: Http Exception 400, Bad request, Create option failed
 */
optionRouter.post('/add', async function (request, response) {

    try {

        const { colorId, productId, image, price, name } = request.body
        const option = { colorId, productId, image, price, name };
        const newOption = await optionModel.create(option);
        response.status(200).json({ status: true, message: "Create new option completed", option: newOption });

    } catch (error) {
        response.status(400).json({ status: false, message: `Http Exception 400: ${error.message}` })
    }
})


/**
 * @swagger
 * /option/update:
 *   put:
 *     summary: Update option with Id
 *     tags: [Option]
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: optionId you need to update
 *                 example: 670a3d3a0a60865036210f84
 *               price:
 *                 type: number
 *                 description: new option price
 *                 example: 10000
 *               name:
 *                 type: string
 *                 description: new option name
 *                 example: Mercury size L
 *     responses:
 *       200:
 *         description: Cập nhật sản phẩm thành công
 *       400: 
 *         description: Dữ liệu yêu cầu không hợp lệ, Update failed
 *       401: 
 *         description: 401, Unauthorized
 *       403: 
 *         description: HTTP 403 Forbidden, verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 *       404:
 *         description: Không tìm thấy sản phẩm với ID đã cho
 */
optionRouter.put('/update', async function (request, response) {

    try {

        const { _id, price, image, name } = request.body

        const updateData = {};

        if (price) updateData.price = price;
        if (name) updateData.name = name;
        if (image) updateData.image = image;



        const item = await optionModel.findByIdAndUpdate(_id, updateData, { new: true })
        if (item != null) {
            response.status(200).json({ status: true, message: "Update completed", item });
        } else {
            response.status(200).json({ status: false, message: "Not found optionId" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: `Http Exception 400: ${error.message}` })
    }
})



/**
 * @swagger
 * /option/list-options-by-productid:
 *   get: 
 *     summary: Get all options of a product with productId
 *     tags: [Option]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         description: Product ID which you want to get all options of it
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: 200, Get options by productId completed
 *       400: 
 *         description: Http Exception 400, Bad request, Get options by productId failed
 *       401: 
 *         description: 401, Unauthorized
 *       403: 
 *         description: HTTP 403 Forbidden, verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 */
// lấy toàn bộ option của một sản phẩm thông qua productId
optionRouter.get('/list-options-by-productid', async function (request, response) {

    try {

        const { productId } = request.query
        const list = await optionModel.find({ productId: productId });
        response.status(200).json({ status: true, message: "Get options by productId completed", options: list });


    } catch (error) {
        response.status(400).json({ status: false, message: `Http Exception 400: ${error.message}` })
    }
})










module.exports = optionRouter