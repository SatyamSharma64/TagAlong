const sgMail = require("@sendgrid/mail");

// const Mailgun = require('mailgun-js');
const { SinchClient} = require("@sinch/sdk-core");

sgMail.setApiKey(process.env.SG_KEY);

const sendSGMail = async ({
  to,
  sender,
  subject,
  html,
  attachments,
  text,
}) => {
  try {
    const from = "satyamkailashsharma@gmail.com";

    const msg = {
      to: to, // Change to your recipient
      from: from, // Change to your verified sender
      subject: subject,
      html: html,
      // text: text,
      attachments,
    };

    
    return sgMail.send(msg);
  } catch (error) {
    console.log(error);
  }
};

const sendSMS = async ({userNumber, otp}) => {
    try{
        const sinchClient = new SinchClient({
            projectId: "2d7d1907-66d8-4d72-8f09-13c2b339c580",
            keyId: "eae63fca-6eff-4c41-b979-1a714f44cd10",
            keySecret: "POfcfZ9.5woDZhz.3daDQA7kS5"
        });
        const response = await sinchClient.sms.batches.send({
            sendSMSRequestBody: {
                to: [
                    userNumber
                ],
                from: "+447520650984",
                body: `your companion verification code is ${otp}`
            }
        });

        console.log(JSON.stringify(response));
        return true;
    }catch(error) {
        console.log(error);
    }
}



exports.sendEmail = async (args) => {
  if (!process.env.NODE_ENV === "development") {
    return Promise.resolve();
  } else {
    return sendSGMail(args);
  }
};


exports.sendSMS = async (args) => {
    if (!process.env.NODE_ENV === "development") {
      return Promise.resolve();
    } else {
      return sendSMS(args);
    }
};