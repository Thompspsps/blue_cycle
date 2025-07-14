const {CouponPrototype}=require("../models/couponPrototype.model");
const {authenticateToken}=require("../scripts/tokenChecker");
const mongoose=require("mongoose");

const getCouponPrototypes=async (req,res,next)=>{
    try{
        if(await authenticateToken(req,res,["user","admin"])){
            const {store:queryStore,price:queryPrice,discount:queryDiscount}=req.query;
            const filters={};
            if (queryStore) filters.store=queryStore;
            if (queryPrice && !isNaN(queryPrice)) filters.price={$lte:Number(queryPrice)};
            if (queryDiscount && !isNaN(queryDiscount)) filters.discount = Number(queryDiscount);
            let couponPrototypes=await CouponPrototype.find(filters);
            couponPrototypes=couponPrototypes.map((entry)=>{
                return{
                    self:"/api/v1/couponPrototypes/"+entry._id,
                    store:entry.store,
                    discount:entry.discount,
                    price:entry.price,
                    description:entry.description
                };
            });
            res.locals.response={status:200,success:true,message:"OK",data:couponPrototypes};
        }
    }catch(err){
        console.error(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

const getCouponPrototypeById=async(req,res,next)=>{
    try{
        const {id}=req.params;
        if(!mongoose.Types.ObjectId.isValid(id))
        res.locals.response={status:400,success:false,message:"Not valid id",data:null};
        else{
            let coupon=await CouponPrototype.findById(id).select("-__v");
            if(!coupon)
                res.locals.response={status:404,success:false,message:"Not found",data:null};
            else{
                if(await authenticateToken(req,res,["user","admin"])){
                    coupon=coupon.toObject();
                    coupon.self="/api/v1/couponPrototypes/"+id;
                    delete coupon._id;
                    res.locals.response={status:200,success:true,message:"OK",data:coupon};
                }
            }
        }
    }catch(err){
        console.error(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
}

//magari aggiungere una getCouponPrototypeById

const postCouponPrototype=async (req,res,next)=>{
    try{
        const {store:providedStore,discount:providedDiscount,price:providedPrice,description:providedDescription}=req.body;
        if(!(providedStore&&providedPrice&&providedDiscount))
            res.locals.response={status:400,success:false,message:"Bad request",data:null};
        else{
            if(await authenticateToken(req,res,["admin"])){
                let createdCouponPrototype=new CouponPrototype({store:providedStore,discount:providedDiscount,price:providedPrice,description:providedDescription});
                createdCouponPrototype=await createdCouponPrototype.save();
                createdCouponPrototype=createdCouponPrototype.toObject();
                createdCouponPrototype.self="/api/v1/couponPrototypes/"+createdCouponPrototype._id;
                delete createdCouponPrototype._id;
                delete createdCouponPrototype.__v;
                res.locals.response={status:201,success:true,message:"Created",data:createdCouponPrototype};
            }
        }
    }catch(err){
        console.error(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

const deleteCouponPrototypeById=async (req,res,next)=>{
    try{
        const {id:providedItemId}=req.params;
        if(!mongoose.Types.ObjectId.isValid(providedItemId))
            res.locals.response={status:400,success:false,message:"Bad request",data:null};
        else{
            if(await authenticateToken(req,res,["admin"])){
                const deletedItem=await CouponPrototype.findByIdAndDelete(providedItemId);
                if(!deletedItem)
                    res.locals.response={status:404,success:false,message:"Not Found",data:null};
                else
                    res.locals.response={status:200,success:true,message:"Deleted",data:null};
            }
        }
    }catch(err){
        console.error(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

module.exports={
    getCouponPrototypes,
    getCouponPrototypeById,
    postCouponPrototype,
    deleteCouponPrototypeById
};