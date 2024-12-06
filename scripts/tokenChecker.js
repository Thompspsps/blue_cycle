const jwt=require("jsonwebtoken");

require("dotenv").config();
const KEY=process.env.SECRET_KEY || "another-secret-key";

const authenticateToken=async (req,res,roles,id=null)=>{
    // const authHeader = req.headers["authorization"];
    console.log(req.headers);
    const authHeader=req.headers["authorization"];
    // console.log(token);
    const token=authHeader && authHeader.split(" ")[1]; // Syntax: Bearer <token>
    //token non incluso tra gli headers
    if(!token){
        // console.log("niente token")
        res.locals.response={status:401,success:false,message:"Unauthorized",data:null};
        return false;
    }
    //else
    try{
        const payload=jwt.verify(token,KEY);
        // console.log(payload);
        if ((id!==null&&payload.id!==id&&payload.role=="user")||!roles.includes(payload.role)){
            res.locals.response={status:403,success:false,message:"Forbidden",data:null};
            return false;
        }
        return true; // Autenticazione riuscita
    }catch(err){
        // console.log(err);
        res.locals.response={status:401,success:false,message:"Unauthorized",data:null};
        // if(err instanceof jwt.TokenExpiredError)
        //     res.locals.response={status:401,success:false,message:"Expired token",data:null};
        // else
        //     res.locals.response={status:401,success:false,message:"Unauthorized",data:null};
        return false;
    }
}

// const authenticateToken = async function(req, res, roles, id = null) {
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1]; // Syntax: Bearer <token>

//     if (!token) {
//         res.locals.response = { status: 401, success: false, message: "Unauthorized", data: null };
//         return false;
//     }

//     try {
//         console.log("Token ricevuto:", token);

//         const payload = jwt.verify(token, KEY);
//         console.log("Payload decodificato:", payload);

//         if ((id !== null && payload.id !== id && payload.role === "user") || !roles.includes(payload.role)) {
//             res.locals.response = { status: 403, success: false, message: "Forbidden", data: null };
//             return false;
//         }
//         return true; // Autenticazione riuscita
//     } catch (err) {
//         console.error("Errore nella verifica del token:", err);

//         if (err instanceof jwt.TokenExpiredError) {
//             res.locals.response = { status: 401, success: false, message: "Expired token", data: null };
//         } else {
//             res.locals.response = { status: 401, success: false, message: "Unauthorized", data: null };
//         }
//         return false;
//     }
// }

module.exports={authenticateToken};


//aggiungere la possibilità che siano supportati piu' ruoli
// async function authenticateToken(req,res,roles,id=null){
//     const authHeader=req.headers["authorization"];
//     const token=authHeader && authHeader.split(' ')[1]; //syntax: Bearer token 
//     if(!token){
//         res.locals.response={status:401,success:false,message:"Unauthorized",data:null}
//         return false;
//     }else{
//         jwt.verify(token,KEY,(err,payload)=>{
//             if(err instanceof jwt.TokenExpiredError){    //token scaduto
//                 res.locals.response={status:401,success:false,message:"Expired token",data:null}
//                 return false;
//             }else if(err||(id!=null && payload.id!=id)||!roles.includes(payload.role)){
//                 res.locals.response={status:403,success:false,message:"Forbidden",data:null}
//                 return false;
//             }else
//                 return true;
//         });
//     }
// }