const {Schema,model}=require("mongoose");

const transactionSchema=Schema(
    {
        user:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        machine:{
            type: Schema.Types.ObjectId,
            ref: "Machine",
            required: true
        },
        date:{
            type: Number,
            required: true,
            default: Math.trunc(Date.now()/1000)
        },
        collected:{
            type: Number,
            required:true
        }
    }
);

const Transaction=model("Transaction",transactionSchema);

module.exports={Transaction};