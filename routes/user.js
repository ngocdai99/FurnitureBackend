const express = require('express');
const userRouter = express.Router();
const userModel = require("../models/user")
const mongoose = require('mongoose');
const upload = require("../utils/multerconfig")
const sendMail = require("../utils/mailconfig")

const JWT = require('jsonwebtoken');
const config = require("../utils/configEnv");

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
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Register failed', error: error.message })
    }
})


userRouter.post('/login', async function (request, response) {
    try {
        const { email, password } = request.body
        userExisted = await userModel.findOne({ email: email, password: password })
        if (userExisted) {

            const token = JWT.sign({ id: email }, config.SECRETKEY, { expiresIn: '1h' });
            const refreshToken = JWT.sign({ id: email }, config.SECRETKEY, { expiresIn: '1h' })


            response.status(200).json({ status: true, message: "Login successfully", token, refreshToken });
        } else {
            response.status(200).json({ status: true, message: "Email doesn't existed or wrong password" });
        }

    } catch (error) {
        response.status(400).json({ status: false, message: 'Http Exception 400: Bad request, Login failed' })
    }
})


userRouter.get('/user-detail/:_id', async function (request, response) {
    try {
        const token = request.header("Authorization").split(' ')[1]
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (error) {
                if (error) {
                    response.status(403).json({ status: false, message: "HTTP 403 Forbidden, Máy chủ đã hiểu yêu cầu, nhưng sẽ không đáp ứng yêu cầu đó" });
                } else {
                    const { _id } = request.params
                    if (!mongoose.Types.ObjectId.isValid(_id)) {
                        return response.status(400).json({ status: false, message: "Invalid User ID format" });
                    }
                    userExisted = await userModel.findById(_id)
                    if (userExisted) {
                        response.status(200).json({ status: true, message: "Get detail successfully", detail: userExisted });
                    } else {
                        response.status(200).json({ status: true, message: "UserId doesn't existed" });
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

userRouter.post('/update-profile', async function (request, response) {
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
                    response.json({ status: true, message: "Gửi mail thành công" });
                }
            })
        } else {
            response.status(401).json({ status: false, message: "401, Unauthorized" });
        }

    } catch (error) {
        return response.json({ status: false,message: "Gửi mail thất bại" , message: error.message });
    }
   
});
module.exports = userRouter