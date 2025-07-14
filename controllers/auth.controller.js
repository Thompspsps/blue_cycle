const bcrypt=require("bcrypt");
const {User,Admin}=require("../models/bc.models");

// jsonwebtoken
const jwt=require("jsonwebtoken");
const KEY=process.env.SECRET_KEY || "another-secret-key"; // the key is supposed to be secret

const userAuth=async (req,res,next)=>{
    try{
        const {email:providedEmail,password:providedPassword}=req.body;
        if(!providedEmail||!providedPassword)
            res.locals.response={status:400,success:false,message:"Bad request",data:null};
        else{
            // console.log("<",providedEmail,">");
            const user=await User.findOne({email:providedEmail});
            if(!user)
                res.locals.response={status:404,success:false,message:"Not found",data:null};
            else{
                if(await bcrypt.compare(providedPassword,user.password.content)){
                    const token=jwt.sign({id:user.id,role:"user"},KEY,{/*algorithm:"HS512",*/expiresIn:"1h"}); // -> token lifetime set to 1 hour (remember to change it back to 1h)
                    res.locals.response={status:200,success:true,message:"Authentication successfull",data:{self:"/api/v1/users/"+user._id,token:token}};
                }else
                    res.locals.response={status:400,success:false,message:"Bad request",data:null};
            }
        }
    // server error
    }catch(err){    
        console.error(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

const adminAuth=async (req,res,next)=>{
    try{
        const {email:providedEmail,password:providedPassword}=req.body;
        if(!providedEmail||!providedPassword)
            res.locals.response={status:400,success:false,message:"Bad request",data:null};
        else{
            const admin=await Admin.findOne({email:providedEmail});
            if(!admin)
                res.locals.response={status:404,success:false,message:"Not found",data:null}
            else{
                if(await bcrypt.compare(providedPassword,admin.password)){
                    const token=jwt.sign({id:admin.id,role:"admin"},KEY,{/*algorithm:"HS512",*/expiresIn:"1d"}); // -> token lifespan set to 1 day
                    res.locals.response={status:200,success:true,message:"Authentication successfull",data:{self:"/api/v1/admins/"+admin._id,token:token}};
                }else
                    res.locals.response={status:400,success:false,message:"Bad request",data:null};
            }
        }
    }catch(err){
        console.error(err)
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

module.exports={userAuth,adminAuth};