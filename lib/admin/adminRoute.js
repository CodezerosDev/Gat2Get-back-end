/**
 * @author Kavya Patel
 */

/*#################################            Load modules start            ########################################### */

const router = require("express").Router();
const facade = require('./adminFacade')
const mapper = require('./adminMapper')
const admConst = require('./adminConstants')
const validators = require('./adminValidators')

/*#################################            Load modules end            ########################################### */

// ADMIN PROFILE APIs

router.route('/login').post([validators.checkLoginRequest], (req, res) => {

    let { emailId, password } = req.body

    facade.login(emailId, password).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/logout/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params

    facade.logout(id).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getProfile/:id').get([validators.checkToken, validators.checkGetProfileRequest], (req, res) => {

    let { id } = req.params

    facade.getProfile(id).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/updateProfile/:id').put([validators.checkToken, validators.checkUpdateProfileRequest], (req, res) => {

    let { id } = req.params
    let obj = req.body

    facade.updateProfile(id, obj).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/forgotPassword').post([validators.checkForgotPasswordRequest], (req, res) => {

    let { emailId } = req.body

    facade.forgotPassword(emailId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/setNewPassword/:redisId').post([validators.checkSetNewPasswordRequest], (req, res) => {

    let { redisId } = req.params
    let { password } = req.body

    facade.setNewPassword(redisId, password).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/resetPassword/:id').post([validators.checkToken, validators.checkResetPasswordRequest], (req, res) => {

    let { id } = req.params
    let { oldPassword, newPassword } = req.body

    facade.resetPassword(id, oldPassword, newPassword).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/sendCode/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params

    facade.sendCode(id).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/verifyCode/:id').post([validators.checkToken, validators.checkVerifyCodeRequest], (req, res) => {

    let { id } = req.params
    let { verificationCode } = req.body

    facade.verifyCode(id, verificationCode).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/updateEmail/:id').post([validators.checkToken, validators.checkUpdateEmailRequest], (req, res) => {

    let { id } = req.params
    let { emailId } = req.body

    facade.updateEmail(id, emailId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// CMS APIs

router.route('/createCMS/:id').post([validators.checkToken, validators.checkCreateCMSRequest], (req, res) => {

    let { id } = req.params
    let cmsDetails = req.body

    facade.createCMS(id, cmsDetails).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllCMS/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params

    facade.getAllCMS(id).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getCMSDetails/:id/:cmsId').get([validators.checkToken], (req, res) => {

    let { id, cmsId } = req.params

    facade.getCMSDetails(id, cmsId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/updateCMS/:id/:cmsId').put([validators.checkToken, validators.checkUpdateCMSRequest], (req, res) => {

    let { id, cmsId } = req.params
    let cmsDetails = req.body

    facade.updateCMS(id, cmsId, cmsDetails).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/deleteCMS/:id/:cmsId').delete([validators.checkToken], (req, res) => {

    let { id, cmsId } = req.params

    facade.deleteCMS(id, cmsId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// LANGUAGE SETTING APIs

router.route('/addLanguage/:id').post([validators.checkToken, validators.checkAddLanguageRequest], (req, res) => {

    let { id } = req.params
    let languageDetails = req.body

    facade.addLanguage(id, languageDetails).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllLanguages/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params

    facade.getAllLanguages(id).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getLanguageDetails/:id/:languageId').get([validators.checkToken], (req, res) => {

    let { id, languageId } = req.params

    facade.getLanguageDetails(id, languageId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/updateLanguage/:id/:languageId').put([validators.checkToken, validators.checkUpdateLanguageRequest], (req, res) => {

    let { id, languageId } = req.params
    let languageDetails = req.body

    facade.updateLanguage(id, languageId, languageDetails).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/deleteLanguage/:id/:languageId').delete([validators.checkToken], (req, res) => {

    let { id, languageId } = req.params

    facade.deleteLanguage(id, languageId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// CATEGORY APIs

router.route('/createCategory/:id').post([validators.checkToken, validators.checkCreateCategoryRequest], (req, res) => {

    let { id } = req.params
    let categoryDetails = req.body

    facade.createCategory(id, categoryDetails).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllCategories/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params
    let { type } = req.query

    facade.getAllCategories(id, type).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/updateCategory/:id/:categoryId').put([validators.checkToken, validators.checkUpdateCategoryRequest], (req, res) => {

    let { id, categoryId } = req.params
    let categoryDetails = req.body

    facade.updateCategory(id, categoryId, categoryDetails).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/deleteCategory/:id/:categoryId').delete([validators.checkToken], (req, res) => {

    let { id, categoryId } = req.params

    facade.deleteCategory(id, categoryId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// EMAIL TEMPLATE APIs

router.route('/createTemplate/:id').post([validators.checkToken, validators.checkCreateTemplateRequest], (req, res) => {

    let { id } = req.params
    let templateDetails = req.body

    facade.createTemplate(id, templateDetails).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllTemplates/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params
    let queryParams = req.query

    facade.getAllTemplates(id, queryParams).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getTemplateDetails/:id/:templateId').get([validators.checkToken], (req, res) => {

    let { id, templateId } = req.params

    facade.getTemplateDetails(id, templateId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/updateTemplate/:id/:templateId').put([validators.checkToken, validators.checkUpdateTemplateRequest], (req, res) => {

    let { id, templateId } = req.params
    let templateDetails = req.body

    facade.updateTemplate(id, templateId, templateDetails).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/deleteTemplate/:id/:templateId').delete([validators.checkToken], (req, res) => {

    let { id, templateId } = req.params

    facade.deleteTemplate(id, templateId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllTemplateEntities/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params

    facade.getAllTemplateEntities(id).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// USER MANAGEMENT APIs

router.route('/getAllUsers/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params
    let queryParams = req.query

    facade.getAllUsers(id, queryParams).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getUserDetails/:id/:userId').get([validators.checkToken], (req, res) => {

    let { id, userId } = req.params

    facade.getUserDetails(id, userId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/addUser/:id').post([validators.checkToken, validators.checkAddUserRequest], (req, res) => {

    let { id } = req.params
    let userDetails = req.body

    facade.addUser(id, userDetails).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/updateUser/:id/:userId').put([validators.checkToken, validators.checkUpdateUserRequest], (req, res) => {

    let { id, userId } = req.params
    let userDetails = req.body

    facade.updateUser(id, userId, userDetails).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/deleteUser/:id/:userId').delete([validators.checkToken], (req, res) => {

    let { id, userId } = req.params

    facade.deleteUser(id, userId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})


// DASHBOARD APIs

router.route('/getCounts/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params
    let { year } = req.query

    facade.getCounts(id, year).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// AMENITIES APIs
router.route('/createAmenities/:id').post([validators.checkToken, validators.checkCreateAmenitiesRequest], (req, res) => {

    let { id } = req.params
    let details = req.body

    facade.createAmenities(id, details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllAmenities/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params

    facade.getAllAmenities(id).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/addAmenities/:id/:amenitiesId').put([validators.checkToken, validators.checkAddAmenitiesRequest], (req, res) => {

    let { id, amenitiesId } = req.params
    let { amenities } = req.body

    facade.addAmenities(id, amenitiesId, amenities).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/updateAmenities/:id/:amenitiesId').put([validators.checkToken, validators.checkUpdateAmenitiesRequest], (req, res) => {

    let { id, amenitiesId } = req.params
    let details = req.body

    facade.updateAmenities(id, amenitiesId, details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/deleteMainAmenities/:id/:amenitiesId').delete([validators.checkToken], (req, res) => {

    let { id, amenitiesId } = req.params

    facade.deleteMainAmenities(id, amenitiesId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/removeAmenities/:id/:categoryId/:amenitiesId').delete([validators.checkToken], (req, res) => {

    let { id, categoryId, amenitiesId } = req.params

    facade.removeAmenities(id, categoryId, amenitiesId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// LANDLORD APIs

router.route('/getPendingLandlordRequests/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params
    let queryParams = req.query

    facade.getPendingLandlordRequests(id, queryParams).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})


router.route('/getAllLandlords/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params
    let queryParams = req.query

    facade.getAllLandlords(id, queryParams).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// ACCOMODATION APIs

router.route('/getPendingAccomodations/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params
    let queryParams = req.query

    facade.getPendingAccomodations(id, queryParams).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getAccomodationDetails/:id/:accomodationId').get([validators.checkToken], (req, res) => {

    let { id, accomodationId } = req.params

    facade.getAccomodationDetails(id, accomodationId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/updateAccomodationVerification/:id/:accomodationId').put([validators.checkToken], (req, res) => {

    let { id, accomodationId } = req.params
    let details = req.body

    facade.updateAccomodationVerification(id, accomodationId, details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllAccomodations/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params
    let queryParams = req.query

    facade.getAllAccomodations(id, queryParams).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/updateAccomodation/:id/:accomodationId').put([validators.checkToken, validators.checkUpdateAccomodationRequest], (req, res) => {

    let { id, accomodationId } = req.params
    let details = req.body

    facade.updateAccomodation(id, accomodationId, details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/deleteAccomodation/:id/:accomodationId').delete([validators.checkToken], (req, res) => {

    let { id, accomodationId } = req.params

    facade.deleteAccomodation(id, accomodationId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getHostedAccomodations/:id/:landlordId').get([validators.checkToken], (req, res) => {

    let { id, landlordId } = req.params
    let queryParams = req.query

    facade.getHostedAccomodations(id, landlordId, queryParams).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// CONTACT US APIs

router.route('/getAllQueries/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params
    let queryParams = req.query

    facade.getAllQueries(id, queryParams).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getQueryDetails/:id/:queryId').get([validators.checkToken], (req, res) => {

    let { id, queryId } = req.params

    facade.getQueryDetails(id, queryId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/queryReply/:id/:queryId').post([validators.checkToken, validators.checkQueryReplyRequest], (req, res) => {

    let { id, queryId } = req.params
    let { reply } = req.body

    facade.queryReply(id, queryId, reply).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/updateQueryStatus/:id/:queryId/:status').get([validators.checkToken], (req, res) => {

    let { id, queryId, status } = req.params

    facade.updateQueryStatus(id, queryId, status).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// GENERAL SETTING APIs
router.route('/setServiceFee/:id').post([validators.checkToken, validators.checkSetServiceFeeRequest], (req, res) => {

    let { id } = req.params
    let { serviceFee } = req.body

    facade.setServiceFee(id, serviceFee).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getServiceFee/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params

    facade.getServiceFee(id).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// NOTIFICATION APIs

router.route('/getAdminNotifications/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params
    let { skip, limit } = req.query

    facade.getAdminNotifications(id, skip, limit).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getAdminNotificationsCount/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params

    facade.getAdminNotificationsCount(id).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/updateNotificationStatus/:id').put([validators.checkToken, validators.updateNotificationStatusRequest], (req, res) => {

    let { id } = req.params
    let details = req.body

    facade.updateNotificationStatus(id, details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// BOOKING APIs

router.route('/getAllBookings/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params
    let queryParams = req.query

    facade.getAllBookings(id, queryParams).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getBookingDetails/:id/:bookingId').get([validators.checkToken], (req, res) => {

    let { id, bookingId } = req.params

    facade.getBookingDetails(id, bookingId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllUserBookings/:id/:userId').get([validators.checkToken], (req, res) => {

    let { id, userId } = req.params
    let { skip, limit } = req.query

    facade.getAllUserBookings(id, userId, skip, limit).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// REVIEW RATING APIs

router.route('/getAllReviews/:id/:propertyId').get([validators.checkToken], (req, res) => {

    let { id, propertyId } = req.params
    let { skip, limit } = req.query

    facade.getAllReviews(id, propertyId, skip, limit).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// PAYOUTS APIs

router.route('/getAllPaymentsReceived/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params
    let queryParams = req.query

    facade.getAllPaymentsReceived(id, queryParams).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllPayOuts/:id/:landlordId').get([validators.checkToken], (req, res) => {

    let { id, landlordId } = req.params

    facade.getAllPayOuts(id, landlordId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllLandlordPayments/:id/:landlordId').get([validators.checkToken], (req, res) => {

    let { id, landlordId } = req.params
    let queryParams = req.query

    facade.getAllLandlordPayments(id, landlordId, queryParams).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/releasePayment/:id/:landlordId').post([validators.checkToken, validators.checkReleasePaymentRequest], (req, res) => {

    let { id, landlordId } = req.params
    let details = req.body

    facade.releasePayment(id, landlordId, details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// LIST APIs

router.route('/getAllUserList/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params

    facade.getAllUserList(id).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllLandlordList/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params

    facade.getAllLandlordList(id).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// CANCELLATION - REFUND APIs

router.route('/refundPayment/:id/:userId/:bookingId').post([validators.checkToken, validators.checkRefundPaymentRequest], (req, res) => {

    let { id, userId, bookingId } = req.params
    let { amount } = req.body

    facade.refundPayment(id, userId, bookingId, amount).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// REPORTS

router.route('/getReports/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params
    let queryParams = req.query

    facade.getReports(id, queryParams).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/downloadReport/:id').get([], (req, res) => {

    let { id } = req.params
    let queryParams = req.query

    facade.downloadReport(id, queryParams).then((result) => {

        res.header('Content-Type', 'text/csv');
        res.attachment(result.responseData.fileName);
        res.send(result.responseData.csv);

    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// TAX

router.route('/addTax/:id').post([validators.checkToken, validators.checkAddTaxRequest], (req, res) => {

    let { id } = req.params
    let details = req.body

    facade.addTax(id, details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllTaxes/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params

    facade.getAllTaxes(id).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/updateTax/:id/:taxId').put([validators.checkToken], (req, res) => {

    let { id, taxId } = req.params
    let details = req.body

    facade.updateTax(id, taxId, details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/deleteTax/:id/:taxId').delete([validators.checkToken], (req, res) => {

    let { id, taxId } = req.params

    facade.deleteTax(id, taxId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

// INVITATION LINKS
router.route('/createLink/:id').post([validators.checkToken, validators.checkCreateInvitationLinkRequest], (req, res) => {

    let { id } = req.params
    let details = req.body

    facade.createLink(id, details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllLinks/:id').get([validators.checkToken], (req, res) => {

    let { id } = req.params

    facade.getAllLinks(id).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/updateLink/:id/:linkId').put([validators.checkToken, validators.checkUpdateInvitationLinkRequest], (req, res) => {

    let { id, linkId } = req.params
    let { URL } = req.body

    facade.updateLink(id, linkId, URL).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})

router.route('/deleteLink/:id/:linkId').delete([validators.checkToken], (req, res) => {

    let { id, linkId } = req.params

    facade.deleteLink(id, linkId).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(admConst.CODE.INTRNLSRVR, admConst.MESSAGE.internalServerError))
    })
})
module.exports = router