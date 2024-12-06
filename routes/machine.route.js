const express=require("express");
const machineRouter=express.Router();

const {
    getMachines,
    getMachineById,
    postMachine,
    patchMachineById,
    getMachineByIdTransactions,
    getUserByIdTransactionsCollected
}=require("../controllers/machine.controller");

machineRouter.get("/",getMachines);
machineRouter.get("/:id",getMachineById);
machineRouter.post("/",postMachine);
machineRouter.patch("/:id",patchMachineById);
machineRouter.get("/:id/transactions",getMachineByIdTransactions);
machineRouter.get("/:id/transactions/collected",getUserByIdTransactionsCollected);


module.exports={machineRouter};