const {CouponPrototype}=require("../models/couponPrototype.model");
const {authenticateToken}=require("../scripts/tokenChecker");
const mongoose=require("mongoose");

const getCouponPrototypes=async (req,res,next)=>{
    try{
        if(await authenticateToken(req,res,["user","admin"])){
            const {store:queryStore,pricec:queryPrice,discount:queryDiscount}=req.query;
            const filters={};
            if(queryStore) filters.store=queryStore;
            if(typeof(queryPrice)==="number") filters.price=queryPrice;
            if(typeof(queryDiscount)==="number") filters.discount=queryDiscount;                //controllo se sono definiti i filtri
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
        console.log(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

//magari aggiungere una getCouponProrotypeById

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
                res.locals.response={status:201,success:true,message:"Created",data:createdCouponPrototype};
            }
        }
    }catch(err){
        console.log(err);
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
                // non mostra contenuto json stranamente
                else
                    res.locals.response={status:204,success:true,message:"Deleted",data:null};
            }
        }
    }catch(err){
        console.log(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

module.exports={
    getCouponPrototypes,
    postCouponPrototype,
    deleteCouponPrototypeById
};