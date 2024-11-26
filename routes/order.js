const express = require('express');
const orderRouter = express.Router();
const orderModel = require("../models/order")
const orderDetailModel = require("../models/order_detail");
const mongoose = require('mongoose');
const JWT = require('jsonwebtoken');
const util = require('util');
const config = require("../utils/configEnv");

/**
 * @swagger
 * /order/add:
 *   post:
 *     summary: Add a new order
 *     security: 
 *       - bearerAuth: []
 *     description: Creates a new order with order details
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "670398b0d1e8715c0ffe1789"
 *                 description: ID of the user placing the order
 *               items:
 *                 type: array
 *                 description: List of items in the order
 *                 items:
 *                   type: object
 *                   properties:
 *                     optionId:
 *                       type: string
 *                       example: "670a3d3b0a60865036210f86"
 *                       description: ID of the selected product option
 *                     productId:
 *                       type: string
 *                       example: "670a3d3a0a60865036210f84"
 *                       description: ID of the product
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                       description: Number of units of the product
 *                     price:
 *                       type: number
 *                       example: 10000
 *                       description: Price per unit of the product
 *     responses:
 *       200:
 *         description: Order created successfully
 *       400:
 *         description: Bad request, Order creation failed
 *       401:
 *         description: Unauthorized
 */


// add trên cluster
// orderRouter.post('/add', async function (request, response) {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const token = request.header("Authorization")?.split(' ')[1];

//         if (!token) {
//             return response.status(401).json({ status: false, message: "401, Unauthorized" });
//         }


//         await util.promisify(JWT.verify)(token, config.SECRETKEY);


//         const { userId, items } = request.body;

//         if (!Array.isArray(items) || items.length === 0) {
//             return response.status(400).json({ status: false, message: 'Items must be a non-empty array.' });
//         }

//         const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);


//         const order = await orderModel.create([{ userId, totalAmount }], { session });

//         const orderDetails = items.map((item) => ({
//             orderId: order[0]._id,
//             optionId: item.optionId,
//             productId: item.productId,
//             quantity: item.quantity,
//             price: item.price
//         }));

//         await orderDetailModel.insertMany(orderDetails, { session });

//         await session.commitTransaction();


//         response.status(200).json({
//             status: true,
//             message: "Order created successfully",
//             order: order[0], 
//             orderDetails
//         });

//     } catch (error) {
//         await session.abortTransaction();
//         response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Order creation failed', error: error.message });
//     } finally {
//         session.endSession();
//     }
// });

orderRouter.post('/add', async function (request, response) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {


        const { userId, items } = request.body;

        if (!Array.isArray(items) || items.length == 0) {
            return response.status(400).json({ status: false, message: 'Items must be a non-empty array.' });
        }

        const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);


        const order = await orderModel.create([{ userId, totalAmount }], { session });

        const orderDetails = items.map((item) => ({
            orderId: order[0]._id,
            optionId: item.optionId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        }));

        await orderDetailModel.insertMany(orderDetails, { session });

        await session.commitTransaction();


        response.status(200).json({
            status: true,
            message: "Order created successfully",
            orderId: order[0]._id
        });

    } catch (error) {
        await session.abortTransaction();
        response.status(400).json({ status: false, message: `Http Exception 400,  ${error.message}` });
    } finally {
        session.endSession();
    }
});

/**
 * @swagger
 * /order/details:
 *   get: 
 *     summary: Get order details with orderId
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderId
 *         description: OrderId you want to get details
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: 200, Fetch order details successfully
 *       400: 
 *         description: 400, Failed to fetch order details
 *       401:
 *         description: 401, Unauthorized
 *       403: 
 *         description: HTTP 403 Forbidden,verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 */
orderRouter.post('/details', async (request, response) => {
    try {
        const { orderId } = request.body;

        // Kiểm tra orderId
        if (!orderId) {
            return response.status(400).json({
                status: false,
                message: 'Order ID is required.'
            });
        }

        // Tìm đơn hàng và thông tin người dùng
        const order = await orderModel.findById(orderId).populate('userId');
        if (!order) {
            return response.status(404).json({
                status: false,
                message: 'Order not found.'
            });
        }

        // Tạo đối tượng order mới với userId chuyển thành user
        const { userId, ...rest } = order.toObject();
        const updateOrder = { ...rest, user: userId };

        // Lấy chi tiết đơn hàng và cập nhật thông tin sản phẩm
        const details = await orderDetailModel.find({ orderId }).populate('productId', 'name').populate('optionId')
        const updateDetails = details.map(detail => {
            const { productId, optionId, ...restDetail } = detail.toObject();
            return { ...restDetail, productName: productId.name, option: optionId };
        });

        // Trả về kết quả
        response.status(200).json({
            status: true,
            message: '200, Fetch order details successfully',
            generalInformation: updateOrder,
            details: updateDetails
        });

    } catch (error) {
        response.status(400).json({
            status: false,
            message: `Http Exception 400: ${error.message}`
        });
    }
});


/**
 * @swagger
 * /order/list-orders:
 *   get: 
 *     summary: Get all favorites of an user with userId
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         description: userId you want to get his order history
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: 200, Get orders by userId completed
 *       400: 
 *         description: 400, Bad request, Get orders by userId failed
 *       401:
 *         description: 401, Unauthorized
 *       403: 
 *         description: 403,verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 */



// lấy toàn bộ orders của một user thông qua userId, order status
orderRouter.post('/list-orders', async function (request, response) {

    try {

        const { userId, status } = request.body
        const orders = await orderModel.find({ userId: userId, status: status }).populate('userId');
        const updateOrders = orders.map((order) => {
            const orderObj = order.toObject();
            orderObj.user = orderObj.userId;
            delete orderObj.userId;
            return orderObj;
        });
        console.log(updateOrders)

        const allOrders = await Promise.all(
            updateOrders.map(async (order) => {
                const details = await orderDetailModel.find({ orderId: order._id }).populate('productId', 'name').populate('optionId')
                const updateDetails = details.map((detail) => {
                    const { productId, optionId, ...restDetail } = detail.toObject();
                    return { ...restDetail, productName: productId.name, option: optionId };
                })
                return {
                    generalInformation: order,
                    details: updateDetails
                };
            })
        );
        response.status(200).json({ status: true, message: "Get orders by userId and status completed", orders: allOrders });


    } catch (error) {
        response.status(400).json({ status: false, message: `Http Exception 400: ${error.message}` })
    }

})










module.exports = orderRouter