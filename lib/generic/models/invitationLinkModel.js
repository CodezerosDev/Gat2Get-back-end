/**
 * @author Kavya Patel
 */

/*#################################            Load modules start            ########################################### */

const constants = require('../../constants')
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

/*#################################            Load modules end            ########################################### */

let invitationLink = new Schema({

    type: {
        type: String,
        enum: [constants.INVITATION_LINK_TYPES.WEB, constants.INVITATION_LINK_TYPES.ANDROID, constants.INVITATION_LINK_TYPES.IOS],
        required: true
    },
    URL: { type: String, required: true },
    createdAt: { type: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
    editedAt: { type: Number },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
    status: { type: String, enum: [constants.STATUS.ACTIVE, constants.STATUS.INACTIVE], default: constants.STATUS.ACTIVE }

}, {
    strict: false,
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model(constants.DB_MODEL_REF.INVITATION_LINKS, invitationLink);
