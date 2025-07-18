const {Schema,model}=require("mongoose");
// const {v4:uuidv4}=require('uuid'); da tohgliere
// const voucher_codes=require("voucher-code-generator");
// const {nanoid}=require("nanoid");
// let customAlphabet;
// (async()=>{
//     const nanoidModule=await import("nanoid");
//     customAlphabet=nanoidModule.customAlphabet;
// })();

// const { customAlphabet } = require('nanoid');
const nanoid=require("nanoid");

const alphabet="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const fixedLength=10; // all codes must have fixed length


const generateCode=()=>{
    let result = '';
    for (let i=0;i<fixedLength;i++)
        result+=alphabet.charAt(Math.floor(Math.random()*alphabet.length));
    return result;
};

const set31DaysFromNow=()=>{
    const today=Math.trunc(Date.now()/1000);
    const mid=today-today%86400; // set to midnight
    return mid+(86400*31);
};

const couponSchema=Schema(
    {
        user:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        code:{
            type: String,
            unique:true,
            // default:()=>customAlphabet(alphabet,fixedLength)()
            default: generateCode
        },
        store:{
            type: String,
            trim:true
        },
        discount:{
            type: Number,
            min: 1,
            max: 50,
            required: true
        },
        description:{
            type: String,
            trim:true
        },
        used:{
            type: Boolean,
            default: false
        },
        expiration:{
            type: Number
        }
    }
);

// middleware for generating a code before saving
couponSchema.pre("save",async function(next){
    // if(!this.code)
    //     this.code=voucher_codes.generate({length:10,count:1,charset:"alphanumeric"})[0];
    this.expiration=set31DaysFromNow();
    next();
});

const Coupon=model("Coupon",couponSchema);

module.exports={Coupon};