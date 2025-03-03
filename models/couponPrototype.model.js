const {Schema,model}=require("mongoose");

const couponPrototypeSchema=Schema(
    {
        store:{
            type: String,
            required: true,
            trim:true
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
            minimum: 1
        },
        description:{
            type: String,
            trim:true
        }
    }
);

const CouponPrototype=model("CouponPrototype",couponPrototypeSchema);

module.exports={CouponPrototype};