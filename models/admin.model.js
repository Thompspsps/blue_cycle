const {Schema,model}=require("mongoose");
const bcrypt=require("bcrypt");
require("dotenv").config();

const saltRounds=parseInt(process.env.SALT_ROUNDS)||10;

const adminSchema=Schema(
    {
        email:{
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password:{
            type: String,
            required: true
        }
    }
);

adminSchema.pre("save",async function(next){
    await bcrypt.hash(this.password,saltRounds).then((haschedpassword)=>this.password=haschedpassword);
    next();
});

const Admin=model("Admin",adminSchema);

module.exports={Admin};