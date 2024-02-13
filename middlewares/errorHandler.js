//not found
exports.notFound=(req,res,next)=>{
    const error=new Error(`Not Found:${req.OriginalUrl}`);
    res.status(404); 
    next(error);
}


//error handler
exports.errorHandler=(err,req,res,next)=>{
    // const statuscode =res.statusCode==200?500:res.statusCode;
    const statuscode=res.statusCode||500;
    res.status(statuscode);
    res.json({
        message:err?.message,
        stack:err
    })
}
