const {Schema,model}=require("mongoose");
// const {customAlphabet}=require("nanoid");

// dynamic import per nanoid
// let customAlphabet;
// (async()=>{
//     const nanoidModule=await import("nanoid");
//     customAlphabet=nanoidModule.customAlphabet;
// })();

// const { customAlphabet } = require('nanoid');

const nanoid=require("nanoid");

const alphabet="0123456789";
const fixedLength=10; // all codes must have fixed length

const bcrypt=require("bcrypt");
require("dotenv").config();
const saltRounds=parseInt(process.env.SALT_ROUNDS)||10;

const passwordSchema=new Schema({
    content: {
        type: String,
        required: true,
        default:()=>Math.random().toString(36).slice(-10), // senza la funzione freccia, ad ogni utente viene assegnata la stessa password
        trim:true
    },
    temporary: {
        type: Boolean
    }
});

const generateCode=()=>{
    let code='';
    for(let i=0;i<fixedLength;i++)
        code += Math.floor(Math.random()*10); // Aggiunge una cifra da 0 a 9
    return code;
}

const userSchema=Schema(
    {
        code:{
            type: String,
            unique: true,
            required: true,
            // default:codeGenerator(fixedLength)
            // default:()=>customAlphabet(alphabet,fixedLength)()
            default: generateCode 
        },
        email:{
            type: String,
            required: true,
            unique: true,
            trim:true
        },
        name:{
            type: String,
            required: true,
            trim:true
        },
        password:{
            type: passwordSchema,
            // type: String,
            required:true,
        },
        points:{
            type: Number,
            required: true,
            default: 0,
            minimum: 0
        }
    }
);

// middleware to ensure that no other user has the same code(!!! naive !!!) <-- i don't like it
userSchema.pre("save",async function(next){
    try{
        // if(this.isModified("password"))
        await bcrypt.hash(this.password.content,saltRounds).then((hashedpassword)=>this.password.content=hashedpassword);
        this.password.temporary=true
        // rimuovere quello che c'è qui sotto

        // the new user hasn't been created yet
        while(await User.findOne({code:this.code})){
            // generate a new code
            // this.code=codeGenerator(fixedLength); 
            // this.code=customAlphabet(alphabet,fixedLength)();
            this.code=generateCode();
        }
        next();
    }catch(err){
        throw err;
    }
});


// middleware to hash the password when changed
userSchema.pre("findOneAndUpdate",async function(next){
    // controllo
    //     await bcrypt.hash(this.password,saltRounds).then((hashedpassword)=>this.password=hashedpassword);
    // next();
    try{
        const updatedObj=this.getUpdate(); // ottieniene l'oggetto di aggiornamento
        // console.log(updatedObj);
        if(updatedObj.password)
            await bcrypt.hash(updatedObj.password.content,saltRounds).then((hashedpassword)=>updatedObj.password.content=hashedpassword);
        // if(updatedObj.$set && updatedObj.$set.password){
        //     const hashedPassword=await bcrypt.hash(updatedObj.$set.password,saltRounds);
        //     this.set({password:hashedPassword});
        // }
        next();
    }catch(err){
        next(err);
    }
});

const User=model("User",userSchema);

//si potrebbero risolvere i problemi di conflitto se si usasse un 
//code incrementale(aggiungengo a sinistra una di 0 tanti quanti 
//sono quelli necessari a raggiungere la lunghezza desiderata)
//(non so se esiste nativamente in mongoDB)
// --> problema di collisioni
function codeGenerator(length){
    let id=Math.floor(Math.random()*Math.pow(10,length)).toString();
    return id.padStart(length,"0");
}

module.exports={User};