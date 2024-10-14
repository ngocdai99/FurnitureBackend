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



/**
 * @swagger
 * /category/list:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Get categories list completed
 *       400:
 *         description: Http Exception 400, Bad request, Get categories list failed
 *       401:
 *         description: 401, Unauthorized
 *       403: 
 *         description: HTTP 403 Forbidden, verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 */
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


/**
 * @swagger
 * /category/add:
 *   post: 
 *     summary: Create new category
 *     tags: [Category]
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: new category name
 *                 example: Nebula
 *               image:
 *                 type: string
 *                 description: new category image
 *                 example: nebula_image
 *     responses:
 *       200:
 *         description: Create category successfully
 *       403: 
 *         description: HTTP 403 Forbidden,verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 *       401:
 *         description: 401, Unauthorized
 *       400: 
 *         description: Http Exception 400, Bad request, Create category failed
 *       409: 
 *         description: Http Exception 409, Bad request, category Name existed
 */
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
                        response.status(409).json({ status: false, message: "Category name is existed" });
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


/**
 * @swagger
 * /category/update:
 *   put:
 *     summary: Update size name with ID
 *     tags: [Category]
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
 *                 description: Id of the category which you want to update
 *                 example: 670a3d3a0a60865036210f84
 *               name:
 *                 type: string
 *                 description: New category name
 *                 example: L
 *               image:
 *                 type: string
 *                 description: New category image
 *                 example: L
 *     responses:
 *       200:
 *         description: Update category successfully
 *       400: 
 *         description: Dữ liệu yêu cầu không hợp lệ, Update failed
 *       401: 
 *         description: 401, Unauthorized
 *       403: 
 *         description: HTTP 403 Forbidden, verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 *       404:
 *         description: 404, Not found category Id
 *       409:
 *         description: 409, Size name you want to update is existed
 */
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
                        response.status(200).json({ status: true, message: 'Update category successfully' })
                    } else {
                        response.status(404).json({ status: false, message: "Not found categoryId" });
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



/**
 * @swagger
 * /category/delete:
 *   delete:
 *     summary: Delete category 
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: _id
 *         schema:
 *           type: string
 *         description: ID favorite
 *         required: true
 *         example: 670968fab4cc5c881c2dccf6
 *     responses:
 *       200:
 *         description: Delete completed
 *       400: 
 *         description: Http Exception 400, Bad request, Delete failed
 *       401: 
 *         description: 401, Unauthorized
 *       403: 
 *         description: HTTP 403 Forbidden, verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 *       409:
 *         description: 409, this category has linked products. Cannot be deleted
 */
categoryRouter.delete('/delete', async function (request, response) {

    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { _id } = request.query;
                    const deletable = await productModel.findOne({ categoryId: _id })
                    if (!deletable) {
                        await categoryModel.findByIdAndDelete(_id)
                        response.status(200).json({ status: true, message: 'Mission completed' })
                    } else {
                        response.status(409).json({ status: false, message: '409, this category has linked products. Cannot be deleted' })
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