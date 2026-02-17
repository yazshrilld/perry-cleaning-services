import { getters } from "../config";
import fs from "fs";
import path from "path";
// import { parseString } from "xml2js";
import { replaceVariables } from "./helpers";
import { logger } from "netwrap";
import nodemailer from "nodemailer";
//import { notificationsModel } from "../models";



// Create reusable transporter object
const transporter = nodemailer.createTransport({
  host: getters.getAppMailers().server,
  port: 465,
  secure: true,
  auth: {
    user: getters.getAppMailers().username,
    pass: getters.getAppMailers().password,
  },
  tls: {
    rejectUnauthorized: false, // Set to true in production with valid certificate
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    logger(`Server is currently unable to accept mail processing requests ${error}`, {
      isError: true,
    });
  } else {
    logger(`${success} --- Server is ready to accept mail processing`);
  }
});




const sendEmail = async (mailConfigs: any) => {
  try {
    const variables: any = {
      content: mailConfigs.html,
      getFullYear: new Date().getFullYear(),
    };
    const source = fs.readFileSync(
      path.join("src/templates/email", mailConfigs.template+".hbs"),
      "utf8",
    );
    ////console.log(source)
    // Replace variables in the template body
    const emailHtmlPayload = await replaceVariables(source, variables);

    const emailPayload = {
      html: emailHtmlPayload,
      subject: mailConfigs.subject,
      to: mailConfigs.to,
      cc: mailConfigs.cc,
      bcc: mailConfigs.bcc,
      from: `"${getters.getAppMailers().mailSentFrom}" <${getters.getAppMailers().mailSentFrom}>`,
    };

    // Call SendMailV2 function to send the email
    // const result = await SendMailV2(emailPayload);
    // Convert recipients to array if they're strings
    const toRecipients = Array.isArray(emailPayload.to)
      ? emailPayload.to
      : [emailPayload.to];

    // Send to primary recipients
    const primaryMailOptions = {
      ...emailPayload,
      to: toRecipients.join(", "),
      cc: emailPayload.cc
        ? Array.isArray(emailPayload.cc)
          ? emailPayload.cc.join(", ")
          : emailPayload.cc
        : undefined,
      bcc: emailPayload.bcc
        ? Array.isArray(emailPayload.bcc)
          ? emailPayload.bcc.join(", ")
          : emailPayload.bcc
        : undefined,
    };

    const info = await transporter.sendMail(primaryMailOptions);


    // Handle the result from SendMailV2
    if (info) {
      // if (mailConfigs.requestId) {
      //   await notificationsModel.updateNotificationsById2(
      //     mailConfigs.requestId,
      //     {
      //       status: "sent",
      //       isActive: false,
      //     },
      //   );
      // }
      console.log("Email sent successfully!");
      return true;
    } else {
      console.log("Failed to send email:", info);
      return false;
    }
  } catch (error) {
    console.error("Error sending mail:", error);
    return false;
    // Handle any errors that occur during the API request
    // throw error;
  }
};
export { sendEmail };



//  {
//    {
//      content;
//    }
//  }

//   <img src="https://internopay.app/images/logo.png" width="200" height="100" alt="Internopay" border="0" style="height: auto;  font-family: sans-serif; font-size: 15px; line-height: 15px; color: #555555;">