const express=require("express");
const couponPrototypeRouter=express.Router();

const {
    getCouponPrototypes,
    getCouponPrototypeById,
    postCouponPrototype,
    deleteCouponPrototypeById
}=require("../controllers/couponPrototype.controller");

couponPrototypeRouter.get("/",getCouponPrototypes);
couponPrototypeRouter.get("/:id",getCouponPrototypeById);
couponPrototypeRouter.post("/",postCouponPrototype);
couponPrototypeRouter.delete("/:id",deleteCouponPrototypeById);

module.exports={couponPrototypeRouter};