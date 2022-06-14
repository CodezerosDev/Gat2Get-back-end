const mongoose = require('mongoose')
const constants = require('../../constants')

const Schema = mongoose.Schema({

    type: { type: String, enum: [constants.LANGUAGES.ENGLISH, constants.LANGUAGES.SPANISH, constants.LANGUAGES.PORTUGUESE] },
    name: { type: String, required: true },
    status: { type: String, enum: [constants.STATUS.ACTIVE, constants.STATUS.INACTIVE], default: constants.STATUS.ACTIVE },
    createdAt: { type: Number },
    createdBy: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
    editedAt: { type: Number },
    editedBy: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
}, {
    versionKey: false,
    timeStamp: true,
    strict: true
})

module.exports = mongoose.model(constants.DB_MODEL_REF.LANGUAGES, Schema);
