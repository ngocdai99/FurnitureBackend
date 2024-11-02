const express = require('express');
const colorRouter = express.Router();
const colorModel = require("../models/color")
const mongoose = require('mongoose');
const JWT = require('jsonwebtoken');
const config = require("../utils/configEnv");


/**
 * @swagger
 * /color/add:
 *   post: 
 *     summary: Create new color
 *     tags: [Color]
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               colorName:
 *                 type: string
 *                 description: new color name
 *                 example: M
 *     responses:
 *       200:
 *         description: Create size successfully
 *       403: 
 *         description: HTTP 403 Forbidden,verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 *       401:
 *         description: 401, Unauthorized
 *       400: 
 *         description: Http Exception 400, Bad request, Create color failed
 *       409: 
 *         description: Http Exception 409, color Name existed
 */

colorRouter.post('/add', async function (request, response) {

    try {

        const { colorName } = request.body
        const colorExisted = await sizeModel.findOne({ colorName })
        if (!colorExisted) {
            const newColor = { colorName };
            console.log('newColor', newColor)
            await colorModel.create(newColor);
            response.status(200).json({ status: true, message: "Create color completed", color: newColor });
        } else {
            response.status(409).json({ status: false, message: "Color Name existed" });
        }


    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Create color failed', error: error.message })
    }
})

/**
 * @swagger
 * /size/list:
 *   get:
 *     summary: Get all sizes
 *     tags: [Size]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Get sizes list completed
 *       400:
 *         description: Http Exception 400, Bad request, Get sizes list failed
 *       401:
 *         description: 401, Unauthorized
 *       403: 
 *         description: HTTP 403 Forbidden, verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 */
colorRouter.get('/list', async function (request, response) {

    try {
        const list = await colorModel.find()
        console.log('colors list', list)
        if (list.length == 0) {
            response.status(204).json({ status: true, message: "204, Get colors list completed, sizes length = 0", colors: list });
        } else {
            response.status(200).json({ status: true, message: "200, Get colors list completed", colors: list });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Get colors list failed', error: error.message })
    }
})


/**
 * @swagger
 * /size/update:
 *   put:
 *     summary: Update size name with ID
 *     tags: [Size]
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
 *                 description: ID của sản phẩm cần cập nhật
 *                 example: 670a3d3a0a60865036210f84
 *               sizeName:
 *                 type: string
 *                 description: Tên sản phẩm
 *                 example: L
 *     responses:
 *       200:
 *         description: Update sizeName successfully
 *       400: 
 *         description: Dữ liệu yêu cầu không hợp lệ, Update failed
 *       401: 
 *         description: 401, Unauthorized
 *       403: 
 *         description: HTTP 403 Forbidden, verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 *       404:
 *         description: Not found size Id
 *       409:
 *         description: 409, Size name you want to update is existed
 */
colorRouter.put('/update', async function (request, response) {

    try {

        const { _id, colorName } = request.body
        const colorNameExisted = await colorModel.findOne({ colorName })
        if (colorNameExisted) {
            response.status(409).json({ status: false, message: "colorName you want to update is existed" });
        } else {
            const updateData = {};

            if (colorName) updateData.colorName = colorName;
            const item = await colorModel.findByIdAndUpdate(_id, updateData, { new: true })
            if (item != null) {
                response.status(200).json({ status: true, message: "Updated color completed", item });
            } else {
                response.status(200).json({ status: false, message: "Not found colorId" });
            }
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Update failed', error: error.message })
    }
})


module.exports = colorRouter