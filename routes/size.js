var express = require('express');
var sizeRouter = express.Router();
var sizeModel = require("../models/size")
const mongoose = require('mongoose');


sizeRouter.post('/add', async function (request, response) {
    try {
        const { sizeName } = request.body
        const sizeExisted = await sizeModel.findOne({ sizeName: sizeName })
        if (!sizeExisted) {
            const newSize = { sizeName: sizeName };
            console.log('newSize', newSize)
            await sizeModel.create(newSize);
            response.status(200).json({ status: true, message: "Create size completed", size: newSize });
        } else {
            response.status(200).json({ status: false, message: "Size Name existed" });
        }
    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Create size failed' })
    }
})


sizeRouter.get('/list', async function (request, response) {
    try {
        const list = await sizeModel.find()
        // const list = []
        console.log('sizes list', list)
        if (list.length == 0) {
            response.status(200).json({ status: true, message: "Get sizes list completed, sizes length = 0", sizes: list });
        } else {
            response.status(200).json({ status: true, message: "Get sizes list completed", sizes: list });
        }
    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Get sizes list failed' })
    }
})

sizeRouter.post('/update', async function (request, response) {
    try {
        const { _id, sizeName } = request.body
        const sizeNameExisted = await sizeModel.findOne({ sizeName: sizeName })
        if (sizeNameExisted) {
            response.status(200).json({ status: false, message: "Size name you want to update is existed" });
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


    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Update size failed' })
    }
})


module.exports = sizeRouter