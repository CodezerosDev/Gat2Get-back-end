/**
 * @author Kavya Patel
 */

/*#################################            Load modules start            ########################################### */

const mongoose = require("mongoose");
const constants = require('../../constants');
var Schema = mongoose.Schema;

/*#################################            Load modules end            ########################################### */

var schema = new Schema({

    // type: { type: String, enum: [constants.ACCOMODATIONS.WORKPLACE, constants.ACCOMODATIONS.HOME_OFFICE] },
    type: { type: String },
    name: { type: String, required: true },
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

module.exports = mongoose.model(constants.DB_MODEL_REF.CATEGORIES, schema);