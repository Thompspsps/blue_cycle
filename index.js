// to do:
// cambiare la durata del token per l'utente
// magari gestire il logging con winston (al posto di console.log)
// aggiungere a swagger la descrizione di reset_password
// aggiungere nel frontend il controllo di validità dell'email, con validator
// bug per cui l'utente restituito da resetUserPasswordByEmail ha la password in chiaro

// controllare bug con il reset_password viene restituito temporary:true(il campo effettivo viene aggiornato correttamente)

// package for date (doesn't really have a meaningfull use beside debugging(?))
const moment=require("moment");

const express=require("express");
const app=express();

const bcrypt=require("bcrypt");

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/api_doc.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// express middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true})); //false
app.use((req,res,next)=>{
    console.log("Request received at: ",req.method," ",req.url,"from ",req.hostname," (",moment(new Date()).format("DD-MM-YYYY  hh:mm:ss"),")");
    next();
});

// "cross-origin resource sharing" package
const cors=require("cors");
app.use(cors());

// routes
const {userRouter,machineRouter,couponPrototypeRouter,transactionRouter}=require("./routes/bc.routes");
app.use("/api/v1/users",(req,res,next)=>{console.log(".../users router");next();},userRouter);
app.use("/api/v1/machines",(req,res,next)=>{console.log(".../machines router");next();},machineRouter);
app.use("/api/v1/couponPrototypes",(req,res,next)=>{console.log(".../couponPrototypes router");next();},couponPrototypeRouter);
app.use("/api/v1/transactions",(req,res,next)=>{console.log(".../transactions router");next();},transactionRouter);


// mongoose
const mongoose=require("mongoose");
const {User,Admin}=require("./models/bc.models");

// dotenv (open the .env file for more)
require("dotenv").config();
const DB=process.env.DB_URI;
const PORT=process.env.SERVER_PORT || 3000;
const KEY=process.env.SECRET_KEY || "another-secret-key"; // the key is supposed to be secret

// jsonwebtoken
const jwt=require("jsonwebtoken");

const {transporter,senderAddress}=require("./scripts/emailSender");


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
app.post("/api/v1/userAuth",async (req,res,next)=>{
    try{
        const {email:providedEmail,password:providedPassword}=req.body;
        if(!providedEmail||!providedPassword)
            res.locals.response={status:400,success:false,message:"Bad request",data:null};
        else{
            const user=await User.findOne({email:providedEmail});
            if(!user)
                res.locals.response={status:404,success:false,message:"Not found",data:null};
            else{
                if(await bcrypt.compare(providedPassword,user.password.content)){
                    const token=jwt.sign({id:user.id,role:"user"},KEY,{/*algorithm:"HS512",*/expiresIn:"1d"}); // -> token lifetime set to 1 hour (remember to change it back to 1h)
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
});

app.post("/api/v1/adminAuth",async (req,res,next)=>{
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
                    const token=jwt.sign({id:admin.id,role:"admin"},KEY,{/*algorithm:"HS512",*/expiresIn:"1d"}); // -> token lifetime set to 1 day
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
});

// da riguardare
const resetUserPasswordByEmail=async (req,res,next)=>{
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
            console.log("------->",tpassword);
        }else
            res.locals.response={status:404,success:false,message:"User not found",data:null};
    }catch(err){
        console.error(err);
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
};

app.post("/api/v1/forgotPassword",resetUserPasswordByEmail);

// final middleware to centrally manage the response obtained from the previous middleware and send it to the client 
app.use((req,res)=>{
    const {status,success,message,data}=res.locals.response||{status:500,success:false,message:"Internal server error or method-endpoint not supported",data:null}; // default response in case an unsupported endpoint is called
    res.status(status).json({success,message,data});
});

module.exports=KEY;