const FCM = require('fcm-push');

const serverKey = process.env.fcm_server_key || "";
const fcm = new FCM(serverKey);

function sendMessage(to, title, msg, type, refId) {

    return new Promise((resolve, reject) => {

        let message = {
            to: to,
            notification: {
                title: title,
                body: msg,
                type: type,
                refId: refId
            },
            data: {
                title: title,
                body: msg,
                type: type,
                refId: refId
            }
        }
        fcm.send(message, (err, response) => {

            if (err) {
                console.log({ err });
                // reject(false)
            } else {
                console.log("Successfully sent with response: ", response);
                // resolve(true)
            }
        })
    })
    // send(message)
}

module.exports = { sendMessage }
