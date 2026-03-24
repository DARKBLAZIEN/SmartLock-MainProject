const nodemailer = require("nodemailer");
require("dotenv").config({ path: __dirname + "/backend/.env" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("Testing with User:", process.env.EMAIL_USER);
console.log("Testing with Pass:", process.env.EMAIL_PASS ? "****" + process.env.EMAIL_PASS.slice(-4) : "MISSING");

transporter.verify(function (error, success) {
  if (error) {
    console.error("Nodemailer Verification Error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
