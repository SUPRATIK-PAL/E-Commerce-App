const { generateToken } = require("../config/jwtToken");
const User=require("../models/userModels");
const Product=require("../models/productModel");
const Cart=require("../models/cartModel");
const Coupon=require("../models/couponModel");
const Order=require("../models/orderModel");
const asyncHandler=require('express-async-handler');
const { validateMongoDbId } = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt=require('jsonwebtoken');
const crypto=require('crypto');
const uniqid=require('uniqid');




//register
exports.createUser= asyncHandler(async (req,res)=>{
    const email=req.body.email;
    const findUser=await User.findOne({email:email});
    if(!findUser){
        //create new user
        const newUser=await User.create(req.body);
        res.json(newUser)
    }else{
        throw new Error("User Already Exists");
    }
})
//login
exports.loginuserCtrl=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
    //check user exists or not
    const findUser=await User.findOne({email});
    if(findUser && await findUser.isPasswordMatched(password)){
        const refreshToken=await generateRefreshToken(findUser?.id);
        const updateUser=await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken:refreshToken
            },
            {
                new:true
            }
        )
        res.cookie('refreshToken',refreshToken,{
            httpOnly:true, 
            maxAge:72*60*60*1000
        })
        res.json({
            _id:findUser?.firstname,
            lastname:findUser?.lastname,
            email:findUser?.email,
            mobile:findUser?.mobile,
            token:generateToken(findUser?._id)
        })
    }else{
        throw new Error("Invalid Credentials");
    }
})
//save user address
exports.saveAddress=asyncHandler(async(req,res)=>{
    const{_id}=req.user;
    validateMongoDbId(_id);
    try{
        const updatedUser=await User.findByIdAndUpdate(
            _id,
            {
                address:req?.body?.address
            },
            {new:true}
        )
    }catch(error){

    }
})
//getAllUsers
exports.getAllUser=asyncHandler(async(req,res)=>{
    try{
        const getUsers=await User.find();
        res.json({
            getUsers
        })
    }catch(error){
        throw new Error(error);
    }
})
//getSingleUser
exports.getUser=asyncHandler(async(req,res)=>{
    const{id}=req.params;
    validateMongoDbId(id);
    try{ 
        const user= await User.findById(id)
        // console.log(user);
        res.json(user)
    }catch(error){
        throw new Error(error)
    }
})
//update user
exports.updateUser=asyncHandler(async(req,res)=>{
    const{id}=req.user;
    validateMongoDbId(id);
    try{
        const updatedUser=await User.findByIdAndUpdate(
            id,
            {
                firstname:req?.body?.firstname,
                lastname: req?.body.lastname,
                email:req?.body?.email,
                mobile:req?.body?.email
            },
            {
                new:true
            }
        )
        res.json(updatedUser);
    }catch(error){
        throw new Error(error)

    }
})
//deleteUser
exports.deleteUser=asyncHandler(async(req,res)=>{
    const{id}=req.params;
    validateMongoDbId(id);
    try{
        const user= await User.findByIdAndDelete(id)
        console.log(user);
        res.json(user)
    }catch(error){
        throw new Error(error)
    }
})

//blockUser
exports.blockUser=asyncHandler(async(req,res)=>{
    const{id}=req.params;
    validateMongoDbId(id);
    console.log(93);
    try{
        const block=await User.findByIdAndUpdate(id,
            {
                isBlocked:true
            },
            {
                new:true
            }
        )
        res.json({
            messsage:"User Blocked"
        })
    }catch(error){
        throw new Error(error)
    }
})
//unblockUser
exports.unblockUser=asyncHandler(async(req,res)=>{
    const{id}=req.params;
    validateMongoDbId(id);
    console.log(123)
    try{
        const unblock=await User.findByIdAndUpdate(id,
            {
                isBlocked:false
            },
            {
                new:true
            }
        )
        res.json({
            messsage:"User Unblocked"
        })
    }catch(error){
        throw new Error(error)
    }
})
//handle refresh token
exports.handleRefreshToken=asyncHandler(async(req,res)=>{
    const cookie=req.cookies;
    if(!cookie?.refreshToken)throw new Error("No Refresh Token Present")
    refreshToken=cookie.refreshToken;
    const user=await User.findOne({refreshToken});
    if(!user)throw new Error('User not found or no refresh token present!')
    jwt.verify(refreshToken,process.env.JWT_SECRET,(err,decoded)=>{
        if(err||user.id!=decoded.id){
            throw new Error('There is something wrong with refresh token')
        }
        const accessToken=generateToken(user?._id);
        res.json({accessToken});
    });
    res.json(user)
})
//logout
exports.logout=asyncHandler(async(req,res)=>{
    const cookie=req.cookies;
    if(!cookie?.refreshToken)throw new Error("No Refresh Token Present")
    refreshToken=cookie.refreshToken;
    const user=await User.findOne({refreshToken});
    if(!user){
        res.clearCookie("refreshToken",{
            httpOnly:true,
            secure:true
        });
        return res.sendStatus(204)//forbidden
    }
    await User.findOneAndUpdate({refreshToken},{
        refreshToken:"",
    })
    res.clearCookie("refreshToken",{
        httpOnly:true,
        secure:true
    }); 
    res.sendStatus(204)//forbidden 
})
//updatePassword
exports.updatePassword=asyncHandler(async(req,res)=>{
    console.log(req.user)
    const{_id}=req.user;
    const {password}=req.body;
    validateMongoDbId(_id);
    const user=await User.findById(_id);
    if(password){
        user.password=password; 
        const updatedPassword=await user.save();
        res.status(200).json({
            success:true,
            updatedPassword
        })
    }else{
        res.json(user);
    }
})
//forgotPasssword
exports.forgotPasswordToken=asyncHandler(async(req,res)=>{
    const{email}=req.body;
    const user=await User.findOne({email});
    if(!user){
        throw new Error("User not found with this email")
    }
    try{
        const token=await user.createPasswordResetToken();
        await user.save();
        const resetURL="http://localhost:5000"
        const data={
            to:email,
            text:"hey User",
            subject:"Forgot Password Link",
            html:resetURL
        };
        sendEmail(data);
        res.json(token)
    }catch(error){
        throw new Error(error);
    }
})
//resetPassword
exports.resetPassword=asyncHandler(async(req,res)=>{
    const {password}=req.body;
    const{token}=req.params;
    const hashedToken=crypto.createHash('sha256').update(token).digest("hex");
    const user=await User.findOne({
        passwordResetToken:hashedToken,
        passwordResetExpires:{$gt:Date.now()},

    })
    if(!user){
        throw new Error("Token Expired..Please try again later")
        user.password=password;
        user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;
        await user.save();
        res.json(user)
    }
})
//getWishList
exports.getWishList=asyncHandler(async(req,res)=>{
    const{_id}=req.user;
    try{
        const findUser=await User.findById(_id);
        req.json(findUser)
    }catch(error){
        throw new Error(error)
    }
})
//userCart
exports.userCart=asyncHandler(async(req,res)=>{
    const{cart}=req.body;
    const{_id}=req.user;
    validateMongoDbId(_id);
    try{
        let products=[];
        const user=User.findById(_id);
        //check user already have a product in the cart
        const alreadtExistCart=await Cart.findOne({orderby:user._id});
        if(alreadtExistCart){
            alreadtExistCart.remove();
        }
        for(let i=0;i<cart.length;i++){
            let object={};
            object.product=cart[i].id;
            object.count=cart[i].count;
            object.color=cart[i].color; 
            let getPrice=await Product.findById(cart[i]._id).select("price").exec();
            object.price=getPrice.price;
            products.push(object)
        }
        let cartTotal=0;
        for(let i=0;i<products.length;i++){
            cartTotal+=products[i].price*products[i].count;
        }
        let newCart=await new Cart({
            products,
            cartTotal,
            orderby:user?._id
        }).save();
        res.json(newCart)
    }catch(error){
        throw new Error(error);
    }
})
//getUserCart
exports.getUserCart=asyncHandler(async(req,res)=>{
    const{_id}=req.user;
    validateMongoDbId(_id);
    try{
        const cart=await Cart.findOne({orderby:_id}).populate("products.product")
        res.json(cart);
    }catch(error){
        throw new Error(error);
    }
})
//emptyCart
exports.emptyCart=asyncHandler(async(req,res)=>{
    const{_id}=req.user;
    validateMongoDbId(_id);
    try{
        const user=await User.findOne({_id});
        const cart=await Cart.findOneAndRemove({orderby:user._id});
        res.json(cart);
    }catch(error){
        throw new Error(error);
    }
});
//couponApply
exports.applyCoupon=asyncHandler(async(req,res)=>{
    const{coupon}=req.body;
    const{_id}=req.user;
    validateMongoDbId(_id);
    const validCoupon=await Coupon.findOne({name:coupon});
    if(!validCoupon){
        throw new Error("Invalid Coupon");
    }
    const user=await User.findOne({_id});
    let{products,cartTotal}=await Cart.findOne({
        orderby:user._id,
    }).populate("products.product");
    let totalAfterDiscount=(
        cartTotal-(cartTotal*validCoupon.discount)/100
    ).toFixed(2);
    await Cart.findOneAndUpdate(
        {orderby:user._id},
        {totalAfterDiscount},
        {new:true}
    )
    res.json(totalAfterDiscount);
})
//createOrder
exports.createOrder=asyncHandler(async(req,res)=>{
    const{COD,couponApplied}=req.body;
    const{_id}=req.user;
    validateMongoDbId(_id);
    try{
        if(!COD)throw new Error("Create Cash Order Failed");
        const user=await User.findById(_id);
        let userCart=await Cart.findOne({orderby:user._id})
        let finalAmount=0;
        if(couponApplied && userCart.totalAfterDiscount){
            finalAmount=userCart.totalAfterDiscount*100;
        }else{
            finalAmount=userCart.cartTotal*100;
        }
        let newOrder=await new Order({
            products:userCart.products,
            paymentIntent:{
                id:uniqid(),
                method:"COD",
                amount:finalAmount,
                status:"Cash On Delivery",
                created:Date.now(),
                currency:"usd"
            },
            orderby:user._id,
            orderStatus:"Cash On Delivery",
        }).save();
        const update=userCart.products.map((item)=>{
            return{
                updateOne:{
                    filter:{_id:item.product._id},
                    update:{$inc:{quantity:-item.count,sold:+item.count}}
                }
            }
        })
        const updated=await Product.bulkWrite(update,{});
        res.json({
            success:true
        })
    }catch(error){
        throw new Error(error);
    }
})
//getOrders
exports.getOrders=asyncHandler(async(req,res)=>{
    const{_id}=req.user;
    validateMongoDbId(_id);
    try{
        const userorders=await Order.findOne({orderby:_id}).populate("products.product").exec();
        res.json(userorders);
    }catch(error){
        throw new Error(error);
    }
})
//UpdateOrderSatus
exports.updateOrderSatus=asyncHandler(async(req,res)=>{
    const{status}=req.body;
    const{id}=req.params;
    validateMongoDbId(id);
    try{
        const findOrder=await Order.findByIdAndUpdate(
            id,
            {
                orderStatus:status,
                paymentIntent:{
                    status:status
                }
            },
            {new:true}
        )
        res.json(findOrder)
    }catch(error){
        throw new Error(error);
    }
})


