const mongoose = require('mongoose')
const constants = require('../../constants')
const appUtil = require('../../appUtils')

const Schema = mongoose.Schema({

    firstName: { type: String },
    lastName: { type: String },
    emailId: { type: String },
    contactNumber: { type: String },
    password: { type: String },
    role: { type: String, enum: [constants.ROLE.USER, constants.ROLE.ADMIN, constants.ROLE.LANDLORD], default: constants.ROLE.USER },
    verificationCode: { type: String },
    isCodeVerified: { type: Boolean, default: false },
    profilePicture: { type: String, default: 'https://res.cloudinary.com/dizkwji5k/image/upload/v1561362114/nbgeugd7hviq8kgjuacr.jpg' },
    document: [{
        doc_url: { type: String },
        isKYCVerified: { type: Boolean }
    }],
    socialId: { type: String },
    loginType: { type: String, enum: ["Google", "Facebook", "Local"], default: "Local" },
    cardDetails: [{
        cardNumber: { type: String },
        expirationMonth: { type: String },
        expirationYear: { type: String },
        nameOnCard: { type: String },
        isPrimary: { type: Boolean, default: false }
    }],
    isAccountVerified: { type: Boolean },
    status: { type: String, enum: [constants.STATUS.ACTIVE, constants.STATUS.INACTIVE], default: constants.STATUS.ACTIVE },
    createdAt: { type: Number },
    createdBy: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
    editedAt: { type: Number },
    editedBy: { type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.USER },
    isLoggedOut: { type: Boolean, default: false },
    favourites: [{ type: mongoose.Types.ObjectId, ref: constants.DB_MODEL_REF.ACCOMODATION }],
    isRegister: { type: Boolean, default: false },
    serviceFee: { type: String },
    accomodations: { type: Number, default: 0 },
    deviceId: { type: String },
    fcmToken: { type: String },
    accountId: { type: String },
    stripeAccountDetails: { type: Object },
    roleChangedAt: { type: Number }
}, {
    versionKey: false,
    timeStamp: true,
    strict: true
})

// module.exports = mongoose.model(constants.DB_MODEL_REF.USER, Schema);


User = module.exports = mongoose.model(constants.DB_MODEL_REF.USER, Schema);

createAdmin()
async function createAdmin() {
    let mongo = {
        dbName: process.env.dbName,
        dbUrl: process.env.dbUrl
    }

    let dbUrl = mongo.dbUrl + mongo.dbName;
    mongoose.connect(dbUrl, (err, success) => {
        if (err) {
            console.log({ err })
        }
        if (success) {
            User.countDocuments(async (err, data) => {
                if (err) {
                    console.log('error while creating admin');
                } else if (data == 0) {
                    let obj = {
                        "firstName": process.env.adminFirstName,
                        "lastName": process.env.adminLastName,
                        "password": process.env.adminPassword,
                        "contactNumber": process.env.adminContactNumber,
                        "emailId": process.env.adminEmailId,
                        "profilePicture": process.env.adminProfilePicture,
                        "role": constants.ROLE.ADMIN,
                        createdAt: new Date().getTime(),
                        isAccountVerified: true,
                        isCodeVerified: true
                    };

                    let updatedPass = await appUtil.convertPass(obj.password);
                    obj.password = updatedPass;
                    let user = new User(obj);
                    user.save((err, result) => {

                        if (err) {
                            console.log({ err })
                        } else {
                            console.log('admin created successfully.')
                        }
                    })

                }
            })

        } else {
            console.log("no success")
        }
    })
}