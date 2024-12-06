//to run the application type: npm run env
const moment=require("moment");     //package per la gestione delle date (eliminabile)

const express=require("express");
const app=express();
//middleware
app.use(express.json());
app.use(express.urlencoded({extended:true})); //false
app.use((req,res,next)=>{
    console.log("Request received at: ",req.method," ",req.url,"from ",req.hostname," (",moment(new Date()).format("DD-MM-YYYY  hh:mm:ss"),")");
    next();
});

const cors=require("cors");
app.use(cors());

//routes
const {userRouter,machineRouter,couponPrototypeRouter,transactionRouter}=require("./routes/bc.routes");
app.use("/api/v1/users",(req,res,next)=>{console.log(".../users router");next();},userRouter);
app.use("/api/v1/machines",(req,res,next)=>{console.log(".../machines router");next();},machineRouter);
app.use("/api/v1/couponPrototypes",(req,res,next)=>{console.log(".../couponPrototypes router");next();},couponPrototypeRouter);
app.use("/api/v1/transactions",(req,res,next)=>{console.log(".../transactions router");next();},transactionRouter);


//mongoose
const mongoose=require("mongoose");
const {User,Admin}=require("./models/bc.models");

//dotenv
require("dotenv").config();
const DB=process.env.DB_URI;
const PORT=process.env.SERVER_PORT || 3000;

//jsonwebtoken
const jwt=require("jsonwebtoken");
const KEY=process.env.SECRET_KEY || "another-secret-key";


//connessione al database e avvio di express
mongoose.connect(DB)
.then(()=>{
    console.log("Connected to mongoDB Cloud");
    app.listen(PORT,()=>console.log("Server is running on port ",PORT));
})
.catch((err)=>{
    console.log("Could not connect to mongoDB Cloud\n",err);
});



//autenticazione tramite credenziali e creazione dei token
app.post("/api/v1/userAuth",async (req,res,next)=>{
    try{    //take the parameter email as providedEmail
        const {email:providedEmail,password:providedPassword}=req.body;
        if(!providedEmail||!providedPassword)
            res.locals.response={status:400,success:false,message:"Bad request",data:null};
        else{
            const user=await User.findOne({email:providedEmail});
            if(!user)
                res.locals.response={status:404,success:false,message:"Not found",data:null};
            else{
                if(user.password!=providedPassword)
                    res.locals.response={status:400,success:false,message:"Bad request",data:null};
                else{
                    const token=jwt.sign({id:user.id,role:"user"},KEY,{/*algorithm:"HS512",*/expiresIn:"1h"}); //->token con 1h di validità
                    res.locals.response={status:200,success:true,message:"Authentication successfull",data:{self:"/api/v1/users/"+user._id,token:token}};
                }
            }
        }
    }catch(err){    //server error
        console.log(err);
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
                if(admin.password!=providedPassword)
                    res.locals.response={status:400,success:false,message:"Bad request",data:null};
                else{
                    const token=jwt.sign({id:admin.id,role:"admin"},KEY,{/*algorithm:"HS512",*/expiresIn:"1d"}); //->token con 1 giorno di validità
                    res.locals.response={status:200,success:true,message:"Authentication successfull",data:{self:"/api/v1/admins/"+admin._id,token:token}};
                }
            }
        }
    }catch(err){    //server error
        console.log(err)
        res.locals.response={status:500,success:false,message:"Internal server error",data:null};
    }
    next();
});

//middleware gestire in maniera centralizzata le risposte ottenibili in 
//fase di controllo della richiesta (e per l'invio della risposta)
app.use((req,res)=>{
    const {status,success,message,data}=res.locals.response||{status:500,success:false,message:"Internal server error or method-endpoint not supported",data:null}; //da tenere nel caso non si siano coperti tutti i casi delle richieste
    res.status(status).json({success,message,data});
});