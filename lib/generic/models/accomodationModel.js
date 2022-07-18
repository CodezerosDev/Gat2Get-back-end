const mongoose = require('mongoose')
const constants = require('../../constants')

const Schema = mongoose.Schema({
    // type: { type: String, enum: [constants.ACCOMODATIONS.HOME_OFFICE, constants.ACCOMODATIONS.WORKPLACE] },
    type: { type: String },
    name: {
        en: { type: String },
        pt: { type: String },
        es: { type: String }
    },
    spaceAvailability: {
        spaceCycle: { type: String, enum: [constants.SPACEAVAILABILITY.HOURLY, constants.SPACEAVAILABILITY.DAILY, constants.SPACEAVAILABILITY.MONTHLY] },
        hours: []
    },
    checkIn: { type: String },
    checkOut: { type: String },
    spaceReadyIn: { type: Number },
    generalRules: {
        en: { type: String },
        pt: { type: String },
        es: { type: String }
    },
    cancellationPolicy: {
        en: {
            data: { type: String },
            doc_url: { type: String }
        },
        pt: {
            data: { type: String },
            doc_url: { type: String }
        },
        es: {
            data: { type: String },
            doc_url: { type: String }
        }
    },
    categoryId: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.CATEGORIES },
    price: [{
        name: { type: String },
        rate: { type: Number },
        guestCapacity: { type: Number }
    }],
    quantity: { type: Number },
    address: {
        country: { type: String },
        state: { type: String },
        streetAddress: { type: String },
        flat: { type: String },
        city: { type: String },
        postcode: { type: String },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: [Number],
        },
    },
    amenities: [{
        amtId: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.AMENITIES },
        name: { type: String },
        amt: []
    }],
    description: {
        en: { type: String },
        pt: { type: String },
        es: { type: String }
    },
    media: [],
    visited: { type: Number },
    lockedDates: [{
        startDate: { type: Number },
        endDate: { type: Number }
    }],
    landlord: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
    status: { type: String, enum: [constants.STATUS.ACTIVE, constants.STATUS.INACTIVE], default: constants.STATUS.ACTIVE },
    isVerified: { type: Boolean },
    createdAt: { type: Number },
    createdBy: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
    editedAt: { type: Number },
    editedBy: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER }
}, {
    versionKey: false,
    timeStamp: true,
    strict: true
})
Schema.index({location: "2dsphere" });
module.exports = mongoose.model(constants.DB_MODEL_REF.ACCOMODATION, Schema);