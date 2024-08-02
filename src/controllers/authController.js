const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const { PrismaClient } = require('@prisma/client')
const { sendSMS } = require("../helpers/mailer");


const prisma = new PrismaClient()


const register = async (req,res,next) => {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
        where: {
        email: email,
        },
    });
    
    if(existingUser){
        const validCreds = bcrypt.compare(password, existingUser.password);
        if(validCreds && existingUser.email_verified){ 
            const token = jwt.sign(existingUser.user_id, process.env.JWT_SECRET);
            res.cookie("token", token);
            res.status(200).json({
                "status": "success",
                "message": "Logged in successfully!"
            });
        }else if(validCreds){
            req.id = existingUser.user_id;
            next();
        }else{
            return res.status(400).json({
                "status": "error",
                "message": "Email already in use, Please login with correct password! "
            });
        }
    }
    else{
        const salt = await bcrypt.genSalt(9);
        const hashedPass = await bcrypt.hash(password, salt);
        const user = await prisma.user.create({
            data: {
              email: email,
              name: name,
              password: hashedPass
            },
        });
        req.id = user.user_id;
        next();
    }
    
}

const login = async (req,res,next) => {
    console.log(req);
    const {email, password} = req.body;

    const existingUser = await prisma.user.findUnique({
        where: {
            email: email,
        }
    });

    if(existingUser){
        const validatCreds = await bcrypt.compare(password, existingUser.password);
        if(validatCreds && existingUser.phone_verified){
            const token = jwt.sign(existingUser.user_id, process.env.JWT_SECRET);
            res.cookie("token", token);
            res.status(200).json({
                status: "success",
                message: "Logged in Successfully!",
            });
        }
        else if(validatCreds){
            req.id = existingUser.user_id;
            next();
        }else{
            res.status(400).json({
                status: "error",
                message: "Incorrect Password!",
            });
        }
    }else{
        res.status(400).json({
            status: "error",
            message: "no user with this mail!",
        });
    }
}

const sendVerificationMail = async (req,res,next) => {
    const { userId } = req;
    const new_otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });

    const otp_expiry_time = Date.now() + 10 * 60 * 1000; // 10 Mins after otp is sent

    const user = await prisma.user.update({
        where: {
          user_id: userId,
        },
        data: {
          verification_code: new_otp,
          verification_code_expires: otp_expiry_time,
        },
      });

    console.log(new_otp);

    // TODO send mail
    mailService.sendEmail({
        from: "xyz@gmail.com",
        to: user.email,
        subject: "Verification OTP",
        html: otp(user.name, new_otp),
        attachments: [],
    });

    res.status(200).json({
        status: "success",
        message: "OTP Sent Successfully!",
    });
}



const sendVerificationSMS = async (req,res,next) => {
    const { userId } = req;
    const new_otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });

    const otp_expiry_time = Date.now() + 10 * 60 * 1000; // 10 Mins after otp is sent

    const user = await prisma.user.update({
        where: {
          user_id: userId,
        },
        data: {
          verification_code: new_otp,
          verification_code_expires: otp_expiry_time,
        },
      });

    console.log(new_otp);

    const sent = sendSMS(otp);
    if(sent){
        res.status(200).json({
            status: "success",
            message: "OTP Sent Successfully!",
        });
    }else{
        
    }
}

const verifyCode = async (req, res) => {
    // verify otp and update user accordingly
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({
        where: {
            email: email,
            verification_code: otp,
            verification_code_expires: { $gt: Date.now() },
        }
    });
  
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Email or OTP is invalid or OTP expired",
      });
    }
  
    if (user.verified) {
      return res.status(400).json({
        status: "error",
        message: "Email is already verified",
      });
    }
   
    await await prisma.user.update({
        where: {
            email: email,
        },
        data: {
            verification_code: null,
            verification_code_expires: null,
        },
    });
  
    const token = jwt.sign(existingUser.user_id, process.env.JWT_SECRET);
    res.cookie('token', token);
    res.status(200).json({
      status: "success",
      message: "OTP verified Successfully!",
      user_id: user.user_id,
    });
}

module.exports = {
    register,
    login,
    sendVerificationMail,
    sendVerificationSMS,
    verifyCode
}