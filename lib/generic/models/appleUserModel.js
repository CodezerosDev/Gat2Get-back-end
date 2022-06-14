const mongoose = require('mongoose')
const constants = require('../../constants')
const appUtil = require('../../appUtils')

const Schema = mongoose.Schema({

    firstName: { type: String },
    lastName: { type: String },
    emailId: { type: String },
    appleId: { type: String }
}, {
    versionKey: false,
    timeStamp: true,
    strict: true
})

module.exports = mongoose.model(constants.DB_MODEL_REF.APPLE_USER, Schema);