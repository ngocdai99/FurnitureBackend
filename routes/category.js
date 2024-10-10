var express = require('express');
var categoryRouter = express.Router();
var categoryModel = require("../models/category")
var productModel = require("../models/product")

categoryRouter.get('/list/detail', async function (request, response) {
    try {
        const {categoryName} = request.query
        let category = await categoryModel.findOne({name: categoryName})
        response.status(200).json({ status: true, message: "Mission completed", data: category });
    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' })
    }
})

categoryRouter.get('/list', async function (request, response) {
    try {
        let list = await categoryModel.find()
        response.status(200).json({ status: true, message: "Mission completed", data: list });
    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' })
    }
})
categoryRouter.post("/add", async function (req, res) {
    // xử lý database
    try {
        const { name, image} = req.body;
        const existedCategory = await categoryModel.findOne({name: name})
        if(!existedCategory){
            const addItem = { name, image };
            await categoryModel.create(addItem);
            res.status(200).json({ status: true, message: "Category created completed", addItem });
        } else{
            console.log(existedCategory)
            res.status(200).json({ status: false, message: "Category name is existed"});
        } 
       
    } catch (e) {
        res.status(400).json({ status: false, message: "Mission failed" });
    }
});

categoryRouter.put('/update', async function (request, response) {
    try {
        const { _id, name, image } = request.body;
        console.log("Searching for ID:", _id); // Thêm thông báo kiểm tra ID
        let itemUpdate = await categoryModel.findById(_id) // Sử dụng categoryModel

        if (itemUpdate != null) {
            itemUpdate.name = name ? name : itemUpdate.name
            itemUpdate.image = image ? image : itemUpdate.image

            await itemUpdate.save()
            response.status(200).json({ status: true, message: 'Mission completed' })
        } else {
            response.status(404).json({ status: false, message: "Not found Id" });
        }
    } catch (error) {
        console.error(error); // Ghi lại lỗi
        response.status(400).json({ status: false, message: 'Mission failed', error: error.message })
    }
})

categoryRouter.delete('/delete', async function (request, response) {
    try {
        const { _id} = request.body;
        const deletable = await productModel.findOne({categoryId: _id})
        if(!deletable){
            await categoryModel.findByIdAndDelete(_id)
            response.status(200).json({ status: true, message: 'Mission completed' })
        }else{
            response.status(200).json({ status: false, message: 'Mission failed, this category has some product. Cannot be deleted' }) 
        }
      

    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed' })
    }
})

module.exports = categoryRouter