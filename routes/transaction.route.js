const express=require("express");
const transactionRouter=express.Router();

const{
    postTransaction
}=require("../controllers/transaction.controller");

transactionRouter.post("/",postTransaction);

module.exports={transactionRouter};