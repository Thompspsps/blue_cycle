//mongoose
const mongoose=require("mongoose");

// dotenv (open the .env file for more)
require("dotenv").config();
const DB=process.env.DB_URI;
const PORT=process.env.SERVER_PORT || 3000;

// const createServer=require("./app");
// const app=createServer();

const app=require("./app");

// connection to mongodb database e startup of express
mongoose.connect(DB)
.then(async ()=>{
    console.log("Connected to mongoDB Cloud");
    app.listen(PORT,"0.0.0.0",()=>console.log("Server is running on port",PORT));
})
.catch((err)=>{
    console.log("Could not connect to mongoDB Cloud\n",err);
});


// credential authentication and token creation
// app.post("/api/v1/userAuth",async (req,res,next)=>{
//     try{
//         const {email:providedEmail,password:providedPassword}=req.body;
//         if(!providedEmail||!providedPassword)
//             res.locals.response={status:400,success:false,message:"Bad request",data:null};
//         else{
//             const user=await User.findOne({email:providedEmail});
//             if(!user)
//                 res.locals.response={status:404,success:false,message:"Not found",data:null};
//             else{
//                 if(await bcrypt.compare(providedPassword,user.password.content)){
//                     const token=jwt.sign({id:user.id,role:"user"},KEY,{/*algorithm:"HS512",*/expiresIn:"1d"}); // -> token lifetime set to 1 hour (remember to change it back to 1h)
//                     res.locals.response={status:200,success:true,message:"Authentication successfull",data:{self:"/api/v1/users/"+user._id,token:token}};
//                 }else
//                     res.locals.response={status:400,success:false,message:"Bad request",data:null};
//             }
//         }
//     // server error
//     }catch(err){    
//         console.error(err);
//         res.locals.response={status:500,success:false,message:"Internal server error",data:null};
//     }
//     next();
// });

// app.post("/api/v1/adminAuth",async (req,res,next)=>{
//     try{
//         const {email:providedEmail,password:providedPassword}=req.body;
//         if(!providedEmail||!providedPassword)
//             res.locals.response={status:400,success:false,message:"Bad request",data:null};
//         else{
//             const admin=await Admin.findOne({email:providedEmail});
//             if(!admin)
//                 res.locals.response={status:404,success:false,message:"Not found",data:null}
//             else{
//                 if(await bcrypt.compare(providedPassword,admin.password)){
//                     const token=jwt.sign({id:admin.id,role:"admin"},KEY,{/*algorithm:"HS512",*/expiresIn:"1d"}); // -> token lifetime set to 1 day
//                     res.locals.response={status:200,success:true,message:"Authentication successfull",data:{self:"/api/v1/admins/"+admin._id,token:token}};
//                 }else
//                     res.locals.response={status:400,success:false,message:"Bad request",data:null};
//             }
//         }
//     }catch(err){
//         console.error(err)
//         res.locals.response={status:500,success:false,message:"Internal server error",data:null};
//     }
//     next();
// });

// da riguardare
// const resetUserPasswordByEmail=async (req,res,next)=>{
//     try{
//         const {email:providedEmail}=req.body;
//         let tpassword=Math.random().toString(36).slice(-8);
//         let user=await User.findOneAndUpdate({email:providedEmail},{password:{content:tpassword,temporary:true}}).select("-__v -password._id");
//         if(user){
//             user=user.toObject();
//             user.self="/api/v1/users/"+user._id;
//             delete user._id;
//             res.locals.response={status:200,success:true,message:"OK",data:user};
//             await transporter.sendMail({
//                 from: senderAddress, // sender address
//                 to: user.email, // list of receivers
//                 subject: "Cambio password", // Subject line
//                 text: "La tua nuova password temporanea è: "+tpassword,
//             })
//             .then(()=>console.log("Email sent"));
//             console.log("------->",tpassword);
//         }else
//             res.locals.response={status:404,success:false,message:"User not found",data:null};
//     }catch(err){
//         console.error(err);
//         res.locals.response={status:500,success:false,message:"Internal server error",data:null};
//     }
//     next();
// };

// app.post("/api/v1/forgotPassword",resetUserPasswordByEmail);

// // final middleware to centrally manage the response obtained from the previous middleware and send it to the client 
// app.use((req,res)=>{
//     const {status,success,message,data}=res.locals.response||{status:500,success:false,message:"Internal server error or method-endpoint not supported",data:null}; // default response in case an unsupported endpoint is called
//     res.status(status).json({success,message,data});
// });

module.exports={mongoose};