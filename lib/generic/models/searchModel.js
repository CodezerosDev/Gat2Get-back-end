const mongoose = require('mongoose')
const constants = require('../../constants')

const Schema = mongoose.Schema({
    searchCity: { type: String },
    searchCount: { type: Number }
}, {
    versionKey: false,
    timeStamp: true,
    strict: true
})

module.exports = mongoose.model(constants.DB_MODEL_REF.SEARCHES, Schema);