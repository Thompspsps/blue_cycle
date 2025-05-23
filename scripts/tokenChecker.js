// to do: 
// prevedere due messaggi diversi per assenza di autorizzazione e token scaduto(basta decommentare)
// importare la KEY da index (riga 8)

const jwt=require("jsonwebtoken");
require("dotenv").config();
const KEY=process.env.SECRET_KEY||"another-secret-key";
//const {KEY}=require("../index"); // ensure the same key is used

const authenticateToken=async (req,res,roles,id=null)=>{
    const authHeader=req.headers["authorization"];
    const token=authHeader && authHeader.split(" ")[1]; // Syntax: Bearer <token>
    
    // token not included on the request headers
    if(!token){
        res.locals.response={status:401,success:false,message:"Unauthorized",data:null};
        return false;
    }
    try{
        const payload=jwt.verify(token,KEY);
        if((!roles.includes(payload.role))||(id!==null&&payload.id!==id&&payload.role==="user")){
            res.locals.response={status:403,success:false,message:"Forbidden",data:null};
            return false;
        }
        return true; // authentication succeded
    }catch(err){
        res.locals.response={status:401,success:false,message:"Unauthorized",data:null};
        // if(err instanceof jwt.TokenExpiredError)
            // res.locals.response={status:401,success:false,message:"Expired token",data:null};
        // else
            // res.locals.response={status:401,success:false,message:"Unauthorized",data:null};
        return false;
    }
}

module.exports={authenticateToken};