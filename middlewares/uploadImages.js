const multer=require('multer');
const sharp=require('sharp');
const path=require('sharp');
const fs=require('fs');


const multerStorage=multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,path.join(__dirname,"../public/images"));
    },
    filename:function(req,res,cb){
        const uniqueSuffix=Date.now()+ "-" +Math.round(Math.random()*1e9);
        cb(null,file.fieldname + "-" + uniqueSuffix + ".jpeg");
    }
})

const multerFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('Image')){
        cb(null,true);
    }else{
        cb({
            message:"Unsupported file format"
        },false)
    }
}

exports.uploadPhoto=multer({
    storage:multerStorage,
    fileFilter:multerFilter,
    limits:{fieldSize:2000000}
})


exports.productImgResize=async(req,res,next)=>{
    if(!req.files){
        return next();
    }
    await promises.all(req.files.map(async(file)=>{
        await sharp(file.path)
        .resize(300,300)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/images/products/${file.filename}`);
        fs.unlinkSync(`public/images/products/${file.filename}`)
    }))
    next();
}


exports.blogImgResize=async(req,res,next)=>{
    if(!req.files){
        return next();
    }
    await promises.all(req.files.map(async(file)=>{
        await sharp(file.path)
        .resize(300,300)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/images/products/${file.filename}`);
    }))
    next();
}
















