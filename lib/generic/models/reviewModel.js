const mongoose = require('mongoose')
const constants = require('../../constants')

const Schema = mongoose.Schema({
    ratings: { type: Number },
    ratingsBy: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
    review: { type: String },
    propertyId: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.ACCOMODATION },
    createdAt: { type: Number },
    createdBy: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
    editedAt: { type: Number },
    editedBy: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
}, {
    versionKey: false,
    timeStamp: true,
    strict: true
})

module.exports = mongoose.model(constants.DB_MODEL_REF.REVIEW, Schema);