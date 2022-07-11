const nodemailer = require('nodemailer');
// var twilio = require('twilio');
// var client = new twilio(process.env.accountSid, process.env.authToken);

const EMAIL_CONFIG = {
    service: 'gmail',
//    host: process.env.smtp_host,
//    port: process.env.smtp_port,
    auth: {
        type:'PLAIN',
        user: process.env.adminEmailId, // generated ethereal user
        pass: process.env.adminPassword // generated ethereal password
    }
};

function sendEmail(mailOptions) {
    let transporter = nodemailer.createTransport(EMAIL_CONFIG)
    return transporter.sendMail(mailOptions);
}

/**
 * [createMailOption preparing a mail option model]
 * @param  {[type]} subject [subject of the mail]
 * @param  {[type]} html    [html content]
 * @param  {[type]} toMail  [reciever of the mail]
 * @return {[type]}         [object] 
 */
function createMailOption(subject, html, toMail) {
    let mailOptions = {
        from: process.env.adminEmailId, // sender address
        to: toMail, // list of receivers
        subject: subject, // Subject line
        text: 'Gat2Get', // plain text body
        html: html // html body
    };
    return mailOptions;
}

function value(cn) {
    return cn.replace(/\${(\w+)}/, '$1')
}

async function sending_logic(mailBodyDetails, templateDetails) {

    if (templateDetails && (Object.keys(templateDetails).length > 0)) {
        let mailBody = templateDetails.mailBody;

        let idx = mailBody.match(new RegExp(/\${\w+}/g));
        if (idx && idx.length > 0) {
            idx.map((val, id) => {
                mailBody = mailBody.replace(/\${(\w+)}/, mailBodyDetails[value(idx[id])])
                return val;
            })
        };
        let returnedValue = await createMailOption(templateDetails.mailSubject, mailBody, mailBodyDetails.emailId);
        return sendEmail(returnedValue)
    } else {
        return true;
    }
}

function SEND_MAIL(mailBodyDetails, templateDetails) {

    return sending_logic(mailBodyDetails, templateDetails)
}

function convertNotificationMessage(nameObj, body) {

    let idx = body.match(new RegExp(/\${\w+}/g));
    if (idx && idx.length > 0) {
        idx.map((val, id) => {
            body = body.replace(/\${(\w+)}/, nameObj[value(idx[id])])
            return val;
        })
    };
    return body

}
module.exports = {

    SEND_MAIL,

    convertNotificationMessage
}
