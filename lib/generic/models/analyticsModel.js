const mongoose = require('mongoose')
const constants = require('../../constants')

const Schema = mongoose.Schema({

    type: { type: String, enum: [constants.ANALYTICS.USER, constants.ANALYTICS.LANDLORD, constants.ANALYTICS.BOOKING] },
    qty: { type: Number, default: 0 },
    month: { type: String },
    year: { type: String }
}, {
    versionKey: false,
    timeStamp: false,
    strict: true
})

module.exports = mongoose.model(constants.DB_MODEL_REF.ANALYTICS, Schema);
