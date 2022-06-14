const mongoose = require("mongoose");
const constants = require('../../constants');
var Schema = mongoose.Schema;

var schema = new Schema({
    propertyId: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.ACCOMODATION },
    propertyType: { type: String },
    userId: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
    fromDate: { type: Number },
    toDate: { type: Number },
    categoryId: [{ type: mongoose.Types.ObjectId }],
    basePrice: { type: Number },
    price: { type: Number },
    taxes: { type: Number },
    taxRate: { type: Number },
    chargeId: { type: String },
    refundId: { type: String },
    receiptUrl: { type: String },
    payStatus: { type: String },
    reason: { type: String },
    status: {
        type: String,
        enum: [constants.BOOKINGSTATUS.APPROVED, constants.BOOKINGSTATUS.REQUESTED, constants.BOOKINGSTATUS.REJECTED, constants.BOOKINGSTATUS.CANCELLED, constants.BOOKINGSTATUS.COMPLETED, constants.BOOKINGSTATUS.PAYMENT_RELEASED, constants.BOOKINGSTATUS.PAYMENT_REFUNDED, constants.BOOKINGSTATUS.REQUEST_EXPIRED],
        default: constants.BOOKINGSTATUS.REQUESTED
    },
    cardNumber: { type: String },
    cardBrand: { type: String },
    nameOnCard: { type: String },
    createdAt: { type: Number },
}, {
    strict: true,
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model(constants.DB_MODEL_REF.BOOKING, schema);