/**
 * @author Kavya Patel
 */

/*#################################            Load modules start            ########################################### */
const service = require('./adminService')

/*#################################            Load modules end            ########################################### */

/**
 * Admin login
 * @param {string} emailId email id of admin
 * @param {string} password password of admin
 */
function login(emailId, password) {

    return service.login(emailId, password).then(data => data)
}

/**
 * Admin logout
 * @param {String} id mongo id of admin
 */
function logout(id) {

    return service.logout(id).then(data => data)
}

/**
 * Get profile
 * @param {string} id mongo id of admin to fetch profile details
 */
function getProfile(id) {

    return service.getProfile(id).then(data => data)
}

/**
 * Update profile
 * @param {string} id mongo id of admin
 * @param {object} obj admin profile updating details
 */
function updateProfile(id, obj) {

    return service.updateProfile(id, obj).then(data => data)
}

/**
 * Recover password by email
 * @param {string} emailId email id of admin for recover password
 */
function forgotPassword(emailId) {

    return service.forgotPassword(emailId).then(data => data)
}

/**
 * Set new password
 * @param {string} redisId redis id for recovering password
 * @param {string} password new password to set
 */
function setNewPassword(redisId, password) {

    return service.setNewPassword(redisId, password).then(data => data)
}

/**
 * Reset password
 * @param {string} id mongo id of admin
 * @param {string} oldPassword old password to verify
 * @param {string} newPassword new password to reset
 */
function resetPassword(id, oldPassword, newPassword) {

    return service.resetPassword(id, oldPassword, newPassword).then(data => data)
}

/**
 * If email changing is attempted, need to send verification code to existing email id
 * @param {string} id mongo id of admin to confirm email changing
 */
function sendCode(id) {

    return service.sendCode(id).then(data => data)
}

/**
 * Verify code
 * @param {string} id mongo id of admin
 * @param {string} verificationCode redis id to verify
 */
function verifyCode(id, verificationCode) {

    return service.verifyCode(id, verificationCode).then(data => data)
}

/**
 * Update email 
 * @param {string} id mongo id of admin
 * @param {string} emailId new email id to be updated
 */
function updateEmail(id, emailId) {

    return service.updateEmail(id, emailId).then(data => data)
}

/**
 * Create CMS
 * @param {String} id mongo id of admin
 * @param {Object} cmsDetails CMS page details
 */
function createCMS(id, cmsDetails) {

    return service.createCMS(id, cmsDetails).then(data => data)
}

/**
 * Get all CMS pages
 * @param {String} id mongo id of admin
 */
function getAllCMS(id) {

    return service.getAllCMS(id).then(data => data)
}

/**
 * Get CMS page details
 * @param {String} id mongo id of admin
 * @param {String} cmsId mongo id of CMS page to get details
 */
function getCMSDetails(id, cmsId) {

    return service.getCMSDetails(id, cmsId).then(data => data)
}

/**
 * Update CMS page
 * @param {String} id mongo id of admin
 * @param {String} cmsId mongo id of CMS page to be updated
 * @param {Object} cmsDetails cms updating details
 */
function updateCMS(id, cmsId, cmsDetails) {

    return service.updateCMS(id, cmsId, cmsDetails).then(data => data)
}

/**
 * Delete Resurrect CMS page
 * @param {String} id mongo id of admin
 * @param {String} cmsId mongo id of CMS page to be deleted or resurrected
 */
function deleteCMS(id, cmsId) {

    return service.deleteCMS(id, cmsId).then(data => data)
}

/**
 * Add language
 * @param {String} id mongo id of admin
 * @param {Object} languageDetails languages to be added
 */
function addLanguage(id, languageDetails) {

    return service.addLanguage(id, languageDetails).then(data => data)
}

/**
 * Get all languages
 * @param {String} id mongo id of admin
 */
function getAllLanguages(id) {

    return service.getAllLanguages(id).then(data => data)
}

/**
 * Get language details
 * @param {String} id mongo id of admin
 * @param {String} languageId mongo id of language to fetch details
 */
function getLanguageDetails(id, languageId) {

    return service.getLanguageDetails(id, languageId).then(data => data)
}

/**
 * Update language
 * @param {String} id mongo id of admin
 * @param {String} languageId mongo id of language
 * @param {Object} languageDetails language details to be updated
 */
function updateLanguage(id, languageId, languageDetails) {

    return service.updateLanguage(id, languageId, languageDetails).then(data => data)
}

/**
 * Delete or resurrect language
 * @param {String} id mongo id of admin
 * @param {String} languageId mongo id of language to be deleted or resurrected
 */
function deleteLanguage(id, languageId) {

    return service.deleteLanguage(id, languageId).then(data => data)
}

/**
 * Create category
 * @param {String} id mongo id of admin
 * @param {Object} categoryDetails category to be added
 */
function createCategory(id, categoryDetails) {

    return service.createCategory(id, categoryDetails).then(data => data)
}

/**
 * Get all categories
 * @param {String} id mongo id of admin
 * @param {String} type category type to fetch its sub categories
 */
function getAllCategories(id, type) {

    return service.getAllCategories(id, type).then(data => data)
}

/**
 * Update category
 * @param {String} id mongo id of admin
 * @param {String} categoryId mongo id of category to be updated
 * @param {Object} categoryDetails category updating details
 */
function updateCategory(id, categoryId, categoryDetails) {

    return service.updateCategory(id, categoryId, categoryDetails).then(data => data)
}

/**
 * Delete or Resurrect Category
 * @param {String} id mongo id of admin
 * @param {String} categoryId mongo id of category to be deleted or resurrected
 */
function deleteCategory(id, categoryId) {

    return service.deleteCategory(id, categoryId).then(data => data)
}

/**
 * Create template
 * @param {string} id mongo id of admin who is creating template
 * @param {object} templateDetails email template details to be added
 */
function createTemplate(id, templateDetails) {

    return service.createTemplate(id, templateDetails).then(data => data)
}

/**
 * Get all templates
 * @param {string} id mongo id of admin to fetch templates
 * @param {Object} queryParams query params for sorting, paginations
 */
function getAllTemplates(id, queryParams) {

    return service.getAllTemplates(id, queryParams).then(data => data)
}

/**
 * Get template details
 * @param {string} id mongo id of admin
 * @param {string} templateId mongo id of template to fetch details
 */
function getTemplateDetails(id, templateId) {

    return service.getTemplateDetails(id, templateId).then(data => data)
}

/**
 * Update template
 * @param {String} id mongo id of admin
 * @param {String} templateId mongo id of template to be updated
 * @param {object} templateDetails template updating details
 */
function updateTemplate(id, templateId, templateDetails) {

    return service.updateTemplate(id, templateId, templateDetails).then(data => data)
}

/**
 * Delete or Resurrect template
 * @param {String} id mongo id of admin
 * @param {String} templateId mongo id of template to deleted or resurrected
 */
function deleteTemplate(id, templateId) {

    return service.deleteTemplate(id, templateId).then(data => data)
}

/**
 * Get all template entities
 * @param {String} id mongo id of admin
 */
function getAllTemplateEntities(id) {

    return service.getAllTemplateEntities(id).then(data => data)
}

/**
 * Get all users
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query params for sorting, paginations
 */
function getAllUsers(id, queryParams) {

    return service.getAllUsers(id, queryParams).then(data => data)
}

/**
 * Get user details
 * @param {String} id mongo id of admin
 * @param {String} userId mongo id of user to fetch details
 */
function getUserDetails(id, userId) {

    return service.getUserDetails(id, userId).then(data => data)
}

/**
 * Add User
 * @param {String} id mongo id of admin
 * @param {Object} userDetails details of user to be added
 */
function addUser(id, userDetails) {

    return service.addUser(id, userDetails).then(data => data)
}

/**
 * Update user
 * @param {String} id mongo id of admin
 * @param {String} userId mongo id user to be updated
 * @param {Object} userDetails user details to be updated
 */
function updateUser(id, userId, userDetails) {

    return service.updateUser(id, userId, userDetails).then(data => data)
}

/**
 * Delete or Resurrect user
 * @param {String} id mongo id of admin
 * @param {String} userId mongo id of user to be deleted or resurrected
 */
function deleteUser(id, userId) {

    return service.deleteUser(id, userId).then(data => data)
}

/**
 * Get dashboard counts
 * @param {String} id mongo id of admin
 * @param {Number} year year of which users, landlords and bookings counts to be fetched monthly
 */
function getCounts(id, year) {

    return service.getCounts(id, year).then(data => data)
}

/**
 * Create amenities
 * @param {String} id mongo id of admin
 * @param {Object} details amenities details to be created
 */
function createAmenities(id, details) {

    return service.createAmenities(id, details).then(data => data)
}

/**
 * Get all amenities
 * @param {String} id mongo id of admin
 */
function getAllAmenities(id) {

    return service.getAllAmenities(id).then(data => data)
}

/**
 * Add amenities
 * @param {String} id mongo id of admin
 * @param {String} amenitiesId mongo id of main amenties category in which more amenites to be added
 * @param {Array} amenities 
 */
function addAmenities(id, amenitiesId, amenities) {

    return service.addAmenities(id, amenitiesId, amenities).then(data => data)
}

/**
 * Update amenities
 * @param {String} id mongo id of admin
 * @param {String} amenitiesId mongo id of amenities to be updated
 * @param {Object} details amenities details to be updated
 */
function updateAmenities(id, amenitiesId, details) {

    return service.updateAmenities(id, amenitiesId, details).then(data => data)
}

/**
 * Delete or resurrect amenities
 * @param {String} id mongo id of admin
 * @param {String} amenitiesId mongo id of amenities to be deleted or resurrected
 */
function deleteMainAmenities(id, amenitiesId) {

    return service.deleteMainAmenities(id, amenitiesId).then(data => data)
}

/**
 * Remove amenities
 * @param {String} id mongo id of admin
 * @param {String} categoryId mongo id of main amenities category
 * @param {*} amenitiesId mongo id of amenities to be removed from list
 */
function removeAmenities(id, categoryId, amenitiesId) {

    return service.removeAmenities(id, categoryId, amenitiesId).then(data => data)
}

/**
 * Get all pending landlord requests
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query params for sorting, paginations
 */
function getPendingLandlordRequests(id, queryParams) {

    return service.getPendingLandlordRequests(id, queryParams).then(data => data)
}

/**
 * Get all landlords
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query params for sorting and pagination on landlords
 */
function getAllLandlords(id, queryParams) {

    return service.getAllLandlords(id, queryParams).then(data => data)
}

/**
 * Get verification pending accomodations
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query params for sorting and pagination on landlords
 */
function getPendingAccomodations(id, queryParams) {

    return service.getPendingAccomodations(id, queryParams).then(data => data)
}

/**
 * Get accomodation details
 * @param {String} id mongo id of admin
 * @param {String} accomodationId mongo id of accomodation
 */
function getAccomodationDetails(id, accomodationId) {

    return service.getAccomodationDetails(id, accomodationId).then(data => data)
}

/**
 * Update accomodation verification request
 * @param {String} id mongo id of admin
 * @param {String} accomodationId mongo id of accomodation
 * @param {Object} details reason to be send if verification is rejected
 */
function updateAccomodationVerification(id, accomodationId, details) {

    return service.updateAccomodationVerification(id, accomodationId, details).then(data => data)
}

/**
 * Get all accomodations
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query params for sorting and pagination on landlords
 */
function getAllAccomodations(id, queryParams) {

    return service.getAllAccomodations(id, queryParams).then(data => data)
}

/**
 * Update accomodation
 * @param {String} id mongo id of admin
 * @param {String} accomodationId mongo id of accomodation to be updated
 * @param {Object} details accomodation details to be updated
 */
function updateAccomodation(id, accomodationId, details) {

    return service.updateAccomodation(id, accomodationId, details).then(data => data)
}

/**
 * Delete or Resurrect accomodation
 * @param {String} id mongo id of admin
 * @param {String} accomodationId mongo id of accomodation to be deleted or resurrected
 */
function deleteAccomodation(id, accomodationId) {

    return service.deleteAccomodation(id, accomodationId).then(data => data)
}

/**
 * Get hosted accomodations
 * @param {String} id mongo id of admin
 * @param {String} landlordId mongo id of landlord whose hosted accomodations to be fetched
 * @param {Object} queryParams query params for sorting and pagination on landlords
 */
function getHostedAccomodations(id, landlordId, queryParams) {

    return service.getHostedAccomodations(id, landlordId, queryParams).then(data => data)
}

/**
 * Get all Open or pending queries
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query params for sorting and pagination on landlords
 */
function getAllQueries(id, queryParams) {

    return service.getAllQueries(id, queryParams).then(data => data)
}

/**
 * Get query details
 * @param {String} id mongo id of admin
 * @param {String} queryId mongo id of contact us query to fetch details
 */
function getQueryDetails(id, queryId) {

    return service.getQueryDetails(id, queryId).then(data => data)
}

/**
 * Query reply
 * @param {String} id mongo id of admin
 * @param {String} queryId mongo id of support query
 * @param {String} reply replied message given by admin
 */
function queryReply(id, queryId, reply) {

    return service.queryReply(id, queryId, reply).then(data => data)
}

/**
 * Update support query status
 * @param {String} id mongo id of admin
 * @param {String} queryId mongo id of support query
 * @param {String} status support query status to be updated
 */
function updateQueryStatus(id, queryId, status) {

    return service.updateQueryStatus(id, queryId, status).then(data => data)
}

/**
 * Set service fee
 * @param {String} id mongo id of admin
 * @param {String} serviceFee service fee 
 */
function setServiceFee(id, serviceFee) {

    return service.setServiceFee(id, serviceFee).then(data => data)
}

/**
 * Get service fee
 * @param {String} id mongo id of admin
 */
function getServiceFee(id) {

    return service.getServiceFee(id).then(data => data)
}

/**
 * Get notifications received by admin
 * @param {String} id mongo id of admin
 */
function getAdminNotifications(id, skip, limit) {

    return service.getAdminNotifications(id, skip, limit).then(data => data)
}

/**
 * Get notifications counts of unread received by admin
 * @param {String} id mongo id of admin
 */
function getAdminNotificationsCount(id) {

    return service.getAdminNotificationsCount(id).then(data => data)
}

/**
 * Update notification status
 * @param {String} id mongo id of admin
 * @param {Object} details notification records id whose status to be updated
 */
function updateNotificationStatus(id, details) {

    return service.updateNotificationStatus(id, details).then(data => data)
}

/**
 * Get all bookings
 * @param {String} id mongo id of admin
 * @param {Object} queryParams filters to fetch bookings
 */
function getAllBookings(id, queryParams) {

    return service.getAllBookings(id, queryParams).then(data => data)
}

/**
 * Get booking details
 * @param {String} id mongo id of admin
 * @param {String} bookingId mongo id of booking to fetch details
 */
function getBookingDetails(id, bookingId) {

    return service.getBookingDetails(id, bookingId).then(data => data)
}

/**
 * Get all booking by user
 * @param {String} id mongo id of admin
 * @param {String} userId mongo id of user
 */
function getAllUserBookings(id, userId, skip, limit) {

    return service.getAllUserBookings(id, userId, skip, limit).then(data => data)
}

/**
 * Get all reviews posted on property
 * @param {String} id mongo id of admin
 * @param {String} propertyId mongo id of property to fetch review-ratings received
 */
function getAllReviews(id, propertyId, skip, limit) {

    return service.getAllReviews(id, propertyId, skip, limit).then(data => data)
}

/**
 * Get all payments received by user
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query parameters for filters, sorting and pagination
 */
function getAllPaymentsReceived(id, queryParams) {

    return service.getAllPaymentsReceived(id, queryParams).then(data => data)
}

/**
 * Get all payouts of landlord
 * @param {String} id mongo id of admin
 * @param {String} landlordId mongo id of landlord to fetch pending payments to be released
 */
function getAllPayOuts(id, landlordId) {

    return service.getAllPayOuts(id, landlordId).then(data => data)
}

/**
 * Get list of user name with id
 * @param {String} id mongo id of admin
 */
function getAllUserList(id) {

    return service.getAllUserList(id).then(data => data)
}

/**
 * Get list of landlord name with id
 * @param {String} id mongo id of admin
 */
function getAllLandlordList(id) {

    return service.getAllLandlordList(id).then(data => data)
}

/**
 * Release payments of landlords
 * @param {String} id mongo id of admin
 * @param {String} landlordId mongo id of landlord
 * @param {Object} details payment details to be paid to landlord
 */
function releasePayment(id, landlordId, details) {

    return service.releasePayment(id, landlordId, details).then(data => data)
}

/**
 * Refund payment
 * @param {String} id mongo id of admin
 * @param {String} userId mongo id of user to refund payment
 * @param {String} bookingId mongo id of booking of refunding payment
 * @param {Number} amount amount to be refunded as per cancellation policy
 */
function refundPayment(id, userId, bookingId, amount) {

    return service.refundPayment(id, userId, bookingId, amount).then(data => data)
}

/**
 * Get reports
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query params to fetch reports
 */
function getReports(id, queryParams) {

    return service.getReports(id, queryParams).then(data => data)
}

/**
 * Get download link for reports
 * @param {String} id mongo id of admin
 * @param {Object} queryParams query params to fetch reports
 */
function downloadReport(id, queryParams) {

    return service.downloadReport(id, queryParams).then(data => data)
}

/**
 * Get all landlord payable/paid list
 * @param {String} id mongo id of admin
 * @param {String} landlordId mongo id of landlord
 * @param {Object} queryParams query params to filter results
 */
function getAllLandlordPayments(id, landlordId, queryParams) {

    return service.getAllLandlordPayments(id, landlordId, queryParams).then(data => data)
}

/**
 * Add tax rate
 * @param {String} id mongo id of admin
 * @param {Object} details tax rate to be added country-state wise
 */
function addTax(id, details) {

    return service.addTax(id, details).then(data => data)
}

/**
 * Get all tax rates
 * @param {String} id mongo id of admin
 */
function getAllTaxes(id) {

    return service.getAllTaxes(id).then(data => data)
}

/**
 * Update tax rate
 * @param {String} id mongo id of admin
 * @param {String} taxId mongo id of tax rate
 * @param {Object} details tax rate details to be updated
 */
function updateTax(id, taxId, details) {

    return service.updateTax(id, taxId, details).then(data => data)
}

/**
 * Delete tax rate
 * @param {String} id mongo id of admin
 * @param {String} taxId mongo id of tax
 */
function deleteTax(id, taxId) {

    return service.deleteTax(id, taxId).then(data => data)
}

/**
 * Create invitation link
 * @param {String} id mongo id of admin
 * @param {Object} details invitation link details to be created
 */
function createLink(id, details) {

    return service.createLink(id, details).then(data => data)
}

/**
 * Get all invitation links
 * @param {String} id mongo id of admin
 */
function getAllLinks(id) {

    return service.getAllLinks(id).then(data => data)
}

/**
 * Update invitation link
 * @param {String} id mongo id of admin
 * @param {String} linkId mongo id of invitation link to be updtaed
 * @param {String} URL URL to be updated
 */
function updateLink(id, linkId, URL) {

    return service.updateLink(id, linkId, URL).then(data => data)
}

/**
 * Delet/Resurrect invitation link
 * @param {String} id mongo id of admin
 * @param {String} linkId mongo id of invitation link to be updtaed
 */
function deleteLink(id, linkId) {

    return service.deleteLink(id, linkId).then(data => data)
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