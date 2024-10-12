const express = require('express');
const categoryRouter = express.Router();
const categoryModel = require("../models/category")
const productModel = require("../models/product")
const JWT = require('jsonwebtoken');
const config = require("../utils/configEnv");

categoryRouter.get('/list/detail', async function (request, response) {
    try {
        const { categoryName } = request.query
        let category = await categoryModel.findOne({ name: categoryName })
        response.status(200).json({ status: true, message: "Mission completed", data: category });
    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' })
    }
})

categoryRouter.get('/list', async function (request, response) {
    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    let list = await categoryModel.find()
                    response.status(200).json({ status: true, message: "Mission completed", data: list });
                }
            })
        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' })
    }
})
categoryRouter.post("/add", async function (request, response) {
    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { name, image } = request.body;
                    const existedCategory = await categoryModel.findOne({ name: name })
                    if (!existedCategory) {
                        const addItem = { name, image };
                        await categoryModel.create(addItem);
                        response.status(200).json({ status: true, message: "Category created completed", addItem });
                    } else {
                        console.log(existedCategory)
                        response.status(200).json({ status: false, message: "Category name is existed" });
                    }
                }
            })
        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed', error: error.message })
    }
});

categoryRouter.put('/update', async function (request, response) {
    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { _id, name, image } = request.body;
                    console.log("Searching for ID:", _id);
                    let itemUpdate = await categoryModel.findById(_id)

                    if (itemUpdate != null) {
                        itemUpdate.name = name ? name : itemUpdate.name
                        itemUpdate.image = image ? image : itemUpdate.image

                        await itemUpdate.save()
                        response.status(200).json({ status: true, message: 'Mission completed' })
                    } else {
                        response.status(404).json({ status: false, message: "Not found Id" });
                    }
                }
            })
        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed', error: error.message })
    }


})

categoryRouter.delete('/delete', async function (request, response) {

    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { _id } = request.body;
                    const deletable = await productModel.findOne({ categoryId: _id })
                    if (!deletable) {
                        await categoryModel.findByIdAndDelete(_id)
                        response.status(200).json({ status: true, message: 'Mission completed' })
                    } else {
                        response.status(200).json({ status: false, message: 'Mission failed, this category has some product. Cannot be deleted' })
                    }
                }
            })
        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed', error: error.message })
    }
})

module.exports = categoryRouter