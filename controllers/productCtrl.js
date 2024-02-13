const Product=require("../models/productModel");
const asyncHandler=require("express-async-handler");
const slugify=require('slugify');
const User=require("../models/userModels");
const { validateMongoDbId } = require("../utils/validateMongodbid");
const cloudinaryUploading=require("../utils/cloudinary");
const fs=require('fs')

//create product
exports.createProduct=asyncHandler(async(req,res)=>{
    try{
        if(req.body.title){
            req.body.slug=slugify(req.body.title);
        }
        const newProduct=await Product.create(req.body);
        res.json(newProduct)
    }catch(error){
        throw new Error(error);
    }
})

//find product
exports.getProduct=asyncHandler(async(req,res)=>{
    const{id}=req.params;
    try{
        const findProduct=await Product.findById(id);
        return res.status(200).json({
            success:true,
            findProduct
        })
    }catch(error){
        throw new Error(error)
    }
})
//getAllProduct
exports.getAllproduct=asyncHandler(async(req,res)=>{
    try{
        //filtering
        const queryObj={...req.query};
        const excludeFields=["page","sort","limit","fields"];
        excludeFields.forEach((el)=>delete queryObj[el]);
        console.log(queryObj);
        let queryStr=JSON.stringify(queryObj);
        queryStr=queryStr.replace(/\b(gte|ge|lte|le)\b/g,(match)=>`$${match}`)
        let query=Product.find(JSON.parse(queryStr));


        //sorting
        if(req.query.sort){
            const sortBy=req.query.sort.split(",").join(" ");
            query=query.sort(sortBy); 
        }else{
            query=query.sort("-createdAt");
        }

        //limiting the fields
        if(req.query.fields){
            const fields=req.query.fields.split(",").join(" ");
            query=query.select(fields);
        }else{
            query=query.select('-__v');
        }
        //pagination
        const page=req.query.page;
        const limit=req.query.limit;
        const skip=(page-1)*limit;
        query=query.skip(skip).limit(limit);
        if(req.query.page){
            const productCount=await Product.countDocuments();
            if(skip>=productCount){
                throw new Error("This page does not exists");
            }
        }
        const getAllProducts=await query
        res.status(200).json({
            success:true,
            getAllProducts
        })
    }catch(error){
        throw new Error(error)
    }
})
//productUpdate
exports.updateProduct=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    // console.log(id)
    try{
        if(req.body.title){
            req.body.slug=slugify(req.body.title);
        }
        const updatedProduct=await Product.findOneAndUpdate(
            {_id:id},
            req.body,
            {new: true,}
        )
        // console.log(updatedProduct)
        res.status(200).json({
            success:true,
            updatedProduct
        })
    }catch(error){
        throw new Error(error)
    } 
})
//delete product
exports.deleteProduct=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    // console.log(id)
    try{
        const deletedProduct=await Product.findOneAndDelete(
            {_id:id},
        )
        // console.log(updatedProduct)
        res.status(200).json({
            success:true,
            deletedProduct
        })
    }catch(error){
        throw new Error(error)
    } 
})



exports.addToWishList=asyncHandler(async(req,res)=>{
    const {_id}=req.user;
    const {prodId}=req.body;
    try{
        const user=await User.findById(_id);
        const alreadyAdded=user.wishlist.find((id)=>id.toString()===prodId);
        if(alreadyAdded){
            let user=await User.findByIdAndUpdate(
                id,
                {
                    $pull:{wishlist:prodId}
                },
                {new:true}
            )
        }else{
            let user=await User.findByIdAndUpdate(
                id,
                {
                    $push:{wishlist:prodId}
                },
                {new:true}
            )
        }
    }catch(error){
        throw new  Error(error)
    }
})

exports.rating=asyncHandler(async(req,res)=>{
    const{_id}=req.user;
    const{star,prodId,comment}=req.body;
    try{
        const product=await Product.findById(prodId);
        let alreadyRated=product.ratings.find(
            (userId)=>userId.postedby.toString()===_id.toString()
        )
        if(alreadyRated){
            const updateRating=await Product.findOne(
                {
                    ratings:{$elemMatch:alreadyRated}
                },
                {
                    $set:{"ratings.$.star":star,"ratings.$.comment":comment}
                },
                {new:true}
            )
            
        }else{
            const rateProduct=await Product.findByIdAndUpdate(prodId,{
                $push:{
                    ratings:{
                        star:star,
                        comment:comment,
                        postedby:_id,
                    }
                }
            },{new:true})
            
        }
        const getAllRatings=await Product.findById(prodId);
        let totalrating=getAllRatings.ratings.length;
        let ratingsum=getAllRatings.ratings.map((item)=>item.star).reduce((prev,curr)=>prev+curr,0);
        let actualRating=Math.round(ratingsum/totalrating);
        let finalProduct=await Product.findByIdAndUpdate(
            prodId,
            {
                totalrating:actualRating,
            },
            {
                new:true
            }
        )
        res.json(finalProduct)
    }catch(error){
        throw new Error(error);
    }
})



exports.uploadImages=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    validateMongoDbId(id);
    try{
        const uploader=(path)=>cloudinaryUploading(path,"images");
        const urls=[];
        const files=req.files;
        for(const file of files){
            const{path}=file;
            const newPath=await uploader(path);
            urls.push(newPath);
            fs.unlinkSync(path);
        }
        const findProduct=await Product.findByIdAndUpdate(
            id,
            {
                images:urls.map((file)=>{
                    return file;
                })
            },
            {new:true}
        );
        res.json(findProduct)
    }catch(error){
        throw new Error(error);
    }
})