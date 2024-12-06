const {Schema,model}=require("mongoose");
// const {v4:uuidv4}=require('uuid'); da tohgliere
const voucher_codes=require("voucher-code-generator");

const couponSchema=Schema(
    {
        user:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        code:{
            type: String,
            required: true,
            default: voucher_codes.generate({length:10,count:1,charset:"alphanumeric"})[0]//uuidv4() //generazione di un codice univoco (UUID)
        },
        store:{
            type: String
        },
        discount:{
            type: Number,
            min: 1,
            max: 50, //to be discussed
            required: true
        },
        description:{
            type: String
        },
        used:{
            type: Boolean,
            default: false
        },
        expiration:{
            type: Number,
            default: set31DaysFromNow()
        }
    }
);

const set31DaysFromNow=()=>{
    let today=Math.trunc(Date.now()/1000);
    today-=today % 86400;
    return today+(86400*31);
};

const Coupon=model("Coupon",couponSchema);

module.exports={Coupon};