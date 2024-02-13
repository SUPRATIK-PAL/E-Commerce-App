const Blog=require("../models/blogModel");
const User=require("../models/userModels");
const asyncHandler=require("express-async-handler");
const {validateMongoDbId}=require("../utils/validateMongodbid");
const cloudinaryUploading=require("../utils/cloudinary"); 
const fs=require('fs');



exports.createBlog=asyncHandler(async(req,res)=>{
    try{
        const newBlog=await Blog.create(req.body);
        res.json({
            success:true,
            newBlog
        })
    }catch(error){
        throw new Error(error);
    }
})


exports.updateBlog=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    // validateMongoDbId(id);
    try{
        const updateBlog=await Blog.findByIdAndUpdate(id,
            req.body,
            {new:true}
            )
            res.json(updateBlog);
    }catch(error){  
        throw new Error(error);
    }
})

exports.getBlog=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    // validateMongoDbId(id);
    try{
        const getBlog=await Blog.findById(id);
        const updateViews=await Blog.findByIdAndUpdate(
            id,
            {
                $inc:{numViews:1}
            },
            {new:true}
        )
        res.json(updateViews);
    }catch(error){  
        throw new Error(error);
    }
})


exports.getAllBlogs=asyncHandler(async(req,res)=>{
    try{
        const getBlogs=await Blog.find();
        res.json(getBlogs);
    }catch(error){  
        throw new Error(error);
    }
})


exports.deleteBlogs=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    // validateMongoDbId(id);
    try{
        const deletedBlog=await Blog.findByIdAndDelete(id);
        res.json(deletedBlog)
    }catch(error){  
        throw new Error(error);
    }
})

exports.likeBlog=asyncHandler(async(req,res)=>{
    const{blogId}=req.body;
    // validateMongoDbId(blogId);
    // console.log(blogId);
    //find the blog you want to be liked
    const blog=await Blog.findById(blogId);
    //find login user
    const loginUserId=req?.user?._id;
    //find if user liked the blog
    const isLiked=blog?.isLiked;
    //find the user if he disliked the blog
    const alreadyDisliked=blog?.disLikes?.find(
        ((userId)=>userId?.toString()===loginUserId?.toString())
    );

    if(alreadyDisliked){
        const blog=await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull:{disLikes:loginUserId},
                isDisliked:false,
            },
            {new:true}
        )
        res.json(blog)
    }
    if(!isLiked){
        const blog=await Blog.findByIdAndUpdate(
            blogId,
            {
                $push:{likes,loginUserId},
                isLiked:true
            },
            {new:true}
        )
        res.json(blog)
    }else{
        const blog=await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull:{likes,loginUserId},
                isLiked:false
            },
            {new:true}
        )
        res.json(blog)   
    }

})


exports.dislikeBlog=asyncHandler(async(req,res)=>{
    const{blogId}=req.body;
    // validateMongoDbId(blogId);
    // console.log(blogId);
    //find the blog you want to be liked
    const blog=await Blog.findById(blogId);
    //find login user
    const loginUserId=req?.user?._id;
    //find if user liked the blog
    const isDisliked=blog?.isDisliked;
    //find the user if he disliked the blog
    const alreadyLiked=blog?.likes?.find(
        ((userId)=>userId?.toString()===loginUserId?.toString())
    );

    if(alreadyLiked){
        const blog=await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull:{likes:loginUserId},
                likes:false,
            },
            {new:true}
        )
        res.json(blog)
    }
    if(!isDisliked){
        const blog=await Blog.findByIdAndUpdate(
            blogId,
            {
                $push:{disLikes,loginUserId},
                disLikes:true
            },
            {new:true}
        )
        res.json(blog)
    }else{
        const blog=await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull:{disLikes,loginUserId},
                disLikes:false
            },
            {new:true}
        )
        res.json(blog)   
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
        const findBlog=await Product.findByIdAndUpdate(
            id,
            {
                images:urls.map((file)=>{
                    return file;
                })
            },
            {new:true}
        );
        res.json(findBlog)
    }catch(error){
        throw new Error(error);
    }
})








