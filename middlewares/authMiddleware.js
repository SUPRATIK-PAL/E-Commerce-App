const User=require("../models/userModels");
const jwt=require("jsonwebtoken");
const asyncHandler=require("express-async-handler");



exports.authMiddleware=asyncHandler(async(req,res,next)=>{
    let token;
    if(req?.headers?.authorization?.startsWith("Bearer")){
        token=req.headers.authorization.split(" ")[1];
        try{
            if(token){
                const decode=jwt.verify(token,process.env.JWT_SECRET)
                // console.log(decode);
                const user=await User.findById(decode?.id);
                req.user=user;//***** */
                // console.log(user); 
                next();
                console.log(decode)
            }
        }catch(error){
            throw new Error('Not Authorized! token expired. Please Login again')
        }
    }else{
        throw new Error("There is no token present");
    }
})

exports.isAdmin=asyncHandler(async(req,res,next)=>{ 
    // console.log("Admin n------------->>");
    const {email}=req.user;
    const adminUser=await User.findOne({email});
    // console.log(adminUser)
    if(adminUser.role!=="Admin"){
        throw new Error("You are not admin");
    }else{
        next();
    }
}) 