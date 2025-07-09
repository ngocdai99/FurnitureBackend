var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
var logger = require('morgan');
const cors = require('cors');
const axios = require('axios');


// config mongoose
const mongoose = require('mongoose')
require("./models/category")
require("./models/product")
require("./models/user")
require("./models/color")
require("./models/order")





// connect database
// https://restapirepo.onrender.com/

// mongoose.connect("mongodb://localhost:27017/Furniture")
mongoose.connect("mongodb+srv://ngocdaibui99:9luzjjPyAZTUtKXF@daingoc99.ulnqr.mongodb.net/Furniture")
  .then(() => console.log(">>>>>>>>>> DB Connected!!!!!!"))
  .catch((err) => console.log(">>>>>>>>> DB Error: ", err));



const userRouter = require('./routes/user');
const productRouter = require('./routes/product');
const categoryRouter = require('./routes/category');
const colorRouter = require('./routes/color');
const optionRouter = require('./routes/option');
const favoriteRouter = require('./routes/favorite');
const orderRouter = require('./routes/order');



var app = express();

// swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./utils/configSwagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use('/user', userRouter)
app.use('/category', categoryRouter)
app.use('/product', productRouter)
app.use('/color', colorRouter)
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

function keepServerAlive() {
  const url = 'https://restapirepo.onrender.com/api-docs/'; // URL chính của bạn sau khi deploy

  setInterval(async () => {
    try {
      const res = await axios.get(url);
      console.log('⏰ Keep alive ping at', new Date().toISOString());
    } catch (err) {
      console.error('❌ Keep alive failed:', err.message);
    }
  }, 600000); // 600_000 ms = 10 phút
}

keepServerAlive();

module.exports = app
