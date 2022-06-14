/**
 * @author Kavya Patel
 */

/*#################################            Load modules start            ########################################### */

const dao = require('./adminDao')
const admConst = require('./adminConstants')
const mapper = require('./adminMapper')
const constants = require('../constants')
const appUtils = require('../appUtils')
const jwtHandler = require('../jwtHandler')
var ObjectId = require('mongoose').Types.ObjectId;
const redisServer = require('../redis')
const mailHandler = require('../middleware/email')
const scrtKey = process.env.stripeSecretKey_test
const stripe = require('stripe')(scrtKey);
const { Parser } = require('json2csv')

/*#################################            Load modules end            ########################################### */

/**
 * Admin login
 * @param {string} emailId email id of admin
 * @param {string} password password of admin
 */
function login(emailId, password) {

    if (!emailId || !password) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let emailQuery = {
            emailId: emailId,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(emailQuery).then((adminDetails) => {

            if (!adminDetails) {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidEmailId)
            } else {

                let passObj = {
                    password: password
                }
                return appUtils.verifyPassword(passObj, adminDetails).then((isValidPassword) => {

                    if (isValidPassword) {

                        let updateObj = {
                            isLoggedOut: false
                        }
                        return dao.updateProfile(emailQuery, updateObj).then((profileUpdated) => {

                            if (profileUpdated) {

                                let adminObj = {
                                    _id: adminDetails._id,
                                    emailId: adminDetails.emailId,
                                    contactNumber: adminDetails.contactNumber
                                }
                                return jwtHandler.genAdminToken(adminObj).then((token) => {

                                    let filteredAdminDetails = mapper.filterAdminResponse(profileUpdated)
                                    filteredAdminDetails.token = token

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.LoginSuccess, filteredAdminDetails)
                                }).catch((err) => {

                                    console.log({ err })
                                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                                })
                            } else {

                                console.log("Unable to update log in status")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })

                    } else {

                        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidPassword)
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })

            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * 
 * @param {String} id mongo id of admin
 */
function logout(id) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)

    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let updateObj = {
                    isLoggedOut: true
                }
                return dao.updateProfile(adminQuery, updateObj).then((profileUpdated) => {

                    if (profileUpdated) {

                        return mapper.responseMapping(admConst.CODE.Success, admConst.MESSAGE.Success)

                    } else {

                        console.log("Failed to update logout flag")
                        return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get profile
 * @param {string} id mongo id of admin to fetch profile details
 */
function getProfile(id) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)

    } else {

        let query = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(query).then((adminDetails) => {

            if (adminDetails) {

                let filteredAdminDetails = mapper.filterAdminResponse(adminDetails)
                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, filteredAdminDetails)
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Update profile
 * @param {string} id mongo id of admin
 * @param {object} obj admin profile updating details
 */
function updateProfile(id, obj) {

    if (!id || !ObjectId.isValid(id) || !obj || (Object.keys(obj).length == 0)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let query = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(query).then((adminDetails) => {

            if (adminDetails) {

                let filterAllowedAdminUpdateFields = mapper.filterAllowedAdminUpdateFields(obj)

                return dao.updateProfile(query, filterAllowedAdminUpdateFields).then((adminUpdated) => {

                    if (adminUpdated) {

                        let filteredAdminDetails = mapper.filterAdminResponse(adminUpdated)
                        return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.ProfileUpdated, filteredAdminDetails)
                    } else {

                        console.log("Failed to update profile")
                        return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)

                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Recover password by email
 * @param {string} emailId email id of admin for recover password
 */
function forgotPassword(emailId) {

    if (!emailId || (!appUtils.isValidEmail(emailId))) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let query = {
            emailId: emailId,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }
        return dao.getAdminDetails(query).then(async (isExist) => {

            if (isExist) {

                let obj = {
                    type: 'FORGOT',
                    userId: isExist._id,
                    emailId: isExist.emailId,
                    isActive: true,
                    expiryTime: (new Date().getTime() + (24 * 60 * 60 * 1000))
                }

                let redisId = await redisServer.setRedisDetails(obj);

                let mailQuery = {
                    mailName: constants.EMAIL_TEMPLATES.ADMIN_FORGOT_PASSWORD,
                    status: constants.STATUS.ACTIVE
                }
                let templateDetails = await dao.getTemplateDetails(mailQuery);

                if (templateDetails) {
                    let adminObj = {
                        firstName: isExist.firstName,
                        emailId: isExist.emailId,
                        redisId: redisId
                    }
                    let mailSent = mailHandler.SEND_MAIL(adminObj, templateDetails)
                }
                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.ResetPasswordMailSent, redisId)

            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((e) => {

            console.log({ e })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })

    }
}

/**
 * Set new password
 * @param {string} redisId redis id for recovering password
 * @param {string} password new password to set
 */
async function setNewPassword(redisId, password) {

    if (!redisId || !password) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)

    } else {

        let isUserExists = await redisServer.getRedisDetails(redisId)

        if (isUserExists) {

            let newPass = await appUtils.convertPass(password);

            let query = {
                _id: isUserExists.userId,
                status: constants.STATUS.ACTIVE,
                role: constants.ROLE.ADMIN
            }
            let updateObj = {
                password: newPass
            }
            return dao.updateProfile(query, updateObj).then(async (updateDone) => {

                if (updateDone) {

                    let query = {
                        mailName: constants.EMAIL_TEMPLATES.RESET_PASSWORD,
                        status: constants.STATUS.ACTIVE
                    }
                    let templateDetails = await dao.getTemplateDetails(query);

                    let mailBodyDetails = updateDone

                    let mailConfig = mailHandler.SEND_MAIL(mailBodyDetails, templateDetails);

                    return mapper.responseMapping(admConst.CODE.Success, admConst.MESSAGE.PasswordUpdateSuccess)

                } else {
                    console.log("Failed to reset password");
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                }

            }).catch((e) => {

                console.log({ e })
                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
            })

        } else {

            return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.ResetPasswordLinkExpired)
        }
    }
}

/**
 * Reset password
 * @param {string} id mongo id of admin
 * @param {string} oldPassword old password to verify
 * @param {string} newPassword new password to reset
 */
function resetPassword(id, oldPassword, newPassword) {

    if (!id || !ObjectId.isValid(id) || !oldPassword || !newPassword) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)

    } else {

        let query = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(query).then((adminDetails) => {

            if (adminDetails) {

                let passObj = {
                    password: oldPassword
                }
                return appUtils.verifyPassword(passObj, adminDetails).then(async (isPasswordMatch) => {

                    if (isPasswordMatch) {

                        let password = newPassword;
                        let newPass = await appUtils.convertPass(password);

                        let updateObj = {
                            password: newPass
                        }
                        return dao.updateProfile(query, updateObj).then(async (updateDone) => {

                            if (updateDone) {

                                let query = {
                                    mailName: constants.EMAIL_TEMPLATES.RESET_PASSWORD,
                                    status: constants.STATUS.ACTIVE
                                }
                                let templateDetails = await dao.getTemplateDetails(query);

                                let mailBodyDetails = updateDone

                                let mailConfig = mailHandler.SEND_MAIL(mailBodyDetails, templateDetails);

                                return mapper.responseMapping(admConst.CODE.Success, admConst.MESSAGE.PasswordUpdateSuccess)

                            } else {
                                console.log("Failed to reset password");
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((e) => {

                            console.log({ e });
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    } else {

                        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidCredentials)
                    }
                }).catch((e) => {

                    console.log({ e });
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * If email changing is attempted, need to send verification code to existing email id
 * @param {string} id mongo id of admin to confirm email changing
 */
function sendCode(id) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let query = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(query).then(async (adminDetails) => {

            if (adminDetails) {

                let obj = {
                    type: 'EMAIL_UPDATE',
                    userId: adminDetails._id,
                    emailId: adminDetails.emailId,
                    isActive: true,
                    expiryTime: (new Date().getTime() + (60 * 5000))
                }

                let redisId = await redisServer.setRedisDetails(obj)

                let mailQuery = {
                    mailName: constants.EMAIL_TEMPLATES.ADMIN_UPDATE_EMAIL_VERIFICATION,
                    status: constants.STATUS.ACTIVE
                }
                let templateDetails = await dao.getTemplateDetails(mailQuery);
                if (templateDetails) {
                    let adminObj = {
                        firstName: adminDetails.firstName,
                        emailId: adminDetails.emailId,
                        redisId: redisId
                    }

                    let mailSent = mailHandler.SEND_MAIL(adminObj, templateDetails)
                }
                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.OldEmailVerification, redisId)
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Verify code
 * @param {string} id mongo id of admin
 * @param {string} verificationCode redis id to verify
 */
async function verifyCode(id, verificationCode) {

    if (!id || !ObjectId.isValid(id) || !verificationCode) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)

    } else {

        let isUserExists = await redisServer.getRedisDetails(verificationCode)

        if (isUserExists) {

            return mapper.responseMapping(admConst.CODE.Success, admConst.MESSAGE.Success)

        } else {

            return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidVerificationCode)
        }
    }
}

/**
 * Update email 
 * @param {string} id mongo id of admin
 * @param {string} emailId new email id to be updated
 */
function updateEmail(id, emailId) {

    if (!id || !ObjectId.isValid(id) || !emailId || !appUtils.isValidEmail(emailId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)

    } else {

        let query = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(query).then((adminDetails) => {

            if (adminDetails) {

                let emailQuery = {
                    emailId: emailId,
                    _id: { $ne: id }
                }

                return dao.getAdminDetails(emailQuery).then((emailExists) => {

                    if (emailExists) {

                        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.EmailAlreadyExists)

                    } else {

                        let updateObj = {
                            emailId: emailId
                        }
                        return dao.updateProfile(query, updateObj).then((profileUpdated) => {

                            if (profileUpdated) {

                                return mapper.responseMapping(admConst.CODE.Success, admConst.MESSAGE.EmailResetSuccessful)

                            } else {

                                console.log("Failed to update email")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }

                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Create CMS
 * @param {String} id mongo id of admin
 * @param {Object} cmsDetails CMS page details
 */
function createCMS(id, cmsDetails) {

    if (!id || !ObjectId.isValid(id) || !cmsDetails || (Object.keys(cmsDetails).length == 0)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let cmsQuery = {
                    type: cmsDetails.type
                }
                return dao.getCMSDetails(cmsQuery).then((cmsExists) => {

                    if (cmsExists) {

                        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.CMSPageAlreadyExists)

                    } else {

                        cmsDetails.createdAt = new Date().getTime()
                        cmsDetails.createdBy = id

                        return dao.createCMS(cmsDetails).then((cmsCreated) => {

                            if (cmsCreated) {

                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.CMSPageCreatedSuccess, cmsCreated)

                            } else {

                                console.log("Failed to create CMS")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all CMS pages
 * @param {String} id mongo id of admin
 */
function getAllCMS(id) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                return dao.getAllCMS().then((cmsPages) => {

                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, cmsPages)
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get CMS page details
 * @param {String} id mongo id of admin
 * @param {String} cmsId mongo id of CMS page to get details
 */
function getCMSDetails(id, cmsId) {

    if (!id || !ObjectId.isValid(id) || !cmsId || !ObjectId.isValid(cmsId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let cmsQuery = {
                    _id: cmsId
                }

                return dao.getCMSDetails(cmsQuery).then((cmsDetails) => {

                    if (cmsDetails) {

                        return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, cmsDetails)
                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.CMSPageNotFound)

                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Update CMS page
 * @param {String} id mongo id of admin
 * @param {String} cmsId mongo id of CMS page to be updated
 * @param {Object} cmsDetails cms updating details
 */
function updateCMS(id, cmsId, cmsDetails) {

    if (!id || !ObjectId.isValid(id) || !cmsId || !ObjectId.isValid(cmsId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let cmsQuery = {
                    _id: cmsId,
                    status: constants.STATUS.ACTIVE
                }

                return dao.getCMSDetails(cmsQuery).then((cmsExists) => {

                    if (cmsExists) {

                        let allowedCMSUpdatingFields = mapper.allowedCMSUpdatingFields(cmsDetails)
                        allowedCMSUpdatingFields.editedAt = new Date().getTime()
                        allowedCMSUpdatingFields.editedBy = id

                        return dao.updateCMS(cmsQuery, allowedCMSUpdatingFields).then((cmsPageUpdated) => {

                            if (cmsPageUpdated) {

                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.CMSPageUpdatedSuccess, cmsPageUpdated)
                            } else {

                                console.log("Failed to update CMS page")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)

                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.CMSPageNotFound)

                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Delete Resurrect CMS page
 * @param {String} id mongo id of admin
 * @param {String} cmsId mongo id of CMS page to be deleted or resurrected
 */
function deleteCMS(id, cmsId) {

    if (!id || !ObjectId.isValid(id) || !cmsId || !ObjectId.isValid(cmsId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let cmsQuery = {
                    _id: cmsId,
                }

                return dao.getCMSDetails(cmsQuery).then((cmsExists) => {

                    if (cmsExists) {

                        let updateObj = {}
                        if (cmsExists.status == constants.STATUS.ACTIVE) {

                            updateObj = {
                                status: constants.STATUS.INACTIVE
                            }

                        } else {
                            updateObj = {
                                status: constants.STATUS.ACTIVE
                            }
                        }

                        return dao.updateCMS(cmsQuery, updateObj).then((cmsPageUpdated) => {

                            if (cmsPageUpdated) {

                                if (cmsPageUpdated.status == constants.STATUS.ACTIVE) {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.CMSPageActivated, cmsPageUpdated)

                                } else {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.CMSPageDeactivated, cmsPageUpdated)
                                }
                            } else {

                                console.log("Failed to update CMS")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)

                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.CMSPageNotFound)

                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Add language
 * @param {String} id mongo id of admin
 * @param {Object} languageDetails languages to be added
 */
function addLanguage(id, languageDetails) {

    if (!id || !ObjectId.isValid(id) || !languageDetails || Object.keys(languageDetails).length == 0) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let languageQuery = {
                    type: languageDetails.type
                }
                return dao.getLanguageDetails(languageQuery).then((languageExists) => {

                    if (languageExists) {

                        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.LanguageAlreadyExists)

                    } else {

                        languageDetails.createdAt = new Date().getTime()
                        languageDetails.createdBy = id

                        return dao.addLanguage(languageDetails).then((languageAdded) => {

                            if (languageAdded) {

                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.LanguageAddedSuccess, languageAdded)
                            } else {

                                console.log("Failed to add language")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all languages
 * @param {String} id mongo id of admin
 */
function getAllLanguages(id) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                return dao.getAllLanguages().then((languages) => {

                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, languages)
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get language details
 * @param {String} id mongo id of admin
 * @param {String} languageId mongo id of language to fetch details
 */
function getLanguageDetails(id, languageId) {

    if (!id || !ObjectId.isValid(id) || !languageId || !ObjectId.isValid(languageId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let languageQuery = {
                    _id: languageId
                }

                return dao.getLanguageDetails(languageQuery).then((languageDetails) => {

                    if (languageDetails) {

                        return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, languageDetails)

                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.LanguageNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Update language
 * @param {String} id mongo id of admin
 * @param {String} languageId mongo id of language
 * @param {Object} languageDetails language details to be updated
 */
function updateLanguage(id, languageId, languageDetails) {

    if (!id || !ObjectId.isValid(id) || !languageId || !ObjectId.isValid(languageId) || !languageDetails || Object.keys(languageDetails).length == 0) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let languageQuery = {
                    _id: languageId,
                    status: constants.STATUS.ACTIVE
                }

                return dao.getLanguageDetails(languageQuery).then((languageExists) => {

                    if (languageExists) {

                        let allowedLanguageUpdateFields = mapper.allowedLanguageUpdateFields(languageDetails)
                        allowedLanguageUpdateFields.editedAt = new Date().getTime()
                        allowedLanguageUpdateFields.editedBy = id

                        return dao.updateLanguage(languageQuery, allowedLanguageUpdateFields).then((languageUpdated) => {

                            if (languageUpdated) {

                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.LanguageUpdatedSuccess, languageUpdated)
                            } else {

                                console.log("Failed to update language")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)

                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })

                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.LanguageNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Delete or resurrect language
 * @param {String} id mongo id of admin
 * @param {String} languageId mongo id of language to be deleted or resurrected
 */
function deleteLanguage(id, languageId) {

    if (!id || !ObjectId.isValid(id) || !languageId || !ObjectId.isValid(languageId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let languageQuery = {
                    _id: languageId,
                }

                return dao.getLanguageDetails(languageQuery).then((languageExists) => {

                    if (languageExists) {

                        let updateObj = {}
                        if (languageExists.status == constants.STATUS.ACTIVE) {

                            updateObj = {
                                status: constants.STATUS.INACTIVE
                            }

                        } else {
                            updateObj = {
                                status: constants.STATUS.ACTIVE
                            }
                        }

                        return dao.updateLanguage(languageQuery, updateObj).then((languageUpdated) => {

                            if (languageUpdated) {

                                if (languageUpdated.status == constants.STATUS.ACTIVE) {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.LanguageActivated, languageUpdated)

                                } else {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.LanguageDeactivated, languageUpdated)
                                }
                            } else {

                                console.log("Failed to update CMS")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)

                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })

                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.LanguageNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Create category
 * @param {String} id mongo id of admin
 * @param {Object} categoryDetails category to be added
 */
function createCategory(id, categoryDetails) {

    if (!id || !ObjectId.isValid(id) || !categoryDetails || Object.keys(categoryDetails).length == 0) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let categoryQuery = {
                    type: categoryDetails.type,
                    name: categoryDetails.name
                }

                return dao.getCategoryDetails(categoryQuery).then((categoryExists) => {

                    if (categoryExists) {

                        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.CategoryAlreadyExists)

                    } else {

                        categoryDetails.createdAt = new Date().getTime()
                        categoryDetails.createdBy = id
                        return dao.createCategory(categoryDetails).then((categoryCreated) => {

                            if (categoryCreated) {

                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.CategoryCreatedSuccess, categoryCreated)

                            } else {

                                console.log("Failed to create category")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all categories
 * @param {String} id mongo id of admin
 * @param {String} type category type to fetch its sub categories
 */
function getAllCategories(id, type) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let categoryQuery = {}
                if (type) {
                    categoryQuery = {
                        type: type
                    }
                }
                console.log({ categoryQuery })
                return dao.getAllCategories(categoryQuery).then((categories) => {

                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, categories)
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Update category
 * @param {String} id mongo id of admin
 * @param {String} categoryId mongo id of category to be updated
 * @param {Object} categoryDetails category updating details
 */
function updateCategory(id, categoryId, categoryDetails) {

    if (!id || !ObjectId.isValid(id) || !categoryId || !ObjectId.isValid(categoryId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let categoryQuery = {
                    _id: categoryId,
                    status: constants.STATUS.ACTIVE
                }

                return dao.getCategoryDetails(categoryQuery).then((categoryExists) => {

                    if (categoryExists) {

                        categoryDetails.editedAt = new Date().getTime()
                        categoryDetails.editedBy = id

                        return dao.updateCategory(categoryQuery, categoryDetails).then((categoryUpdated) => {

                            if (categoryUpdated) {

                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.CategoryUpdatedSuccess, categoryUpdated)

                            } else {

                                console.log("Failed to update category")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)

                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.CategoryNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Delete or Resurrect Category
 * @param {String} id mongo id of admin
 * @param {String} categoryId mongo id of category to be deleted or resurrected
 */
function deleteCategory(id, categoryId) {

    if (!id || !ObjectId.isValid(id) || !categoryId || !ObjectId.isValid(categoryId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let categoryQuery = {
                    _id: categoryId,
                }

                return dao.getCategoryDetails(categoryQuery).then((categoryExists) => {

                    if (categoryExists) {

                        let updateObj = {}
                        if (categoryExists.status == constants.STATUS.ACTIVE) {

                            updateObj = {
                                status: constants.STATUS.INACTIVE
                            }

                        } else {
                            updateObj = {
                                status: constants.STATUS.ACTIVE
                            }
                        }

                        return dao.updateCategory(categoryQuery, updateObj).then((categoryUpdated) => {

                            if (categoryUpdated) {

                                if (categoryUpdated.status == constants.STATUS.ACTIVE) {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.CategoryActivated, categoryUpdated)

                                } else {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.CategoryDeactivated, categoryUpdated)
                                }
                            } else {

                                console.log("Failed to update CMS")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)

                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })

                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.LanguageNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}


/**
 * Create Template
 * @param {string} id mongo id of admin who is creating template
 * @param {object} templateDetails email template details to be added
 */
function createTemplate(id, templateDetails) {

    if (!id || !ObjectId.isValid(id) || !templateDetails || (Object.keys(templateDetails).length == 0)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let mailQuery = {

                    mailName: templateDetails.mailName
                }

                return dao.getTemplateDetails(mailQuery).then((templateExists) => {

                    if (templateExists) {

                        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.TemplateAlreadyExists)
                    } else {

                        let filterAllowedTemplateFields = mapper.filterAllowedTemplateFields(templateDetails)
                        filterAllowedTemplateFields.createdBy = id
                        filterAllowedTemplateFields.createdAt = new Date().getTime()

                        return dao.createTemplate(filterAllowedTemplateFields).then((templateCreated) => {

                            if (templateCreated) {

                                let allowedTemplateFields = mapper.filterAllowedTemplateFields(templateCreated)
                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.TemplateCreatedSuccess, allowedTemplateFields)

                            } else {

                                console.log('Failed to create template')
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all templates
 * @param {string} id mongo id of admin to fetch templates
 * @param {Object} queryParams query params for sorting, paginations
 */
function getAllTemplates(id, queryParams) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then(async (adminDetails) => {

            if (adminDetails) {

                let tmpQuery = {}

                let totalTemplates = await dao.getTemplateCounts(tmpQuery)

                let sortQuery = {}
                if (queryParams.column) {

                    sortQuery[queryParams.column] = ((queryParams.dir == "asc") ? 1 : -1)
                } else {

                    sortQuery['createdAt'] = -1
                }

                let aggregateQuery = [
                    {
                        $match: tmpQuery
                    },
                    {
                        $sort: sortQuery
                    },
                    {
                        $skip: parseInt(queryParams.skip)
                    },
                    {
                        $limit: parseInt(queryParams.limit)
                    }, {
                        $project: {
                            '_id': 1,
                            'mailName': 1,
                            'mailTitle': 1,
                            'mailSubject': 1,
                            'mailBody': 1,
                            'status': 1,
                            'createdAt': 1,
                            'createdBy': 1,
                            'type': 1,
                            'notificationMessage': 1
                        }
                    }
                ]
                return dao.getAllTemplates(aggregateQuery).then((templates) => {

                    let respObj = {
                        "recordsTotal": totalTemplates,
                        "recordsFiltered": templates.length,
                        "records": templates
                    }
                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get template details
 * @param {string} id mongo id of admin
 * @param {string} templateId mongo id of template to fetch details
 */
function getTemplateDetails(id, templateId) {

    if (!id || !ObjectId.isValid(id) || !templateId || !ObjectId.isValid(templateId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let templateQuery = {
                    _id: templateId
                }

                return dao.getTemplateDetails(templateQuery).then((templateDetails) => {

                    if (templateDetails) {

                        return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, templateDetails)

                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.TemplateNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Update template
 * @param {String} id mongo id of admin
 * @param {String} templateId mongo id of template to be updated
 * @param {object} templateUpdatingDetails template updating details
 */
function updateTemplate(id, templateId, templateUpdatingDetails) {

    if (!id || !ObjectId.isValid(id) || !templateId || !ObjectId.isValid(templateId) || !templateUpdatingDetails || Object.keys(templateUpdatingDetails).length == 0) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let templateQuery = {
                    _id: templateId,
                    status: constants.STATUS.ACTIVE
                }

                return dao.getTemplateDetails(templateQuery).then((templateDetails) => {

                    if (templateDetails) {

                        let filterTemplateUpdateFields = mapper.filterTemplateUpdateFields(templateUpdatingDetails)
                        filterTemplateUpdateFields.editedAt = new Date().getTime()
                        filterTemplateUpdateFields.editedBy = id

                        return dao.updateTemplate(templateQuery, filterTemplateUpdateFields).then((templateUpdated) => {

                            if (templateUpdated) {

                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.TemplateUpdated, templateUpdated)
                            } else {

                                console.log("Failed to update template")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)

                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })

                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.TemplateNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Delete or Resurrect template
 * @param {String} id mongo id of admin
 * @param {String} templateId mongo id of template to deleted or resurrected
 */
function deleteTemplate(id, templateId) {

    if (!id || !ObjectId.isValid(id) || !templateId || !ObjectId.isValid(templateId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let templateQuery = {
                    _id: templateId
                }

                return dao.getTemplateDetails(templateQuery).then((templateDetails) => {

                    if (templateDetails) {

                        let updateObj = {}
                        if (templateDetails.status == constants.STATUS.ACTIVE) {

                            updateObj = {
                                status: constants.STATUS.INACTIVE
                            }
                        } else {

                            updateObj = {
                                status: constants.STATUS.ACTIVE
                            }
                        }
                        return dao.updateTemplate(templateQuery, updateObj).then((templateUpdated) => {

                            if (templateUpdated) {

                                if (templateUpdated.status == constants.STATUS.ACTIVE) {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.TemplateActivated, templateUpdated)
                                } else {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.TemplateDeactivated, templateUpdated)
                                }

                            } else {

                                console.log("Failed to update template")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })

                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.TemplateNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all template entities
 * @param {String} id mongo id of admin
 */
function getAllTemplateEntities(id) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let entities = constants.TEMPLATE_ENTITIES
                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, entities)
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all pending landlord request
 * @param {String} id mongo id of admin
 */
function getAllUsers(id, queryParams) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then(async (adminDetails) => {

            if (adminDetails) {

                let userQuery = {
                    role: constants.ROLE.USER
                }

                if (queryParams.search) {

                    userQuery['$or'] = [
                        { 'emailId': { '$regex': queryParams.search, '$options': 'i' } },
                        { 'firstName': { '$regex': queryParams.search, '$options': 'i' } },
                        { 'lastName': { '$regex': queryParams.search, '$options': 'i' } }]
                }

                let totalUsers = await dao.getCounts(userQuery)

                let sortQuery = {}
                if (queryParams.column) {

                    sortQuery[queryParams.column] = ((queryParams.dir == "asc") ? 1 : -1)
                } else {

                    sortQuery['createdAt'] = -1
                }

                let aggregateQuery = [
                    {
                        $match: userQuery
                    },
                    {
                        $sort: sortQuery
                    },
                    {
                        $skip: parseInt(queryParams.skip)
                    },
                    {
                        $limit: parseInt(queryParams.limit)
                    }, {
                        $project: {
                            '_id': 1,
                            'role': 1,
                            'isCodeVerified': 1,
                            'profilePicture': 1,
                            'loginType': 1,
                            'isAccountVerified': 1,
                            'status': 1,
                            'isLoggedOut': 1,
                            'isRegister': 1,
                            'firstName': 1,
                            'lastName': 1,
                            'emailId': 1,
                            'contactNumber': 1,
                            'createdAt': 1,
                            'createdBy': 1,
                            'document': 1
                        }
                    }
                ]

                return dao.getAllUsers(aggregateQuery).then((users) => {

                    let respObj = {
                        "recordsTotal": totalUsers,
                        "recordsFiltered": users.length,
                        "records": users
                    }

                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get user details
 * @param {String} id mongo id of admin
 * @param {String} userId mongo id of user to fetch details
 */
function getUserDetails(id, userId) {

    if (!id || !ObjectId.isValid(id) || !userId || !ObjectId.isValid(userId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let userQuery = {
                    _id: userId,
                    role: { $in: [constants.ROLE.USER, constants.ROLE.LANDLORD] }
                }
                return dao.getAdminDetails(userQuery).then((userDetails) => {

                    if (userDetails) {

                        let filteredUserDetails = mapper.filterAdminResponse(userDetails)
                        return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, filteredUserDetails)

                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.UserNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Add User
 * @param {String} id mongo id of admin
 * @param {Object} userDetails details of user to be added
 */
function addUser(id, userDetails) {

    if (!id || !ObjectId.isValid(id) || !userDetails || Object.keys(userDetails).length == 0) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let userQuery = {
                    $or: [{
                        emailId: userDetails.emailId
                    }, {
                        contactNumber: userDetails.contactNumber
                    }]
                }
                return dao.getAdminDetails(userQuery).then(async (userExists) => {

                    if (userExists) {

                        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.UserAlreadyExists)

                    } else {

                        let convertedPassword = await appUtils.convertPass(userDetails.password)
                        userDetails.password = convertedPassword
                        userDetails.createdAt = new Date().getTime()
                        userDetails.createdBy = id
                        let verificationCode = Math.floor(Math.random() * (999999 - 100000) + 100000)
                        userDetails.verificationCode = verificationCode
                        userDetails.isCodeVerified = false
                        userDetails.isRegister = true

                        if (userDetails.role == constants.ROLE.LANDLORD) {
                            userDetails.isAccountVerified = true
                        }
                        return dao.addUser(userDetails).then(async (userCreated) => {

                            if (userCreated) {

                                let mailQuery = {
                                    mailName: constants.EMAIL_TEMPLATES.USER_VERIFICATION_CODE,
                                    status: constants.STATUS.ACTIVE
                                }
                                let templateDetails = await dao.getTemplateDetails(mailQuery)
                                if (templateDetails) {

                                    let userObj = {
                                        emailId: userCreated.emailId,
                                        verificationCode: verificationCode
                                    }
                                    let mailSent = mailHandler.SEND_MAIL(userObj, templateDetails)
                                }

                                let filteredUserDetails = mapper.filterAdminResponse(userCreated)
                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.UserCreatedSuccess, filteredUserDetails)
                            } else {

                                console.log("Failed to create user")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Update user
 * @param {String} id mongo id of admin
 * @param {String} userId mongo id user to be updated
 * @param {Object} userDetails user details to be updated
 */
function updateUser(id, userId, userDetails) {

    if (!id || !ObjectId.isValid(id) || !userId || !ObjectId.isValid(userId) || !userDetails || (Object.keys(userDetails).length == 0)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let userQuery = {
                    _id: userId,
                    status: constants.STATUS.ACTIVE
                }
                return dao.getAdminDetails(userQuery).then((userExists) => {

                    if (!userExists) {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.UserNotFound)

                    } else {

                        let allowedUserUpdateFields = mapper.filterAllowedAdminUpdateFields(userDetails)
                        allowedUserUpdateFields.editedAt = new Date().getTime()
                        allowedUserUpdateFields.editedBy = id

                        return dao.updateProfile(userQuery, allowedUserUpdateFields).then(async (userUpdated) => {

                            if (userUpdated) {

                                let filteredUserFields = mapper.filterAdminResponse(userUpdated)

                                if (userUpdated.role == constants.ROLE.LANDLORD) {

                                    if (userDetails.isAccountVerified) {

                                        mailQuery = {
                                            mailName: constants.EMAIL_TEMPLATES.LANDLORD_APPROVED,
                                            status: constants.STATUS.ACTIVE
                                        }
                                    } else {

                                        mailQuery = {
                                            mailName: constants.EMAIL_TEMPLATES.LANDLORD_REJECTED,
                                            status: constants.STATUS.ACTIVE
                                        }
                                    }
                                    let templateDetails = await dao.getTemplateDetails(mailQuery)
                                    if (templateDetails) {
                                        let usrObj = {
                                            firstName: userUpdated.firstName,
                                            emailId: userUpdated.emailId,
                                        }
                                        let mailSent = mailHandler.SEND_MAIL(usrObj, templateDetails)
                                    }
                                }

                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.userUpdatedSuccess, filteredUserFields)
                            } else {

                                console.log("Failed to update user")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }

                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Delete or Resurrect user
 * @param {String} id mongo id of admin
 * @param {String} userId mongo id of user to be deleted or resurrected
 */
function deleteUser(id, userId) {

    if (!id || !ObjectId.isValid(id) || !userId || !ObjectId.isValid(userId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let userQuery = {
                    _id: userId
                }

                return dao.getAdminDetails(userQuery).then((userDetails) => {

                    if (userDetails) {

                        let updateObj = {}
                        if (userDetails.status == constants.STATUS.ACTIVE) {

                            updateObj = {
                                status: constants.STATUS.INACTIVE
                            }
                        } else {

                            updateObj = {
                                status: constants.STATUS.ACTIVE
                            }
                        }
                        return dao.updateProfile(userQuery, updateObj).then((userUpdated) => {

                            if (userUpdated) {

                                let filteredUserFields = mapper.filterAdminResponse(userUpdated)

                                if (filteredUserFields.status == constants.STATUS.ACTIVE) {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.UserActivated, filteredUserFields)
                                } else {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.UserDeactivated, filteredUserFields)
                                }

                            } else {

                                console.log("Failed to update user")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })

                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.TemplateNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get dashboard counts
 * @param {String} id mongo id of admin
 * @param {Number} year year of which users, landlords and bookings counts to be fetched monthly
 */
function getCounts(id, year) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then(async (adminDetails) => {

            if (adminDetails) {

                // let userCounts = 0
                // let landlordCounts = 0
                // let bookingCounts = 0

                // let userCountQuery = {
                //     role: constants.ROLE.USER
                // }
                // let landlordCountQuery = {
                //     role: constants.ROLE.LANDLORD
                // }
                // let bookingCountQuery = {
                //     status: constants.BOOKINGSTATUS.APPROVED
                // }

                // userCounts = await dao.getCounts(userCountQuery)
                // landlordCounts = await dao.getCounts(landlordCountQuery)
                // bookingCounts = await dao.getBookingCounts(bookingCountQuery)

                // let respObj = {
                //     users: userCounts,
                //     landlord: landlordCounts,
                //     bookingCounts: bookingCounts
                // }

                // return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)

                let usrQuery = {
                    year: year,
                    type: constants.ANALYTICS.USER
                }
                let landlordQuery = {
                    year: year,
                    type: constants.ANALYTICS.LANDLORD
                }
                let bookingQuery = {
                    year: year,
                    type: constants.ANALYTICS.BOOKING
                }

                return Promise.all([dao.getAllAnalytics(usrQuery), dao.getAllAnalytics(landlordQuery), dao.getAllAnalytics(bookingQuery)]).then((list) => {

                    let totalUsers = 0
                    let totalLandlords = 0
                    let totalBookings = 0
                    list[0].map(objs => {
                        totalUsers += parseInt(objs.qty)
                    })
                    list[1].map(objs => {
                        totalLandlords += parseInt(objs.qty)
                    })
                    list[2].map(objs => {
                        totalBookings += parseInt(objs.qty)
                    })
                    let respObj = {
                        totalUsers: totalUsers,
                        totalLandlords: totalLandlords,
                        totalBookings: totalBookings,
                        users: list[0],
                        landlords: list[1],
                        booking: list[2]
                    }

                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Create amenities
 * @param {String} id mongo id of admin
 * @param {Object} details amenities details to be created
 */
function createAmenities(id, details) {

    if (!id || (!ObjectId.isValid(id)) || !details || (Object.keys(details).length == 0)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let amenitiesQuery = {
                    title: details.title
                }

                return dao.getAmenitiesDetails(amenitiesQuery).then((amenitiesExists) => {

                    if (amenitiesExists) {

                        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.AmenitiesAlreadyExists)
                    } else {

                        details.createdAt = new Date().getTime()
                        details.createdBy = id

                        return dao.createAmenities(details).then((amenitiesCreated) => {

                            if (amenitiesCreated) {

                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.AmenitiesCreatedSuccess, amenitiesCreated)
                            } else {

                                console.log("Failed to create amenities")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all amenities
 * @param {String} id mongo id of admin
 */
function getAllAmenities(id) {

    if (!id || (!ObjectId.isValid(id))) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                return dao.getAllAmenities().then((amenities) => {

                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, amenities)
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Add amenities
 * @param {String} id mongo id of admin
 * @param {String} amenitiesId mongo id of main amenties category in which more amenites to be added
 * @param {Array} amenities 
 */
function addAmenities(id, amenitiesId, amenities) {

    if (!id || !ObjectId.isValid(id) || !amenitiesId || !ObjectId.isValid(amenitiesId) || !amenities || amenities.length == 0) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let amenitiesQuery = {
                    _id: amenitiesId,
                    status: constants.STATUS.ACTIVE
                }

                return dao.getAmenitiesDetails(amenitiesQuery).then((amenitiesExists) => {

                    if (!amenitiesExists) {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.AmenitiesNotFound)
                    } else {

                        let updateObj = {}
                        updateObj['$set'] = { editedAt: new Date().getTime(), editedBy: id }
                        updateObj['$push'] = {
                            amenities: amenities
                        }

                        return dao.addRemoveAmenities(amenitiesQuery, updateObj).then((amenitiesAdded) => {

                            if (amenitiesAdded) {

                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.AmenitiesAdded, amenitiesAdded)
                            } else {

                                console.log("Failed to updated amenities")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Update amenities
 * @param {String} id mongo id of admin
 * @param {String} amenitiesId mongo id of amenities to be updated
 * @param {Object} details amenities details to be updated
 */
function updateAmenities(id, amenitiesId, details) {

    if (!id || !ObjectId.isValid(id) || !amenitiesId || !ObjectId.isValid(amenitiesId) || !details || details.length == 0) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let amenitiesQuery = {
                    _id: amenitiesId,
                    status: constants.STATUS.ACTIVE
                }

                return dao.getAmenitiesDetails(amenitiesQuery).then((amenitiesExists) => {

                    if (!amenitiesExists) {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.AmenitiesNotFound)
                    } else {

                        details.editedAt = new Date().getTime()
                        details.editedBy = id

                        return dao.updateAmenities(amenitiesQuery, details).then((amenitiesUpdated) => {

                            if (amenitiesUpdated) {

                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.AmenitiesUpdated, amenitiesUpdated)
                            } else {

                                console.log("Failed to updated amenities")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Delete or resurrect amenities
 * @param {String} id mongo id of admin
 * @param {String} amenitiesId mongo id of amenities to be deleted or resurrected
 */
function deleteMainAmenities(id, amenitiesId) {

    if (!id || !ObjectId.isValid(id) || !amenitiesId || !ObjectId.isValid(amenitiesId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {


        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let amenitiesQuery = {
                    _id: amenitiesId
                }

                return dao.getAmenitiesDetails(amenitiesQuery).then((amenitiesExists) => {

                    if (!amenitiesExists) {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.AmenitiesNotFound)
                    } else {

                        let updateObj = {}
                        if (amenitiesExists.status == constants.STATUS.ACTIVE) {

                            updateObj.status = constants.STATUS.INACTIVE
                        } else {

                            updateObj.status = constants.STATUS.ACTIVE
                        }
                        updateObj.editedAt = new Date().getTime()
                        updateObj.editedBy = id

                        return dao.updateAmenities(amenitiesQuery, updateObj).then((amenitiesUpdated) => {

                            if (amenitiesUpdated) {

                                if (amenitiesUpdated.status == constants.STATUS.ACTIVE) {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.AmenitiesActivated, amenitiesUpdated)
                                } else {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.AmenitiesDeactivated, amenitiesUpdated)
                                }

                            } else {

                                console.log("Failed to updated amenities")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Remove amenities
 * @param {String} id mongo id of admin
 * @param {String} categoryId mongo id of main amenities category
 * @param {String} amenitiesId mongo id of amenities to be removed from list
 */
function removeAmenities(id, categoryId, amenitiesId) {

    if (!id || !ObjectId.isValid(id) || !categoryId || !ObjectId.isValid(categoryId) || !amenitiesId || !ObjectId.isValid(amenitiesId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let amenitiesQuery = {
                    _id: categoryId,
                    status: constants.STATUS.ACTIVE
                }

                return dao.getAmenitiesDetails(amenitiesQuery).then((amenitiesExists) => {

                    if (!amenitiesExists) {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.AmenitiesNotFound)
                    } else {

                        let subAmenitiesExists = amenitiesExists.amenities.filter(obj => obj._id.toString() == amenitiesId.toString())

                        if (subAmenitiesExists.length > 0) {

                            let updateObj = {}
                            updateObj['$set'] = { editedAt: new Date().getTime(), editedBy: id }
                            updateObj['$pull'] = {
                                'amenities': { '_id': amenitiesId }
                            }

                            return dao.addRemoveAmenities(amenitiesQuery, updateObj).then((amenitiesRemoved) => {

                                if (amenitiesRemoved) {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.AmenitiesRemoved, amenitiesRemoved)
                                } else {

                                    console.log("Failed to remove amenities")
                                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)

                                }
                            }).catch((err) => {

                                console.log({ err })
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            })
                        } else {

                            return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.AmenitiesNotFound)
                        }
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all pending landlord requests
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query params for sorting, paginations
 */
function getPendingLandlordRequests(id, queryParams) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then(async (adminDetails) => {

            if (adminDetails) {

                let landlordQuery = {
                    role: constants.ROLE.LANDLORD,
                    isCodeVerified: true,
                    isRegister: true,
                    status: constants.STATUS.ACTIVE,
                    isAccountVerified: { $exists: false }
                }
                let totalLandlords = await dao.getCounts(landlordQuery)

                let sortQuery = {}
                if (queryParams.column) {

                    sortQuery[queryParams.column] = ((queryParams.dir == "asc") ? 1 : -1)
                } else {

                    sortQuery['createdAt'] = -1
                }
                // console.log({ sortQuery })
                let aggregateQuery = [
                    {
                        $match: landlordQuery
                    },
                    {
                        $sort: sortQuery
                    },
                    {
                        $skip: parseInt(queryParams.skip)
                    },
                    {
                        $limit: parseInt(queryParams.limit)
                    }, {
                        $project: {
                            '_id': 1,
                            'role': 1,
                            'isCodeVerified': 1,
                            'profilePicture': 1,
                            'loginType': 1,
                            'isAccountVerified': 1,
                            'status': 1,
                            'isLoggedOut': 1,
                            'isRegister': 1,
                            'firstName': 1,
                            'lastName': 1,
                            'emailId': 1,
                            'contactNumber': 1,
                            'createdAt': 1,
                            'createdBy': 1,
                            'document': 1
                        }
                    }
                ]

                return dao.getAllUsers(aggregateQuery).then((landlords) => {

                    let respObj = {
                        "recordsTotal": totalLandlords,
                        "recordsFiltered": landlords.length,
                        "records": landlords
                    }
                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, landlords)
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all landlords
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query params for sorting and pagination on landlords
 */
function getAllLandlords(id, queryParams) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then(async (adminDetails) => {

            if (adminDetails) {

                let landlordQuery = {
                    isAccountVerified: true,
                    role: constants.ROLE.LANDLORD
                }

                if (queryParams.search) {

                    landlordQuery['$or'] = [
                        { 'emailId': { '$regex': queryParams.search, '$options': 'i' } },
                        { 'firstName': { '$regex': queryParams.search, '$options': 'i' } },
                        { 'lastName': { '$regex': queryParams.search, '$options': 'i' } }]
                }

                let totalLandlords = await dao.getCounts(landlordQuery)

                let sortQuery = {}
                if (queryParams.column) {

                    sortQuery[queryParams.column] = ((queryParams.dir == "asc") ? 1 : -1)
                } else {

                    sortQuery['createdAt'] = -1
                }
                // console.log({ sortQuery })
                let aggregateQuery = [
                    {
                        $match: landlordQuery
                    },
                    {
                        $sort: sortQuery
                    },
                    {
                        $skip: parseInt(queryParams.skip)
                    },
                    {
                        $limit: parseInt(queryParams.limit)
                    },
                    {
                        $project: {
                            '_id': 1,
                            'role': 1,
                            'isCodeVerified': 1,
                            'profilePicture': 1,
                            'loginType': 1,
                            'isAccountVerified': 1,
                            'status': 1,
                            'isLoggedOut': 1,
                            'isRegister': 1,
                            'firstName': 1,
                            'lastName': 1,
                            'emailId': 1,
                            'contactNumber': 1,
                            'createdAt': 1,
                            'createdBy': 1,
                            'document': 1,
                            'accomodations': 1
                        }
                    }
                ]

                return dao.getAllUsers(aggregateQuery).then((landlords) => {

                    let respObj = {
                        "recordsTotal": totalLandlords,
                        "recordsFiltered": landlords.length,
                        "records": landlords
                    }
                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get verification pending accomodations
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query params for sorting and pagination on landlords
 */
function getPendingAccomodations(id, queryParams) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then(async (adminDetails) => {

            if (adminDetails) {

                let accomodationQuery = {
                    // isVerified: false
                    isVerified: { $exists: false }
                }

                if (queryParams.type == constants.ACCOMODATIONS.HOME_OFFICE) {
                    accomodationQuery.type = constants.ACCOMODATIONS.HOME_OFFICE
                }
                if (queryParams.type == constants.ACCOMODATIONS.WORKPLACE) {
                    accomodationQuery.type = constants.ACCOMODATIONS.WORKPLACE
                }

                if (queryParams.search) {

                    accomodationQuery['$or'] = [
                        { 'name.en': { '$regex': queryParams.search, '$options': 'i' } },
                        { 'address.country': { '$regex': queryParams.search, '$options': 'i' } },
                        { 'address.city': { '$regex': queryParams.search, '$options': 'i' } },
                        { 'address.postcode': { '$regex': queryParams.search, '$options': 'i' } },
                        { 'address.streetAddress': { '$regex': queryParams.search, '$options': 'i' } }]
                }


                let totalAccomodations = await dao.getAccomodationCounts(accomodationQuery)

                let sortQuery = {}
                if (queryParams.column) {

                    sortQuery[queryParams.column] = ((queryParams.dir == "asc") ? 1 : -1)
                } else {

                    sortQuery['createdAt'] = -1
                }
                // console.log({ sortQuery })

                return dao.getAllAccomodations(accomodationQuery, sortQuery, queryParams.skip, queryParams.limit).then((accomodations) => {

                    let respObj = {
                        "recordsTotal": totalAccomodations,
                        "recordsFiltered": accomodations.length,
                        "records": accomodations
                    }
                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get accomodation details
 * @param {String} id mongo id of admin
 * @param {String} accomodationId mongo id of accomodation
 */
function getAccomodationDetails(id, accomodationId) {

    if (!id || !ObjectId.isValid(id) || !accomodationId || !ObjectId.isValid(accomodationId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let accomodationQuery = {
                    _id: ObjectId(accomodationId)
                }

                return dao.getAccomodationDetails(accomodationQuery).then((accomodationDetails) => {

                    if (accomodationDetails && accomodationDetails.length > 0) {

                        return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, accomodationDetails[0])
                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.AccomodationNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Update accomodation verification request
 * @param {String} id mongo id of admin
 * @param {String} accomodationId mongo id of accomodation
 * @param {Object} details reason to be send if verification is rejected
 */
function updateAccomodationVerification(id, accomodationId, details) {

    if (!id || !ObjectId.isValid(id) || !accomodationId || !ObjectId.isValid(accomodationId) || !details || Object.keys(details).length == 0) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let accomodationQuery = {
                    _id: ObjectId(accomodationId)
                }

                return dao.getAccomodationDetails(accomodationQuery).then((accomodationDetails) => {

                    if (accomodationDetails && accomodationDetails.length > 0) {

                        let landlordDetails = accomodationDetails[0].landlordDetails
                        let updateObj = {
                            isVerified: details.isVerified
                        }

                        return dao.updateAccomodation(accomodationQuery, updateObj).then(async (accomodationUpdated) => {

                            if (accomodationUpdated) {

                                let mailQuery = {}
                                let notificationQuery = {}
                                if (accomodationUpdated.isVerified) {

                                    mailQuery = {
                                        mailName: constants.EMAIL_TEMPLATES.ACCOMODATION_APPROVED,
                                        status: constants.STATUS.ACTIVE
                                    }

                                    notificationQuery = {

                                        mailName: constants.EMAIL_TEMPLATES.NOTIFY_LANDLORD_ACCOMODATION_APPROVED_BY_ADMIN,
                                        status: constants.STATUS.ACTIVE
                                    }
                                } else {
                                    mailQuery = {
                                        mailName: constants.EMAIL_TEMPLATES.ACCOMODATION_REJECTED,
                                        status: constants.STATUS.ACTIVE
                                    }
                                    notificationQuery = {

                                        mailName: constants.EMAIL_TEMPLATES.NOTIFY_LANDLORD_ACCOMODATION_REJECTED_BY_ADMIN,
                                        status: constants.STATUS.ACTIVE
                                    }
                                }

                                let templateDetails = await dao.getTemplateDetails(mailQuery)
                                if (templateDetails) {

                                    let usrObj = {
                                        firstName: landlordDetails.firstName,
                                        emailId: landlordDetails.emailId,
                                    }
                                    if (!accomodationUpdated.isVerified) {

                                        usrObj.reason = details.reason
                                    }
                                    let mailSent = mailHandler.SEND_MAIL(usrObj, templateDetails)
                                }

                                // Create Notification

                                let notificationTemplateDetails = await dao.getTemplateDetails(notificationQuery)
                                let notificationMessage = notificationTemplateDetails.notificationMessage

                                Object.keys(notificationMessage).forEach((key, value) => {

                                    if (value > 0) {
                                        let obj = {
                                            name: accomodationDetails[0].name[key]
                                        }
                                        notificationMessage[key] = mailHandler.convertNotificationMessage(obj, notificationMessage[key])
                                    }
                                })

                                if (notificationTemplateDetails) {

                                    let notificationObject = {
                                        message: notificationMessage,
                                        isRead: false,
                                        receiverId: landlordDetails._id,
                                        createdAt: new Date().getTime(),
                                        status: constants.STATUS.ACTIVE,
                                        categoryType: constants.NOTIFICATION_CATEGORIES.ACCOMODATION,
                                        refId: accomodationId
                                    }
                                    await dao.createNotification(notificationObject)
                                }

                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.AccomodationVerificationUpdated, accomodationUpdated)

                            } else {

                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)

                            }

                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })

                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.AccomodationNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all accomodations
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query params for sorting and pagination on landlords
 */
function getAllAccomodations(id, queryParams) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then(async (adminDetails) => {

            if (adminDetails) {

                let accomodationQuery = {
                    isVerified: true
                }
                if (queryParams.type == constants.ACCOMODATIONS.HOME_OFFICE) {
                    accomodationQuery.type = constants.ACCOMODATIONS.HOME_OFFICE
                }
                if (queryParams.type == constants.ACCOMODATIONS.WORKPLACE) {
                    accomodationQuery.type = constants.ACCOMODATIONS.WORKPLACE
                }

                if (queryParams.search) {

                    accomodationQuery['$or'] = [
                        { 'name.en': { '$regex': queryParams.search, '$options': 'i' } },
                        { 'address.country': { '$regex': queryParams.search, '$options': 'i' } },
                        { 'address.city': { '$regex': queryParams.search, '$options': 'i' } },
                        { 'address.postcode': { '$regex': queryParams.search, '$options': 'i' } },
                        { 'address.streetAddress': { '$regex': queryParams.search, '$options': 'i' } }]
                }

                let totalAccomodations = await dao.getAccomodationCounts(accomodationQuery)

                let sortQuery = {}
                if (queryParams.column) {

                    sortQuery[queryParams.column] = ((queryParams.dir == "asc") ? 1 : -1)
                } else {

                    sortQuery['createdAt'] = -1
                }
                // console.log({ sortQuery })

                return dao.getAllAccomodations(accomodationQuery, sortQuery, queryParams.skip, queryParams.limit).then((accomodations) => {

                    let respObj = {
                        "recordsTotal": totalAccomodations,
                        "recordsFiltered": accomodations.length,
                        "records": accomodations
                    }

                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Update accomodation
 * @param {String} id mongo id of admin
 * @param {String} accomodationId mongo id of accomodation to be updated
 * @param {Object} details accomodation details to be updated
 */
function updateAccomodation(id, accomodationId, details) {

    if (!id || !ObjectId.isValid(id) || !accomodationId || !ObjectId.isValid(accomodationId) || !details || Object.keys(details).length == 0) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let accomodationQuery = {
                    _id: ObjectId(accomodationId),
                    status: constants.STATUS.ACTIVE
                }

                return dao.getAccomodationDetails(accomodationQuery).then((accomodationDetails) => {

                    if (accomodationDetails && accomodationDetails.length > 0) {

                        details.editedBy = id
                        details.editedAt = new Date().getTime()

                        return dao.updateAccomodation(accomodationQuery, details).then((accomodationUpdated) => {

                            if (accomodationUpdated) {

                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.AccomodationUpdatedSuccess, accomodationUpdated)

                            } else {

                                console.log("Failed to update accomodation")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)

                            }

                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })

                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.AccomodationNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Delete or Resurrect accomodation
 * @param {String} id mongo id of admin
 * @param {String} accomodationId mongo id of accomodation to be deleted or resurrected
 */
function deleteAccomodation(id, accomodationId) {

    if (!id || !ObjectId.isValid(id) || !accomodationId || !ObjectId.isValid(accomodationId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let accomodationQuery = {
                    _id: ObjectId(accomodationId),
                }

                return dao.getAccomodationDetails(accomodationQuery).then((accomodationDetails) => {

                    if (accomodationDetails && accomodationDetails.length > 0) {

                        let updateObj = {}
                        if (accomodationDetails[0].status == constants.STATUS.ACTIVE) {

                            updateObj.status = constants.STATUS.INACTIVE

                        } else {

                            updateObj.status = constants.STATUS.ACTIVE
                        }
                        updateObj.editedAt = new Date().getTime()
                        updateObj.editedBy = id

                        return dao.updateAccomodation(accomodationQuery, updateObj).then((accomodationUpdated) => {

                            if (accomodationUpdated) {

                                if (accomodationUpdated.status == constants.STATUS.ACTIVE) {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.AccomodationActivated, accomodationUpdated)

                                } else {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.AccomodationDeactivated, accomodationUpdated)

                                }

                            } else {

                                console.log("Failed to update accomodation")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)

                            }

                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })

                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.AccomodationNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get hosted accomodations
 * @param {String} id mongo id of admin
 * @param {String} landlordId mongo id of landlord whose hosted accomodations to be fetched
 * @param {Object} queryParams query params for sorting and pagination on landlords
 */
function getHostedAccomodations(id, landlordId, queryParams) {

    if (!id || !ObjectId.isValid(id) || !landlordId || !ObjectId.isValid(landlordId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then(async (adminDetails) => {

            if (adminDetails) {

                let accQuery = {
                    landlord: ObjectId(landlordId),
                    isVerified: true
                }

                let totalAccomodations = await dao.getAccomodationCounts(accQuery)

                let sortQuery = {}
                if (queryParams.column) {

                    sortQuery[queryParams.column] = ((queryParams.dir == "asc") ? 1 : -1)
                } else {

                    sortQuery['createdAt'] = -1
                }
                // console.log({ sortQuery })
                return dao.getAllAccomodations(accQuery, sortQuery, queryParams.skip, queryParams.limit).then((accomodations) => {

                    let respObj = {
                        "recordsTotal": totalAccomodations,
                        "recordsFiltered": accomodations.length,
                        "records": accomodations
                    }

                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all Open or pending queries
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query params for sorting and pagination on landlords
 */
function getAllQueries(id, queryParams) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then(async (adminDetails) => {

            if (adminDetails) {

                let query = {}
                if (queryParams.status == constants.CONTACTUSSTATUS.OPEN) {
                    query.status = constants.CONTACTUSSTATUS.OPEN
                }
                if (queryParams.status == constants.CONTACTUSSTATUS.CLOSE) {
                    query.status = constants.CONTACTUSSTATUS.CLOSE
                }

                if (queryParams.search) {

                    query['$or'] = [
                        { 'name': { '$regex': queryParams.search, '$options': 'i' } },
                        { 'emailId': { '$regex': queryParams.search, '$options': 'i' } },
                        { 'message': { '$regex': queryParams.search, '$options': 'i' } },
                        { 'ticketNo': { '$regex': queryParams.search } },
                    ]
                }

                let totalQueries = await dao.getQueryCounts(query)

                let sortQuery = {}
                if (queryParams.column) {

                    sortQuery[queryParams.column] = ((queryParams.dir == "asc") ? 1 : -1)
                } else {

                    sortQuery['createdAt'] = -1
                }

                let aggregateQuery = [
                    {
                        $match: query
                    },
                    {
                        $sort: sortQuery
                    },
                    {
                        $skip: parseInt(queryParams.skip)
                    },
                    {
                        $limit: parseInt(queryParams.limit)
                    }, {
                        $project: {
                            '_id': 1,
                            'status': 1,
                            'name': 1,
                            'emailId': 1,
                            'contactNumber': 1,
                            'message': 1,
                            'queryReply': 1,
                            'createdAt': 1,
                            'ticketNo': 1
                        }
                    }
                ]

                return dao.getAllQueries(aggregateQuery).then((queries) => {

                    let respObj = {
                        "recordsTotal": totalQueries,
                        "recordsFiltered": queries.length,
                        "records": queries
                    }
                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get query details
 * @param {String} id mongo id of admin
 * @param {String} queryId mongo id of contact us query to fetch details
 */
function getQueryDetails(id, queryId) {

    if (!id || !ObjectId.isValid(id) || !queryId || !ObjectId.isValid(queryId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then(async (adminDetails) => {

            if (adminDetails) {

                let query = {
                    _id: ObjectId(queryId)
                }

                return dao.getQueryDetails(query).then((queryExists) => {

                    if (queryExists) {

                        let previousQuery = {
                            emailId: queryExists.emailId,
                            // _id: { "$lt": ObjectId(queryId) }
                        }

                        let sortQuery = {
                            'createdAt': -1
                        }
                        let aggregateQuery = [
                            {
                                $match: previousQuery
                            },
                            {
                                $sort: sortQuery
                            },
                            {
                                $skip: 0
                            },
                            {
                                $limit: 5
                            }, {
                                $project: {
                                    '_id': 1,
                                    'status': 1,
                                    'name': 1,
                                    'emailId': 1,
                                    'contactNumber': 1,
                                    'message': 1,
                                    'queryReply': 1,
                                    'createdAt': 1,
                                    'ticketNo': 1
                                }
                            }
                        ]

                        return dao.getAllQueries(aggregateQuery).then((previousQueries) => {

                            let respObj = {
                                queryDetails: queryExists,
                                previousQueries: previousQueries
                            }
                            return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)

                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })

                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.SupportQueryNotFound)
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Query reply
 * @param {String} id mongo id of admin
 * @param {String} queryId mongo id of support query
 * @param {String} reply replied message given by admin
 */
function queryReply(id, queryId, reply) {

    if (!id || !ObjectId.isValid(id) || !queryId || !ObjectId.isValid(queryId) || !reply) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let query = {
                    _id: queryId,
                    status: constants.CONTACTUSSTATUS.OPEN
                }

                return dao.getQueryDetails(query).then(async (queryDetails) => {

                    if (queryDetails) {

                        let mailQuery = {
                            mailName: constants.EMAIL_TEMPLATES.SUPPORT_QUERY_REPLY,
                            status: constants.STATUS.ACTIVE
                        }

                        let templateDetails = await dao.getTemplateDetails(mailQuery);

                        let mailBodyDetails = {
                            name: queryDetails.name,
                            emailId: queryDetails.emailId,
                            query: queryDetails.message,
                            reply: reply
                        }

                        let mailConfig = mailHandler.SEND_MAIL(mailBodyDetails, templateDetails);

                        let updateObj = {
                            status: constants.CONTACTUSSTATUS.CLOSE,
                            reply: reply
                        }

                        return dao.updateSupportQuery(query, updateObj).then((queryUpdated) => {

                            if (queryUpdated) {

                                return mapper.responseMapping(admConst.CODE.Success, admConst.MESSAGE.SupportQueryReplySent)
                            } else {

                                console.log("Failed to update support query")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.SupportQueryNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Update support query status
 * @param {String} id mongo id of admin
 * @param {String} queryId mongo id of support query
 * @param {String} status support query status to be updated
 */
function updateQueryStatus(id, queryId, status) {

    if (!id || !ObjectId.isValid(id) || !queryId || !ObjectId.isValid(queryId) || !status) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let query = {
                    _id: queryId
                }

                return dao.getQueryDetails(query).then(async (queryDetails) => {

                    if (queryDetails) {


                        let updateObj = {
                            status: status
                        }

                        return dao.updateSupportQuery(query, updateObj).then((queryUpdated) => {

                            if (queryUpdated) {

                                if (queryUpdated.status == constants.CONTACTUSSTATUS.OPEN) {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.SupportQueryOpened, queryUpdated)
                                } else {

                                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.SupportQueryClosed, queryUpdated)
                                }

                            } else {

                                console.log("Failed to update support query")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.SupportQueryNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Set service fee
 * @param {String} id mongo id of admin
 * @param {String} serviceFee service fee 
 */
function setServiceFee(id, serviceFee) {

    if (!id || !ObjectId.isValid(id) || !serviceFee) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let updateObj = {
                    serviceFee: serviceFee
                }

                return dao.updateProfile(adminQuery, updateObj).then((profileUpdated) => {

                    if (profileUpdated) {

                        let respObj = {
                            serviceFee: profileUpdated.serviceFee
                        }
                        return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.ServiceFeeSetSuccess, respObj)
                    } else {

                        console.log("Failed to set service fee")
                        return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get service fee
 * @param {String} id mongo id of admin
 */
function getServiceFee(id) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let respObj = {
                    serviceFee: adminDetails.serviceFee
                }

                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get notifications received by admin
 * @param {String} id mongo id of admin
 */
function getAdminNotifications(id, skip, limit) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then(async (adminDetails) => {

            if (adminDetails) {

                let notificationQuery = {
                    receiverId: id
                }

                let totalRecords = await dao.getNotificationCount(notificationQuery)

                return dao.getAdminNotifications(notificationQuery, skip, limit).then((notifications) => {

                    let ids = []
                    // console.log(notifications.length)
                    notifications.map((obj) => {
                        ids.push(obj._id)
                    })
                    let query = {
                        _id: { $in: ids }
                    }
                    let update = {
                        isRead: true
                    }

                    return dao.updateNotifications(query, update).then((updated) => {

                        let respObj = {
                            "recordsTotal": totalRecords,
                            "recordsFiltered": notifications.length,
                            "records": notifications
                        }

                        return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
                    })

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })

                // return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get notifications counts of unread received by admin
 * @param {String} id mongo id of admin
 */
function getAdminNotificationsCount(id) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let notificationQuery = {
                    receiverId: id,
                    isRead: false
                }

                return dao.getNotificationCount(notificationQuery).then((count) => {

                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, count)

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })

                // return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Update notification status
 * @param {String} id mongo id of admin
 * @param {Object} details notification records id whose status to be updated
 */
function updateNotificationStatus(id, details) {

    if (!id || !ObjectId.isValid(id) || !details || Object.keys(details).length == 0) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let notificationQuery = {
                    _id: { $in: details.notificationIds }
                }
                let update = {
                    isRead: true
                }

                return dao.updateNotifications(notificationQuery, update).then((updated) => {

                    if (updated) {

                        return mapper.responseMapping(admConst.CODE.Success, admConst.MESSAGE.NotificationStatusUpdated)
                    } else {

                        return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })

                // return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all bookings
 * @param {String} id mongo id of admin
 * @param {Object} queryParams filters to fetch bookings
 */
function getAllBookings(id, queryParams) {

    if (!id || !ObjectId.isValid(id) || !queryParams || Object.keys(queryParams).length == 0) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let matchQuery = {}
                let sortQuery = {}
                if (queryParams.fromDate) {

                    matchQuery = {
                        fromDate: { $gte: parseInt(queryParams.fromDate) },
                        toDate: { $lte: parseInt(queryParams.toDate) }
                    }
                }
                if (queryParams.status) {

                    matchQuery.status = queryParams.status
                }
                if (queryParams.propertyType) {

                    matchQuery.propertyType = queryParams.propertyType
                }
                if (queryParams.landlord) {

                    matchQuery["propertyDetails.landlord"] = ObjectId(queryParams.landlord)
                }
                if (queryParams.column) {

                    sortQuery[queryParams.column] = ((queryParams.dir == "asc") ? 1 : -1)
                } else {

                    sortQuery['createdAt'] = -1
                }

                let countAggregation = [
                    {
                        $lookup: {
                            from: 'accomodations',
                            localField: "propertyId",
                            foreignField: '_id',
                            as: 'propertyDetails'
                        }
                    }, {
                        $unwind: {
                            path: '$propertyDetails',
                            preserveNullAndEmptyArrays: true
                        }
                    }, {
                        $lookup: {
                            from: 'users',
                            localField: "userId",
                            foreignField: '_id',
                            as: 'userDetails'
                        }
                    }, {
                        $unwind: {
                            path: '$userDetails',
                            preserveNullAndEmptyArrays: true
                        }
                    }, {
                        $lookup: {
                            from: 'users',
                            localField: "propertyDetails.landlord",
                            foreignField: '_id',
                            as: 'landlordDetails'
                        }
                    }, {
                        $unwind: {
                            path: '$landlordDetails',
                            preserveNullAndEmptyArrays: true
                        }
                    }, {
                        $match: matchQuery
                    }, {
                        $project: {
                            '_id': 1,
                            'status': 1,
                            'fromDate': 1,
                            'toDate': 1,
                            'totalPrice': "$price",
                            'price': "$basePrice",
                            'taxes': 1,
                            'taxRate': 1,
                            'media': 1,
                            'createdAt': 1,
                            'payStatus': 1,
                            'propertyType': 1,
                            'propertyDetails._id': 1,
                            'propertyDetails.name': 1,
                            'propertyDetails.address.city': 1,
                            'propertyDetails.address.country': 1,
                            'userDetails._id': 1,
                            'userDetails.firstName': 1,
                            'userDetails.lastName': 1,
                            'landlordDetails._id': 1,
                            'landlordDetails.firstName': 1,
                            'landlordDetails.lastName': 1
                        }
                    }]

                let recordAggregation = []
                countAggregation.map((objs) => recordAggregation.push(objs))
                recordAggregation.push({
                    $sort: sortQuery
                }, {

                    $skip: parseInt(queryParams.skip)
                },
                    { $limit: parseInt(queryParams.limit) },
                )

                return Promise.all([dao.getAllBookings(countAggregation), dao.getAllBookings(recordAggregation)]).then((details) => {

                    let respObj = {
                        "recordsTotal": details[0].length,
                        "recordsFiltered": details[1].length,
                        "records": details[1]
                    }
                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })

            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get booking details
 * @param {String} id mongo id of admin
 * @param {String} bookingId mongo id of booking to fetch details
 */
async function getBookingDetails(id, bookingId) {

    if (!id || !ObjectId.isValid(id) || !bookingId || !ObjectId.isValid(bookingId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let matchQuery = {
                    _id: ObjectId(bookingId)
                }

                let aggregateQuery = [{
                    $match: matchQuery
                }, {
                    $lookup: {
                        from: 'accomodations',
                        localField: "propertyId",
                        foreignField: '_id',
                        as: 'propertyDetails'
                    }
                }, {
                    $unwind: {
                        path: '$propertyDetails',
                        preserveNullAndEmptyArrays: true
                    }
                }, {
                    $lookup: {
                        from: 'users',
                        localField: "userId",
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                }, {
                    $unwind: {
                        path: '$userDetails',
                        preserveNullAndEmptyArrays: true
                    }
                }, {
                    $lookup: {
                        from: 'users',
                        localField: "propertyDetails.landlord",
                        foreignField: '_id',
                        as: 'landlordDetails'
                    }
                }, {
                    $unwind: {
                        path: '$landlordDetails',
                        preserveNullAndEmptyArrays: true
                    }
                }, {
                    $project: {
                        '_id': 1,
                        'status': 1,
                        'fromDate': 1,
                        'toDate': 1,
                        'totalPrice': "$price",
                        'price': "$basePrice",
                        'taxes': 1,
                        'taxRate': 1,
                        'createdAt': 1,
                        'media': 1,
                        'payStatus': 1,
                        'propertyType': 1,
                        'propertyDetails._id': 1,
                        'propertyDetails.name': 1,
                        'propertyDetails.cancellationPolicy': 1,
                        'propertyDetails.address.city': 1,
                        'propertyDetails.address.country': 1,
                        'userDetails._id': 1,
                        'userDetails.firstName': 1,
                        'userDetails.lastName': 1,
                        'landlordDetails._id': 1,
                        'landlordDetails.firstName': 1,
                        'landlordDetails.lastName': 1
                    }
                }]

                return dao.getAllBookings(aggregateQuery).then((bookingDetails) => {

                    if (bookingDetails.length > 0) {

                        return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, bookingDetails[0])

                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.BookingNotFound)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })

            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all booking by user
 * @param {String} id mongo id of admin
 * @param {String} userId mongo id of user
 */
function getAllUserBookings(id, userId, skip, limit) {

    if (!id || !ObjectId.isValid(id) || !userId || !ObjectId.isValid(userId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let userQuery = {
                    _id: userId
                }
                return dao.getAdminDetails(userQuery).then((userDetails) => {

                    if (userDetails) {

                        let matchQuery = {
                            userId: ObjectId(userId)
                        }

                        let countAggregation = [{
                            $match: matchQuery
                        }, {
                            $lookup: {
                                from: 'accomodations',
                                localField: "propertyId",
                                foreignField: '_id',
                                as: 'propertyDetails'
                            }
                        }, {
                            $unwind: {
                                path: '$propertyDetails',
                                preserveNullAndEmptyArrays: true
                            }
                        }, {
                            $lookup: {
                                from: 'users',
                                localField: "userId",
                                foreignField: '_id',
                                as: 'userDetails'
                            }
                        }, {
                            $unwind: {
                                path: '$userDetails',
                                preserveNullAndEmptyArrays: true
                            }
                        }, {
                            $project: {
                                '_id': 1,
                                'status': 1,
                                'fromDate': 1,
                                'toDate': 1,
                                'totalPrice': "$price",
                                'price': "$basePrice",
                                'taxes': 1,
                                'taxRate': 1,
                                'createdAt': 1,
                                'payStatus': 1,
                                'media': 1,
                                'propertyType': 1,
                                'propertyDetails._id': 1,
                                'propertyDetails.name': 1,
                                'propertyDetails.address': 1,
                                'propertyDetails.status': 1,
                                'userDetails._id': 1,
                                'userDetails.firstName': 1,
                                'userDetails.lastName': 1,
                                "days": {
                                    "$divide": [
                                        { "$subtract": ["$toDate", "$fromDate"] },
                                        60 * 1000 * 60 * 24
                                    ]
                                }
                            }
                        }]

                        let recordAggregation = []
                        countAggregation.map((objs) => recordAggregation.push(objs))
                        recordAggregation.push({

                            $skip: parseInt(skip)
                        },
                            { $limit: parseInt(limit) },
                        )

                        return Promise.all([dao.getAllBookings(countAggregation), dao.getAllBookings(recordAggregation)]).then((details) => {

                            let respObj = {
                                "recordsTotal": details[0].length,
                                "recordsFiltered": details[1].length,
                                "records": details[1]
                            }
                            return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })

                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.UserNotFound)
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })

            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all reviews posted on property
 * @param {String} id mongo id of admin
 * @param {String} propertyId mongo id of property to fetch review-ratings received
 */
function getAllReviews(id, propertyId, skip, limit) {

    if (!id || !ObjectId.isValid(id) || !propertyId || !ObjectId.isValid(propertyId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let propertyQuery = {
                    _id: propertyId
                }
                return dao.getAccomodationDetails(propertyQuery).then(async (propertyDetails) => {

                    if (propertyDetails) {

                        let reviewQuery = {
                            propertyId: propertyId
                        }

                        let totalRecords = await dao.getReviewCounts(reviewQuery)
                        return dao.getAllReviews(reviewQuery, skip, limit).then((reviews) => {

                            let respObj = {
                                "recordsTotal": totalRecords,
                                "recordsFiltered": reviews.length,
                                "records": reviews
                            }

                            return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.PropertyNotFound)
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })

            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all payments received by user
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query parameters for filters, sorting and pagination
 */
function getAllPaymentsReceived(id, queryParams) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then(async (adminDetails) => {

            if (adminDetails) {

                let matchQuery = {}
                let sortQuery = {}

                if (queryParams.status) {

                    matchQuery.status = queryParams.status
                }
                if (queryParams.user) {

                    matchQuery.userId = ObjectId(queryParams.user)
                }

                let totalRecords = await dao.getBookingCounts(matchQuery)

                if (queryParams.column) {

                    sortQuery[queryParams.column] = ((queryParams.dir == "asc") ? 1 : -1)
                } else {

                    sortQuery['createdAt'] = -1
                }

                let aggregateQuery = [{
                    $match: matchQuery
                }, {
                    $sort: sortQuery
                }, {
                    $skip: parseInt(queryParams.skip)
                }, {
                    $limit: parseInt(queryParams.limit)
                }, {
                    $lookup: {
                        from: 'accomodations',
                        localField: "propertyId",
                        foreignField: '_id',
                        as: 'propertyDetails'
                    }
                }, {
                    $unwind: {
                        path: '$propertyDetails',
                        preserveNullAndEmptyArrays: true
                    }
                }, {
                    $lookup: {
                        from: 'users',
                        localField: "propertyDetails.landlord",
                        foreignField: '_id',
                        as: 'landlordDetails'
                    }
                }, {
                    $unwind: {
                        path: '$landlordDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: "userId",
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                }, {
                    $unwind: {
                        path: '$userDetails',
                        preserveNullAndEmptyArrays: true
                    }
                }, {
                    $project: {
                        '_id': 1,
                        'status': 1,
                        'fromDate': 1,
                        'toDate': 1,
                        'totalPrice': "$price",
                        'price': "$basePrice",
                        'taxes': 1,
                        'taxRate': 1,
                        'createdAt': 1,
                        'payStatus': 1,
                        'receiptUrl': 1,
                        'payStatus': 1,
                        'propertyType': 1,
                        'propertyDetails._id': 1,
                        'propertyDetails.name': 1,
                        'propertyDetails.address.city': 1,
                        'propertyDetails.address.country': 1,
                        'userDetails._id': 1,
                        'userDetails.firstName': 1,
                        'userDetails.lastName': 1,
                        'landlordDetails._id': 1,
                        'landlordDetails.firstName': 1,
                        'landlordDetails.lastName': 1,
                    }
                }]

                return dao.getAllBookings(aggregateQuery).then((payments) => {

                    let respObj = {
                        "recordsTotal": totalRecords,
                        "recordsFiltered": payments.length,
                        "records": payments
                    }
                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })

            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all payouts of landlord
 * @param {String} id mongo id of admin
 * @param {String} landlordId mongo id of landlord to fetch pending payments to be released
 */
function getAllPayOuts(id, landlordId) {

    if (!id || !ObjectId.isValid(id) || !landlordId || !ObjectId.isValid(landlordId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let aggregateQuery = [{
                    $lookup: {
                        from: 'accomodations',
                        localField: "propertyId",
                        foreignField: '_id',
                        as: 'propertyDetails'
                    }
                }, {
                    $unwind: {
                        path: '$propertyDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: {
                        status: constants.BOOKINGSTATUS.COMPLETED,
                        'propertyDetails.landlord': ObjectId(landlordId)
                    }
                },
                {
                    $project: {
                        '_id': 1,
                        'status': 1,
                        'fromDate': 1,
                        'toDate': 1,
                        'totalPrice': "$price",
                        'price': "$basePrice",
                        'taxes': 1,
                        'taxRate': 1,
                        'createdAt': 1,
                        'propertyType': 1,
                        'propertyDetails._id': 1,
                        'propertyDetails.name': 1,
                        'propertyDetails.landlord': 1,
                    }
                }]

                let serviceFees = parseFloat(adminDetails.serviceFee)

                return dao.getAllBookings(aggregateQuery).then((payments) => {

                    let totalPayableAmount = 0
                    payments.map((obj) => {

                        let serviceCharge = ((serviceFees / 100) * parseFloat(obj.price))
                        let amountToBePaid = parseFloat(obj.price) - serviceCharge

                        obj.serviceCharge = parseFloat(serviceCharge)
                        obj.serviceFeeRate = serviceFees
                        obj.subTotal = amountToBePaid
                        totalPayableAmount += parseFloat(amountToBePaid)
                    })

                    let respObj = {

                        payouts: payments,
                        totalPayableAmount: totalPayableAmount
                    }

                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })

            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get list of user name with id
 * @param {String} id mongo id of admin
 */
function getAllUserList(id) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let userQuery = {
                    role: constants.ROLE.USER,
                    isRegister: true,
                    isCodeVerified: true
                }

                let aggregateQuery = [{
                    $match: userQuery
                }, {
                    $project: {
                        '_id': 1,
                        'firstName': 1,
                        'lastName': 1
                    }
                }]

                return dao.getAllUsers(aggregateQuery).then((users) => {

                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, users)
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get list of landlord name with id
 * @param {String} id mongo id of admin
 */
function getAllLandlordList(id) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let landlordQuery = {
                    role: constants.ROLE.LANDLORD,
                    isAccountVerified: true,
                    isRegister: true,
                    isCodeVerified: true
                }

                let aggregateQuery = [{
                    $match: landlordQuery
                }, {
                    $project: {
                        '_id': 1,
                        'firstName': 1,
                        'lastName': 1
                    }
                }]

                return dao.getAllUsers(aggregateQuery).then((landlords) => {

                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, landlords)
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Release payments of landlords
 * @param {String} id mongo id of admin
 * @param {String} landlordId mongo id of landlord
 * @param {Object} details payment details to be paid to landlord
 */
async function releasePayment(id, landlordId, details) {

    // const accountDetails = await stripe.accounts.del(
    //     details.accountId
    // )

    // // const accountDetails = await stripe.accounts.retrieve(details.accountId)
    // return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, accountDetails)
    if (!id || !ObjectId.isValid(id) || !landlordId || !ObjectId.isValid(landlordId) || !details || Object.keys(details).length == 0) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        let landlordQuery = {
            _id: landlordId,
            role: constants.ROLE.LANDLORD
        }

        return Promise.all([dao.getAdminDetails(adminQuery), dao.getAdminDetails(landlordQuery)]).then((result) => {

            if (!result[0]) {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)

            } else if (!result[1]) {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.UserNotFound)

            } else {

                if (!result[1].accountId) {

                    return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.AccountIdNotAdded)
                } else {

                    return new Promise((resolve, reject) => {

                        stripe.transfers.create({
                            amount: parseInt(details.totalAmount) * 100,
                            currency: "usd",
                            destination: result[1].accountId
                        }, (err, transferSuccess) => {

                            if (err) {

                                console.log({ err })
                                reject(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
                            } else {

                                console.log({ transferSuccess })
                                let paymentQuery = {
                                    _id: { $in: details.paymentIds }
                                }

                                let updateObj = {
                                    status: constants.BOOKINGSTATUS.PAYMENT_RELEASED
                                }
                                dao.updatePaymentStatus(paymentQuery, updateObj).then(async (paymentUpdated) => {

                                    if (paymentUpdated) {

                                        let mailQuery = {
                                            mailName: constants.EMAIL_TEMPLATES.PAYOUT_SETTLED,
                                            status: constants.STATUS.ACTIVE
                                        }

                                        let templateDetails = await dao.getTemplateDetails(mailQuery)
                                        if (templateDetails) {

                                            let usrObj = {
                                                emailId: landlordId,
                                                firstName: result[1].firstName,
                                                currency: details.currency,
                                                amount: parseFloat(details.totalAmount)
                                            }
                                            mailHandler.SEND_MAIL(usrObj, templateDetails)
                                        }

                                        resolve(mapper.responseMapping(admConst.CODE.Success, admConst.MESSAGE.PaymentReleasedSuccess))
                                    } else {

                                        console.log({ err })
                                        reject(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
                                    }
                                }).catch((err) => {

                                    console.log({ err })
                                    reject(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
                                })
                            }
                        })
                    }).catch((err) => {

                        console.log({ err })
                        return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                    })
                }
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Refund payment
 * @param {String} id mongo id of admin
 * @param {String} userId mongo id of user to refund payment
 * @param {String} bookingId mongo id of booking of refunding payment
 * @param {Number} amount amount to be refunded as per cancellation policy
 */
function refundPayment(id, userId, bookingId, amount) {

    if (!id || !ObjectId.isValid(id) || !userId || !ObjectId.isValid(userId) || !bookingId || !ObjectId.isValid(bookingId) || !amount) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        let userQuery = {
            _id: userId,
            role: { $in: [constants.ROLE.USER, constants.ROLE.LANDLORD] }
        }

        let bookingMatchQuery = {
            _id: ObjectId(bookingId),
            status: { $in: [constants.BOOKINGSTATUS.CANCELLED, constants.BOOKINGSTATUS.REJECTED] }
        }

        let aggregateQuery = [{
            $match: bookingMatchQuery
        }, {
            $lookup: {
                from: 'accomodations',
                localField: "propertyId",
                foreignField: '_id',
                as: 'propertyDetails'
            }
        }, {
            $unwind: {
                path: '$propertyDetails',
                preserveNullAndEmptyArrays: true
            }
        }, {
            $project: {
                '_id': 1,
                'status': 1,
                'fromDate': 1,
                'toDate': 1,
                'totalPrice': "$price",
                'price': "$basePrice",
                'taxes': 1,
                'taxRate': 1,
                'createdAt': 1,
                'media': 1,
                'payStatus': 1,
                'propertyType': 1,
                'chargeId': 1,
                'propertyDetails._id': 1,
                'propertyDetails.name': 1
            }
        }]

        return Promise.all([dao.getAdminDetails(adminQuery), dao.getAdminDetails(userQuery), dao.getAllBookings(aggregateQuery)]).then((result) => {

            if (!result[0]) {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)

            } else if (!result[1]) {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.UserNotFound)

            } else if (!result[2] || result[2].length == 0) {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.BookingNotFound)

            } else {

                let userDetails = result[1]
                let bookingDetails = result[2][0]
                let chargeId = bookingDetails.chargeId

                return new Promise((resolve, reject) => {

                    stripe.refunds.create({
                        charge: chargeId,
                        amount: parseInt(amount) * 100
                    }, (err, result) => {

                        if (err) {

                            console.log({ err })
                            reject(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
                        } else {

                            let updateObj = {
                                status: constants.BOOKINGSTATUS.PAYMENT_REFUNDED
                            }

                            dao.updateBooking(bookingMatchQuery, updateObj).then(async (bookingUpdated) => {

                                if (bookingUpdated) {

                                    let mailQuery = {
                                        mailName: constants.EMAIL_TEMPLATES.PAYMENT_REFUNDED,
                                        status: constants.STATUS.ACTIVE
                                    }

                                    let templateDetails = await dao.getTemplateDetails(mailQuery);
                                    let fromDate = new Date(bookingDetails.fromDate)
                                    fromDate = fromDate.toDateString()
                                    let toDate = new Date(bookingDetails.toDate)
                                    toDate = toDate.toDateString()

                                    if (templateDetails) {
                                        let usrObj = {
                                            firstName: userDetails.firstName,
                                            lastName: userDetails.lastName,
                                            emailId: userDetails.emailId,
                                            propertyName: bookingDetails.propertyDetails.name.en,
                                            fromDate: fromDate,
                                            toDate: toDate
                                        }
                                        mailHandler.SEND_MAIL(usrObj, templateDetails)
                                    }

                                    resolve(mapper.responseMapping(admConst.CODE.Success, admConst.MESSAGE.RefundSuccess))
                                } else {

                                    reject(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
                                }
                            }).catch((err) => {

                                console.log({ err })
                                reject(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
                            })

                        }
                    })
                }).catch((e) => {

                    console.log({ e })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })

    }
}

/**
 * Get reports
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query params to fetch reports
 */
function getReports(id, queryParams) {

    if (!id || !ObjectId.isValid(id) || !queryParams || Object.keys(queryParams).length == 0) {

        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)

    } else {

        let adminQuery = {
            _id: id,
            role: constants.ROLE.ADMIN
        }
        return dao.getAdminDetails(adminQuery).then(async (adminDetails) => {

            if (adminDetails) {

                let { type } = queryParams

                if (type == constants.ROLE.USER || type == constants.ROLE.LANDLORD) {

                    let matchQuery = {
                        role: type,
                        isRegister: true
                    }
                    // if (queryParams.search) {
                    //     matchQuery[queryParams.searchColumn] = {
                    //         $regex: new RegExp(queryParams.searchVal),
                    //         $options: 'i'
                    //     }
                    // }
                    if (queryParams.search) {

                        matchQuery['$or'] = [
                            { 'emailId': { '$regex': queryParams.search, '$options': 'i' } },
                            { 'firstName': { '$regex': queryParams.search, '$options': 'i' } },
                            { 'lastName': { '$regex': queryParams.search, '$options': 'i' } }]
                    }

                    if (queryParams.fromDate) {

                        matchQuery.createdAt = { $gte: parseInt(queryParams.fromDate), $lt: parseInt(queryParams.toDate) }

                    }

                    let totalRecords = await dao.getCounts(matchQuery)
                    let sortQuery = {}
                    if (queryParams.column) {

                        sortQuery[queryParams.column] = ((queryParams.dir == "asc") ? 1 : -1)
                    } else {

                        sortQuery['createdAt'] = -1
                    }
                    let aggregateQuery = [
                        {
                            $match: matchQuery
                        },
                        {
                            $sort: sortQuery
                        },
                        {
                            $skip: parseInt(queryParams.skip)
                        },
                        {
                            $limit: parseInt(queryParams.limit)
                        },
                        {
                            $project: {
                                '_id': 1,
                                'role': 1,
                                'profilePicture': 1,
                                'firstName': 1,
                                'lastName': 1,
                                'emailId': 1,
                                'contactNumber': 1,
                                'createdAt': 1
                            }
                        }
                    ]

                    return dao.getAllUsers(aggregateQuery).then((users) => {

                        let respObj = {
                            "recordsTotal": totalRecords,
                            "recordsFiltered": users.length,
                            "records": users
                        }
                        return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
                    }).catch((err) => {

                        console.log({ err })
                        return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                    })

                } else {

                    let matchQuery = {}
                    if (queryParams.fromDate) {

                        matchQuery = {
                            fromDate: { $gte: parseInt(queryParams.fromDate) },
                            toDate: { $lte: parseInt(queryParams.toDate) }
                        }

                    }

                    if (queryParams.search) {

                        matchQuery['$or'] = [
                            { 'propertyDetails.name.en': { '$regex': queryParams.search, '$options': 'i' } },
                            { 'propertyType': { '$regex': queryParams.search, '$options': 'i' } },
                            { 'userDetails.firstName': { '$regex': queryParams.search, '$options': 'i' } },
                            { 'userDetails.lastName': { '$regex': queryParams.search, '$options': 'i' } },
                            { 'landlordDetails.firstName': { '$regex': queryParams.search, '$options': 'i' } },
                            { 'landlordDetails.lastName': { '$regex': queryParams.search, '$options': 'i' } }
                        ]
                    }

                    let totalRecordsAggregateQuery = [
                        {
                            '$lookup': {
                                'foreignField': '_id',
                                'localField': 'propertyId',
                                'from': 'accomodations',
                                'as': 'propertyDetails'
                            }
                        },
                        {
                            $unwind: {
                                path: '$propertyDetails',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            '$lookup': {
                                'foreignField': '_id',
                                'localField': 'userId',
                                'from': 'users',
                                'as': 'userDetails'
                            }
                        },
                        {
                            $unwind: {
                                path: '$userDetails',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            '$lookup': {
                                'foreignField': '_id',
                                'localField': 'propertyDetails.landlord',
                                'from': 'users',
                                'as': 'landlordDetails'
                            }
                        },
                        {
                            $unwind: {
                                path: '$landlordDetails',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $match: matchQuery
                        },
                        {
                            $project: {
                                '_id': 1,
                                'status': 1,
                                'totalPrice': "$price",
                                'price': "$basePrice",
                                'taxes': 1,
                                'taxRate': 1,
                                'createdAt': 1,
                                'fromDate': 1,
                                'toDate': 1,
                                'propertyDetails._id': 1,
                                'propertyDetails.name': 1,
                                'propertyDetails.type': 1,
                                'userDetails._id': 1,
                                'userDetails.firstName': 1,
                                'userDetails.lastName': 1,
                                'landlordDetails._id': 1,
                                'landlordDetails.firstName': 1,
                                'landlordDetails.lastName': 1
                            }
                        }
                    ]

                    return dao.getAllBookings(totalRecordsAggregateQuery).then((totalRecords) => {

                        let sortQuery = {}
                        if (queryParams.column) {

                            sortQuery[queryParams.column] = ((queryParams.dir == "asc") ? 1 : -1)
                        } else {

                            sortQuery['createdAt'] = -1
                        }

                        totalRecordsAggregateQuery.push({ '$sort': sortQuery })
                        totalRecordsAggregateQuery.push({ '$skip': parseInt(queryParams.skip) })
                        totalRecordsAggregateQuery.push({ '$limit': parseInt(queryParams.limit) })
                        return dao.getAllBookings(totalRecordsAggregateQuery).then((bookings) => {

                            let respObj = {
                                "recordsTotal": totalRecords.length,
                                "recordsFiltered": bookings.length,
                                "records": bookings
                            }

                            return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)

                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    }).catch((err) => {

                        console.log({ err })
                        return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                    })
                }
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })

    }
}

/**
 * Get reports
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query params to fetch reports
 */
function downloadReport(id, queryParams) {

    return getReports(id, queryParams).then((reportResponse) => {

        if (reportResponse && reportResponse.responseCode == constants.CODE.Success) {

            let fileData = []
            let results = reportResponse.responseData.records
            let { type } = queryParams
            let respObj = {}
            if (type == constants.ROLE.USER) {

                respObj.fileName = "users.csv"
                results.map((objs) => {

                    let newObj = {
                        "ID": objs._id,
                        "First name": objs.firstName,
                        "Last name": objs.lastName,
                        "EmailId": objs.emailId,
                        "Contact No.": objs.contactNumber,
                        "Registered at": new Date(objs.createdAt).toLocaleString()
                    }

                    fileData.push(newObj)
                })
            } else if (type == constants.ROLE.LANDLORD) {

                respObj.fileName = "landlords.csv"
                results.map((objs) => {

                    let newObj = {
                        "ID": objs._id,
                        "First name": objs.firstName,
                        "Last name": objs.lastName,
                        "EmailId": objs.emailId,
                        "Contact No.": objs.contactNumber,
                        "Registered at": new Date(objs.createdAt).toLocaleString()
                    }

                    fileData.push(newObj)
                })
            } else {

                respObj.fileName = "bookings.csv"
                results.map((objs) => {

                    let newObj = {
                        "ID": objs._id,
                        "Status": objs.status,
                        "Booking from": new Date(objs.fromDate).toDateString(),
                        "Booking till": new Date(objs.toDate).toDateString(),
                        "Total price": objs.price,
                        "Base price": objs.basePrice,
                        "Admin commission": objs.taxes,
                        "Property ID": objs.propertyDetails._id,
                        "Property type": objs.propertyDetails.type,
                        "Property name": objs.propertyDetails.name.en,
                        "User ID": objs.userDetails._id,
                        "User first name": objs.userDetails.firstName,
                        "User last name": objs.userDetails.lastName,
                        "Landlord ID": objs.landlordDetails._id,
                        "Landlord first name": objs.landlordDetails.firstName,
                        "Landlord last name": objs.landlordDetails.lastName
                    }

                    fileData.push(newObj)
                })

            }

            if (fileData.length > 0) {

                const parser = new Parser();
                respObj.csv = parser.parse(fileData);
            }

            return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)

        } else {

            // console.log({ reportResponse })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        }

    }).catch((err) => {

        console.log({ err })
        return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
    })
}

/**
 * Get all landlord payable/paid list
 * @param {String} id mongo id of admin
 * @param {String} landlordId mongo id of landlord
 * @param {Object} queryParams query params to filter results
 */
function getAllLandlordPayments(id, landlordId, queryParams) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let matchQuery = {
                    'propertyDetails.landlord': ObjectId(landlordId)
                }
                if (queryParams.status) {

                    matchQuery['status'] = queryParams.status
                }

                let totalRecordsAggregateQuery = [{
                    $lookup: {
                        from: 'accomodations',
                        localField: "propertyId",
                        foreignField: '_id',
                        as: 'propertyDetails'
                    }
                }, {
                    $unwind: {
                        path: '$propertyDetails',
                        preserveNullAndEmptyArrays: true
                    }
                }, {
                    $lookup: {
                        from: 'users',
                        localField: "propertyDetails.landlord",
                        foreignField: '_id',
                        as: 'landlordDetails'
                    }
                }, {
                    $unwind: {
                        path: '$landlordDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: "userId",
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                }, {
                    $unwind: {
                        path: '$userDetails',
                        preserveNullAndEmptyArrays: true
                    }
                }, {
                    $match: matchQuery
                },
                {
                    $project: {
                        '_id': 1,
                        'status': 1,
                        'fromDate': 1,
                        'toDate': 1,
                        'totalPrice': "$price",
                        'price': "$basePrice",
                        'taxes': 1,
                        'taxRate': 1,
                        'createdAt': 1,
                        'propertyType': 1,
                        'propertyDetails._id': 1,
                        'propertyDetails.name': 1,
                        'userDetails._id': 1,
                        'userDetails.firstName': 1,
                        'userDetails.lastName': 1,
                        'landlordDetails._id': 1,
                        'landlordDetails.firstName': 1,
                        'landlordDetails.lastName': 1
                    }
                }]

                return dao.getAllBookings(totalRecordsAggregateQuery).then((totalRecords) => {

                    // if (totalRecords && totalRecords.length > 0) {

                    let sortQuery = {}
                    if (queryParams.column) {

                        sortQuery[queryParams.column] = ((queryParams.dir == "asc") ? 1 : -1)
                    } else {

                        sortQuery['createdAt'] = -1
                    }
                    totalRecordsAggregateQuery.push({ '$sort': sortQuery })
                    totalRecordsAggregateQuery.push({ '$skip': parseInt(queryParams.skip) })
                    totalRecordsAggregateQuery.push({ '$limit': parseInt(queryParams.limit) })

                    return dao.getAllBookings(totalRecordsAggregateQuery).then((payments) => {

                        if (payments) {

                            let respObj = {
                                "recordsTotal": totalRecords.length,
                                "recordsFiltered": payments.length,
                                "records": payments
                            }
                            return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)
                        } else {

                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        }
                    }).catch((err) => {

                        console.log({ err })
                        return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                    })
                    // } else {

                    //     return mapper.responseMapping(admConst.CODE.Success, admConst.MESSAGE.Success)
                    // }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })


                // return dao.getAllBookings(aggregateQuery).then((payments) => {

                //     let totalPayableAmount = 0
                //     payments.map((obj) => {

                //         totalPayableAmount += parseFloat(obj.price)
                //     })

                //     let respObj = {

                //         payouts: payments,
                //         totalPayableAmount: totalPayableAmount
                //     }

                //     return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, respObj)

                // }).catch((err) => {

                //     console.log({ err })
                //     return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                // })

            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Add tax rate
 * @param {String} id mongo id of admin
 * @param {Object} details tax rate to be added country-state wise
 */
function addTax(id, details) {

    if (!id || !ObjectId.isValid(id) || !details || Object.keys(details).length == 0) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let query = {
                    country: details.country
                }

                return dao.getTaxDetails(query).then((taxExists) => {

                    if (taxExists) {

                        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.TaxAlreadyExists)
                    } else {

                        details.createdAt = new Date().getTime()
                        details.createdBy = id

                        return dao.addTax(details).then((added) => {

                            if (added) {

                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.TaxAddedSuccess, added)

                            } else {

                                console.log("Failed to add tax")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all tax rates
 * @param {String} id mongo id of admin
 */
function getAllTaxes(id) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                return dao.getAllTaxes().then((taxes) => {

                    return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, taxes)

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Update tax rate
 * @param {String} id mongo id of admin
 * @param {String} taxId mongo id of tax rate
 * @param {Object} details tax rate details to be updated
 */
function updateTax(id, taxId, details) {

    if (!id || !ObjectId.isValid(id) || !taxId || !ObjectId.isValid(taxId) || !details || !Object.keys(details)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let taxQuery = {
                    _id: taxId
                }

                return dao.getTaxDetails(taxQuery).then((taxDetails) => {

                    if (taxDetails) {


                        details.editedAt = new Date().getTime()
                        details.editedBy = id

                        return dao.updateTax(taxQuery, details).then((updated) => {

                            if (updated) {

                                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.TaxUpdatedSuccess, updated)
                            } else {

                                console.log("Failed to update tax rate")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidTaxDetails)
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })

            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Delete tax rate
 * @param {String} id mongo id of admin
 * @param {String} taxId mongo id of tax
 */
function deleteTax(id, taxId) {

    if (!id || !ObjectId.isValid(id) || !taxId || !ObjectId.isValid(taxId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        return dao.getAdminDetails(adminQuery).then((adminDetails) => {

            if (adminDetails) {

                let taxQuery = {
                    _id: taxId
                }

                return dao.getTaxDetails(taxQuery).then((taxDetails) => {

                    if (taxDetails) {

                        return dao.deleteTax(taxQuery).then((deleted) => {

                            if (deleted) {

                                return mapper.responseMapping(admConst.CODE.Success, admConst.MESSAGE.TaxDeletedSuccess)
                            } else {

                                console.log("Failed to delete tax rate")
                                return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                            }
                        }).catch((err) => {

                            console.log({ err })
                            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                        })
                    } else {

                        return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidTaxDetails)
                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })

            } else {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Create invitation link
 * @param {String} id mongo id of admin
 * @param {Object} details invitation link details to be created
 */
function createLink(id, details) {

    if (!id || !ObjectId.isValid(id) || !details || Object.keys(details).length == 0) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        let linkQuery = {
            type: details.type
        }

        return Promise.all([dao.getAdminDetails(adminQuery), dao.getLinkDetails(linkQuery)]).then((result) => {

            if (!result[0]) {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)

            } else if (result[1]) {

                return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvitationLinkAlreadyCreated)

            } else {

                details.createdAt = new Date().getTime()
                details.createdBy = id

                return dao.createLink(details).then((created) => {

                    if (created) {

                        return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.InvitationLinkCreated, created)

                    } else {

                        return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                    }

                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })
            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Get all invitation links
 * @param {String} id mongo id of admin
 */
function getAllLinks(id) {

    if (!id || !ObjectId.isValid(id)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        let linkQuery = {}

        return Promise.all([dao.getAdminDetails(adminQuery), dao.getAllLinks(linkQuery)]).then((result) => {

            if (!result[0]) {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)

            } else {

                return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.Success, result[1])

            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Update invitation link
 * @param {String} id mongo id of admin
 * @param {String} linkId mongo id of invitation link to be updtaed
 * @param {String} URL URL to be updated
 */
function updateLink(id, linkId, URL) {

    if (!id || !ObjectId.isValid(id) || !linkId || !ObjectId.isValid(linkId) || !URL) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        let linkQuery = {
            _id: linkId,
            status: constants.STATUS.ACTIVE
        }

        return Promise.all([dao.getAdminDetails(adminQuery), dao.getLinkDetails(linkQuery)]).then((result) => {

            if (!result[0]) {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)

            } else if (!result[1]) {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvitationLinkNotFound)

            } else {

                let updateObj = {
                    URL: URL,
                    editedAt: new Date().getTime(),
                    editedBy: id
                }

                return dao.updateLink(linkQuery, updateObj).then((linkUpdated) => {

                    if (linkUpdated) {

                        return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.InvitationLinkUpdated, linkUpdated)

                    } else {

                        console.log("Failed to update link")
                        return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)

                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })

            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}

/**
 * Delet/Resurrect invitation link
 * @param {String} id mongo id of admin
 * @param {String} linkId mongo id of invitation link to be updtaed
 */
function deleteLink(id, linkId) {

    if (!id || !ObjectId.isValid(id) || !linkId || !ObjectId.isValid(linkId)) {

        return mapper.responseMapping(admConst.CODE.BadRequest, admConst.MESSAGE.InvalidDetails)
    } else {

        let adminQuery = {
            _id: id,
            status: constants.STATUS.ACTIVE,
            role: constants.ROLE.ADMIN
        }

        let linkQuery = {
            _id: linkId
        }

        return Promise.all([dao.getAdminDetails(adminQuery), dao.getLinkDetails(linkQuery)]).then((result) => {

            if (!result[0]) {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvalidCredentials)

            } else if (!result[1]) {

                return mapper.responseMapping(admConst.CODE.DataNotFound, admConst.MESSAGE.InvitationLinkNotFound)

            } else {

                let linkDetails = result[1]

                let updateObj = {
                    editedAt: new Date().getTime(),
                    editedBy: id
                }
                if (linkDetails.status == constants.STATUS.ACTIVE) {

                    updateObj.status = constants.STATUS.INACTIVE
                } else {

                    updateObj.status = constants.STATUS.ACTIVE
                }

                return dao.updateLink(linkQuery, updateObj).then((linkUpdated) => {

                    if (linkUpdated) {

                        if (linkUpdated.status == constants.STATUS.ACTIVE) {

                            return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.InvitationLinkActivated, linkUpdated)
                        } else {

                            return mapper.responseMappingWithData(admConst.CODE.Success, admConst.MESSAGE.InvitationLinkDeactivated, linkUpdated)
                        }

                    } else {

                        console.log("Failed to update link")
                        return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)

                    }
                }).catch((err) => {

                    console.log({ err })
                    return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
                })

            }
        }).catch((err) => {

            console.log({ err })
            return mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError)
        })
    }
}
module.exports = {

    login,

    logout,

    getProfile,

    updateProfile,

    forgotPassword,

    setNewPassword,

    resetPassword,

    sendCode,

    verifyCode,

    updateEmail,

    createCMS,

    getAllCMS,

    getCMSDetails,

    updateCMS,

    deleteCMS,

    addLanguage,

    getAllLanguages,

    getLanguageDetails,

    updateLanguage,

    deleteLanguage,

    createCategory,

    getAllCategories,

    updateCategory,

    deleteCategory,

    createTemplate,

    getAllTemplates,

    getTemplateDetails,

    updateTemplate,

    deleteTemplate,

    getAllTemplateEntities,

    getAllUsers,

    getUserDetails,

    addUser,

    updateUser,

    deleteUser,

    getCounts,

    createAmenities,

    getAllAmenities,

    addAmenities,

    updateAmenities,

    deleteMainAmenities,

    removeAmenities,

    getPendingLandlordRequests,

    getAllLandlords,

    getPendingAccomodations,

    getAccomodationDetails,

    updateAccomodationVerification,

    getAllAccomodations,

    updateAccomodation,

    deleteAccomodation,

    getHostedAccomodations,

    getAllQueries,

    getQueryDetails,

    queryReply,

    updateQueryStatus,

    setServiceFee,

    getServiceFee,

    getAdminNotifications,

    getAdminNotificationsCount,

    updateNotificationStatus,

    getAllBookings,

    getBookingDetails,

    getAllUserBookings,

    getAllReviews,

    getAllPaymentsReceived,

    getAllPayOuts,

    getAllUserList,

    getAllLandlordList,

    releasePayment,

    refundPayment,

    getReports,

    downloadReport,

    getAllLandlordPayments,

    addTax,

    getAllTaxes,

    updateTax,

    deleteTax,

    createLink,

    getAllLinks,

    updateLink,

    deleteLink
}