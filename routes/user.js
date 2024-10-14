const express = require('express');
const userRouter = express.Router();
const userModel = require("../models/user")
const mongoose = require('mongoose');
const upload = require("../utils/multerconfig")
const sendMail = require("../utils/mailconfig")
const JWT = require('jsonwebtoken');
const config = require("../utils/configEnv");
const fs = require('fs').promises

/**
 * @swagger
 * /user/register:
 *   post: 
 *     summary: Register new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: new user's fullname
 *                 example: M
 *               email:
 *                 type: string
 *                 description: new email
 *                 example: M
 *               password:
 *                 type: string
 *                 description: new password
 *                 example: M
 *     responses:
 *       200:
 *         description: Register successfully
 *       400: 
 *         description: Http Exception 400, Bad request, Create favorite failed
 *       409: 
 *         description: Http Exception 409, This product is existed in this user's favorites
 */
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
            response.status(409).json({ status: false, message: "Email existed" });
        }


    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Register failed', error: error.message })
    }
})



/**
 * @swagger
 * /user/login:
 *   post: 
 *     summary: Login 
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: email
 *                 example: M
 *               password:
 *                 type: string
 *                 description: password
 *                 example: M
 *     responses:
 *       200:
 *         description: Register successfully
 *       400: 
 *         description: Http Exception 400, Bad request, Create favorite failed
 *       401: 
 *         description: Http Exception 409, Email doesn't existed or wrong password
 */
userRouter.post('/login', async function (request, response) {
    try {
        const { email, password } = request.body
        userExisted = await userModel.findOne({ email: email, password: password })
        if (userExisted) {

            const token = JWT.sign({ id: email }, config.SECRETKEY, { expiresIn: '1h' });
            const refreshToken = JWT.sign({ id: email }, config.SECRETKEY, { expiresIn: '1h' })


            response.status(200).json({ status: true, message: "Login successfully", token, refreshToken });
        } else {
            response.status(401).json({ status: true, message: "Email doesn't existed or wrong password" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Login failed' })
    }
})



/**
 * @swagger
 * /user/user-detail/{_id}:
 *   get: 
 *     summary: Get all favorites of an user with userId
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: Id of the user you want to get detail
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: Get detail successfully
 *       400: 
 *         description: Dữ liệu yêu cầu không hợp lệ, Get detail failed
 *       401: 
 *         description: 401, Unauthorized
 *       403: 
 *         description: HTTP 403 Forbidden, verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 *       404:
 *         description: Not found user Id
 *       409:
 *         description: 409, UserId doesn't existed
 */
userRouter.get('/user-detail/:_id', async function (request, response) {
    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { _id } = request.params
                    userExisted = await userModel.findById(_id)
                    if (userExisted) {
                        response.status(200).json({ status: true, message: "Get detail successfully", detail: userExisted });
                    } else {
                        response.status(409).json({ status: true, message: "UserId doesn't existed" });
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
 * /user/update-profile:
 *   put:
 *     summary: Update user's profile
 *     tags: [User]
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
 *                 description: userId you need to update
 *                 example: 670a3d3a0a60865036210f84
 *               name:
 *                 type: string
 *                 description: New fullname
 *                 example: abc
 *               image:
 *                 type: string
 *                 description: New image
 *                 example: user_image
 *               password:
 *                 type: string
 *                 description: New password
 *                 example: abc
 *               age:
 *                 type: number
 *                 description: New age
 *                 example: 18
 *               address:
 *                 type: string
 *                 description: New address
 *                 example: "HCM city"
 *     responses:
 *       200:
 *         description: Update sizeName successfully
 *       400: 
 *         description: Dữ liệu yêu cầu không hợp lệ, Update failed
 *       401: 
 *         description: 401, Unauthorized
 *       403: 
 *         description: HTTP 403 Forbidden, verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 *       404:
 *         description: Not found size Id
 *       409:
 *         description: 409, Size name you want to update is existed
 */
userRouter.put('/update-profile', async function (request, response) {
    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { _id, name, image, password, age, address } = request.body
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
                }
            })
        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Mission failed', error: error.message })
    }
})


// upload file
userRouter.post('/upload', [upload.single('image')], async function (request, response) {

    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { file } = request;
                    if (!file) {
                        return response.json({ status: 0, link: "" });
                    } else {
                        const url = `http://localhost:3000/images/${file.filename}`;
                        return response.json({ status: 1, url: url });
                    }
                }
            })
        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        return response.json({ status: false, link: "", message: error.message });
    }

});



//Upload multiple file

userRouter.post('/uploads', [upload.array('image', 9)], async function (request, response) {

    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { files } = request;
                    if (!files) {
                        return response.json({ status: 0, link: [] });
                    } else {
                        const url = [];
                        for (const singleFile of files) {
                            url.push(`http://localhost:3000/images/${singleFile.filename}`);
                        }
                        return response.json({ status: 1, url: url });
                    }
                }
            })
        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        return response.json({ status: false, link: [], message: error.message });
    }
});

/**
 * @swagger
 * /user/send-mail:
 *   post: 
 *     summary: Send email 
 *     security: 
 *       - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 description: the email of the receiver
 *                 example: M
 *               subject:
 *                 type: string
 *                 description: the subject of the email
 *                 example: M
 *               nameHello:
 *                 type: string
 *                 description: the name you want to say Hi
 *                 example: M
 *     responses:
 *       200:
 *         description: Send email successfully
 *       400: 
 *         description: Http Exception 400, Bad request, Send email failed
 *       401: 
 *         description: 401, Unauthorized
 *       403: 
 *         description: HTTP 403 Forbidden, verify JWT failed, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó
 */
userRouter.post("/send-mail", async function (request, response) {

    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { to, subject, nameHello } = request.body;
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
                    response.status(200).json({ status: true, message: "Send email successfully" });
                }
            })
        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        return response.status(400).json({ status: false, message: "400, Send email failed", message: error.message });
    }

});
module.exports = userRouter