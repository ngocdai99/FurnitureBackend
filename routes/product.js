const express = require('express');
const productRouter = express.Router();
const productModel = require('../models/product')
const categoryModel = require("../models/category")
const optionModel = require("../models/option")

const JWT = require('jsonwebtoken');
const config = require("../utils/configEnv");

// - Lấy toàn bộ danh sách sản phẩm
/**
 * @swagger
 * /product/list:
 *   get:
 *     summary: Lấy danh sách sản phẩm
 * 
 *     responses:
 *       200:
 *         description: Mission completed
 *       400: 
 *         description: Mission failed
 */

productRouter.get('/list', async function (request, response) {
    try {
        const token = request.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (err, id) {
                if (err) {
                    response.status(403).json({ "status": 403, "err": err });
                } else {
                    const list = await productModel.find().populate('categoryId')

                    response.status(200).json({ status: true, message: "Mission completed", data: list });
                }
            });
        } else {
            response.status(401).json({ "status": 401 });
        }




    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' })
    }
})

// - Lấy toàn bộ danh sách sản phẩm thuộc loại "xxx"
productRouter.get('/list/category/:categoryName', async function (request, response) {
    try {
        const { categoryName } = request.params;

        // Tìm danh mục theo tên
        const category = await categoryModel.findOne({ name: categoryName });
        if (!category) {
            return response.status(200).json({ status: false, message: "Category not found" });
        }

        // Lấy danh sách sản phẩm thuộc loại đó
        const list = await productModel.find({ categoryId: category._id }, 'name').populate('categoryId', 'name');

        response.status(200).json({ status: true, message: "Mission completed", data: list });
    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' });
    }
});


/**
 * @swagger
 * /product/list/quantity:
 *   get:
 *     summary: Get all products with quantity less than "limit"
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
 */

//- Lấy danh sách sản phẩm có số lượng dưới 100
productRouter.get('/list/quantity', async function (request, response) {
    try {
        const { limit } = request.query
        let list = await productModel.find({ quantity: { $lt: limit } })
        response.status(200).json({ status: true, message: "Mission completed", data: list });
    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' })
    }
})

/**
 * @swagger
 * /product/list/limit:
 *   get: 
 *     summary: Lấy danh sách sản phẩm có giá trên một mức nhất định và số lượng dưới một mức nhất định
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
        const { price, quantity } = request.query
        let list = await productModel.find({ price: { $gt: price }, quantity: { $lt: quantity } })
        response.status(200).json({ status: true, message: "Mission completed", data: list });
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
 *     summary: Thêm mới một sản phẩm
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Thông tin sản phẩm cần thêm
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Tên sản phẩm
 *               required: true
 *             description:
 *               type: string
 *               description: Mô tả sản phẩm
 *               required: true
 *             price:
 *               type: number
 *               description: Giá sản phẩm
 *               required: true
 *             image:
 *               type: string
 *               description: URL hình ảnh sản phẩm
 *               required: true
 *             rating:
 *               type: number
 *               description: Đánh giá sản phẩm
 *               required: false
 *             voting:
 *               type: number
 *               description: Số lượng bình chọn
 *               required: false
 *             quantity:
 *               type: number
 *               description: Số lượng sản phẩm
 *               required: true
 *             categoryId:
 *               type: string
 *               description: ID danh mục sản phẩm
 *               required: true
 *     responses:
 *       200:
 *         description: Thêm sản phẩm thành công
 *       400: 
 *         description: Thêm sản phẩm thất bại
 */
productRouter.post('/add', async function (request, response) {
    try {

        const { name, description, price, image, rating, voting, quantity, categoryId } = request.body
        const addItem = { name, description, price, image, rating, voting, quantity, categoryId };
        const newProduct = await productModel.create(addItem);

        // Tạo option mặc định cho sản phẩm mới
        const defaultOption = {
            sizeId: '6706498d54c243334697c383',
            productId: newProduct._id,
            price: newProduct.price,
            optionName: `${name} Default Option`
        }

        await optionModel.create(defaultOption)

        response.status(200).json({ status: true, message: "Mission completed", product: newProduct, option: defaultOption });
    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed', error: error.message })
    }
})

/**
 * @swagger
 * /product/update:
 *   put:
 *     summary: Thay đổi thông tin sản phẩm theo ID
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Thông tin sản phẩm cần cập nhật
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: ID của sản phẩm cần cập nhật
 *               required: true
 *               default: 6706bca29b23d9ba05569982
 *             name:
 *               type: string
 *               description: Tên sản phẩm
 *               required: false
 *               default: Mercury
 *             description:
 *               type: string
 *               description: Mô tả sản phẩm
 *               required: false
 *               default: Sao Thủy hay Thủy Tinh là hành tinh nhỏ nhất và gần Mặt Trời nhất trong tám hành tinh thuộc hệ Mặt Trời, với chu kỳ quỹ đạo bằng khoảng 88 ngày Trái Đất. Nhìn từ Trái Đất, hành tinh hiện lên với chu kỳ giao hội trên quỹ đạo bằng xấp xỉ 116 ngày, và nhanh hơn hẳn những hành tinh khác
 *             image:
 *               type: string
 *               description: URL hình ảnh sản phẩm
 *               required: false
 *               default: mercury_image
 *             quantity:
 *               type: number
 *               description: Số lượng sản phẩm
 *               required: false
 *               default: 5
 *             price:
 *               type: number
 *               description: Giá sản phẩm
 *               required: false
 *               default: 10000
 *             categoryId:
 *               type: string
 *               description: ID danh mục sản phẩm
 *               required: false
 *               default: 6706bc989b23d9ba05569980
 *     responses:
 *       200:
 *         description: Cập nhật sản phẩm thành công
 *       400: 
 *         description: Cập nhật sản phẩm thất bại
 *       404:
 *         description: Không tìm thấy sản phẩm với ID đã cho
 */
productRouter.put('/update', async function (request, response) {
    try {
        const { _id, name, description, image, quantity, price, categoryId } = request.body

        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (image) updateData.image = image;
        if (quantity) updateData.quantity = quantity;
        if (price) updateData.price = price;
        if (categoryId) updateData.categoryId = categoryId;

        const item = await productModel.findByIdAndUpdate(_id, updateData, { new: true })
        if (item != null) {
            response.status(200).json({ status: true, message: "Mission completed", item });
        } else {
            response.status(400).json({ status: false, message: "Not found Id" });
        }

    } catch (error) {
        response.status(404).json({ status: false, message: 'Mission failed' })
    }
})

// - Lấy danh sách các product có price từ min đến max 

productRouter.get('/list/range-price/:min/:max', async function (request, response) {

    try {
        const { min, max } = request.params
        let list = await productModel.find({ price: { $gte: min, $lte: max } });

        response.status(200).json({ status: true, message: "Mission completed", data: list });
    } catch (error) {
        console.error("Error:", error);
        response.status(400).json({ status: false, message: 'Mission failed', error: error.message });
    }
});

// - Lấy ra danh sách các product thuộc loại xxx và có số lượng lớn hơn yyy 
productRouter.get('/list/category-quantity/:categoryName/:quantity', async function (request, response) {

    try {
        const { categoryName, quantity } = request.params

        let category = await categoryModel.findOne({ name: categoryName })
        if (category) {
            console.log('categoryId = ', category._id)
            let list = await productModel.find({ categoryId: category._id, quantity: { $gt: quantity } });
            response.status(200).json({ status: true, message: "Mission completed", data: list });
        } else {
            response.status(200).json({ status: false, message: "Not found categoryName" });
        }


    } catch (error) {
        console.error("Error:", error);
        response.status(400).json({ status: false, message: 'Mission failed', error: error.message });
    }
});






// - Sắp xếp danh sách sản phẩm theo giá từ thấp đến cao
productRouter.get('/list-sort-ascending', async function (request, response) {
    try {
        const list = await productModel.find().sort({ price: 'ascending' })

        response.status(200).json({ status: true, message: "Mission completed", data: list });
    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' })
    }
})



// - Tìm sản phẩm có giá cao nhất thuộc loại xxx


productRouter.get('/list/category-highest-price/:categoryName/', async function (request, response) {

    try {
        const { categoryName } = request.params

        // 1. Check xem loại được nhập vào có tồn tại hay không

        const category = await categoryModel.findOne({ name: categoryName })
        if (category) {
            const products = await productModel.find({ categoryId: category._id })
            console.log('products = ', products)

            if (products.length === 0) {
                response.status(200).json({ status: false, message: "No products found in this category" });
                return
            }
            // 2. Tìm giá cao nhất trong loại đó
            const maxPrice = Math.max(...products.map((item) => item.price))

            // 3. Lọc tất cả sản phẩm có giá cao nhất đó, return 1 mảng
            const result = products.filter((item) => item.price == maxPrice)

            response.status(200).json({ status: true, message: "Mission completed", data: result });
        } else {
            response.status(200).json({ status: false, message: "Category not found" });
        }


    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed', error: error.message });
    }
});









module.exports = productRouter

