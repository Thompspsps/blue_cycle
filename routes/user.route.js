const express=require("express");
const userRouter=express.Router();

const {
    getUsers,
    postUser,
    getUserById,
    patchUserById,
    getUserByIdCoupons,
    //getUserByIdCouponById, --> forse da aggiungere
    postUserByIdCoupon,
    getUserByIdWishlistedCoupons,
    postUserByIdWishlistedCoupon,
    getUserByIdWishlistedCouponById,
    deleteUserByIdWishlistedCouponById,
    getUserByIdTransactions,
    getUserByIdTransactionsCollected
}=require("../controllers/user.controller");

userRouter.get("/",getUsers);
userRouter.post("/",postUser);
userRouter.get("/:id",getUserById);
userRouter.patch("/:id",patchUserById);
userRouter.get("/:id/coupons",getUserByIdCoupons);
// forse aggiungere un router per getuserByIdCouponById
//userRouter.get("/:id/coupons/:itemId",getUserByIdCouponById)
userRouter.post("/:id/coupons",postUserByIdCoupon);
userRouter.get("/:id/wishlistedCoupons",getUserByIdWishlistedCoupons);
userRouter.post("/:id/wishlistedCoupons",postUserByIdWishlistedCoupon);
userRouter.get("/:userId/wishlistedCoupons/:itemId",getUserByIdWishlistedCouponById);
userRouter.delete("/:userId/wishlistedCoupons/:itemId",deleteUserByIdWishlistedCouponById);
userRouter.get("/:id/transactions",getUserByIdTransactions);
userRouter.get("/:id/transactions/collected",getUserByIdTransactionsCollected);

module.exports={userRouter};