// const {User,Machine,Transaction} = require("../models/bc.models");
// const {authenticateToken}=require("../scripts/tokenChecker");

// const postTransaction=async (req,res,next)=>{
//     try{
//         const {date:providedDate,collected:providedCollected}=req.body; //non passare nella richiesta date se è la data attuale(assegnata di default da mongoose)
//         let {user:providedUser,machine:providedMachine}=req.body; 
//         // providedUser=substring(providedUser.lastIndexOf('/')+1);
//         // providedMachine=substring(providedMachine.lastIndexOf('/')+1);
//         if((!mongoose.Types.ObjectId.isValid(providedUser=substring(providedUser.lastIndexOf('/')+1))||!mongoose.Types.ObjectId.isValid(providedMachine=substring(providedMachine.lastIndexOf('/')+1)))||(typeof(providedCollected)==="number"||providedCollected<0))
//             res.locals.response={status:400,success:false,message:"Bad request",data:null};
//         else{
//             const user=await User.findById(providedUser);
//             const machine=await Machine.findById(providedMachine);
//             if(!user||!machine)
//                 res.locals.response={status:404,success:false,message:"Not found",data:null};
//             else{
//                 if(authenticateToken(req,res,["machine"])){
//                     let transaction=new Transaction({user:providedUser,machine:providedMachine,date:providedDate,providedCollected});
//                     transaction=await transaction.save();
//                     transaction.self="/api/v1/transactions/"+transaction._id;
//                     delete transaction._id;
//                     res.locals.response={status:201,success:false,message:"Created",data:transaction};
//                 }
//             }
//         }
//     }catch(err){
//         console.log(err);
//         res.locals.response={status:500,success:false,message:"Internal server error",data:null};
//     }
//     next();
// };

// //serve un getTransactionById???????????????????????????????????

// module.exports={
//     postTransaction
// };

const {User,Machine,Transaction}=require("../models/bc.models");
const {authenticateToken}=require("../scripts/tokenChecker");
const mongoose=require("mongoose");
const moment=require("moment");
require("dotenv").config();
const MAX=process.env.MAX_COLLECTED;
const {fetchPoints}=require("../scripts/pointsFetcher");

const postTransaction=async(req,res,next)=>{
    try{
        const {date:providedDate,collected:providedCollected}=req.body; // non passare nella richiesta date se è la data attuale (assegnata di default da mongoose)
        let {user:providedUser,machine:providedMachine}=req.body; 

        providedUser=providedUser.substring(providedUser.lastIndexOf('/')+1);
        providedMachine=providedMachine.substring(providedMachine.lastIndexOf('/')+1);

        if(
            !mongoose.Types.ObjectId.isValid(providedUser)|| 
            !mongoose.Types.ObjectId.isValid(providedMachine)|| 
            typeof(providedCollected)!=="number"|| 
            providedCollected<0
        )
            res.locals.response={status:400,success:false,message:"Bad request",data:null};
        else{
            const user=await User.findById(providedUser);
            const machine=await Machine.findById(providedMachine);

            if(!user||!machine) 
                res.locals.response={status:404,success:false,message:"Not found",data:null};
            else{
                if(await authenticateToken(req,res,["machine"])){
                    //logica per cui un utente non può consegnare piu di MAX al giorno

                    const todayPoints=await fetchPoints("/api/v1/users/"+providedUser,Date.now());
                    console.log(todayPoints);
                    if(todayPoints>=MAX)
                        console.log("Daily quota reached");
                    else{
                        if(todayPoints+providedCollected>MAX){
                            await User.findByIdAndUpdate(providedUser,{$inc:{points:MAX-todayPoints}});
                            console.log("Daily quota reached");
                        }else
                            await User.findByIdAndUpdate(providedUser,{$inc:{points:providedCollected}});
                    }
                    
                    //-------------------------------------------------------------------------------
                    let transaction=new Transaction({user:providedUser,machine:providedMachine,date:providedDate,collected:providedCollected});
                    transaction=await transaction.save();
                    transaction = transaction.toObject();
                    transaction.self="/api/v1/transactions/"+transaction._id;
                    transaction.user="/api/v1/users/"+providedUser;
                    transaction.machine="/api/v1/machines/"+providedMachine;
                    delete transaction._id;
                    res.locals.response={status:201,success:true,message:"Created",data:transaction};
                }
            }
        }
    }catch(err){
        console.log(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

module.exports = {postTransaction};
