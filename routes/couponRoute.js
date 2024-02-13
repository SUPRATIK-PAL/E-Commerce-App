const express=require("express");
const { createCoupon, getAllCoupon, updateCoupon } = require("../controllers/couponCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router=express.Router();

router.post('/',authMiddleware,isAdmin,createCoupon);
router.post('/',authMiddleware,isAdmin,getAllCoupon);
router.put('/:id',authMiddleware,isAdmin,updateCoupon);
router.delete('/',authMiddleware,isAdmin,getAllCoupon); 


module.exports=router;