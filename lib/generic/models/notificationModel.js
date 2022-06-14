/**
 * @author Kavya Patel
 */

/*#################################            Load modules start            ########################################### */

const mongoose = require("mongoose");
const constants = require('../../constants');
let Schema = mongoose.Schema;

/*#################################            Load modules end            ########################################### */

let schema = new Schema({

    notificationType: { type: mongoose.Schema.Types.ObjectId, ref: constants.DB_MODEL_REF.EMAILTEMPLATES },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
    senderDetails: { type: Object },
    isRead: { type: Boolean, default: false },

    createdAt: { type: Number },

    editedAt: { type: Number },
    categoryType: { type: String, enums: [constants.NOTIFICATION_CATEGORIES.CHAT, constants.NOTIFICATION_CATEGORIES.ACCOMODATION, constants.NOTIFICATION_CATEGORIES.BOOKING_APPROVED, constants.NOTIFICATION_CATEGORIES.BOOKING_REJECTED, constants.NOTIFICATION_CATEGORIES.BOOKING_REQUESTED, constants.NOTIFICATION_CATEGORIES.REVIEW_RATINGS] },
    refId: { type: mongoose.Schema.Types.ObjectId },
    status: {
        type: String,
        enum: [constants.STATUS.ACTIVE, constants.STATUS.INACTIVE],
        default: constants.STATUS.ACTIVE
    },

    message: {
        en: { type: String },
        pt: { type: String },
        es: { type: String }
    }
}, {
    strict: true,
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model(constants.DB_MODEL_REF.NOTIFICATIONS, schema);