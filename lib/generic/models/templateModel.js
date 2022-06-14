/**
 * @author Kavya Patel
 */

/*#################################            Load modules start            ########################################### */

const mongoose = require("mongoose");
const constants = require('../../constants');
var Schema = mongoose.Schema;

/*#################################            Load modules end            ########################################### */

var schema = new Schema({

    type: { type: String, enum: [constants.TEMPLATE_TYPES.EMAIL, constants.TEMPLATE_TYPES.NOTIFICATION] },
    mailName: {
        type: String,
        required: true
    },
    mailTitle: {
        type: String,
        required: function () {
            return (this.type == constants.TEMPLATE_TYPES.EMAIL) ? true : false
        }
    },
    mailBody: {
        type: String,
        required: function () {
            return (this.type == constants.TEMPLATE_TYPES.EMAIL) ? true : false
        }
    },
    mailSubject: {
        type: String,
        required: function () {
            return (this.type == constants.TEMPLATE_TYPES.EMAIL) ? true : false
        }
    },
    notificationMessage: {
        en: { type: String },
        pt: { type: String },
        es: { type: String }
    },
    createdAt: { type: Number },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: constants.DB_MODEL_REF.USER
    },
    editedAt: { type: Number },
    editedBy: {
        type: mongoose.Types.ObjectId,
        ref: constants.DB_MODEL_REF.USER
    },
    status: {
        type: String,
        enum: [constants.STATUS.ACTIVE, constants.STATUS.INACTIVE],
        default: constants.STATUS.ACTIVE
    },
}, {
    strict: true,
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model(constants.DB_MODEL_REF.EMAILTEMPLATES, schema);