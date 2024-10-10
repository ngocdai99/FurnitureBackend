var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// config mongoose
const mongoose = require('mongoose')
require("./models/category")
require("./models/product")
require("./models/user")
require("./models/size")
require("./models/order")



// connect database
// mongoose.connect("mongodb://localhost:27017/RestApi")
mongoose.connect("mongodb+srv://ngocdaibui99:9luzjjPyAZTUtKXF@daingoc99.ulnqr.mongodb.net/RestApi")
  .then(() => console.log(">>>>>>>>>> DB Connected!!!!!!"))
  .catch((err) => console.log(">>>>>>>>> DB Error: ", err));



const userRouter = require('./routes/user');
const productRouter = require('./routes/product');
const categoryRouter = require('./routes/category');
const sizeRouter = require('./routes/size');
const optionRouter = require('./routes/option');
const favoriteRouter = require('./routes/favorite');
const orderRouter = require('./routes/order');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/user', userRouter)
app.use('/category', categoryRouter)
app.use('/product', productRouter)
app.use('/size', sizeRouter)
app.use('/option', optionRouter)
app.use('/favorite', favoriteRouter)
app.use('/order', orderRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app
