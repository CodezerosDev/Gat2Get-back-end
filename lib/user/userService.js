const userDao = require('./userDao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userMapper = require('./userMapper');
const userConstants = require('./userConstants');
const mailHandler = require('../middleware/email');
let constants = require('../constants');
const mongoose = require('mongoose');
const jwtHandler = require('../jwtHandler');
const ObjectId = require('mongoose').Types.ObjectId;
const sendPushNotification = require('../middleware/notification');
const scrtKey = process.env.stripeSecretKey_test
const stripe = require('stripe')(scrtKey);
const countryList = require('node-countries')

// User Registration Step-1 --- Kuldip
function registrationStep1(req) {
    let query = {
        emailId: req.body.emailId,
        status: constants.STATUS.ACTIVE
    }
    return userDao.checkUserExist(query).then(async (result) => {
        if (!result || result === null) {
            var code = Math.floor(Math.random() * (999999 - 100000) + 100000);
            let saveData = {
                emailId: req.body.emailId,
                verificationCode: code,
                createdAt: new Date().getTime()
            }
            let mailQuery = {
                mailName: constants.EMAIL_TEMPLATES.USER_VERIFICATION_CODE,
                status: constants.STATUS.ACTIVE
            }
            let templateDetail = await userDao.getTemplateDetails(mailQuery);
            if (templateDetail) {
                let userObj = {
                    emailId: req.body.emailId,
                    verificationCode: code
                }
                let mailSent = mailHandler.SEND_MAIL(userObj, templateDetail)
            }
            return userDao.saveVerificationCode(saveData).then((response) => {
                if (response) {

                    let obj = {
                        emailId: response.emailId,
                        _id: response._id,
                        isCodeVerified: response.isCodeVerified,
                        isRegister: response.isRegister
                    }

                    let analyticsQuery = {
                        type: constants.ANALYTICS.USER,
                        year: new Date().getFullYear(),
                        month: new Date().getMonth() + 1
                    }
                    return userDao.getAnalytics(analyticsQuery).then((analytics) => {

                        if (analytics) {

                            let qty = parseInt(analytics.qty)
                            qty += 1

                            let updateObj = {
                                qty: qty
                            }
                            return userDao.updateAnalytics(analyticsQuery, updateObj).then((updated) => {

                                console.log({ updated })
                                return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.checkMailVerificationCode, obj);

                            }).catch((err) => {

                                console.log({ err })
                                return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr);
                            })
                        } else {

                            let newObj = {
                                type: constants.ANALYTICS.USER,
                                qty: 1,
                                year: new Date().getFullYear(),
                                month: new Date().getMonth() + 1
                            }
                            return userDao.createAnalytics(newObj).then((created) => {

                                console.log({ created })
                                return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.checkMailVerificationCode, obj);
                            }).catch((err) => {

                                console.log({ err })
                                return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr);
                            })

                        }
                    }).catch((error) => {
                        console.log(error)
                        return amdMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr);
                    })
                }
            }).catch((error) => {
                console.log(error)
                return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
            })
        } else {
            if (result.isCodeVerified == false && result.isRegister == false) {
                var code = Math.floor(Math.random() * (999999 - 100000) + 100000);
                let updateData = {
                    verificationCode: code
                }
                let mailQuery = {
                    mailName: constants.EMAIL_TEMPLATES.USER_VERIFICATION_CODE,
                    status: constants.STATUS.ACTIVE
                }
                let templateDetail = await userDao.getTemplateDetails(mailQuery);
                if (templateDetail) {
                    let userObj = {
                        emailId: req.body.emailId,
                        verificationCode: code
                    }
                    let mailSent = mailHandler.SEND_MAIL(userObj, templateDetail)
                }
                return userDao.saveUserDetails(query, updateData).then((response) => {
                    if (response) {
                        let obj = {
                            emailId: response.emailId,
                            _id: response._id,
                            isCodeVerified: response.isCodeVerified,
                            isRegister: response.isRegister
                        }
                        return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.checkMailVerificationCode, obj);
                    }
                }).catch((error) => {
                    console.log(error)
                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                })
            } else if (result.isCodeVerified == true && result.isRegister == false) {
                let obj = {
                    emailId: result.emailId,
                    _id: result._id,
                    isCodeVerified: result.isCodeVerified,
                    isRegister: result.isRegister
                }
                return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.registrationRemain, obj);
            } else {
                if (result.loginType == "Facebook") {
                    return userMapper.responseMapping(userConstants.CODE.badrequest, "Email Already Registered via Facebook");
                } else if (result.loginType == "Google") {
                    return userMapper.responseMapping(userConstants.CODE.badrequest, "Email Already Registered via Google");
                } else {
                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.emailAlreadyExist);
                }
            }
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// User Registration Step-2 --- Kuldip
function registrationStep2(req) {
    let query = {
        emailId: req.params.emailId,
        verificationCode: req.body.code
    }
    let update = {
        isCodeVerified: true
    }
    return userDao.codeVerified(query, update).then((data) => {
        if (data) {
            let obj = {
                _id: data._id,
                emailId: data.emailId,
                isCodeVerified: data.isCodeVerified,
                isRegister: data.isRegister,
                firstName: data.firstName,
                lastName: data.lastName,
                isLoggedOut: data.isLoggedOut,
                profilePicture: data.profilePicture,
                isAccountVerified: data.isAccountVerified,
                socialId: data.socialId,
                loginType: data.loginType,
                contactNumber: data.contactNumber
            }

            return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.codeVerified, obj);
        } else {
            return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.wrongVerificationCode);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// User Registration Step-3 --- Kuldip
function registrationStep3(req) {
    let query = {}
    let update = {}
    if (req.body.isSocial == false) {
        query = {
            emailId: req.params.id,
            status: constants.STATUS.ACTIVE
        }
    } else {
        query = {
            socialId: req.params.id,
            status: constants.STATUS.ACTIVE
        }
    }
    update.firstName = req.body.firstName;
    update.lastName = req.body.lastName;
    update.contactNumber = req.body.contactNumber;
    update.isRegister = true;
    update.createdAt = new Date().getTime();
    update.fcmToken = req.body.fcmToken
    update.deviceId = req.body.deviceId

    if (req.body.password) {
        let password = bcrypt.hashSync(req.body.password, 10);
        update.password = password;
    }

    if (req.body.profilePicture) {
        update.profilePicture = req.body.profilePicture
    }
    return userDao.saveUserDetails(query, update).then((response) => {
        if (response) {
            let token = jwt.sign({
                _id: response._id
            }, process.env.user_secret, {
                expiresIn: 86400
            });
            let obj = {
                user: {
                    firstName: response.firstName,
                    lastName: response.lastName,
                    emailId: response.emailId,
                    _id: response._id,
                    role: response.role,
                    isLoggedOut: response.isLoggedOut,
                    profilePicture: response.profilePicture,
                    socialId: response.socialId,
                    loginType: response.loginType,
                    fcmToken: response.fcmToken,
                    deviceId: response.deviceId
                },
                token: token
            }
            return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.registrationSuccess, obj);
        } else {
            return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

function login(req) {

    let query = {
        emailId: req.body.emailId,
        status: constants.STATUS.ACTIVE,
        role: { $in: [constants.ROLE.USER, constants.ROLE.LANDLORD] }
    }

    let device = req.query.device
    let newDeviceToken = req.body.fcmToken
    let newDeviceId = req.body.deviceId

    return userDao.checkUserExist(query).then(async (result) => {
        if (result) {

            if (result.isRegister) {

                let passwordMatch = await bcrypt.compareSync(req.body.password, result.password);
                if (passwordMatch) {

                    result = result.toObject();
                    let token = jwt.sign({
                        _id: result._id
                    }, process.env.user_secret, {
                        expiresIn: 86400
                    });
                    let returnObj = {
                        user: {
                            _id: result._id,
                            firstName: result.firstName,
                            lastName: result.lastName,
                            emailId: result.emailId,
                            role: result.role,
                            isLoggedOut: result.isLoggedOut,
                            profilePicture: result.profilePicture,
                            isAccountVerified: result.isAccountVerified,
                            socialId: result.socialId,
                            loginType: result.loginType,
                            isCodeVerified: result.isCodeVerified,
                            isRegister: result.isRegister,
                            contactNumber: result.contactNumber,
                            document: result.document,
                            status: result.status,
                            // fcmToken: newDeviceToken
                        },
                        token: token
                    }

                    let updateData = {}
                    if (!result.isCodeVerified) {

                        let code = Math.floor(Math.random() * (999999 - 100000) + 100000);
                        updateData = {
                            verificationCode: code,
                            isLoggedOut: false
                        }
                        let mailQuery = {
                            mailName: constants.EMAIL_TEMPLATES.USER_VERIFICATION_CODE,
                            status: constants.STATUS.ACTIVE
                        }
                        let templateDetail = await userDao.getTemplateDetails(mailQuery);
                        if (templateDetail) {
                            let userObj = {
                                emailId: req.body.emailId,
                                verificationCode: code
                            }
                            let mailSent = mailHandler.SEND_MAIL(userObj, templateDetail)
                        }
                    }

                    if (device == "MOBILE") {

                        updateData = {
                            fcmToken: newDeviceToken,
                            deviceId: newDeviceId
                        }
                    }
                    return userDao.saveUserDetails(query, updateData).then((response) => {

                        if (device == "MOBILE" && (newDeviceId != result.deviceId)) {

                            if (result.fcmToken) {

                                let oldDeviceToken = result.fcmToken
                                let to = oldDeviceToken
                                let title = `ProHOff`
                                let type = constants.PUSH_NOTIFICATION_CATEGORIES.NEW_DEVICE_LOGIN
                                let refId = ''
                                let msg = 'There is new device login from your account'
                                // sendPushNotification.sendMessage(to, title, msg, type, refId)
                            }
                        }
                        returnObj.fcmToken = response.fcmToken
                        returnObj.deviceId = response.deviceId
                        return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.loginSuccess, returnObj);
                    }).catch((error) => {
                        console.log(error)
                        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                    })

                } else {

                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.invalidLoginDetail);
                }
            } else {

                return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist)
            }
        } else {

            return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist)
        }

    })
}

// User Logout --- Kuldip

function logout(req) {
    let query = {
        _id: req.params.userId
    }
    let device = req.query.device // WEB, MOBILE
    let deviceId = req.query.deviceId
    return userDao.checkUserExist(query).then((result) => {
        if (result) {

            let update = {
                isLoggedOut: true
            }
            if (device == "MOBILE" && result.deviceId == deviceId) {

                update.fcmToken = ""
                update.deviceId = ""
            }

            return userDao.saveUserDetails(query, update).then((response) => {
                if (response) {
                    return userMapper.responseMapping(userConstants.CODE.ok, userConstants.MESSAGE.logoutSuccess);
                }
            }).catch((error) => {
                console.log(error)
                return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
            })
        } else {
            return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// User Forgot Password Step-1 --- Kuldip
function forgotPasswordStep1(req) {
    let query = {
        emailId: req.body.emailId
    }
    return userDao.checkUserExist(query).then(async (response) => {
        if (response) {
            var code = Math.floor(Math.random() * (999999 - 100000) + 100000);
            let update = {
                verificationCode: code
            }
            let mailQuery = {
                mailName: constants.EMAIL_TEMPLATES.USER_FORGOT_PASSWORD,
                status: constants.STATUS.ACTIVE
            }
            let templateDetail = await userDao.getTemplateDetails(mailQuery);
            if (templateDetail) {
                let userObj = {
                    firstName: response.firstName,
                    emailId: response.emailId,
                    verificationCode: code
                }
                let mailSent = mailHandler.SEND_MAIL(userObj, templateDetail)
            }
            return userDao.saveUserDetails(query, update).then((response) => {
                if (response) {
                    return userMapper.responseMapping(userConstants.CODE.ok, userConstants.MESSAGE.forgotPasswordLinkSent);
                }
            }).catch((error) => {
                console.log(error)
                return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
            })
        } else {
            return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// User Forgot Password Step-2 --- Kuldip
function forgotPasswordStep2(req) {
    let query = {
        emailId: req.params.emailId,
        verificationCode: req.body.code
    }
    return userDao.forgotPasswordCodeVerified(query).then((data) => {
        if (data) {
            return userMapper.responseMapping(userConstants.CODE.ok, userConstants.MESSAGE.codeVerified);
        } else {
            return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.wrongVerificationCode);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// User Forgot Password Step-3 --- Kuldip
function forgotPasswordStep3(req) {
    let query = {
        emailId: req.params.emailId
    }
    let password = bcrypt.hashSync(req.body.new_password, 10);
    let update = {
        password: password
    }
    return userDao.setPassword(query, update).then((response) => {
        if (response) {
            return userMapper.responseMapping(userConstants.CODE.ok, userConstants.MESSAGE.setNewPasswordSuccess);
        } else {
            return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.passwordNotSet);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// User Reset Password --- Kuldip
function resetPassword(req) {
    let query = {
        _id: req.params.userId
    }
    return userDao.checkUserExist(query).then(async (response) => {
        if (response) {
            let passwordMatch = await bcrypt.compareSync(req.body.old_password, response.password);
            if (passwordMatch) {
                let password = bcrypt.hashSync(req.body.new_password, 10);
                let update = {
                    password: password
                }
                return userDao.setPassword(query, update).then(async (data) => {
                    if (data) {
                        let mailQuery = {
                            mailName: constants.EMAIL_TEMPLATES.RESET_PASSWORD,
                            status: constants.STATUS.ACTIVE
                        }
                        let templateDetail = await userDao.getTemplateDetails(mailQuery);
                        if (templateDetail) {
                            let userObj = {
                                firstName: response.firstName,
                                emailId: response.emailId
                            }
                            let mailSent = mailHandler.SEND_MAIL(userObj, templateDetail)
                        }
                        return userMapper.responseMapping(userConstants.CODE.ok, userConstants.MESSAGE.resetPasswordSuccess);
                    } else {
                        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.passwordNotSet);
                    }
                }).catch((error) => {
                    console.log(error)
                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                })
            } else {
                return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.invalidPassword);
            }
        } else {
            return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// User Profile Manage --- Kuldip
async function profileManage(req) {
    let query = {
        _id: req.params.userId
    }
    let update = {}
    let docData = []
    if (req.body.firstName) {
        update.firstName = req.body.firstName
    }
    if (req.body.lastName) {
        update.lastName = req.body.lastName
    }
    if (req.body.contactNumber) {
        update.contactNumber = req.body.contactNumber
    }
    if (req.body.profilePicture) {
        update.profilePicture = req.body.profilePicture
    }
    if (req.body.document) {
        let user = await userDao.checkUserExist(query)
        if (user) {
            docData = user.document
            docData.push(req.body.document)
            update.document = docData
            // update.isKYCVerified = false
            // update.isAccountVerified = false
        } else {
            docData.push(req.body.document)
            update.document = docData
            // update.isKYCVerified = false
            // update.isAccountVerified = false
        }

    }
    if (req.body.fcmToken) {
        update.fcmToken = req.body.fcmToken
    }
    return userDao.saveUserDetails(query, update).then((response) => {
        if (response) {
            return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.updateSuccess, response);
        } else {
            return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.errorInUpdate);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// User Get Profile --- Kuldip
function getProfile(req) {
    let query = {
        _id: req.params.userId
    }
    return userDao.checkUserExist(query).then((response) => {
        if (response) {
            let obj = {
                role: response.role,
                isCodeVerified: response.isCodeVerified,
                profilePicture: response.profilePicture,
                document: response.document,
                loginType: response.loginType,
                isAccountVerified: response.isAccountVerified,
                status: response.status,
                isLoggedOut: response.isLoggedOut,
                favourites: response.favourites,
                isRegister: response.isRegister,
                id: response._id,
                emailId: response.emailId,
                cardDetails: response.cardDetails,
                contactNumber: response.contactNumber,
                firstName: response.firstName,
                lastName: response.lastName,
                socialId: response.socialId,
                createdAt: response.createdAt,
                reviews: 0
            }

            if (response.role == constants.ROLE.LANDLORD) {

                let landlordQuery = {
                    landlord: req.params.userId
                }
                return userDao.getAllProperties(landlordQuery).then((properties) => {

                    if (properties && properties.length > 0) {

                        let reviewQuery = {
                            propertyId: { $in: properties }
                        }
                        return userDao.getReviewCount(reviewQuery).then((reviewCount) => {

                            obj.reviews = reviewCount
                            return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.getProfileSuccess, obj);
                        }).catch((error) => {
                            console.log(error)
                            return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                        })
                    } else {

                        return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.getProfileSuccess, obj);
                    }
                }).catch((error) => {
                    console.log(error)
                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                })
            } else {

                return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.getProfileSuccess, obj);
            }

        } else {
            return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })

}

// User Add Card Details --- Kuldip
function addCardDetails(req) {
    let query = {
        _id: req.params.userId
    }
    let cardData = [];
    let getCardData = [];
    return userDao.checkUserExist(query).then((response) => {
        if (response) {
            cardData = (response.cardDetails != [] && response.cardDetails != null && response.cardDetails.length) ? response.cardDetails : [];
            if (cardData.length) {
                if (req.body.isPrimary == true) {
                    cardData.map((x) => {
                        x.isPrimary = false
                    })
                    cardData.push({
                        cardNumber: req.body.cardNumber,
                        expirationMonth: req.body.expirationMonth,
                        expirationYear: req.body.expirationYear,
                        nameOnCard: req.body.nameOnCard,
                        isPrimary: true
                    })
                    let update = {
                        cardDetails: cardData
                    }
                    return userDao.saveUserDetails(query, update).then((resp) => {
                        getCardData = resp.cardDetails
                        const index = getCardData.findIndex(val => (val.cardNumber == req.body.cardNumber));
                        if (index > -1) {
                            var addedCard = getCardData[index];
                            let obj = {
                                cardId: addedCard._id
                            }
                            return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.cardDetailAddSuccess, obj);
                        }
                    }).catch((error) => {
                        console.log(error)
                        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                    })
                } else {
                    cardData.push({
                        cardNumber: req.body.cardNumber,
                        expirationMonth: req.body.expirationMonth,
                        expirationYear: req.body.expirationYear,
                        nameOnCard: req.body.nameOnCard,
                        isPrimary: false
                    })
                    let update = {
                        cardDetails: cardData
                    }
                    return userDao.saveUserDetails(query, update).then((resp) => {
                        getCardData = resp.cardDetails
                        const index = getCardData.findIndex(val => (val.cardNumber == req.body.cardNumber));
                        if (index > -1) {
                            var addedCard = getCardData[index];
                            let obj = {
                                cardId: addedCard._id
                            }
                            return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.cardDetailAddSuccess, obj);
                        }
                    }).catch((error) => {
                        console.log(error)
                        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                    })
                }
            } else {
                cardData.push({
                    cardNumber: req.body.cardNumber,
                    expirationMonth: req.body.expirationMonth,
                    expirationYear: req.body.expirationYear,
                    nameOnCard: req.body.nameOnCard,
                    isPrimary: true
                })
                let update = {
                    cardDetails: cardData
                }
                return userDao.saveUserDetails(query, update).then((resp) => {
                    getCardData = resp.cardDetails
                    const index = getCardData.findIndex(val => (val.cardNumber == req.body.cardNumber));
                    if (index > -1) {
                        var addedCard = getCardData[index];
                        let obj = {
                            cardId: addedCard._id
                        }
                        return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.cardDetailAddSuccess, obj);
                    }
                }).catch((error) => {
                    console.log(error)
                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                })
            }
        } else {
            return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// User Get Card Details --- Kuldip
function getCardDetails(req) {
    let query = {
        _id: req.params.userId
    }
    let cardData = []
    return userDao.checkUserExist(query).then((response) => {
        if (response) {
            cardData = response.cardDetails
            return cardData.reduce((x) => {
                if (response.cardDetails == req.params.cardId) {
                    return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.getCardSuccess, x);
                }
            })
        } else {
            return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// User Edit Card Details --- Kuldip
function editCardDetails(req) {
    let query = {
        _id: req.params.userId
    }
    return userDao.checkUserExist(query).then((response) => {
        if (response) {
            let cardData = response.cardDetails;
            if (cardData.length == 1) {
                const index = cardData.findIndex(val => (val._id == req.params.cardId));
                if (index > -1) {
                    cardData[index].cardNumber = req.body.cardNumber;
                    cardData[index].expirationMonth = req.body.expirationMonth;
                    cardData[index].expirationYear = req.body.expirationYear;
                    cardData[index].nameOnCard = req.body.nameOnCard;
                    cardData[index].isPrimary = true;
                    let update = {
                        cardDetails: cardData
                    }
                    return userDao.saveUserDetails(query, update).then((response) => {
                        if (response) {
                            let obj = {
                                _id: req.params.cardId
                            }
                            return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.cardEditedSuccess, obj);
                        } else {
                            return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.errorInUpdate);
                        }
                    }).catch((error) => {
                        console.log(error)
                        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                    })
                }
            } else {
                const index = cardData.findIndex(val => (val._id == req.params.cardId));
                if (index > -1) {
                    if (req.body.isPrimary == true) {
                        cardData.map((x) => {
                            x.isPrimary = false
                        })
                        cardData[index].cardNumber = req.body.cardNumber;
                        cardData[index].expirationMonth = req.body.expirationMonth;
                        cardData[index].expirationYear = req.body.expirationYear;
                        cardData[index].nameOnCard = req.body.nameOnCard;
                        cardData[index].isPrimary = true;
                        let update = {
                            cardDetails: cardData
                        }
                        return userDao.saveUserDetails(query, update).then((response) => {
                            if (response) {
                                let obj = {
                                    _id: req.params.cardId
                                }
                                return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.cardEditedSuccess, obj);
                            } else {
                                return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.errorInUpdate);
                            }
                        }).catch((error) => {
                            console.log(error)
                            return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                        })
                    } else {
                        const primary = cardData.findIndex(val => (val.isPrimary == true));
                        if (primary > -1) {
                            if (req.body.isPrimary == false && cardData[index].isPrimary != false) {
                                cardData[0].isPrimary = true;
                                cardData[index].cardNumber = req.body.cardNumber;
                                cardData[index].expirationMonth = req.body.expirationMonth;
                                cardData[index].expirationYear = req.body.expirationYear;
                                cardData[index].nameOnCard = req.body.nameOnCard;
                                cardData[index].isPrimary = false;
                                let update = {
                                    cardDetails: cardData
                                }
                                return userDao.saveUserDetails(query, update).then((response) => {
                                    if (response) {
                                        let obj = {
                                            _id: req.params.cardId
                                        }
                                        return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.cardEditedSuccess, obj);
                                    } else {
                                        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.errorInUpdate);
                                    }
                                }).catch((error) => {
                                    console.log(error)
                                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                                })
                            } else {
                                cardData[index].cardNumber = req.body.cardNumber;
                                cardData[index].expirationMonth = req.body.expirationMonth;
                                cardData[index].expirationYear = req.body.expirationYear;
                                cardData[index].nameOnCard = req.body.nameOnCard;
                                cardData[index].isPrimary = false;
                                let update = {
                                    cardDetails: cardData
                                }
                                return userDao.saveUserDetails(query, update).then((response) => {
                                    if (response) {
                                        let obj = {
                                            _id: req.params.cardId
                                        }
                                        return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.cardEditedSuccess, obj);
                                    } else {
                                        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.errorInUpdate);
                                    }
                                }).catch((error) => {
                                    console.log(error)
                                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                                })
                            }
                        }
                    }
                } else {
                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.errorInUpdate);
                }
            }
        } else {
            return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// User Remove Card Details --- Kuldip
function removeCardDetails(req) {
    let query = {
        _id: req.params.userId
    }
    let cData = []
    return userDao.checkUserExist(query).then((response) => {
        if (response) {
            cData = response.cardDetails
            const index = cData.findIndex(val => (val._id == req.params.cardId && val.isPrimary == false));
            if (index > -1) {
                cData.splice(index, 1);
            } else {
                return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.pleaseSelectAddPrimary);
            }
            let update = {
                cardDetails: cData
            }
            return userDao.saveUserDetails(query, update).then((response) => {
                if (response) {
                    return userMapper.responseMapping(userConstants.CODE.ok, userConstants.MESSAGE.cardRemovedSuccess);
                } else {
                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.errorInUpdate);
                }
            }).catch((error) => {
                console.log(error)
                return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
            })
        } else {
            return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// User Get CMS Page --- Kuldip
function getCMSPage(req) {
    let query = { type: req.params.type }
    return userDao.getCMSPage(query).then((result) => {
        return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.getCMSSuccess, result);
    }).catch((err) => {
        return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr);

    })
}

function addDocument(req) {
    let query = {
        _id: req.params.userId
    }
    let documentData = [];
    let getDocData = [];
    return userDao.checkUserExist(query).then((response) => {
        if (response) {
            documentData = (response.document != [] && response.document != null && response.document.length) ? response.document : [];
            documentData.push({
                doc_url: req.body.doc_url
            })
            let update = {
                document: documentData
            }
            return userDao.saveUserDetails(query, update).then((resp) => {
                getDocData = resp.document
                const index = getDocData.findIndex(val => (val.doc_url == req.body.doc_url));
                if (index > -1) {
                    var addedDocument = getDocData[index];
                    let obj = {
                        docId: addedDocument._id,
                        doc_url: addedDocument.doc_url
                    }
                    return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.addDocumentSuccess, obj);
                }
            }).catch((error) => {
                console.log(error)
                return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
            })
        } else {
            return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

function editDocument(req) {
    let query = {
        _id: req.params.userId
    }
    let documentData = [];
    let getDocData = [];
    return userDao.checkUserExist(query).then((response) => {
        if (response) {
            documentData = (response.document != [] && response.document != null && response.document.length) ? response.document : [];
            // const index = documentData.findIndex(val => (val._id == req.params.docId));
            let updatedDocs = []
            documentData.map((objs) => {

                if (objs._id == req.params.docId) {

                    // objs.doc_url = req.body.doc_url
                    // delete objs.isKYCVerified
                    let newObj = {
                        _id: objs._id,
                        doc_url: req.body.doc_url
                    }
                    updatedDocs.push(newObj)

                } else {

                    updatedDocs.push(objs)
                }
            })
            let updateObj = {
                document: updatedDocs
            }

            return userDao.saveUserDetails(query, updateObj).then((resp) => {
                getDocData = resp.document
                const index = getDocData.findIndex(val => (val.doc_url == req.body.doc_url));
                if (index > -1) {
                    var addedDoc = getDocData[index];
                    let obj = {
                        _id: addedDoc._id,
                        doc_url: addedDoc.doc_url
                    }
                    return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.editdDocumentSuccess, obj);
                }
            }).catch((error) => {
                console.log(error)
                return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
            })

            // if (index > -1) {
            //     documentData[index].doc_url = req.body.doc_url
            //     delete documentData[index].isKYCVerified
            //     // documentData[index].isKYCVerified = false
            //     console.log({ documentData })
            //     let update = {
            //         document: documentData
            //     }
            //     return userDao.saveUserDetails(query, update).then((resp) => {
            //         getDocData = resp.document
            //         const index = getDocData.findIndex(val => (val.doc_url == req.body.doc_url));
            //         if (index > -1) {
            //             var addedDoc = getDocData[index];
            //             let obj = {
            //                 _id: addedDoc._id,
            //                 doc_url: addedDoc.doc_url
            //             }
            //             return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.editdDocumentSuccess, obj);
            //         }
            //     }).catch((error) => {
            //         console.log(error)
            //         return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
            //     })
            // } else {
            //     return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
            // }
        } else {
            return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

function removeDocument(req) {
    let query = {
        _id: req.params.userId
    }
    let docData = []
    return userDao.checkUserExist(query).then((response) => {
        if (response) {
            docData = response.document;
            const index = docData.findIndex(val => (val._id == req.params.docId));
            if (index > -1) {
                docData.splice(index, 1);
                let update = {
                    document: docData
                }
                return userDao.saveUserDetails(query, update).then((response) => {
                    if (response) {
                        return userMapper.responseMapping(userConstants.CODE.ok, userConstants.MESSAGE.documentRemovedSuccess);
                    } else {
                        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.errorInUpdate);
                    }
                }).catch((error) => {
                    console.log(error)
                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                })
            } else {
                return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.noDocAvail);
            }
        } else {
            return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Add Favorite --- Kuldip
function addFavorite(req) {
    let query = {
        _id: req.params.userId
    }
    let favList = []
    return userDao.checkUserExist(query).then((response) => {
        if (response) {
            favList = response.favourites;
            favList.push(req.params.propertyId)
            let update = {
                favourites: favList
            }
            return userDao.saveUserDetails(query, update).then((response) => {
                if (response) {
                    return userMapper.responseMapping(userConstants.CODE.ok, userConstants.MESSAGE.addedFavoriteSuccess);
                } else {
                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.unableToAdd);
                }
            }).catch((error) => {
                console.log(error)
                return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
            })
        } else {
            return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Remove Favorite --- Kuldip
function removeFavorite(req) {
    let query = {
        _id: req.params.userId
    }
    let favList = []
    return userDao.checkUserExist(query).then((response) => {
        if (response) {
            favList = response.favourites;
            const index = favList.indexOf(req.params.propertyId);
            if (index > -1) {
                favList.splice(index, 1);
            }
            let update = {
                favourites: favList
            }
            return userDao.saveUserDetails(query, update).then((response) => {
                if (response) {
                    return userMapper.responseMapping(userConstants.CODE.ok, userConstants.MESSAGE.removeFavoriteSuccess);
                } else {
                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.unableToRemove);
                }
            }).catch((error) => {
                console.log(error)
                return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
            })
        } else {
            return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Get Favorite List --- Kuldip
function getFavoriteList(req) {
    let page = req.params.page;
    let skip = 0;
    if (page == 1) {
        skip = 0;
    } else {
        skip = (page - 1) * 12;
    }
    let option = {
        skip: skip,
        limit: 12
    };
    let query = {
        _id: mongoose.Types.ObjectId(req.params.userId)
    }
    let favoriteQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'accomodations',
            localField: "favourites",
            foreignField: '_id',
            as: 'favData'
        }
    }, {
        $unwind: "$favData"
    }, {
        $match: {
            "favData.type": req.body.type
        }
    }, {
        $lookup: {
            from: 'users',
            localField: "favData.landlord",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }, {
        $lookup: {
            from: 'reviews',
            localField: "favData._id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }, {
        $project: {
            propertyId: "$favData._id",
            type: "$favData.type",
            name: "$favData.name",
            totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
            totalRatingsBy: { $size: "$reviewData" },
            country: "$favData.address.country",
            city: "$favData.address.city",
            location: "$favData.address.location",
            state: "$favData.address.state",
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            media: { $arrayElemAt: ["$favData.media", 0] },
            price: { $sum: "$favData.price.rate" }
        }
    }]
    let totalFavoriteQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'accomodations',
            localField: "favourites",
            foreignField: '_id',
            as: 'favData'
        }
    }, {
        $unwind: "$favData"
    }, {
        $match: {
            "favData.type": req.body.type
        }
    }]
    let skipData = {
        $skip: option.skip
    }

    let limitData = {
        $limit: option.limit
    }
    favoriteQuery.push(skipData)
    favoriteQuery.push(limitData)
    return userDao.checkUserExist(query).then(async (response) => {
        if (response) {
            let totalRecord = await userDao.getFavoriteList(totalFavoriteQuery)
            let totalPage = await Math.ceil(totalRecord.length / option.limit);
            return userDao.getFavoriteList(favoriteQuery).then((result) => {
                let obj = {
                    result: result,
                    totalRecord: totalRecord.length,
                    limit: option.limit,
                    totalPage: totalPage
                }
                return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.getFavoriteSuccess, obj);
            }).catch((error) => {
                console.log(error)
                return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
            })
        } else {
            return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Get My Reviews --- Kuldip
function getMyReviews(req) {
    let query = {
        ratingsBy: mongoose.Types.ObjectId(req.params.userId)
    }
    let amdQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'accomodations',
            localField: "propertyId",
            foreignField: '_id',
            as: 'amdData'
        }
    }, {
        $unwind: "$amdData"
    }, {
        $sort: {
            createdAt: -1
        }
    }, {
        $project: {
            propertyId: "$amdData._id",
            propertyName: "$amdData.name",
            country: "$amdData.address.country",
            city: "$amdData.address.city",
            location: "$amdData.address.location",
            state: "$amdData.address.state",
            review: "$review",
            ratings: "$ratings",
            createdAt: "$createdAt"
        }
    }]
    return userDao.getMyReviews(amdQuery).then((response) => {
        if (response) {
            return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.getReviewsSuccess, response);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Get Landlord Reviews --- Kuldip
function getLandlordReviews(req) {
    let sum = 0;
    let ratingMatch = {}
    let query = {
        landlord: mongoose.Types.ObjectId(req.params.userId)
    }
    if (req.body.type) {
        if (req.body.type == constants.ACCOMODATIONS.HOME_OFFICE) {
            query.type = constants.ACCOMODATIONS.HOME_OFFICE;
        }
        if (req.body.type == constants.ACCOMODATIONS.WORKPLACE) {
            query.type = constants.ACCOMODATIONS.WORKPLACE;
        }
    }

    if (req.body.propertyId) {
        query._id = mongoose.Types.ObjectId(req.body.propertyId);
    }

    let amdQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }, {
        $unwind: "$reviewData"
    }]

    if (req.body.rating) {
        ratingMatch = {
            $match: {
                "reviewData.ratings": { $eq: req.body.rating }
            }
        }
        amdQuery.push(ratingMatch);
    }

    let userLookup = {
        $lookup: {
            from: 'users',
            localField: "reviewData.ratingsBy",
            foreignField: '_id',
            as: 'userData'
        }
    }
    let userUnwind = {
        $unwind: "$userData"
    }
    let project = {
        $project: {
            _id: "$_id",
            type: "$type",
            propertyName: "$name",
            country: "$address.country",
            city: "$address.city",
            location: "$address.location",
            state: "$address.state",
            review: "$reviewData.review",
            ratings: "$reviewData.ratings",
            createdAt: "$reviewData.createdAt",
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            profilePicture: "$userData.profilePicture"
        }
    }
    let sortQuery = {
        $sort: {
            createdAt: -1
        }
    }
    amdQuery.push(userLookup)
    amdQuery.push(userUnwind)
    amdQuery.push(project)
    amdQuery.push(sortQuery)
    return userDao.getLandlordReviews(amdQuery).then((response) => {
        if (response) {
            response.map((x) => {
                sum += x.ratings
            })
            let obj = {
                response: response,
                totalRatings: (sum / response.length),
                totalRatingsBy: response.length
            }
            return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.getReviewsSuccess, obj);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Contact Us --- Kuldip
async function contactUs(req) {
    let saveData = {
        name: req.body.name,
        emailId: req.body.emailId,
        contactNumber: req.body.contactNumber,
        message: req.body.message,
        createdAt: new Date().getTime()
    }

    let characters = '0123456789';
    let result = '';
    let charactersLength = characters.length;
    for (let j = 0; j < 8; j++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    let ticketNo = parseInt(result)
    ticketNo = ticketNo.toString()
    let ticketExists = await checkIfTicketExists(ticketNo)
    if (!ticketExists) {

        saveData.ticketNo = ticketNo

        return userDao.addContactUs(saveData).then((response) => {
            if (response) {
                return userMapper.responseMapping(userConstants.CODE.ok, userConstants.MESSAGE.contactUsSuccess);
            }
        }).catch((error) => {
            console.log(error)
            return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
        })
    } else {

        return contactUs(req)
    }

}

// Verify Token --- Kuldip
function verifyUsrToken(req) {
    let token = req.headers['authorization']
    let userId = req.params['userId']
    if (!token || !userId || (!ObjectId.isValid(userId))) {
        return userMapper.responseMapping(userConstants.CODE.forbiddenRequest, userConstants.MESSAGE.TOKEN_NOT_PROVIDED);
    } else {
        return jwtHandler.verifyUsrToken(token).then((result) => {
            if (result && result._id == userId) {
                let query = {
                    _id: result._id
                }
                let project = {
                    firstName: 1,
                    lastName: 1,
                    emailId: 1,
                    _id: 1,
                    role: 1,
                    isLoggedOut: 1,
                    token: req.headers['authorization']
                }
                return userDao.getUserData(query, project).then((result) => {
                    return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.validToken, result);
                })
            } else {
                let obj = {
                    tokenExpire: true
                }
                return userMapper.responseMappingWithData(userConstants.CODE.forbiddenRequest, userConstants.MESSAGE.UnauthorizedAccess, obj);
            }
        })
    }
}

// SignUp and SignIn Via Facebook and Google --- Kuldip
function socialLogin(req) {
    let provider = req.body.provider;
    let query = {
        socialId: req.body.socialId,
        provider: req.body.provider,
        emailId: req.body.emailId,
        status: constants.STATUS.ACTIVE,
        isRegister: true
    }

    let device = req.query.device
    let newDeviceToken = req.body.fcmToken
    let newDeviceId = req.body.deviceId

    return userDao.checkUserExist(query).then((response) => {
        if (response) {

            let updateData = {}
            if (device == "MOBILE") {

                updateData = {
                    fcmToken: newDeviceToken,
                    deviceId: newDeviceId
                }
            }
            // if (response.isAccountVerified == true) {
            updateData.isLoggedOut = false
            return userDao.saveUserDetails(query, updateData).then((resp) => {
                if (resp) {

                    if (device == "MOBILE" && (newDeviceId != response.deviceId)) {

                        if (response.fcmToken) {

                            let oldDeviceToken = response.fcmToken
                            let to = oldDeviceToken
                            let title = `ProHOff`
                            let type = constants.PUSH_NOTIFICATION_CATEGORIES.NEW_DEVICE_LOGIN
                            let refId = ''
                            let msg = 'There is new device login from your account'
                            sendPushNotification.sendMessage(to, title, msg, type, refId)
                        }
                    }

                    let user = {
                        firstName: resp.firstName,
                        lastName: resp.lastName,
                        emailId: resp.emailId,
                        _id: resp._id,
                        role: resp.role,
                        isLoggedOut: resp.isLoggedOut,
                        profilePicture: resp.profilePicture,
                        socialId: resp.socialId,
                        loginType: resp.loginType,
                        isCodeVerified: resp.isCodeVerified,
                        isRegister: resp.isRegister,
                        isAccountVerified: resp.isAccountVerified,
                        fcmToken: resp.fcmToken,
                        deviceId: resp.deviceId
                    }
                    return jwtHandler.genUsrToken({
                        _id: resp._id
                    }).then((jwt) => {
                        let obj = {
                            user: user,
                            token: jwt
                        }
                        return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.loginSuccess, obj);
                    }).catch((err) => {
                        console.log({ err })
                        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                    })
                } else {
                    console.log("Failed to update social login details")
                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                }
            }).catch((error) => {
                console.log(error)
                return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
            })
            // } else {
            //     return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.accountNotVerified);
            // }
        } else {
            let emailQuery = {
                emailId: req.body.emailId,
                status: constants.STATUS.ACTIVE
            }
            return userDao.checkUserExist(emailQuery).then((result) => {
                if (result) {
                    // if (result.isAccountVerified == true) {
                    let update = {
                        socialId: req.body.socialId,
                        loginType: provider,
                        isLoggedOut: false,
                        isCodeVerified: true
                    }

                    if (device == "MOBILE") {

                        update.fcmToken = newDeviceToken
                        update.deviceId = newDeviceId
                    }

                    return userDao.saveUserDetails(emailQuery, update).then((resp) => {
                        if (resp) {

                            if (device == "MOBILE" && (newDeviceId != result.deviceId)) {

                                if (result.fcmToken) {

                                    let oldDeviceToken = result.fcmToken
                                    let to = oldDeviceToken
                                    let title = `ProHOff`
                                    let type = constants.PUSH_NOTIFICATION_CATEGORIES.NEW_DEVICE_LOGIN
                                    let refId = ''
                                    let msg = 'There is new device login from your account'
                                    sendPushNotification.sendMessage(to, title, msg, type, refId)
                                }
                            }

                            if (resp.isRegister == true) {
                                let user = {
                                    firstName: resp.firstName,
                                    lastName: resp.lastName,
                                    emailId: resp.emailId,
                                    _id: resp._id,
                                    role: resp.role,
                                    isLoggedOut: resp.isLoggedOut,
                                    profilePicture: resp.profilePicture,
                                    socialId: resp.socialId,
                                    loginType: resp.loginType,
                                    isCodeVerified: resp.isCodeVerified,
                                    isRegister: resp.isRegister,
                                    isAccountVerified: resp.isAccountVerified,
                                    fcmToken: resp.fcmToken,
                                    deviceId: resp.deviceId
                                }
                                return jwtHandler.genUsrToken({
                                    _id: resp._id
                                }).then((jwt) => {
                                    let obj = {
                                        user: user,
                                        token: jwt
                                    }
                                    return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.loginSuccess, obj);
                                }).catch((err) => {
                                    console.log({ err })
                                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                                })
                            } else {
                                let data = {
                                    socialId: req.body.socialId,
                                    emailId: req.body.emailId,
                                    loginType: req.body.provider,
                                    isCodeVerified: true,
                                }
                                if (newDeviceId) {
                                    data.deviceId = newDeviceId
                                }
                                if (newDeviceToken) {
                                    data.fcmToken = newDeviceToken
                                }
                                return userDao.saveVerificationCode(data).then((result) => {
                                    if (result) {
                                        let obj = {
                                            user: {
                                                socialId: result.socialId,
                                                emailId: result.emailId,
                                                _id: result._id,
                                                isCodeVerified: result.isCodeVerified,
                                                loginType: result.loginType,
                                                isRegister: result.isRegister,
                                                deviceId: req.body.deviceId,
                                                fcmToken: req.body.fcmToken
                                            }
                                        }
                                        return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.codeVerified, obj);
                                    }
                                }).catch((error) => {
                                    console.log(error)
                                    return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                                })
                            }
                        } else {
                            console.log("Failed to merge account")
                            return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                        }
                    }).catch((error) => {
                        console.log(error)
                        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                    })
                    // } else {
                    //     return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.accountNotVerified);
                    // }
                } else {
                    let data = {
                        socialId: req.body.socialId,
                        emailId: req.body.emailId,
                        loginType: req.body.provider,
                        isCodeVerified: true
                    }
                    if (newDeviceId) {
                        data.deviceId = newDeviceId
                    }
                    if (newDeviceToken) {
                        data.fcmToken = newDeviceToken
                    }
                    return userDao.saveVerificationCode(data).then((result) => {
                        if (result) {
                            let user = {
                                emailId: result.emailId,
                                _id: result._id,
                                isCodeVerified: result.isCodeVerified,
                                loginType: result.loginType,
                                isRegister: result.isRegister,
                                deviceId: result.deviceId,
                                fcmToken: result.fcmToken
                            }
                            let obj = {
                                user: user
                            }
                            return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.registrationSuccess, obj);
                        }
                    }).catch((error) => {
                        console.log(error)
                        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
                    })
                }
            }).catch((error) => {
                console.log(error)
                return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
            })
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Invite Friends --- Kuldip
async function inviteFriends(req) {
    let mailQuery = {
        mailName: constants.EMAIL_TEMPLATES.INVITE_FRIENDS,
        status: constants.STATUS.ACTIVE
    }
    let templateDetail = await userDao.getTemplateDetails(mailQuery);
    if (templateDetail) {
        let userObj = {
            emailId: req.body.emailId,
        }
        let mailSent = mailHandler.SEND_MAIL(userObj, templateDetail)
        if (mailSent) {
            return userMapper.responseMapping(userConstants.CODE.ok, userConstants.MESSAGE.inviteFriends);
        } else {
            return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
        }
    }
}

// My Bookings --- Kuldip
async function myBookings(req) {
    let page = req.params.page;
    let skip = 0;
    if (page == 1) {
        skip = 0;
    } else {
        skip = (page - 1) * 12;
    }
    let option = {
        skip: skip,
        limit: 12
    };
    let query = {
        userId: mongoose.Types.ObjectId(req.params.userId)
    }
    let bookingQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'accomodations',
            localField: "propertyId",
            foreignField: '_id',
            as: 'propertyData'
        }
    }, {
        $unwind: "$propertyData"
    }, {
        $lookup: {
            from: 'reviews',
            localField: "propertyId",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: "propertyData.landlord",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: "propertyId",
            foreignField: "favourites", //{ $in: ["_id","$favourites"] },
            as: 'userFavData'
        }
    }, {
        $unwind: "$userData"
    }, {
        $lookup: {
            from: 'categories',
            localField: "categoryId",
            foreignField: '_id',
            as: 'categoryData'
        }
    }, {
        $sort: {
            createdAt: -1
        }
    }, {
        $project: {
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            type: "$propertyData.type",
            name: "$propertyData.name",
            totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
            totalRatingsBy: { $size: "$reviewData" },
            propertyId: "$propertyData._id",
            isFavorite: {
                $cond: {
                    if: {
                        $gt: [{ $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.params.userId)] }, -1]
                    },
                    then: {
                        $in: ["$_id", { $arrayElemAt: ["$userFavData.favourites", { $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.params.userId)] }] }]
                    },
                    else: false
                }
            },
            categoryId: "$propertyData.categoryId",
            categoryName: { $arrayElemAt: ["$categoryData.name", { $indexOfArray: ["$categoryData._id", "$propertyData.categoryId"] }] },
            bookedQuantity: { $size: "$categoryId" },
            country: "$propertyData.address.country",
            city: "$propertyData.address.city",
            location: "$propertyData.address.location",
            state: "$propertyData.address.state",
            bookingId: "$_id",
            fromDate: "$fromDate",
            toDate: "$toDate",
            status: "$status",
            media: { $arrayElemAt: ["$propertyData.media", 0] },
            price: "$price",
            taxes: "$taxes",
            taxRate: "$taxRate",
            basePrice: "$basePrice",
            createdAt: "$createdAt",
            spaceCycle: "$propertyData.spaceAvailability.spaceCycle"
        }
    }, {
        $skip: option.skip
    }, {
        $limit: option.limit
    }]
    let totalRecord = await userDao.getMyBookingsCount(query);
    let totalPage = await Math.ceil(totalRecord / option.limit);
    return userDao.getMyBookings(bookingQuery).then((response) => {
        if (response) {
            let obj = {
                response: response,
                totalRecord: totalRecord,
                limit: option.limit,
                totalPage: totalPage
            }
            return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.getBookingSuccess, obj);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}


// get Primary Card --- Kuldip
function getPrimaryCard(req) {
    let query = {
        _id: mongoose.Types.ObjectId(req.params.userId)
    }
    return userDao.checkUserExist(query).then(async (result) => {
        let data = result.cardDetails
        const index = data.findIndex(val => (val.isPrimary == true));
        if (index > -1) {
            return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, data[index]);
        }
    }).catch((error) => {
        console.log(error)
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

function checkIfTicketExists(ticket) {

    let query = {
        ticketNo: ticket,
        status: constants.CONTACTUSSTATUS.OPEN
    }
    return userDao.checkIfTicketNoExists(query).then(data => data)
}

/**
 * Get user notifications
 * @param {String} userId mongo id of user to fetch notifications received
 * @param {Number} page page number of which records to be sent
 */
function getUserNotifications(userId, page) {

    if (!userId || !ObjectId.isValid(userId) || !page) {

        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.invalidDetails);
    } else {

        let userQuery = {
            _id: userId,
            status: constants.STATUS.ACTIVE
        }

        return userDao.checkUserExist(userQuery).then((result) => {

            if (result) {

                let notificationQuery = {
                    receiverId: userId
                }

                let skip = 0;
                if (page == 1) {
                    skip = 0;
                } else {
                    skip = (page - 1) * 12;
                }
                let limit = 12
                // let option = {
                //     skip: skip,
                //     limit: 12
                // };

                return userDao.getUserNotifications(notificationQuery, skip, limit).then(async (notifications) => {

                    let ids = []
                    notifications.map((obj) => {
                        ids.push(obj._id)
                    })
                    let query = {
                        _id: { $in: ids }
                    }
                    let update = {
                        isRead: true
                    }

                    let totalRecord = await userDao.getNotificationCount(notificationQuery);
                    let totalPage = Math.ceil(totalRecord / limit);
                    let respObj = {
                        response: notifications,
                        totalRecord: totalRecord,
                        limit: limit,
                        totalPage: totalPage
                    }
                    // return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.getBookingSuccess, obj);
                    return userDao.updateNotifications(query, update).then((updated) => {

                        return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, respObj)

                    }).catch((err) => {

                        console.log({ err })
                        return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
                    })

                }).catch((err) => {

                    console.log({ err })
                    return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
                })

            } else {

                return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
            }
        }).catch((err) => {

            console.log({ err })
            return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr);
        })
    }
}

/**
 * Get user unread notifications count
 * @param {String} userId mongo id of user to fetch notifications received
 */
function getUserNotificationCount(userId) {

    if (!userId || !ObjectId.isValid(userId)) {

        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.invalidDetails);
    } else {

        let userQuery = {
            _id: userId,
            status: constants.STATUS.ACTIVE
        }

        return userDao.checkUserExist(userQuery).then((result) => {

            if (result) {

                let notificationQuery = {
                    receiverId: userId,
                    isRead: false
                }

                return userDao.getNotificationCount(notificationQuery).then((count) => {

                    return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, count)

                }).catch((err) => {

                    console.log({ err })
                    return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
                })

            } else {

                return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist);
            }
        }).catch((err) => {

            console.log({ err })
            return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr);
        })
    }
}

/**
 * Update notification status
 * @param {String} userId mongo id of user
 * @param {Array} notificationIds mongo ids of notifications to be marked read
 */
function updateNotificationStatus(userId, notificationIds) {

    if (!userId || !ObjectId.isValid(userId) || !notificationIds || notificationIds.length == 0) {

        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.invalidDetails)
    } else {

        let userQuery = {
            _id: userId,
            status: constants.STATUS.ACTIVE
        }

        return userDao.checkUserExist(userQuery).then((userDetails) => {

            if (userDetails) {

                let notificationQuery = {
                    _id: { $in: notificationIds }
                }
                let update = {
                    isRead: true
                }

                return userDao.updateNotifications(notificationQuery, update).then((updated) => {

                    if (updated) {

                        return userMapper.responseMapping(userConstants.CODE.ok, userConstants.MESSAGE.NotificationStatusUpdated)
                    } else {

                        return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr);
                    }

                }).catch((err) => {

                    console.log({ err })
                    return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr);
                })

                // return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, respObj)
            } else {

                return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist)
            }
        }).catch((err) => {

            console.log({ err })
            return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr);
        })
    }
}

// Get User Chat List --- Kuldip
function getChatList(req) {

    let query = {
        $or: [
            { participateId1: mongoose.Types.ObjectId(req.params.userId) },
            { participateId2: mongoose.Types.ObjectId(req.params.userId) }
        ]
    }
    let sortQuery = {}
    sortQuery['lastMessageTime'] = -1
    let chatQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'users',
            localField: "participateId1",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }, {
        $lookup: {
            from: 'users',
            localField: "participateId2",
            foreignField: '_id',
            as: 'landlordData'
        }
    }, {
        $unwind: "$landlordData"
    }, {
        $sort: sortQuery
    }, {
        $project: {
            user1Id: "$userData._id",
            user1profile: "$userData.profilePicture",
            user1firstName: "$userData.firstName",
            user1lastName: "$userData.lastName",
            date: { $arrayElemAt: ["$data", -1] },
            user2Id: "$landlordData._id",
            user2Profile: "$landlordData.profilePicture",
            user2FirstName: "$landlordData.firstName",
            user2LastName: "$landlordData.lastName"
        }
    }]
    return userDao.getChatList(chatQuery).then(async (response) => {

        let userQuery = {
            _id: req.params.userId
        }
        let loggedInUserDetails = await userDao.checkUserExist(userQuery)
        let respObj = {
            loggedInUserDetails: {
                _id: req.params.userId,
                firstName: loggedInUserDetails.firstName,
                lastName: loggedInUserDetails.lastName,
                profilePicture: loggedInUserDetails.profilePicture
            },
            result: response
        }
        return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, respObj);
    }).catch((err) => {
        console.log({ err })
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Get Chats --- Kuldip
function getChats(req) {
    let query = {
        _id: mongoose.Types.ObjectId(req.params.roomId)
    }
    let chatQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'users',
            localField: "participateId1",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    },
    {
        $lookup: {
            from: 'users',
            localField: "participateId2",
            foreignField: '_id',
            as: 'landlordData'
        }
    }, {
        $unwind: "$landlordData"
    },
    {
        $project: {
            user1Id: "$userData._id",
            user1profile: "$userData.profilePicture",
            user1firstName: "$userData.firstName",
            user1lastName: "$userData.lastName",
            user2Id: "$landlordData._id",
            user2Profile: "$landlordData.profilePicture",
            user2FirstName: "$landlordData.firstName",
            user2LastName: "$landlordData.lastName",
            date: "$data"
        }
    }]
    return userDao.getChats(chatQuery).then((response) => {

        return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, response);
    }).catch((err) => {
        console.log({ err })
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Delete Chats --- Kuldip
function deleteChats(req) {
    let query = {
        _id: mongoose.Types.ObjectId(req.params.roomId)
    }
    return userDao.deleteChats(query).then((response) => {
        return userMapper.responseMapping(userConstants.CODE.ok, userConstants.MESSAGE.success);
    }).catch((err) => {
        console.log({ err })
        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr);
    })
}

/**
 * Update bank details
 * @param {String} userId mongo id of user
 * @param {Object} details bank details for creating custom account
 */
function updateBankDetails(userId, details) {

    if (!userId || !ObjectId.isValid(userId) || !details || Object.keys(details).length == 0) {

        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.invalidDetails);
    } else {

        let userQuery = {
            _id: userId,
            role: constants.ROLE.LANDLORD,
            status: constants.STATUS.ACTIVE
        }

        return userDao.checkUserExist(userQuery).then((userDetails) => {

            if (userDetails) {

                return new Promise((resolve, reject) => {

                    let bankDetailsObj = {

                        type: 'custom',
                        country: details.address.country,
                        email: userDetails.emailId,
                        capabilities: {
                            card_payments: { requested: true },
                            transfers: { requested: true },
                        },
                        business_type: 'individual',
                        individual: {
                            address: {
                                city: details.address.city,
                                line1: details.address.line1,
                                line2: details.address.line2,
                                postal_code: details.address.postalCode,
                                state: details.address.state,
                                country: details.address.country
                            },
                            dob: {
                                day: details.dob.day,
                                month: details.dob.month,
                                year: details.dob.year
                            },
                            first_name: userDetails.firstName,
                            last_name: userDetails.lastName,
                            email: userDetails.emailId,
                            phone: userDetails.contactNumber,
                            gender: details.gender,
                            id_number: details.idNumber,
                        },
                        business_profile: {
                            mcc: details.businessProfile.mcc,
                            product_description: details.businessProfile.productDescription,
                        },
                        external_account: {
                            object: "bank_account",
                            country: details.bankCountry,
                            currency: details.bankCurrency,
                            routing_number: details.routingNumber,
                            account_number: details.accountNumber,
                        },
                        tos_acceptance: {
                            date: details.tosAcceptance.date,
                            ip: details.tosAcceptance.ip,
                            service_agreement: "full",
                        }
                    }
                    stripe.accounts.create(bankDetailsObj, (stripeErr, result) => {

                        if (stripeErr) {

                            console.log({ stripeErr })
                            if (stripeErr.param == "individual[phone]") {

                                resolve(userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.InvalidContactNumber))
                            } else {
                                resolve(userMapper.responseMapping(userConstants.CODE.requiredField, stripeErr.raw.message))
                            }
                        } else {

                            console.log({ result })
                            let accountId = result.id
                            let updateObj = {
                                accountId: accountId,
                                stripeAccountDetails: details
                            }
                            userDao.saveUserDetails(userQuery, updateObj).then((updated) => {

                                if (updated) {

                                    resolve(userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, result))
                                } else {

                                    reject(userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr))
                                }
                            }).catch((err) => {

                                console.log({ err })
                                resolve(userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr))
                            })
                        }
                    })
                })
            } else {

                return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist)
            }
        }).catch((err) => {

            console.log({ err })
            return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
        })
    }
}

/**
 * Update device token
 * @param {String} userId mongo id of user
 * @param {String} fcmToken 
 */
function updateFCMToken(userId, fcmToken) {

    if (!userId || !ObjectId.isValid(userId) || !fcmToken) {

        return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist)
    } else {

        let query = {
            _id: userId,
            status: constants.STATUS.ACTIVE
        }

        return userDao.checkUserExist(query).then((userDetails) => {

            if (userDetails) {

                let updateObj = {
                    fcmToken: fcmToken
                }
                return userDao.saveUserDetails(query, updateObj).then((updated) => {

                    if (updated) {

                        return userMapper.responseMapping(userConstants.CODE.ok, userConstants.MESSAGE.success)
                    } else {

                        return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
                    }
                }).catch((err) => {

                    console.log({ err })
                    return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
                })
            } else {

                return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
            }
        }).catch((err) => {

            console.log({ err })
            return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
        })
    }
}

/**
 * Check user is logged in using same device or not
 * @param {String} userId mongo id of user
 * @param {String} deviceId devide id to check user logged in details
 */
function checkUserLogin(userId, deviceId) {

    let userQuery = {
        _id: userId,
        deviceId: deviceId
    }
    return userDao.checkUserExist(userQuery).then((userExists) => {

        if (userExists) {

            let respObj = {
                userLoggedIn: true
            }
            return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, respObj)
        } else {
            let respObj = {
                userLoggedIn: false
            }
            return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, respObj)
        }
    }).catch((err) => {

        console.log({ err })
        return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
    })

}

/**
 * Get bank details
 * @param {String} userId mongo id of user
 */
function getBankDetails(userId) {

    // const deleted = await stripe.accounts.del(
    //     'acct_1HmJ4wQ0E905jN0l'
    // );
    if (!userId || !ObjectId.isValid(userId)) {

        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.invalidDetails);
    } else {

        let userQuery = {
            _id: userId,
            role: constants.ROLE.LANDLORD,
            status: constants.STATUS.ACTIVE
        }

        return userDao.checkUserExist(userQuery).then((userDetails) => {

            if (userDetails) {

                if (userDetails.stripeAccountDetails) {

                    return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, userDetails.stripeAccountDetails)
                } else {

                    return userMapper.responseMapping(userConstants.CODE.ok, userConstants.MESSAGE.success)
                }

            } else {

                return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist)
            }
        }).catch((err) => {

            console.log({ err })
            return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
        })
    }
}

/**
 * Get all active languages
 */
function getAllLanguages() {

    let languageQuery = {
        status: constants.STATUS.ACTIVE
    }

    return userDao.getAllLanguages(languageQuery).then((languages) => {

        return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, languages)
    }).catch((err) => {

        console.log({ err })
        return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
    })
}

function getStateCodes(userId, country) {

    if (!userId || !ObjectId.isValid(userId) || !country) {

        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.invalidDetails);
    } else {

        let userQuery = {
            _id: userId,
            // role: constants.ROLE.LANDLORD,
            status: constants.STATUS.ACTIVE
        }

        return userDao.checkUserExist(userQuery).then(async (userDetails) => {

            if (userDetails) {

                // return countryList.states('IN')
                let result = await countryList.getCountryByName(country)

                if (result) {

                    let states = result.provinces
                    return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, states)
                } else {

                    return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
                }
            } else {

                return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist)
            }
        }).catch((err) => {
            console.log({ err })
            return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
        })
    }
}

function getInvitationLinks() {

    let linkQuery = {
        status: constants.STATUS.ACTIVE
    }

    return userDao.getAllLinks(linkQuery).then((links) => {

        return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, links)

    }).catch((err) => {
        console.log({ err })
        return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
    })
}

function getAppleUserDetails(appleId) {

    if (!appleId) {

        return userMapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.invalidDetails)
    } else {

        let query = {
            appleId: appleId
        }

        return userDao.getAppleUserDetails(query).then((userDetails) => {

            if (userDetails) {

                return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, userDetails)

            } else {

                return userMapper.responseMapping(userConstants.CODE.notFound, userConstants.MESSAGE.userNotExist)
            }
        }).catch((err) => {

            console.log({ err })
            return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
        })
    }
}

function setAppleUserDetails(details) {

    let query = {
        appleId: details.appleId
    }

    return userDao.getAppleUserDetails(query).then((userDetails) => {

        if (userDetails) {

            return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, userDetails)

        } else {

            return userDao.setAppleUserDetails(details).then((userCreated) => {

                if (userCreated) {

                    return userMapper.responseMappingWithData(userConstants.CODE.ok, userConstants.MESSAGE.success, userCreated)

                } else {

                    return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
                }
            }).catch((err) => {

                console.log({ err })
                return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
            })
        }
    }).catch((err) => {

        console.log({ err })
        return userMapper.responseMapping(userConstants.CODE.requiredField, userConstants.MESSAGE.intrnlSrvrErr)
    })
}
module.exports = {
    registrationStep1,
    registrationStep2,
    registrationStep3,
    login,
    logout,
    forgotPasswordStep1,
    forgotPasswordStep2,
    forgotPasswordStep3,
    resetPassword,
    profileManage,
    getProfile,
    addCardDetails,
    editCardDetails,
    removeCardDetails,
    getCardDetails,
    getCMSPage,
    removeDocument,
    addFavorite,
    removeFavorite,
    getFavoriteList,
    getMyReviews,
    getLandlordReviews,
    contactUs,
    verifyUsrToken,
    socialLogin,
    inviteFriends,
    myBookings,
    addDocument,
    editDocument,
    getPrimaryCard,
    getUserNotifications,
    getUserNotificationCount,
    updateNotificationStatus,
    getChatList,
    getChats,
    deleteChats,
    updateBankDetails,
    updateFCMToken,
    checkUserLogin,
    getBankDetails,
    getAllLanguages,
    getStateCodes,
    getInvitationLinks,
    getAppleUserDetails,
    setAppleUserDetails
}