const {Machine,Transaction}=require("../models/bc.models");
const {authenticateToken}=require("../scripts/tokenChecker");
const {fetchPoints}=require("../scripts/pointsFetcher");
const mongoose=require("mongoose");
const qs=require("qs");

const getMachines=async (req,res,next)=>{
    try{
        if(await authenticateToken(req,res,["user","admin"])){
            const {available:queryAvailable,proximity:queryProximity}=req.query;
            const filters={};
            if(queryAvailable==="true") filters.available=true;
            else if(queryAvailable==="false") filters.available=false;
            if(queryProximity){
                let {range,from}=qs.parse(queryProximity);
                range=parseFloat(range);
                from.latitude=parseFloat(from.latitude);
                from.longitude=parseFloat(from.longitude);
                if(
                    range>=0&&
                    from.latitude>=-90&&from.latitude<=90&&
                    from.longitude>=-180&&from.longitude<=180
                ){
                    filters.position={
                        $geoWithin:{
                            $centerSphere:[[from.latitude,from.longitude],range/6371]
                        }
                    };
                }
            }
            // console.log(filters);
            let machines=await Machine.find(filters).select("-position._id");
            machines=machines.map((entry)=>{
                entry=entry.toObject();
                return {
                    self:"/api/v1/machines/"+entry._id,
                    position:entry.position,
                    available:entry.available,
                    description:entry.description
                };
            });
            res.locals.response={status:200,success:true,message:"OK",data:machines};
        }
    }catch(err){
        console.error(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

const getMachineById=async (req,res,next)=>{
    try{
        if(await authenticateToken(req,res,["user","admin"])){
            const {id}=req.params;
            if(!mongoose.Types.ObjectId.isValid(id))
                res.locals.response={status:400,success:false,message:"Not valid id",data:null};
            else{
                let machine=await Machine.findById(id).select("-__v -position._id");
                if(!machine)
                    res.locals.response={status:404,success:false,message:"Not found",data:null};
                else{
                    machine=machine.toObject();
                    machine.self="/api/v1/machines/"+machine._id;
                    delete machine._id;
                    res.locals.response={status:200,success:true,message:"OK",data:machine};
                }
            }
        }
    }catch(err){
        console.error(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
}

const postMachine=async (req,res,next)=>{
    try{
        if(await authenticateToken(req,res,["admin"])){
            const {position:providedPosition,available:providedAvailable,description:providedDescription}=req.body;
            if((!providedPosition||!providedAvailable)||(!providedPosition.latitude||!providedPosition.longitude))
                res.locals.response={status:400,success:false,message:"Bad request",data:null};
            else{
                let createdMachine=new Machine({position:providedPosition,available:providedAvailable,description:providedDescription});
                createdMachine=await createdMachine.save();
                createdMachine=createdMachine.toObject();
                createdMachine.self="/api/v1/machines/"+createdMachine._id;
                delete createdMachine._id;
                delete createdMachine.__v;
                delete createdMachine.position._id;
                res.locals.response={status:201,success:true,message:"Created",data:createdMachine};
            }
        }
    }catch(err){
        console.error(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

const patchMachineById=async (req,res,next)=>{
    try{
        if(await authenticateToken(req,res,["admin"])){
            const {id}=req.params;
            if(!mongoose.Types.ObjectId.isValid(id))
                res.locals.response={status:400,success:false,message:"Bad request",data:null};
            else{
                const machine=await Machine.findById(id);
                if(!machine)
                    res.locals.response={status:404,success:false,message:"Not found",data:null};
                else{
                    const {available:providedAvailable}=req.body;
                    if(typeof(providedAvailable)==="boolean"){
                        let modifiedMachine=await Machine.findByIdAndUpdate(id,{available:providedAvailable}).select("-__v -position._id");
                        modifiedMachine=modifiedMachine.toObject();
                        modifiedMachine.self="/api/v1/machines/"+modifiedMachine._id;
                        modifiedMachine.available=providedAvailable;
                        delete modifiedMachine._id;
                        res.locals.response={status:200,success:true,message:"Updated successfully",data:modifiedMachine};
                    }else
                        res.locals.response={status:400,success:false,message:"Bad request",data:null};
                }
            }
        }
    }catch(err){
        console.error(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

const getMachineByIdTransactions=async (req,res,next)=>{
    try{
        const {id}=req.params;
        if(!mongoose.Types.ObjectId.isValid(id))
            res.locals.response={status:400,success:false,message:"Not valid id",data:null};
        else{
            const machine=await Machine.findById(id);
            if(!machine)
                res.locals.response={status:404,success:false,message:"Not found",data:null};
            else{
                if(await authenticateToken(req,res,["admin"])){
                    let transactions=await Transaction.find({machine:id});
                    transactions=transactions.map((entry)=>{
                        return{
                            self:"/api/v1/transactions/"+entry._id,
                            user:"/api/v1/users/"+entry.user,//oppure solo id di req
                            machine:"/api/v1/machines"+entry.machine,
                            date:entry.date,
                            collected:entry.collected
                        };
                    });
                    res.locals.response={status:200,success:true,message:"OK",data:transactions};
                }
            }
        }
    }catch(err){
        console.error(err);
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
            const machine=await Machine.findById(id);
            if(!machine)
                res.locals.response={status:404,success:false,message:"Not found",data:null};
            else{
                if(await authenticateToken(req,res,["admin"])){
                    const {day}=req.query;
                    const points=await fetchPoints("/api/v1/machines/"+id,day);
                    res.locals.response={status:200,success:true,message:"OK",data:points};
                }
            }
        }
    }catch(err){
        console.error(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
}

module.exports={
    getMachines,
    getMachineById,
    postMachine,
    patchMachineById,
    getMachineByIdTransactions,
    getUserByIdTransactionsCollected
};
