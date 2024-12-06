const express=require("express");
const couponPrototypeRouter=express.Router();

const {
    getCouponPrototypes,
    postCouponPrototype,
    deleteCouponPrototypeById
}=require("../controllers/couponPrototype.controller");

couponPrototypeRouter.get("/",getCouponPrototypes);
couponPrototypeRouter.post("/",postCouponPrototype);
couponPrototypeRouter.delete("/:id",deleteCouponPrototypeById);

module.exports={couponPrototypeRouter};