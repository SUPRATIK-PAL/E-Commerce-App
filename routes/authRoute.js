const express=require('express');
const router=express.Router();
const{
    createUser, 
    loginuserCtrl, 
    getAllUser, 
    getUser, 
    deleteUser, 
    updateUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    getWishList,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderSatus,
}=require("../controllers/userCtrl");
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');


router.post('/register',createUser);
router.post('/forgot-password-token',forgotPasswordToken);
router.post('/reset-password-token',resetPassword)
router.post('/login',loginuserCtrl);
router.post("/cart",userCart);
router.post("/cart/applycoupon",authMiddleware,applyCoupon);
router.post('/cart/cash-order',authMiddleware,createOrder);
router.get('/all-users',getAllUser);
router.get('/get-orders',authMiddleware,getOrders);
router.get("/refresh",handleRefreshToken);
router.get('/logout',logout);
router.get('/:id',authMiddleware,isAdmin,getUser);
router.get('/wishlist',authMiddleware,getWishList);
router.get("/cart",authMiddleware,getUserCart);
router.delete("/empty-cart",authMiddleware,emptyCart);
router.delete('/:id',deleteUser);
router.put("/edit-user",authMiddleware,updateUser);
router.put("/save-address",authMiddleware,saveAddress);
router.put('/block-user/:id',authMiddleware,blockUser);
router.put("/unblock-user/:id",authMiddleware,isAdmin,unblockUser);
router.put("/password",authMiddleware,updatePassword);
router.put("/order/update-order/:id",authMiddleware,isAdmin,updateOrderSatus);  
 




module.exports=router;