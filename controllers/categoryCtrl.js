const Category=require("../models/categoryModel");
const asyncHandler=require("express-async-handler");
const {validateMongoDbId}=require("../utils/validateMongodbid");




exports.createCategory=asyncHandler(async(req,rres)=>{
    try{
        const newCategory=await Category.create(req.body);
        req.json(newCategory)
    }catch(error){
        throw new Error(error);
    }
})



exports.updateCategory=asyncHandler(async(req,rres)=>{
    const {id}=req.params;
    validateMongoDbId(id);
    try{
        const updatedCategory=await Category.findByIdAndUpdate(id,req.body,{new:true});
        req.json(updatedCategory)
    }catch(error){
        throw new Error(error);
    }
})


exports.deleteCategory=asyncHandler(async(req,rres)=>{
    const {id}=req.params;
    validateMongoDbId(id);
    try{
        const deletedCategory=await Category.findByIdAndDelete(id);
        req.json(deletedCategory)
    }catch(error){
        throw new Error(error);
    }
})


exports.getCategory=asyncHandler(async(req,rres)=>{
    const {id}=req.params;
    validateMongoDbId(id);
    try{
        const getCategory=await Category.findById(id);
        req.json(getCategory)
    }catch(error){
        throw new Error(error);
    }
})

exports.getAllCategory=asyncHandler(async(req,rres)=>{
    const {id}=req.params;
    validateMongoDbId(id);
    try{
        const getAllCategory=await Category.find();
        req.json(getAllCategory)
    }catch(error){
        throw new Error(error);
    }
})

