// https://nodemailer.com/extras/smtp-connection/
const nodemailer=require("nodemailer");

const senderAddress="bluecycle.info@gmail.com";

const transporter=nodemailer.createTransport({
    service:"gmail",
    secure:false,
    auth:{
        user:senderAddress,
        pass:"xxnj qcjl hqqa aswy"
    }
});

module.exports={transporter,senderAddress};

