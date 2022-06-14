const userConstant = require('./userConstants');
const emailRegEx = /^[A-Za-z\d\.\_\-\+]{2,64}\@([A-Za-z\d\-\_]{1,256})\.[A-Za-z\d]+(.[A-Za-z\d]+)?$/;
const jwtHandler = require('../jwtHandler');
const ObjectId = require('mongoose').Types.ObjectId;

// Verify User Token
function verifyUsrToken(req, res, next) {

    let token = req.headers['authorization']
    let userId = req.params['userId']

    if (!token || !userId || (!ObjectId.isValid(userId))) {
        return res.status(userConstant.CODE.forbiddenRequest).json({ responseMessage: userConstant.MESSAGE.TOKEN_NOT_PROVIDED })
    } else {
        return jwtHandler.verifyUsrToken(token).then((result) => {
            if (result && result._id == userId) {
                next();
            } else {
                return res.status(userConstant.CODE.forbiddenRequest).json({
                    responseMessage: userConstant.MESSAGE.UnauthorizedAccess,
                    responseData: {
                        tokenExpire: true
                    }
                })
            }
        })
    }
}

var registrationStep1 = function (req, res, next) {
    let { emailId } = req.body;
    let response = {};
    if (!emailId) {
        response = {
            responseCode: userConstant.CODE.requiredField,
            responseMessage: userConstant.REQUIREDFIELDS.email,
            responseData: []
        }
    } else {
        // check email validation
        var pattern = emailRegEx;
        var checkemail = new RegExp(pattern).test(emailId);
        if (!checkemail) {
            response = {
                responseCode: userConstant.CODE.badrequest,
                responseMessage: userConstant.MESSAGE.invalidEmailPattern,
                responseData: []
            }
        }
    }
    if (!response.responseCode) {
        next();
    } else {
        res.send(response)
    }
}

var registrationStep2 = function (req, res, next) {
    let { code } = req.body;
    let response = {};
    if (!code) {
        response = {
            responseCode: userConstant.CODE.requiredField,
            responseMessage: userConstant.REQUIREDFIELDS.code,
            responseData: []
        }
    }
    if (!response.responseCode) {
        next();
    } else {
        res.send(response)
    }
}

var registrationStep3 = function (req, res, next) {
    let { firstName, lastName, contactNumber } = req.body;
    let response = {};
    if (!firstName) {
        response = {
            responseCode: userConstant.CODE.requiredField,
            responseMessage: userConstant.REQUIREDFIELDS.firstName,
            responseData: []
        }
    } else if (!lastName) {
        response = {
            responseCode: userConstant.CODE.requiredField,
            responseMessage: userConstant.REQUIREDFIELDS.lastName,
            responseData: []
        }
    } else if (!contactNumber) {
        response = {
            responseCode: userConstant.CODE.requiredField,
            responseMessage: userConstant.REQUIREDFIELDS.contactNumber,
            responseData: []
        }
    }
    if (!response.responseCode) {
        next();
    } else {
        res.send(response)
    }
}

var login = function (req, res, next) {
    let { emailId, password } = req.body;
    let response = {};
    if (!emailId) {
        response = {
            responseCode: userConstant.CODE.requiredField,
            responseMessage: userConstant.MESSAGE.invalidLoginDetail,
            responseData: []
        }
    } else {
        // check email validation
        var pattern = emailRegEx;
        var checkemail = new RegExp(pattern).test(emailId);
        if (!checkemail) {
            response = {
                responseCode: userConstant.CODE.badrequest,
                responseMessage: userConstant.MESSAGE.invalidEmailPattern,
                responseData: []
            }
        } else if (!password) {
            response = {
                responseCode: userConstant.CODE.requiredField,
                responseMessage: userConstant.MESSAGE.invalidLoginDetail,
                responseData: []
            }
        }
    }
    if (!response.responseCode) {
        next();
    } else {
        res.send(response)
    }
}

var forgotPassword = function (req, res, next) {
    let { emailId } = req.body;
    let response = {};
    if (!emailId) {
        response = {
            responseCode: userConstant.CODE.requiredField,
            responseMessage: userConstant.MESSAGE.invalidLoginDetail,
            responseData: []
        }
    } else {
        // check email validation
        var pattern = emailRegEx;
        var checkemail = new RegExp(pattern).test(emailId);
        if (!checkemail) {
            response = {
                responseCode: userConstant.CODE.badrequest,
                responseMessage: userConstant.MESSAGE.invalidEmailPattern,
                responseData: []
            }
        }
    }
    if (!response.responseCode) {
        next();
    } else {
        res.send(response)
    }
}

var setNewPassword = function (req, res, next) {
    let { new_password } = req.body;
    let response = {};
    if (!new_password) {
        response = {
            responseCode: userConstant.CODE.requiredField,
            responseMessage: userConstant.REQUIREDFIELDS.new_password,
            responseData: []
        }
    }
    if (!response.responseCode) {
        next();
    } else {
        res.send(response)
    }
}

var resetPassword = function (req, res, next) {
    let { old_password, new_password } = req.body;
    let response = {};
    if (!old_password) {
        response = {
            responseCode: userConstant.CODE.requiredField,
            responseMessage: userConstant.REQUIREDFIELDS.old_password,
            responseData: []
        }
    } else if (!new_password) {
        response = {
            responseCode: userConstant.CODE.requiredField,
            responseMessage: userConstant.REQUIREDFIELDS.new_password,
            responseData: []
        }
    }
    if (!response.responseCode) {
        next();
    } else {
        res.send(response)
    }
}

function validateUpdateNotificationStatus(req, res, next) {

    let { userId } = req.params
    let { notificationIds } = req.body

    let response = {};
    if (!userId || !ObjectId.isValid(userId) || !notificationIds || notificationIds.length == 0) {
        response = {
            responseCode: userConstant.CODE.badrequest,
            responseMessage: userConstant.MESSAGE.invalidDetails,
        }
    }
    if (!response.responseCode) {
        next();
    } else {
        res.send(response)
    }
}

function validateUpdateBankDetails(req, res, next) {

    let { userId } = req.params
    let { address, dob, gender, idNumber, businessProfile, tosAcceptance } = req.body

    let response = {};
    if (!userId || !ObjectId.isValid(userId) || !address || Object.keys(address).length == 0 || !dob || Object.keys(dob).length == 0 || !gender || !idNumber || !businessProfile || Object.keys(businessProfile).length == 0 || !tosAcceptance || Object.keys(tosAcceptance).length == 0) {
        response = {
            responseCode: userConstant.CODE.badrequest,
            responseMessage: userConstant.MESSAGE.invalidDetails,
        }
    } else {

        let { city, line1, line2, postalCode, state, country } = address
        let { day, month, year } = dob
        let { mcc, productDescription } = businessProfile
        let { date, ip } = tosAcceptance

        if (!city || !line1 || !line2 || !postalCode || !state || !country || !day || !month || !year || !mcc || !productDescription || !date || !ip) {
            response = {
                responseCode: userConstant.CODE.badrequest,
                responseMessage: userConstant.MESSAGE.invalidDetails,
            }
        }
    }
    if (!response.responseCode) {
        next();
    } else {
        res.send(response)
    }
}

module.exports = {
    verifyUsrToken,
    registrationStep1,
    registrationStep2,
    registrationStep3,
    login,
    forgotPassword,
    setNewPassword,
    resetPassword,
    validateUpdateNotificationStatus,
    validateUpdateBankDetails,
}