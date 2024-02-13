const express=require('express');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlogs, likeBlog, dislikeBlog } = require('../controllers/blogCtrl');
const { blogImgResize, uploadPhoto } = require('../middlewares/uploadImages');
const { uploadImages } = require('../controllers/productCtrl');
const router=express.Router();





router.post('/',authMiddleware,isAdmin,createBlog);
router.put("/:id",authMiddleware,isAdmin,updateBlog);

router.put('/upload/:id',
    authMiddleware,
    isAdmin,
    uploadPhoto.array("images",2),
    blogImgResize,
    uploadImages
);

router.get("/:id",getBlog);
router.get("/",getAllBlogs);
router.delete("/:id",authMiddleware,isAdmin,deleteBlogs);
router.put("/likes",authMiddleware,likeBlog);
router.put("/likes",authMiddleware,dislikeBlog);




 


   

module.exports=router