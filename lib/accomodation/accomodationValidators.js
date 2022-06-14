const amdConstant = require('./accomodationConstants');
const ObjectId = require('mongoose').Types.ObjectId;


var addAccomodation = function (req, res, next) {
    let { type, name, spaceAvailability, spaceReadyIn, address, description, media } = req.body; //category
    let response = {};
    if (!type) {
        response = {
            responseCode: amdConstant.CODE.requiredField,
            responseMessage: amdConstant.REQUIREDFIELDS.type,
            responseData: []
        }
    } else if (!name) {
        response = {
            responseCode: amdConstant.CODE.requiredField,
            responseMessage: amdConstant.REQUIREDFIELDS.name,
            responseData: []
        }
    } else if (!spaceAvailability) {
        response = {
            responseCode: amdConstant.CODE.requiredField,
            responseMessage: amdConstant.REQUIREDFIELDS.spaceAvailability,
            responseData: []
        }
    } else if (!spaceReadyIn) {
        response = {
            responseCode: amdConstant.CODE.requiredField,
            responseMessage: amdConstant.REQUIREDFIELDS.spaceReadyIn,
            responseData: []
        }
    }
    // else if (!category) {
    //     response = {
    //         responseCode: amdConstant.CODE.requiredField,
    //         responseMessage: amdConstant.REQUIREDFIELDS.category,
    //         responseData: []
    //     }
    // } 
    else if (!address) {
        response = {
            responseCode: amdConstant.CODE.requiredField,
            responseMessage: amdConstant.REQUIREDFIELDS.address,
            responseData: []
        }
    } else if (!description) {
        response = {
            responseCode: amdConstant.CODE.requiredField,
            responseMessage: amdConstant.REQUIREDFIELDS.description,
            responseData: []
        }
    } else if (!media) {
        response = {
            responseCode: amdConstant.CODE.requiredField,
            responseMessage: amdConstant.REQUIREDFIELDS.media,
            responseData: []
        }
    }
    if (!response.responseCode) {
        next();
    } else {
        res.send(response)
    }
}

var addReviews = function (req, res, next) {
    let { ratings } = req.body;
    let response = {};
    if (!ratings) {
        response = {
            responseCode: amdConstant.CODE.requiredField,
            responseMessage: amdConstant.REQUIREDFIELDS.ratings,
            responseData: []
        }
    }
    if (!response.responseCode) {
        next();
    } else {
        res.send(response)
    }
}


function validateLockDateRequest(req, res, next) {

    let { userId, propertyId } = req.params
    let { lockedDates } = req.body

    let response = {};
    if (!userId || !ObjectId.isValid(userId) || !propertyId || !ObjectId.isValid(propertyId) || !lockedDates || lockedDates.length == 0) {

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

function validateUnlockDatesRequest(req, res, next) {

    let { userId, propertyId } = req.params
    let { lockedDates } = req.body

    let response = {};
    if (!userId || !ObjectId.isValid(userId) || !propertyId || !ObjectId.isValid(propertyId) || !lockedDates || lockedDates.length == 0) {

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

function validateUpdateLockDatesRequest(req, res, next) {

    let { userId, propertyId, dateId } = req.params
    let { startDate, endDate } = req.body

    let response = {};
    if (!userId || !ObjectId.isValid(userId) || !propertyId || !ObjectId.isValid(propertyId) || !dateId || !ObjectId.isValid(dateId) || !startDate || !endDate) {

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

module.exports = {
    addAccomodation,
    addReviews,
    validateLockDateRequest,
    validateUnlockDatesRequest,
    validateUpdateLockDatesRequest
}