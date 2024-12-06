const {User,WishlistedCoupon,Coupon,Transaction,CouponPrototype}=require("../models/bc.models");
const {authenticateToken}=require("../scripts/tokenChecker");
const {fetchPoints}=require("../scripts/pointsFetcher");
const mongoose=require("mongoose");

const getUsers=async (req,res,next)=>{
    try{
        if(await authenticateToken(req,res,["admin","machine"])){
            //aggiungere il controllo del token(role admin) e filtri
            const {id:queryId,email:queryEmail,code:queryCode}=req.query;
            const filters={};
            if(queryId) filters._id=queryId;
            if(queryEmail) filters.email=queryEmail;
            if(queryCode) filters.code=queryCode;                //controllo se sono definiti i filtri
            console.log(filters);
            let users=await User.find(filters);
            users=users.map((entry)=>{
                return {
                    self:"/api/v1/users/"+entry._id,
                    code:entry.code,
                    email:entry.email,
                    name:entry.name,
                    password:entry.password,
                    points:entry.points
                };
            });
            res.locals.response={status:200,success:true,message:"OK",data:users};
        }
    }catch(err){
        console.log(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

const postUser=async (req,res,next)=>{
    try{
        const {email:providedEmail,name:providedName}=req.body;
        if(!providedEmail||!providedName)
            res.locals.response={status:400,success:false,message:"Bad request",data:null};
        else{
            const user=await User.findOne({email:providedEmail});
            if(!user){
                let createdUser=new User({email:providedEmail,name:providedName});
                createdUser=await createdUser.save();
                createdUser=createdUser.toObject();
                createdUser.self="/api/v1/users/"+createdUser._id;
                delete createdUser._id;
                res.locals.response={status:201,success:true,message:"New user registered",data:createdUser};
            }else
                res.locals.response={status:409,success:false,message:"User already exists",data:null};
        }
    }catch(err){    //server error
        console.log(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};;
    }
    next();
};

const getUserById=async (req,res,next)=>{
    try{
        const {id}=req.params;
        console.log()
        //controllo conformità dell'id fornito
        if(!mongoose.Types.ObjectId.isValid(id))
            res.locals.response={status:400,success:false,message:"Not valid id",data:null};
        else{
            let user=await User.findById(id);
            if(!user)
                res.locals.response={status:404,success:false,message:"Not found",data:null};
            else{
                if(await authenticateToken(req,res,["user","admin"],id)){
                    user=user.toObject();
                    user.self="/api/v1/users"+user._id;
                    delete user._id;
                    res.locals.response={status:200,success:true,message:"OK",data:user};
                }
            }
        }
    }catch(err){    //server error
        console.log(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

const patchUserById=async (req,res,next)=>{
    try{
        const {id}=req.params;
        if(!mongoose.Types.ObjectId.isValid(id))
            res.locals.response={status:400,success:false,message:"Not valid id",data:null};
        else{
            const user=await User.findById(id);
            if(!user)
                res.locals.response={status:404,success:false,message:"Bad request",data:null};
            else{
                console.log(req.body);
                const {oldPassword:providedOldPassword,newPassword:providedNewPassword}=req.body;
                console.log(providedOldPassword," ",providedNewPassword);
                if((providedOldPassword && providedNewPassword)&&(providedOldPassword==user.password)){
                    if(await authenticateToken(req,res,["user","admin"],id)){
                        let modifiedUser=await User.findByIdAndUpdate(id,{password:providedNewPassword});
                        modifiedUser=modifiedUser.toObject();
                        modifiedUser.self="/api/v1/users/"+modifiedUser._id;
                        modifiedUser.password=providedNewPassword;
                        delete modifiedUser._id;
                        res.locals.response={status:200,success:true,message:"Updated successfully",data:modifiedUser};
                    }
                }else
                    res.locals.response={status:400,success:false,message:"Bad request",data:null};
            }
        }
    }catch(err){
        console.log(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

// da ritestare ------------------------------------------------------------------------------------------------------------------------------------
const getUserByIdCoupons=async (req,res,next)=>{
    try{
        const {id}=req.params;
        if(!mongoose.Types.ObjectId.isValid(id))
            res.locals.response={status:400,success:false,message:"Bad request",data:null};
        else{
            const user=await User.findById(id);
            if(!user)
                res.locals.response={status:404,success:false,message:"Not found",data:null};
            else{
                if(await authenticateToken(req,res,["user"],id)){
                    const {used:queryUsed,expired:queryExpired}=req.query;
                    let date;
                    let filters={};
                    filters.user=id;
                    if(queryUsed==="true") filters.used=true;
                    else if(queryUsed==="false") filters.used=true;
                    if(queryExpired==="true"){
                        date=Math.trunc(Date.now()/1000);
                        date-=date%86400;
                    }
                    else
                        date=0;
                    let coupons=await Coupon.find(filters).where("expiration").lt(date);
                    coupons=coupons.map((entry)=>{
                        if(entry.expiration!=null||((entry.expiration<Date.now())==expired))
                            return{
                                self:"/api/v1/users/"+id+"/coupons/"+entry._id,
                                user:"/api/v1/users/"+id,
                                code:entry.code,
                                store:entry.store,
                                discount:entry.discount,
                                description:entry.description,
                                used:entry.used,
                                expiration:entry.expiration
                            };
                        else
                            return null;
                    });
                    res.locals.response={status:200,success:true,message:"OK",data:coupons};
                }
            }
        }
    }catch(err){
        console.log(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

// da ritestare ---------------------------------------------------------------------------------------------
const postUserByIdCoupon=async (req,res,next)=>{
    try{
        const {id}=req.params;
        let {couponPrototype:providedCouponPrototype,expiration:providedExpiration}=req.body;
        if(!providedCouponPrototype)
            res.locals.response={status:400,success:false,message:"Bad request",data:null};
        else{
            providedCouponPrototype=providedCouponPrototype.substring(providedCouponPrototype.lastIndexOf('/')+1);
            if(!mongoose.Types.ObjectId.isValid(id)||!mongoose.Types.ObjectId.isValid(providedCouponPrototype))
                res.locals.response={status:400,success:false,message:"Bad request",data:null};
            else{
                let user=await User.findById(id);
                let couponPrototype=await CouponPrototype.findById(providedCouponPrototype);
                if(!user||!couponPrototype)
                    res.locals.response={status:404,success:false,message:"Not found",data:null};
                else{
                    if(await authenticateToken(req,res,["user"],id)){
                        const pointsToSub=couponPrototype.price*(-1);
                        try{
                            if(user.points<couponPrototype.price)
                                throw new Error("Not enough points");
                            await User.findByIdAndUpdate(id,{$inc:{points:pointsToSub}});
                            
                            let coupon=new Coupon({user:id,store:couponPrototype.store,discount:couponPrototype.discount,description:couponPrototype.description});
                            if(typeof(providedExpirationxpiration)==="number"&&providedExpiration>Date.now()) coupon.expiration=providedExpiration;
                            coupon=await coupon.save();
                            coupon=coupon.toObject();
                            coupon.self="/api/v1/users/"+id+"/coupons/"+coupon._id;
                            coupon.user="/api/v1/users/"+id;
                            delete coupon._id;
                            res.locals.response={status:201,success:true,message:"Added",data:coupon};
                        }catch(err){
                            console.log(err);
                            res.locals.response={status:422,success:false,message:"Unprocessable Entity",data:null};
                        }
                    }
                }
            }
        }
    }catch(err){
        console.log(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

// da ritestare -------------------------------------------------------------------------------------------
const getUserByIdWishlistedCoupons=async (req,res,next)=>{
    try{
        const {id}=req.params;
        if(!mongoose.Types.ObjectId.isValid(id))
            res.locals.response={status:400,success:false,message:"Bad request",data:null};
        else{
            const user=await User.findById(id);
                if(!user)
                    res.locals.response={status:404,success:false,message:"Not found",data:null};
                else{
                    if(await authenticateToken(req,res,["user"],id)){
                        let wishlistedCoupons=await WishlistedCoupon.find({user:id});
                        wishlistedCoupons=wishlistedCoupons.map((entry)=>{
                            return{
                                self:"/api/v1/wishlistedCoupons/"+entry.id,
                                user:"/api/v1/users/"+entry.user,//oppure solo id di req
                                couponPrototype:"/api/v1/couponPrototypes/"+entry.couponPrototype,
                            };
                        });
                        res.locals.response={status:200,success:true,message:"OK",data:wishlistedCoupons};
                    }
                }
        }
    }catch(err){
        console.log(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

// da ritestare -----------------------------------------------------------------------------------------------------------------------------------
const postUserByIdWishlistedCoupon=async (req,res,next)=>{
    try{
        const {id}=req.params;
        let {couponPrototype:providedCouponPrototype}=req.body;
        if(!providedCouponPrototype)
            res.locals.response={status:400,success:false,message:"Bad request",data:null};
        else{
            providedCouponPrototype=providedCouponPrototype.substring(providedCouponPrototype.lastIndexOf('/')+1);
            console.log(providedCouponPrototype);
            if(!mongoose.Types.ObjectId.isValid(id)||!mongoose.Types.ObjectId.isValid(providedCouponPrototype))
                res.locals.response={status:400,success:false,message:"Bad request",data:null};
            else{
                const user=await User.findById(id);
                const couponPrototype=await CouponPrototype.findById(providedCouponPrototype);
                if(!user||!couponPrototype)
                    res.locals.response={status:404,success:false,message:"Not found",data:null};
                else{
                    if(await authenticateToken(req,res,["user"],id)){
                        const wishlistedItem=await WishlistedCoupon.findOne({user:id,couponPrototype:providedCouponPrototype})
                        if(wishlistedItem)
                            res.locals.response={status:209,success:409,message:"Conflict",data:null};
                        else{
                            let wishlistedCoupon=new WishlistedCoupon({user:id,couponPrototype:providedCouponPrototype});
                            wishlistedCoupon=await wishlistedCoupon.save();
                            wishlistedCoupon=wishlistedCoupon.toObject();
                            wishlistedCoupon.self="/api/v1/users/"+id+"/wishlistedCoupons/"+wishlistedCoupon._id;
                            wishlistedCoupon.user="/api/v1/users/"+id;
                            wishlistedCoupon.couponPrototype="/api/v1/couponPrototypes/"+providedCouponPrototype;
                            delete wishlistedCoupon._id;
                            res.locals.response={status:201,success:true,message:"Added",data:wishlistedCoupon};
                        }
                    }
                }
            }
        }
    }catch(err){
        console.log(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};


// da ritestare ---------------------------------------------------------------------------------------------
const deleteUserByIdWishlistedCouponById=async (req,res,next)=>{
    try{
        const {userId:providedUserId,itemId:providedItemId}=req.params;
        if(!mongoose.Types.ObjectId.isValid(providedUserId)||!mongoose.Types.ObjectId.isValid(providedItemId))
            res.locals.response={status:400,success:false,message:"Not valid id/s",data:null};
        else{
            const user=await User.findById(providedUserId);
            if(!user)
                res.locals.response={status:404,success:false,message:"Not found",data:null};
            if(await authenticateToken(req,res,["user"],providedUserId)){
                const wishlistedCoupon=await WishlistedCoupon.findByIdAndDelete(providedItemId);
                if(!wishlistedCoupon)
                    res.locals.response={status:404,success:false,message:"Not Found",data:null};
                else
                    res.locals.response={status:204,success:true,message:"Deleted",data:null};
            }
        }
    }catch(err){
        console.log(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
}

// da ritestare -----------------------------------------------------------------------------------------------------------
const getUserByIdTransactions=async (req,res,next)=>{
    try{
        const {id}=req.params;
        if(!mongoose.Types.ObjectId.isValid(id))
            res.locals.response={status:400,success:false,message:"Not valid id",data:null};
        else{
            const user=await User.findById(id);
            if(!user)
                res.locals.response={status:404,success:false,message:"Not found",data:null};
            else{
                if(await authenticateToken(req,res,["user","admin"],id)){
                    let transactions=await Transaction.find({user:id});
                    transactions=transactions.map((entry)=>{
                        return{
                            self:"/api/v1/transactions/"+entry._id,
                            user:"/api/v1/users/"+entry.user,//oppure solo id di req
                            machine:"/api/v1/machines/"+entry.machine,
                            date:entry.date,
                            collected:entry.collected
                        };
                    });
                    res.locals.response={status:200,success:true,message:"OK",data:transactions};
                }
            }
        }
    }catch(err){
        console.log(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

const getUserByIdTransactionsCollected=async(req,res,next)=>{
    try{
        const {id}=req.params;
        if(!mongoose.Types.ObjectId.isValid(id))
            res.locals.response={status:400,success:false,message:"Not valid id",data:null};
        else{
            const user=await User.findById(id);
            if(!user)
                res.locals.response={status:404,success:false,message:"Not found",data:null};
            else{
                if(await authenticateToken(req,res,["user","admin"],id)){
                    const {day}=req.query;
                    const points=await fetchPoints("/api/v1/users/"+id,day);
                    res.locals.response={status:200,success:true,message:"OK",data:points};
                }
            }
        }
    }catch(err){
        console.log(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
}


module.exports={
    getUsers,
    postUser,
    getUserById,
    patchUserById,
    getUserByIdCoupons,
    // //getUserByIdCouponById --> da aggiungere
    postUserByIdCoupon,
    getUserByIdWishlistedCoupons,
    postUserByIdWishlistedCoupon,
    deleteUserByIdWishlistedCouponById,
    getUserByIdTransactions,
    getUserByIdTransactionsCollected
};