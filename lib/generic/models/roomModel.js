const mongoose = require('mongoose')
const constants = require('../../constants')

const roomSchema = mongoose.Schema({
    participateId1: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
    participateId2: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
    data: [{
        senderId: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
        receiverId: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
        message: { type: String },
        type: { type: String, enum: [constants.CHATTYPE.TEXT, constants.CHATTYPE.EMOJI, constants.CHATTYPE.FILE], default: constants.CHATTYPE.TEXT },
        time: { type: Number, default: Date.now }
    }],
    status: { type: String, enum: [constants.ROOMSTATUS.GROUP, constants.ROOMSTATUS.ONE2ONE], default: constants.ROOMSTATUS.ONE2ONE },
    lastMessageTime: { type: Number }
}, {
    versionKey: false,
    timeStamp: true,
    strict: true
})

module.exports = mongoose.model(constants.DB_MODEL_REF.ROOMS, roomSchema);