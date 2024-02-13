const Coupon=require("../models/couponModel");
const asyncHandler=require('express-async-handler');
const { validateMongoDbId } = require("../utils/validateMongodbid");


exports.createCoupon=asyncHandler(async(req,res)=>{
    try{
        const newCoupon=await Coupon.create(req.body);
        res.json(newCoupon);
    }catch(error){
        throw new Error(error);
    }
})

exports.getAllCoupon=asyncHandler(async(req,res)=>{
    try{
        const AllCoupons=await Coupon.find();
        res.json(AllCoupons);
    }catch(error){
        throw new Error(error);
    }
})

exports.updateCoupon=asyncHandler(async(req,res)=>{
    const{id}=req.params;
    validateMongoDbId(id);
    try{
        const updatedCoupons=await Coupon.findByIdAndUpdate(id,req.body,{new:true})
        res.json(updatedCoupons);
    }catch(error){
        throw new Error(error);
    }
})

exports.deleteCoupon=asyncHandler(async(req,res)=>{
    const{id}=req.params;
    validateMongoDbId(id);
    try{
        const deletedCoupon=await Coupon.findByIdAndDelete(id)
        res.json(deletedCoupon);
    }catch(error){
        throw new Error(error);
    }
})