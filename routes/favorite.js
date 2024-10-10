var express = require('express');
var favoriteRouter = express.Router();
var favoriteModel = require("../models/favorite")



favoriteRouter.post('/add', async function (request, response) {
    try {
        const { userId, productId } = request.body
        const newFavorite = { userId, productId };
        console.log('newFavorite', newFavorite)
        await favoriteModel.create(newFavorite);
        response.status(200).json({ status: true, message: "Create new favorite completed", favorite: newFavorite });

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Create favorite failed' })
    }
})

// lấy toàn bộ favorite của một user thông qua userId
favoriteRouter.get('/list-favorites-by-userid', async function (request, response) {
    try {
        const { userId } = request.query
        const list = await favoriteModel.find({ userId: userId });
        response.status(200).json({ status: true, message: "Get favorites by userId completed", favorites: list });

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Get favorites by userId failed' })
    }
})










module.exports = favoriteRouter