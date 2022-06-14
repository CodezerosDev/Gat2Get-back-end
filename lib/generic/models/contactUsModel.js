const mongoose = require('mongoose')
const constants = require('../../constants')

const Schema = mongoose.Schema({
    ticketNo: { type: String },
    name: { type: String },
    emailId: { type: String },
    contactNumber: { type: String },
    message: { type: String },
    createdAt: { type: Number },
    status: { type: String, enum: [constants.CONTACTUSSTATUS.OPEN, constants.CONTACTUSSTATUS.CLOSE], default: constants.CONTACTUSSTATUS.OPEN },
    reply: { type: String }
}, {
    versionKey: false,
    timeStamp: true,
    strict: true
})

module.exports = mongoose.model(constants.DB_MODEL_REF.CONTACTUS, Schema);
