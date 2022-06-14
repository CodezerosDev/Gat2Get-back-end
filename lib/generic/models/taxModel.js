const mongoose = require('mongoose')
const constants = require('../../constants')

const Schema = mongoose.Schema({

    type: { type: String, required: true, enum: [constants.TAX_TYPES.COUNTRY, constants.TAX_TYPES.STATE] },
    country: { type: String, required: true },
    stateTaxes: [{

        state: { type: String },
        rate: { type: Number }
    }],
    // state: {
    //     type: String, required: () => {
    //         return (this.type == constants.TAX_TYPES.STATE) ? true : false
    //     }
    // },
    rate: { type: String },
    createdAt: { type: Number },
    createdBy: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
    editedAt: { type: Number },
    editedBy: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER }

}, {
    versionKey: false,
    timeStamp: true,
    strict: true
})

// module.exports = mongoose.model(constants.DB_MODEL_REF.USER, Schema);


module.exports = mongoose.model(constants.DB_MODEL_REF.TAX, Schema);
