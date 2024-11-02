var express = require('express');
var favoriteRouter = express.Router();
var favoriteModel = require("../models/favorite")

const JWT = require('jsonwebtoken');
const config = require("../utils/configEnv");

/**
 * @swagger
 * /favorite/add:
 *   post: 
 *     summary: Create new favorite
 *     tags: [Favorite]
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
 *         description: Create favorite successfully
 *       403: 
 *         description: HTTP 403 Forbidden,verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 *       401:
 *         description: 401, Unauthorized
 *       400: 
 *         description: Http Exception 400, Bad request, Create favorite failed
 *       409: 
 *         description: Http Exception 409, This product is existed in this user's favorites
 */
favoriteRouter.post('/add', async function (request, response) {
    try {

        const { userId, productId } = request.body
        const existedFavorite = await favoriteModel.findOne({ userId, productId })
        if (!existedFavorite) {
            const favorite = { userId, productId };
            console.log('newFavorite', favorite)
            const newFavorite = await favoriteModel.create(favorite);
            response.status(200).json({ status: true, message: "Create new favorite completed", favorite: newFavorite });
        } else {
            response.status(409).json({ status: true, message: "This product is existed in this user's favorites" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Create favorite failed' })
    }
})


/**
 * @swagger
 * /favorite/list-favorites-by-userid:
 *   get: 
 *     summary: Get all favorites of an user with userId
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         description: Id of the user you want to get all favorites
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: Lấy danh sách sản phẩm thành công
 *       400: 
 *         description: Lấy danh sách sản phẩm thất bại
 */
// lấy toàn bộ favorite của một user thông qua userId
favoriteRouter.get('/list-favorites-by-userid', async function (request, response) {
    try {
        const { userId } = request.query
        if (userId) {
            const list = await favoriteModel.find({ userId: userId });
            response.status(200).json({ status: true, message: "Get favorites by userId completed", favorites: list });
        } else {
            response.status(200).json({ status: false, message: "Missing userId in query params" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Get favorites by userId failed' })
    }
})

/**
 * @swagger
 * /favorite/delete:
 *   delete:
 *     summary: Delete favorite 
 *     tags: [Favorite]
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
 */
favoriteRouter.delete('/delete', async function (request, response) {
    try {
        const { _id } = request.query;
        if (!_id) {
            return response.status(400).json({ status: false, message: 'Missing required field: _id' });
        }

        const result = await favoriteModel.findByIdAndDelete(_id);
        if (!result) {
            return response.status(404).json({ status: false, message: "Item not found" });
        }
        
        response.status(200).json({ status: true, message: "Delete completed" });

    } catch (error) {
        response.status(500).json({ status: false, message: 'Http Exception 500: Internal server error, Delete failed' });
    }
});










module.exports = favoriteRouter