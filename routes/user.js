var express = require('express');
var userRouter = express.Router();
var userModel = require("../models/user")
const mongoose = require('mongoose');
const upload = require("../utils/multerconfig")
const sendMail = require("../utils/mailconfig")
const fs = require('fs').promises


userRouter.post('/register', async function (request, response) {
    try {
        const { name, email, password } = request.body


        const userExisted = await userModel.findOne({ email: email })
        if (!userExisted) {
            const newUser = { name, image: '', email, password, age: '', address: '', };
            console.log('newUser', newUser)
            await userModel.create(newUser);
            response.status(200).json({ status: true, message: "Register completed", detail: newUser });
        } else {
            response.status(200).json({ status: false, message: "Email existed", newUser });
        }


    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Register failed' })
    }
})


userRouter.post('/login', async function (request, response) {
    try {
        const { email, password } = request.body
        userExisted = await userModel.findOne({ email: email, password: password })
        if (userExisted) {
            response.status(200).json({ status: true, message: "Login successfully" });
        } else {
            response.status(200).json({ status: true, message: "Email doesn't existed or wrong password" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Login failed' })
    }
})


userRouter.get('/user-detail/:_id', async function (request, response) {
    try {
        const { _id } = request.params
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return response.status(400).json({ status: false, message: "Invalid User ID format" });
        }
        userExisted = await userModel.findById( _id )
        if (userExisted) {
            response.status(200).json({ status: true, message: "Get detail successfully", detail: userExisted });
        } else {
            response.status(200).json({ status: true, message: "UserId doesn't existed" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Get detail failed' })
    }
})

userRouter.post('/update-profile', async function (request, response) {
    try {
        const {_id, name, image, password, age, address } = request.body
        const updateData = {};
        if (name) updateData.name = name;
        if (image) updateData.image = image;
        if (password) updateData.password = password;
        if (age) updateData.age = age;
        if (address) updateData.address = address;
        const item = await userModel.findByIdAndUpdate(_id, updateData, { new: true })
        if (item != null) {
            response.status(200).json({ status: true, message: "Updated completed", item });
        } else {
            response.status(200).json({ status: false, message: "Not found userId" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Update failed' })
    }
})


// upload file
userRouter.post('/upload', [upload.single('image')],
    async (req, res, next) => {
        try {
            const { file } = req;
            if (!file) {
                return res.json({ status: 0, link: "" });
            } else {
                const url = `http://localhost:3000/images/${file.filename}`;
                return res.json({ status: 1, url: url });
            }
        } catch (error) {
            console.log('Upload image error: ', error);
            return res.json({ status: 0, link: "" });
        }
    });



//Upload multiple file

userRouter.post('/uploads', [upload.array('image', 9)],
    async (req, res, next) => {
        try {
            const { files } = req;
            if (!files) {
                return res.json({ status: 0, link: [] });
            } else {
                const url = [];
                for (const singleFile of files) {
                    url.push(`http://localhost:3000/images/${singleFile.filename}`);
                }
                return res.json({ status: 1, url: url });
            }
        } catch (error) {
            console.log('Upload image error: ', error);
            return res.json({ status: 0, link: [] });
        }
    });


userRouter.post("/send-mail", async function (req, res, next) {
    try {
        const { to, subject, nameHello } = req.body;
        const content = await fs.readFile('mail.html', 'utf-8')
        let newContent = content.replace('nameHello', nameHello)
        console.log(newContent)

        const mailOptions = {
            from: "Botfarhome <ngocdaibui99@gmail.com>",
            to: to,
            subject: subject,
            html: newContent
        };
        await sendMail.transporter.sendMail(mailOptions);
        res.json({ status: 1, message: "Gửi mail thành công" });
    } catch (err) {
        console.error("Error sending mail:", err);
        res.json({ status: 0, message: "Gửi mail thất bại" });
    }
});
module.exports = userRouter