const express=require('express');
const { connect } = require('./config/dbConnect');
const app=express();
const dotenv=require('dotenv').config();
const authRouter=require('./routes/authRoute');
const productRouter=require('./routes/productRoute');
const categoryRouter=require('./routes/categoryRoute');
const blogRouter=require('./routes/blogRoute');
const couponRouter=require('./routes/couponRoute');
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const PORT=process.env.PORT||4000;
const cookieParser=require('cookie-parser');
const morgan=require('morgan');




connect();  


app.use(morgan('dev'));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use("/api/user",authRouter);
app.use("/api/product",productRouter);
app.use("/api/blog",blogRouter);
app.use("/api/category",categoryRouter);
app.use("/api/coupon",couponRouter);
app.use(notFound);
app.use(errorHandler);
app.listen(PORT,()=>{
    console.log(`Server is running at PORT ${PORT}`);
})
