var express = require('express');
var sizeRouter = express.Router();
var sizeModel = require("../models/size")
const mongoose = require('mongoose');
const JWT = require('jsonwebtoken');
const config = require("../utils/configEnv");


/**
 * @swagger
 * /size/add:
 *   post: 
 *     summary: Create new size
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
 *               sizeName:
 *                 type: string
 *                 description: new size name
 *                 example: M
 *     responses:
 *       200:
 *         description: Create size successfully
 *       403: 
 *         description: HTTP 403 Forbidden,verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 *       401:
 *         description: 401, Unauthorized
 *       400: 
 *         description: Http Exception 400, Bad request, Create size failed
 *       409: 
 *         description: Http Exception 409, Size Name existed
 */

sizeRouter.post('/add', async function (request, response) {

    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { sizeName } = request.body
                    const sizeExisted = await sizeModel.findOne({ sizeName: sizeName })
                    if (!sizeExisted) {
                        const newSize = { sizeName: sizeName };
                        console.log('newSize', newSize)
                        await sizeModel.create(newSize);
                        response.status(200).json({ status: true, message: "Create size completed", size: newSize });
                    } else {
                        response.status(409).json({ status: false, message: "Size Name existed" });
                    }
                }
            })

        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Create size failed', error: error.message })
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
sizeRouter.get('/list', async function (request, response) {

    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const list = await sizeModel.find()
                    console.log('sizes list', list)
                    if (list.length == 0) {
                        response.status(204).json({ status: true, message: "204, Get sizes list completed, sizes length = 0", sizes: list });
                    } else {
                        response.status(200).json({ status: true, message: "200, Get sizes list completed", sizes: list });
                    }
                }
            })

        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Get sizes list failed', error: error.message })
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
sizeRouter.put('/update', async function (request, response) {

    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { _id, sizeName } = request.body
                    const sizeNameExisted = await sizeModel.findOne({ sizeName: sizeName })
                    if (sizeNameExisted) {
                        response.status(409).json({ status: false, message: "Size name you want to update is existed" });
                    } else {
                        const updateData = {};

                        if (sizeName) updateData.sizeName = sizeName;
                        const item = await sizeModel.findByIdAndUpdate(_id, updateData, { new: true })
                        if (item != null) {
                            response.status(200).json({ status: true, message: "Updated size completed", item });
                        } else {
                            response.status(200).json({ status: false, message: "Not found sizeId" });
                        }
                    }

                }
            })

        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Update failed', error: error.message })
    }
})


module.exports = sizeRouter