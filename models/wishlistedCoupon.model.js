const {Schema,model}=require("mongoose");

const wishlistedCouponSchema=Schema(
    {
        user:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        couponPrototype:{
            type: Schema.Types.ObjectId,
            ref: "CouponPrototype",
            required: true
        }
    }
);

const WishlistedCoupon=model("WishlistedCoupon",wishlistedCouponSchema);

module.exports={WishlistedCoupon};