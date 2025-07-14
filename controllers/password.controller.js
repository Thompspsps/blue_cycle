const { User } = require('../models/bc.models');
const { transporter, senderAddress } = require('../scripts/emailSender');

const resetPassword=async (req,res,next)=>{
    try{
        const {email:providedEmail}=req.body;
        let tpassword=Math.random().toString(36).slice(-8);
        let user=await User.findOneAndUpdate({email:providedEmail},{password:{content:tpassword,temporary:true}}).select("-__v -password._id");
        if(user){
            user=user.toObject();
            user.self="/api/v1/users/"+user._id;
            delete user._id;
            res.locals.response={status:200,success:true,message:"OK",data:user};
            await transporter.sendMail({
                from: senderAddress, // sender address
                to: user.email, // list of receivers
                subject: "Cambio password", // Subject line
                text: "La tua nuova password temporanea è: "+tpassword,
            })
            .then(()=>console.log("Email sent"));
            // console.log("------->",tpassword);
        }else
            res.locals.response={status:404,success:false,message:"User not found",data:null};
    }catch(err){
        console.error(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

module.exports=resetPassword;