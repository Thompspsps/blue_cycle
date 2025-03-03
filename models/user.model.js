//to do:
//aggiungere l'hash della password con bcrypt
//aggiungere la validazione dell'indirizzo email
// aggiungere un controllo in pre(findOneAndUpdate) se la password è stata cambiata

const {Schema,model}=require("mongoose");
const bcrypt=require("bcrypt");
require("dotenv").config();

const fixedLength=10; // all codes have fixed length
const saltRounds=parseInt(process.env.SALT_ROUNDS)||10;

const userSchema=Schema(
    {
        code:{
            type: String,
            unique: true,
            required: true,
            default:codeGenerator(fixedLength)
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
            type: String,
            required:true,
            trim:true,
            default:()=>Math.random().toString(36).slice(-10) // senza la funzione freccia, ad ogni utente viene assegnata la stessa password
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
    // if(this.isModified("password"))
        await bcrypt.hash(this.password,saltRounds).then((hashedpassword)=>this.password=hashedpassword);

    // the new user hasn't been created yet
    while(await User.findOne({code:this.code})){
        // generate a new code
        this.code=codeGenerator(fixedLength); 
    }
    next();
});

userSchema.pre("findOneAndUpdate",async function(next){
    // controllo
    //     await bcrypt.hash(this.password,saltRounds).then((hashedpassword)=>this.password=hashedpassword);
    // next();
    try{
        const updatedObj=this.getUpdate(); // ottieniene l'oggetto di aggiornamento
        // console.log(updatedObj);
        if(updatedObj.password)
            await bcrypt.hash(updatedObj.password,saltRounds).then((hashedpassword)=>updatedObj.password=hashedpassword);
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