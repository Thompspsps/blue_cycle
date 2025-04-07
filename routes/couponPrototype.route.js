const express=require("express");
const couponPrototypeRouter=express.Router();

const {
    getCouponPrototypes,
    getCouponProrotypeById,
    postCouponPrototype,
    deleteCouponPrototypeById
}=require("../controllers/couponPrototype.controller");

couponPrototypeRouter.get("/",getCouponPrototypes);
couponPrototypeRouter.get("/:id",getCouponProrotypeById);
couponPrototypeRouter.post("/",postCouponPrototype);
couponPrototypeRouter.delete("/:id",deleteCouponPrototypeById);

module.exports={couponPrototypeRouter};