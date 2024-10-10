const express = require('express');
const orderRouter = express.Router();
const orderModel = require("../models/order")
const orderDetailModel = require("../models/order_detail");
const mongoose = require('mongoose');



// add trên cluster
// orderRouter.post('/add', async function (request, response) {
//     const session = await mongoose.startSession()
//     session.startTransaction();
//     try {
//         const { userId, items } = request.body

//         if (!Array.isArray(items) || items.length === 0) {
//             return response.status(400).json({ status: false, message: 'Items must be a non-empty array.' });
//         }

//         const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

//         const order = await orderModel.create({ userId, totalAmount }, { session });

//         const orderDetails = items.map((item) => {
//             return {
//                 orderId: order._id,
//                 optionId: item.optionId,
//                 productId: item.productId,
//                 quantity: item.quantity,
//                 price: item.price
//             }
//         })

//         await orderDetailModel.insertMany(orderDetails, {session})
//         await session.commitTransaction();
//         response.status(200).json({
//             status: true,
//             message: "Order created successfully",
//             order,
//             orderDetails
        
//         });

//     } catch (error) {
//         await session.abortTransaction();
//         response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Order creation failed', error: error.message  })
//     }finally{
//         session.endSession()
//     }
// })

// add ở localhost
orderRouter.post('/add', async function (request, response) {
    try {
        const { userId, items } = request.body;

        // Tính toán tổng số tiền
        const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // Tạo đơn hàng
        const order = await orderModel.create({ userId, totalAmount });

        // Tạo chi tiết đơn hàng
        const orderDetails = items.map((item) => {
            return {
                orderId: order._id,
                optionId: item.optionId,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            };
        });

        // Chèn các chi tiết đơn hàng
        await orderDetailModel.insertMany(orderDetails);

        response.status(200).json({
            status: true,
            message: "Order created successfully",
            order,
            orderDetails
        });

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Order creation failed', error: error.message });
    }
});



// lấy thông tin của một order thông qua orderId
orderRouter.get('/details', async (request, response) => {
    try {
        const { orderId } = request.query;
        const order = await orderModel.findById(orderId)
        if(order){
            const details = await orderDetailModel.find({ orderId })
            response.status(200).json({ status: true, order, details });
        }
       
       
    } catch (error) {
        response.status(400).json({ status: false, message: "Failed to fetch order details", error: error.message });
    }
});


// lấy toàn bộ orders của một user thông qua userId
orderRouter.get('/list-orders-by-userid', async function (request, response) {
    try {
        const { userId } = request.query
        const orders = await orderModel.find({ userId: userId });

        const allOrders = await Promise.all(
            orders.map(async (order) => {
                const details = await orderDetailModel.find({ orderId: order._id })
                return {
                    order,
                    details
                };
            })
        );
        response.status(200).json({ status: true, message: "Get orders by userId completed", allOrders });

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Get orders by userId failed' })
    }
})










module.exports = orderRouter