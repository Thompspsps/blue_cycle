const express=require("express");
const cors=require("cors");
const moment=require("moment");
const swaggerUi=require("swagger-ui-express");

const swaggerDocument=require("./swagger/api_doc.json");

const authController = require("./controllers/auth.controller");
const resetPassword = require("./controllers/password.controller");

// function createServer(){
//     const app=express();
//     app.use(cors());
//     app.use(express.json());
//     app.use(express.urlencoded({extended:true})); //false

//     app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
//     app.use((req,res,next)=>{
//         console.log("Request received at: ",req.method," ",req.url,"from ",req.hostname," (",moment(new Date()).format("DD-MM-YYYY  hh:mm:ss"),")");
//         next();
//     });

//     const {userRouter,machineRouter,couponPrototypeRouter,transactionRouter}=require("./routes/bc.routes");
//     app.use("/api/v1/users",(req,res,next)=>{console.log(".../users router");next();},userRouter);
//     app.use("/api/v1/machines",(req,res,next)=>{console.log(".../machines router");next();},machineRouter);
//     app.use("/api/v1/couponPrototypes",(req,res,next)=>{console.log(".../couponPrototypes router");next();},couponPrototypeRouter);
//     app.use("/api/v1/transactions",(req,res,next)=>{console.log(".../transactions router");next();},transactionRouter);

//     app.post("/api/v1/userAuth",authController.userAuth);
//     app.post("/api/v1/adminAuth",authController.adminAuth);
//     app.post("/api/v1/forgotPassword",passwordController.resetPassword);

//     // final middleware to centrally manage the response obtained from the previous middleware and send it to the client 
//     app.use((req,res)=>{
//         const {status,success,message,data}=res.locals.response||{status:500,success:false,message:"Internal server error or method-endpoint not supported",data:null}; // default response in case an unsupported endpoint is called
//         res.status(status).json({success,message,data});
//     });

//     return app;
// }


// module.exports=createServer;

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true})); //false

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use((req,res,next)=>{
    console.log("Request received at: ",req.method," ",req.url,"from ",req.hostname," (",moment(new Date()).format("DD-MM-YYYY  hh:mm:ss"),")");
    next();
});

const {userRouter,machineRouter,couponPrototypeRouter,transactionRouter}=require("./routes/bc.routes");
app.use("/api/v1/users",(req,res,next)=>{console.log(".../users router");next();},userRouter);
app.use("/api/v1/machines",(req,res,next)=>{console.log(".../machines router");next();},machineRouter);
app.use("/api/v1/couponPrototypes",(req,res,next)=>{console.log(".../couponPrototypes router");next();},couponPrototypeRouter);
app.use("/api/v1/transactions",(req,res,next)=>{console.log(".../transactions router");next();},transactionRouter);

app.post("/api/v1/userAuth",authController.userAuth);
app.post("/api/v1/adminAuth",authController.adminAuth);
app.post("/api/v1/forgotPassword",resetPassword);
app.get("/",(req,res,next)=>{
    res.locals.response={status:200,success:true,message:"I'm alive!",data:null};
    next();
});

// final middleware to centrally manage the response obtained from the previous middleware and send it to the client 
app.use((req,res)=>{
    const {status,success,message,data}=res.locals.response||{status:500,success:false,message:"Internal server error or method-endpoint not supported",data:null}; // default response in case an unsupported endpoint is called
    res.status(status).json({success,message,data});
});

module.exports=app;