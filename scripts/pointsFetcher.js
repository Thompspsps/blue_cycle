const {Transaction}=require("../models/bc.models");
const mongoose=require("mongoose");

const fetchPoints=async (entity,day=null)=>{
    try{
        let dayBefore=0;
        let dayAfter=Infinity;

        if(day){
            day=parseInt(day.toString().substring(0,10).padEnd(10,"0"));
            day-=day % 86400;
            dayBefore=day;
            dayAfter=day+86400;
        }

        let tr=[];

        if(entity.includes("/api/v1/users/")){
            const userId=entity.substring(entity.lastIndexOf("/")+1);
            if(mongoose.Types.ObjectId.isValid(userId)){
                tr=await aggregatedSum({
                    user:new mongoose.Types.ObjectId(userId),
                    date:{$gt:dayBefore,$lt:dayAfter}
                });
            }
        }else if(entity.includes("/api/v1/machines/")){
            const machineId=entity.substring(entity.lastIndexOf("/")+1);
            if(mongoose.Types.ObjectId.isValid(machineId)){
                tr=await aggregatedSum({
                    machine:new mongoose.Types.ObjectId(machineId),
                    date:{$gt:dayBefore,$lt:dayAfter}
                });
            }
        }
        return tr.length>0?(tr[0].totalPoints):0;
    }catch(err){
        throw err;
    }
};

const aggregatedSum=async (conditions)=>{
    try{
        return await Transaction.aggregate([
            {$match:conditions},
            {
                $group:{
                    _id:null,
                    totalPoints:{$sum:"$collected"}
                }
            }
        ]);
    }catch(err){
        throw err;
    }
};

module.exports={fetchPoints};
