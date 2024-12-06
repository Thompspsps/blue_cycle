const {Schema,model}=require("mongoose");

const couponPrototypeSchema=Schema(
    {
        store:{
            type: String,
            requied: true
        },
        discount:{
            type: Number,
            min: 1,
            max: 100,
            required: true
        },
        price:{
            type: Number,
            required: true,
            min: 1
        },
        description:{
            type: String
        }
    }
);

const CouponPrototype=model("CouponPrototype",couponPrototypeSchema);

module.exports={CouponPrototype};