const {Admin}=require("./admin.model");
const {User}=require("./user.model");
const {Coupon}=require("./coupon.model");
const {Machine}=require("./machine.model");
const {Transaction}=require("./transaction.model");
const {CouponPrototype}=require("./couponPrototype.model");
const {WishlistedCoupon}=require("./wishlistedCoupon.model");

module.exports={Admin,User,Coupon,Machine,Transaction,CouponPrototype,WishlistedCoupon};