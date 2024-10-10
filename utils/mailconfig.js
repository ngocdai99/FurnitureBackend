const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: 'ngocdaibui99@gmail.com',
      pass: 'pnixsnnqnewbaurm'
    },
   
    
  });

module.exports = { transporter };
