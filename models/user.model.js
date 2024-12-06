const {Schema,model}=require("mongoose");

const userSchema=Schema(
    {
        code:{
            type: String,
            default: Math.floor(Math.random() * 10000000000).toString(),
            unique: true,
            required: true
        },
        email:{
            type: String,
            required: true,
            unique: true
        },
        name:{
            type: String,
            required: true
        },
        password:{
            type: String,
            required: true,
            // default: Math.random().toString(36).slice(-10) //genera una stringa random di 10 caratteri
            default: codeGenerator(10)
        },
        points:{
            type: Number,
            required: true,
            default: 0,
            minimum: 0
        }
    }
);

const User=model("User",userSchema);

//si potrebbero risolvere i problemi di conflitto se si usasse un 
//code incrementale(aggiungengo a sinistra una di 0 tanti quanti 
//sono quelli necessari a raggiungere la lunghezza desiderata)
//(non so se esiste nativamente in mongoDB)
function codeGenerator(length){
    let id=Math.floor(Math.random()*Math.pow(10,length)).toString();
    return id.padStart(length,"0");
}

userSchema.pre("save",async (next)=>{
    if(!this.code){
        let unique=false;
        while(!unique){
            //genera una stringa di 10 cifre
            const newCode=codeGenerator(10);
            const existing=await User.findOne({code:newCode});
            if(!existing){
                this.code=newCode;
                unique=true;
                // console.log(newCode);
            }
        }
    }
    next();
});

module.exports={User};