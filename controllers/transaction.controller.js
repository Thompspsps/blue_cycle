// to do
// rimuovere dalla visualizzazione campi superflui(__v)
// discutere con il resto del gruppo se notificare l'utente in caso di raggiungimento di quota giornaliera

const {User,Machine,Transaction}=require("../models/bc.models");
const {authenticateToken}=require("../scripts/tokenChecker");
const mongoose=require("mongoose");
const moment=require("moment");
require("dotenv").config();
const MAX=process.env.MAX_COLLECTED||15;
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
                    console.log(todayPoints+"("+MAX+")");
                    if(todayPoints<MAX){
                        const pointsToAdd=(todayPoints+providedCollected)>MAX?(MAX-todayPoints):(providedCollected);
                        console.log(" ======> "+pointsToAdd);
                        await User.findByIdAndUpdate(providedUser,{$inc:{points:pointsToAdd}});
                    }
                    
                    //-------------------------------------------------------------------------------
                    let transaction=new Transaction({user:providedUser,machine:providedMachine,date:providedDate,collected:providedCollected});
                    await transaction.save();
                    transaction=transaction.toObject();
                    transaction.self="/api/v1/transactions/"+transaction._id;
                    transaction.user="/api/v1/users/"+providedUser;
                    transaction.machine="/api/v1/machines/"+providedMachine;
                    delete transaction._id;
                    delete transaction.__v;
                    res.locals.response={status:201,success:true,message:"Created",data:transaction};
                }
            }
        }
    }catch(err){
        console.error(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

module.exports = {postTransaction};
