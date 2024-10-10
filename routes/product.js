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

productRouter.get('/list2', async function (request, response) {
    try {
        response.status(200).json({ status: true, message: "Mission completed", data: "hehe" });
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

// - Lấy danh sách sản phẩm có giá trên 5000 và số lượng dưới 50
productRouter.get('/list/limit', async function (request, response) {
    try {
        const { price, quantity } = request.body
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


// - Thêm mới một sản phẩm mới
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

// - Thay đổi thông tin sản phẩm theo id,
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
            response.status(200).json({ status: false, message: "Not found Id" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' })
    }
})


// - Xóa một sản phẩm ra khỏi danh sách

// productRouter.delete("/delete", async function (req, res) {
//     try {
//         var { _id } = req.query
//         await productModel.findByIdAndDelete(_id);
//         res.json({ status: true, message: "Xóa sản phẩm thành công" });
//     } catch (err) {
//         res.json({ status: false, message: "Xóa sản phẩm thất bại", err: err });
//     }
// });

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

