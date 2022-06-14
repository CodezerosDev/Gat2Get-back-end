const mongoose = require('mongoose')
const constants = require('../../constants')

const Schema = mongoose.Schema({

    type: { type: String, enum: [constants.CMS.TERMSANDCONDITIONS, constants.CMS.PRIVACYPOLICY, constants.CMS.ABOUTUS, constants.CMS.HOWWEWORK, constants.CMS.TRUSTANDSAFETY, constants.CMS.CANCELLATIONPOLICY] },
    title: { type: String },
    description: { type: String },
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

module.exports = mongoose.model(constants.DB_MODEL_REF.CMS_PAGES, Schema);
