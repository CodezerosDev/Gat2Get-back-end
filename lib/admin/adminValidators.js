/**
 * @author Kavya Patel
 */

/*#################################            Load modules start            ########################################### */

const admConst = require('./adminConstants')
var ObjectId = require('mongoose').Types.ObjectId;
const jwtHandler = require('../jwtHandler');
const mapper = require('./adminMapper');
const appUtils = require('../appUtils');
const constants = require('../constants');

/*#################################            Load modules end            ########################################### */

/**
 * Validate JWT token
 */
function checkToken(req, res, next) {

    let token = req.headers['authorization']
    let { id } = req.params

    if (!token || !id || (!ObjectId.isValid(id))) {

        res.send(mapper.responseMapping(admConst.CODE.FRBDN, admConst.MESSAGE.TOKEN_NOT_PROVIDED))

        // return new exceptions.unauthorizeAccess(busConst.MESSAGE.TOKEN_NOT_PROVIDED)
    } else {

        return jwtHandler.verifyAdminToken(token).then((result) => {

            if (result && result._id == id) {

                next()
            } else {

                res.send(mapper.responseMapping(admConst.CODE.FRBDN, admConst.MESSAGE.TOKEN_NOT_PROVIDED))
            }
        })
    }
}

/**
 * Validating login request
 */
function checkLoginRequest(req, res, next) {

    let error = []
    let { emailId, password } = req.body

    if (!emailId || !password || (!appUtils.isValidEmail(emailId))) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating get profile request
 */
function checkGetProfileRequest(req, res, next) {

    let error = []
    let { id } = req.params

    if (!id || !ObjectId.isValid(id)) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }
    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating update profile request
 */
function checkUpdateProfileRequest(req, res, next) {

    let error = []
    let { id } = req.params
    let obj = req.body

    if (!id || !ObjectId.isValid(id) || !obj || (Object.keys(obj).length == 0)) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }
    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating forgot password request
 */
function checkForgotPasswordRequest(req, res, next) {

    let error = []
    let { emailId } = req.body

    if (!emailId || (!appUtils.isValidEmail(emailId))) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }

}

/**
 * Validating set new password by recovery link
 */
function checkSetNewPasswordRequest(req, res, next) {

    let error = []
    let { redisId } = req.params
    let { password } = req.body

    if (!redisId || !password) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }
    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating reset password request
 */
function checkResetPasswordRequest(req, res, next) {

    let error = []
    let { id } = req.params
    let { oldPassword, newPassword } = req.body

    if (!id || !ObjectId.isValid(id) || !oldPassword || !newPassword) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }
    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating verification code request
 */
function checkVerifyCodeRequest(req, res, next) {

    let error = []
    let { id } = req.params
    let { verificationCode } = req.body

    if (!id || !ObjectId.isValid(id) || !verificationCode) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }
    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating email updating request
 */
function checkUpdateEmailRequest(req, res, next) {

    let error = []
    let { id } = req.params
    let { emailId } = req.body

    if (!id || !ObjectId.isValid(id) || !emailId || !appUtils.isValidEmail(emailId)) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }
    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating CMS creating request
 */
function checkCreateCMSRequest(req, res, next) {

    let error = []
    let { id } = req.params
    let cmsDetails = req.body

    if (!id || !ObjectId.isValid(id) || !cmsDetails || (Object.keys(cmsDetails).length == 0)) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }
    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating CMS updating request 
 */
function checkUpdateCMSRequest(req, res, next) {

    let error = []
    let { id, cmsId } = req.params
    let cmsDetails = req.body

    if (!id || !ObjectId.isValid(id) || !cmsId || !ObjectId.isValid(cmsId) || !cmsDetails || (Object.keys(cmsDetails).length == 0)) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }
    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating language adding request
 */
function checkAddLanguageRequest(req, res, next) {

    let error = []
    let { id } = req.params
    let languageDetails = req.body

    if (!id || !ObjectId.isValid(id) || !languageDetails || (Object.keys(languageDetails).length == 0)) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }
    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating language updating request
 */
function checkUpdateLanguageRequest(req, res, next) {

    let error = []
    let { id, languageId } = req.params
    let languageDetails = req.body

    if (!id || !ObjectId.isValid(id) || !languageId || !ObjectId.isValid(languageId) || !languageDetails || (Object.keys(languageDetails).length == 0)) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }
    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating category creating request
 */
function checkCreateCategoryRequest(req, res, next) {

    let error = []
    let { id } = req.params
    let categoryDetails = req.body

    if (!id || !ObjectId.isValid(id) || !categoryDetails || (Object.keys(categoryDetails).length == 0)) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }
    let { type, name } = categoryDetails
    if (!type || !name) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })

    }
    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating category updating rquest
 */
function checkUpdateCategoryRequest(req, res, next) {

    let error = []
    let { id, categoryId } = req.params
    let { name } = req.body

    if (!id || !ObjectId.isValid(id) || !categoryId || !ObjectId.isValid(categoryId) || !name) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating template creating request
 */
function checkCreateTemplateRequest(req, res, next) {

    let error = []
    let { id } = req.params
    let { type, mailName } = req.body

    if (!id || !ObjectId.isValid(id) || !type || !mailName) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })

    } else {

        if (type == constants.TEMPLATE_TYPES.EMAIL) {
            let { mailTitle, mailBody, mailSubject, } = req.body

            if (!mailTitle || !mailBody || !mailSubject) {

                error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
            }
        } else {

            let { notificationMessage } = req.body
            if (!notificationMessage || Object.keys(notificationMessage).length == 0) {

                error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
            }
        }
    }
    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }

}

/**
 * Validating template updating request
 */
function checkUpdateTemplateRequest(req, res, next) {

    let error = []
    let { id, templateId } = req.params
    let templateDetails = req.body

    if (!id || !ObjectId.isValid(id) || !templateId || !ObjectId.isValid(templateId) || !templateDetails || Object.keys(templateDetails).length == 0) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }
    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating user adding request
 */
function checkAddUserRequest(req, res, next) {

    let error = []
    let { id } = req.params
    let userDetails = req.body

    if (!id || !ObjectId.isValid(id) || !userDetails || Object.keys(userDetails).length == 0) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    let { emailId, contactNumber, firstName, lastName, password, role } = userDetails

    if (!emailId || !contactNumber || !firstName || !lastName || !password || !appUtils.isValidEmail(emailId) || !role) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating user updating request
 */
function checkUpdateUserRequest(req, res, next) {

    let error = []
    let { id, userId } = req.params
    let userDetails = req.body

    if (!id || !ObjectId.isValid(id) || !userId || !ObjectId.isValid(userId) || !userDetails || Object.keys(userDetails).length == 0) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating amenities creating request
 */
function checkCreateAmenitiesRequest(req, res, next) {

    let error = []
    let { id } = req.params
    let amenitiesDetails = req.body

    if (!id || !ObjectId.isValid(id) || !amenitiesDetails || Object.keys(amenitiesDetails).length == 0) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    let { title, amenities } = amenitiesDetails
    if (!title || !amenities || amenities.length == 0) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating amenities adding request
 */
function checkAddAmenitiesRequest(req, res, next) {

    let error = []
    let { id, amenitiesId } = req.params
    let { amenities } = req.body

    if (!id || !ObjectId.isValid(id) || !amenitiesId || !ObjectId.isValid(amenitiesId) || !amenities || amenities.length == 0) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating amenities updating request
 */
function checkUpdateAmenitiesRequest(req, res, next) {

    let error = []
    let { id, amenitiesId } = req.params
    let details = req.body

    if (!id || !ObjectId.isValid(id) || !amenitiesId || !ObjectId.isValid(amenitiesId) || !details || Object.keys(details).length == 0) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating user's KYC verification updating request
 */
function checkUpdateKYCVerificationRequest(req, res, next) {

    let error = []
    let { id, landlordId } = req.params
    let { isKYCVerified } = req.body

    if (!id || !ObjectId.isValid(id) || !landlordId || !ObjectId.isValid(landlordId) || !isKYCVerified) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating accomodation updating request
 */
function checkUpdateAccomodationRequest(req, res, next) {

    let error = []
    let { id, accomodationId } = req.params
    let details = req.body

    if (!id || !ObjectId.isValid(id) || !accomodationId || !ObjectId.isValid(accomodationId) || !details || Object.keys(details).length == 0) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating query replying request
 */
function checkQueryReplyRequest(req, res, next) {

    let error = []
    let { id, queryId } = req.params
    let { reply } = req.body

    if (!id || !ObjectId.isValid(id) || !queryId || !ObjectId.isValid(queryId) || !reply) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating service fee setting request
 */
function checkSetServiceFeeRequest(req, res, next) {

    let error = []
    let { id } = req.params
    let { serviceFee } = req.body

    if (!id || !ObjectId.isValid(id) || !serviceFee) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating notification template creating request
 */
function checkCreateNotificationTemplateRequest(req, res, next) {

    let error = []
    let { id } = req.params
    let templateDetails = req.body

    if (!id || !ObjectId.isValid(id) || !templateDetails || Object.keys(templateDetails).length == 0) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    } else {

        let { type, messageBody } = templateDetails
        if (!type || !messageBody) {
            error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })

        }
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating notification update status
 */
function updateNotificationStatusRequest(req, res, next) {

    let error = []
    let { id } = req.params
    let details = req.body

    if (!id || !ObjectId.isValid(id) || !details || Object.keys(details).length == 0) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating payment releasing request
 */
function checkReleasePaymentRequest(req, res, next) {

    let error = []
    let { id, landlordId } = req.params
    let details = req.body

    if (!id || !ObjectId.isValid(id) || !landlordId || !ObjectId.isValid(landlordId) || !details || Object.keys(details).length == 0) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    } else {

        let { paymentIds, totalAmount } = details
        if (!paymentIds || !totalAmount || paymentIds.length == 0) {

            error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
        }
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating refund payment request
 */
function checkRefundPaymentRequest(req, res, next) {

    let error = []
    let { id, userId, bookingId } = req.params
    let { amount } = req.body

    if (!id || !ObjectId.isValid(id) || !userId || !ObjectId.isValid(userId) || !bookingId || !ObjectId.isValid(bookingId) || !amount) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating tax adding request
 */
function checkAddTaxRequest(req, res, next) {

    let error = []
    let { id } = req.params
    let details = req.body

    if (!id || !ObjectId.isValid(id) || !details || Object.keys(details).length == 0) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    let { type, country, rate, stateTaxes } = details
    if (!type || !country || (type == constants.TAX_TYPES.COUNTRY && !rate) || (type == constants.TAX_TYPES.STATE && (!stateTaxes || stateTaxes.length == 0))) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating creating invitation link request
 */
function checkCreateInvitationLinkRequest(req, res, next) {

    let error = []
    let { id } = req.params
    let { type, URL } = req.body

    if (!id || !ObjectId.isValid(id) || !type || !URL) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}

/**
 * Validating invitation link updating request 
 */
function checkUpdateInvitationLinkRequest(req, res, next) {

    let error = []
    let { id, linkId } = req.params
    let { URL } = req.body

    if (!id || !ObjectId.isValid(id) || !linkId || !ObjectId.isValid(linkId) || !URL) {

        error.push({ responseCode: admConst.CODE.BadRequest, responseMessage: admConst.MESSAGE.InvalidDetails })
    }

    if (error.length > 0) {

        res.json(mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails))
    } else {

        next()
    }
}
module.exports = {

    checkToken,

    checkLoginRequest,

    checkGetProfileRequest,

    checkUpdateProfileRequest,

    checkForgotPasswordRequest,

    checkSetNewPasswordRequest,

    checkResetPasswordRequest,

    checkVerifyCodeRequest,

    checkUpdateEmailRequest,

    checkCreateCMSRequest,

    checkUpdateCMSRequest,

    checkAddLanguageRequest,

    checkUpdateLanguageRequest,

    checkCreateCategoryRequest,

    checkUpdateCategoryRequest,

    checkCreateTemplateRequest,

    checkUpdateTemplateRequest,

    checkAddUserRequest,

    checkUpdateUserRequest,

    checkCreateAmenitiesRequest,

    checkAddAmenitiesRequest,

    checkUpdateAmenitiesRequest,

    checkUpdateKYCVerificationRequest,

    checkUpdateAccomodationRequest,

    checkQueryReplyRequest,

    checkSetServiceFeeRequest,

    checkCreateNotificationTemplateRequest,

    updateNotificationStatusRequest,

    checkReleasePaymentRequest,

    checkRefundPaymentRequest,

    checkAddTaxRequest,

    checkCreateInvitationLinkRequest,

    checkUpdateInvitationLinkRequest

}