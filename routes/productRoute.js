const express=require('express');
const { createProduct, getProduct, getAllproduct, updateProduct, deleteProduct, addToWishList, uploadImages } = require('../controllers/productCtrl');
const router=express.Router();
const {isAdmin,authMiddleware}=require('../middlewares/authMiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages');

router.post('/',authMiddleware,isAdmin,createProduct);
router.put('/upload/:id',
    authMiddleware,
    isAdmin,
    uploadPhoto.array("images",10),
    productImgResize,
    uploadImages
);
router.get('/:id',authMiddleware,isAdmin,getProduct);
router.put('/:id',authMiddleware,isAdmin,updateProduct);
router.delete('/:id',authMiddleware,isAdmin,deleteProduct);
router.get('/',getAllproduct);
router.post('/wishlist',authMiddleware,addToWishList);









module.exports=router
