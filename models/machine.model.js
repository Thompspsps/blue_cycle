const {Schema,model}=require("mongoose");

const positionSchema=new Schema({
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    }
});

const machineSchema=Schema(
    {
        position:{
            type: positionSchema,
            required: true
        },
        available:{
            type: Boolean,
            required: true
        },
        description:{
            type: String,
            trim:true
        }
    }
);

const Machine=model("Machine",machineSchema);

module.exports={Machine};