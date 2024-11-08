const express = require('express');
const productRouter = express.Router();
const productModel = require('../models/product')
const categoryModel = require("../models/category")
const favoriteModel = require("../models/favorite")
const optionModel = require("../models/option")

const JWT = require('jsonwebtoken');
const config = require("../utils/configEnv");



/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /product/list:
 *   get:
 *     summary: Lấy danh sách sản phẩm
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []  
 *     responses:
 *       200:
 *         description: Mission completed
 *       400:
 *         description: Mission failed
 *       401:
 *         description: Unauthorized
 */
productRouter.get('/list', async function (request, response) {
    try {
        const token = request.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error, id) {
                if (error) {
                    response.status(403).json({ status: 403, message: error });
                } else {
                    const list = await productModel.find().populate('categoryId')

                    response.status(200).json({ status: true, message: "Mission completed", data: list });
                }
            });
        } else {
            response.status(401).json({ status: false, message: "Not authorized" });
        }
    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' })
    }
})

/**
 * @swagger
 * /product/list/quantity:
 *   get:
 *     summary: Get all products with quantity less than "limit"
 *     tags: [Product]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: limit
 *        description: Get all products with quantity less than "limit"
 * 
 *     responses:
 *       200:
 *         description: Get all products completed
 *       400: 
 *         description: Get all products failed
 *       401:
 *         description: Unauthorized
 */

//- Lấy danh sách sản phẩm có số lượng dưới 100
productRouter.get('/list/quantity', async function (request, response) {
    try {
        const token = request.header('Authorization').split(' ')[1]

        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error, id) {
                if (error) {
                    response.status(403).json({ status: 403, message: error });
                } else {
                    const { limit } = request.query
                    let list = await productModel.find({ quantity: { $lt: limit } })
                    response.status(200).json({ status: true, message: "Mission completed", data: list });
                }
            })

        } else {
            response.status(401).json({ status: false, message: "Not authorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' })
    }
})


/**
 * @swagger
 * /product/list/category/{categoryName}:
 *   get:
 *     summary: Get all products of category "xxx"
 *     tags: [Product]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: categoryName
 *        required: true
 *        description: The name of the category to get products from
 *     responses:
 *       200:
 *         description: Get all products of category "xxx" completed
 *       400: 
 *         description: Get all products of category "xxx" failed
 *       401:
 *         description: Unauthorized
 */
productRouter.get('/list/category/:categoryId', async function (request, response) {
    try {

        const { categoryId } = request.params;
        // Lấy danh sách sản phẩm thuộc loại đó
        const list = await productModel.find({ categoryId });

        response.status(200).json({ status: true, message: "Mission completed", products: list });

    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed', products: [] });
    }
});

productRouter.post('/detail/:productId', async function (request, response) {
    try {

        const { productId } = request.params
        const { userId } = request.body

        if (!productId) {
            return response.status(400).json({ status: false, message: "Missing productId in query params" });
        }

        const productDetail = await productModel.findById(productId);
        if (!productDetail) {
            return response.status(404).json({ status: false, message: "Product not found" });
        }



        let isFavorite = false
        if (userId) {
            const favorite = favoriteModel.findOne({ userId, productId })

            isFavorite = !!favorite

        }

        return response.status(200).json({ status: true, message: "Get product details successfully", productDetail, isFavorite });



    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400, Bad request, get product details failed' });
    }
});




/**
 * @swagger
 * /product/list/limit:
 *   get: 
 *     summary: Lấy danh sách sản phẩm có giá trên xxx và số lượng dưới xxx
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: price
 *         description: Giá tối thiểu của sản phẩm
 *         required: true
 *         type: number
 *       - in: query
 *         name: quantity
 *         description: Số lượng tối đa của sản phẩm
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: Lấy danh sách sản phẩm thành công
 *       400: 
 *         description: Lấy danh sách sản phẩm thất bại
 */
productRouter.get('/list/limit', async function (request, response) {
    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error, id) {
                if (error) {
                    response.status(403).json({ status: 403, message: error });
                } else {
                    const { price, quantity } = request.query
                    let list = await productModel.find({ price: { $gt: price }, quantity: { $lt: quantity } })
                    response.status(200).json({ status: true, message: "Mission completed", data: list });
                }
            })
        } else {
            response.status(401).json({ status: false, message: "Unauthorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' })
    }
})



// - Lấy danh sách sản phẩm có tên chứa chữ "xxx"
productRouter.get('/list/:name', async function (request, response) {
    try {
        const { name } = request.params
        let list = await productModel.find({ name: { $regex: name, $options: 'i' } })
        response.status(200).json({ status: true, message: "Mission completed", data: list });
    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' })
    }
})

/**
 * @swagger
 * /product/add:
 *   post:
 *     summary: Thêm sản phẩm 
 *     tags: [Product]
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
 *                 description: Tên sản phẩm
 *                 example: Mercury
 *               description:
 *                 type: string
 *                 description: Mô tả sản phẩm
 *                 example: Sao Thủy hay Thủy Tinh là hành tinh nhỏ nhất và gần Mặt Trời nhất trong tám hành tinh thuộc hệ Mặt Trời, với chu kỳ quỹ đạo bằng khoảng 88 ngày Trái Đất. Nhìn từ Trái Đất, hành tinh hiện lên với chu kỳ giao hội trên quỹ đạo bằng xấp xỉ 116 ngày, và nhanh hơn hẳn những hành tinh khác
 *               image:
 *                 type: string
 *                 description: URL hình ảnh sản phẩm
 *                 example: https://cdn.mos.cms.futurecdn.net/fjbeeRiPRQjQNhizwy7cWX-1200-80.jpg
 *               quantity:
 *                 type: number
 *                 description: Số lượng sản phẩm
 *                 example: 5
 *               price:
 *                 type: number
 *                 description: Giá sản phẩm
 *                 example: 10000
 *               categoryId:
 *                 type: string
 *                 description: ID danh mục sản phẩm
 *                 example: 670353609c7a6640a611fc13
 *     responses:
 *       200:
 *         description: Thêm product thành công
 *       403: 
 *         description: HTTP 403 Forbidden,verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 *       401:
 *         description: 401, Unauthorized
 *       400: 
 *         description: Http Exception 400, Bad request, Create product failed
 */

productRouter.post('/add', async function (request, response) {
    try {


        const { name, description, price, image, quantity, categoryId } = request.body
        const addItem = { name, description, price, image, quantity, categoryId };
        const newProduct = await productModel.create(addItem);

        // Tạo option mặc định cho sản phẩm mới
        // const defaultOption = {
        //     sizeId: '6706498d54c243334697c383',
        //     productId: newProduct._id,
        //     price: newProduct.price,
        //     optionName: `${name} Default Option`
        // }

        // await optionModel.create(defaultOption)

        response.status(200).json({ status: true, message: "Create product completed", product: newProduct });

    } catch (error) {
        response.status(400).json({ status: false, message: 'Create product failed', error: error.message })
    }
})

/**
 * @swagger
 * /product/update:
 *   put:
 *     summary: Thay đổi thông tin sản phẩm theo ID
 *     tags: [Product]
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
 *               name:
 *                 type: string
 *                 description: Tên sản phẩm
 *                 example: Earth
 *               description:
 *                 type: string
 *                 description: Mô tả sản phẩm
 *                 example: Trái Đất là hành tinh thứ ba tính từ Mặt Trời và là thiên thể duy nhất được biết đến là có sự sống.
 *               image:
 *                 type: string
 *                 description: URL hình ảnh sản phẩm
 *                 example: https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/1200px-The_Blue_Marble_%28remastered%29.jpg
 *               quantity:
 *                 type: number
 *                 description: Số lượng sản phẩm
 *                 example: 5
 *               price:
 *                 type: number
 *                 description: Giá sản phẩm
 *                 example: 10000
 *               categoryId:
 *                 type: string
 *                 description: ID danh mục sản phẩm
 *                 example: 670353609c7a6640a611fc13
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
productRouter.put('/update', async function (request, response) {
    try {
        const token = request.header('Authorization').split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { _id, name, description, image, quantity, price, categoryId } = request.body
                    console.log('updateting', _id, name)
                    const updateData = {};
                    if (name) updateData.name = name;
                    if (description) updateData.description = description;
                    if (image) updateData.image = image;
                    if (quantity) updateData.quantity = quantity;
                    if (price) updateData.price = price;
                    if (categoryId) updateData.categoryId = categoryId;

                    const item = await productModel.findByIdAndUpdate(_id, updateData, { new: true })
                    if (item != null) {
                        response.status(200).json({ status: true, message: "Update completed", item });
                    } else {
                        response.status(404).json({ status: false, message: "404, Not found Id" });
                    }
                }
            })

        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Update failed' })
    }
})


/**
 * @swagger
 * /product/list/range-price/{min}/{max}:
 *   get:
 *     summary: Get all products with price from min to max
 *     tags: [Product]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: min
 *        required: true
 *        description: Min price
 *      - in: path
 *        name: max
 *        required: true
 *        description: Max price
 *     responses:
 *       200:
 *         description: Mission completed
 *       400:
 *         description: Http Exception 400, Bad request, Mission failed
 *       401:
 *         description: 401, Unauthorized
 *       403: 
 *         description: HTTP 403 Forbidden, verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 */
// - Lấy danh sách các product có price từ min đến max 

productRouter.get('/list/range-price/:min/:max', async function (request, response) {

    try {
        const token = request.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error, id) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { min, max } = request.params
                    let list = await productModel.find({ price: { $gte: min, $lte: max } });

                    response.status(200).json({ status: true, message: "Mission completed", data: list });
                }
            })

        } else {
            response.status(401).json({ status: false, message: "Unauthorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' });
    }

});


/**
 * @swagger
 * /product/list/category-quantity/{categoryName}/{quantity}:
 *   get:
 *     summary: Get all products of category xxx with price higher than yyy
 *     tags: [Product]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: categoryName
 *        required: true
 *        description: categoryName
 *      - in: path
 *        name: quantity
 *        required: true
 *        description: minimmum quantity of products
 *     responses:
 *       200:
 *         description: Mission completed
 *       400:
 *         description: Http Exception 400, Bad request, Mission failed
 *       401:
 *         description: 401, Unauthorized
 *       403: 
 *         description: HTTP 403 Forbidden, verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 *       404:
 *         description: 404, Not found categoryName
 */
productRouter.get('/list/category-quantity/:categoryName/:quantity', async function (request, response) {

    try {
        const token = request.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error, id) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { categoryName, quantity } = request.params

                    let category = await categoryModel.findOne({ name: categoryName })
                    if (category) {
                        console.log('categoryId = ', category._id)
                        let list = await productModel.find({ categoryId: category._id, quantity: { $gt: quantity } });
                        response.status(200).json({ status: true, message: "Mission completed", data: list });
                    } else {
                        response.status(404).json({ status: false, message: "404, Not found categoryName" });
                    }

                }
            })

        } else {
            response.status(401).json({ status: false, message: "Unauthorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' });
    }

});





/**
 * @swagger
 * /product/list-sort-ascending:
 *   get:
 *     summary: Get all products sort ascending
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []  
 *     responses:
 *       200:
 *         description: Mission completed
 *       400:
 *         description: Mission failed
 *       401:
 *         description: Unauthorized
 */

productRouter.get('/list-sort-ascending', async function (request, response) {

    try {
        const token = request.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error, id) {
                if (error) {
                    response.status(403).json({ status: 403, message: error });
                } else {
                    const list = await productModel.find().sort({ price: 'ascending' })

                    response.status(200).json({ status: true, message: "Mission completed", data: list });
                }
            });
        } else {
            response.status(401).json({ status: false, message: "Not authorized" });
        }
    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' })
    }
})


/**
 * @swagger
 * /product/list/category-highest-price/{categoryName}:
 *   get:
 *     summary: Get all products of category xxx with highest price
 *     tags: [Product]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: categoryName
 *        required: true
 *        description: categoryName
 *     responses:
 *       200:
 *         description: 200, Mission completed
 *       204:
 *         description: 204, No products found in this category
 *       400:
 *         description: Http Exception 400, Bad request, Mission failed
 *       401:
 *         description: 401, Unauthorized
 *       403: 
 *         description: HTTP 403 Forbidden, verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 *       404:
 *         description: 404, Not found categoryName
 */
productRouter.get('/list/category-highest-price/:categoryName/', async function (request, response) {

    try {
        const token = request.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error, id) {
                if (error) {
                    response.status(403).json({ status: 403, message: error });
                } else {
                    const { categoryName } = request.params

                    // 1. Check xem loại được nhập vào có tồn tại hay không

                    const category = await categoryModel.findOne({ name: categoryName })
                    if (category) {
                        const products = await productModel.find({ categoryId: category._id })
                        console.log('products = ', products)

                        if (products.length === 0) {
                            response.status(204).json({ status: false, message: "204, No products found in this category", products });
                            return
                        }
                        // 2. Tìm giá cao nhất trong loại đó
                        const maxPrice = Math.max(...products.map((item) => item.price))

                        // 3. Lọc tất cả sản phẩm có giá cao nhất đó, return 1 mảng
                        const result = products.filter((item) => item.price == maxPrice)

                        response.status(200).json({ status: true, message: "200, Mission completed", data: result });
                    } else {
                        response.status(404).json({ status: false, message: "404, Category not found" });
                    }
                }
            });
        } else {
            response.status(401).json({ status: false, message: "401, Not authorized" });
        }
    } catch (error) {
        response.status(400).json({ status: false, message: '400, Mission failed' })
    }

});









module.exports = productRouter

