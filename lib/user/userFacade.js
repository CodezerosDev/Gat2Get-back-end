const userService = require('./userService');

// User Registration Step-1 --- Kuldip
function registrationStep1(req) {
    return userService.registrationStep1(req).then((result) => result)
}

// User Registration Step-2 --- Kuldip
function registrationStep2(req) {
    return userService.registrationStep2(req).then((result) => result)
}

// User Registration Step-3 --- Kuldip
function registrationStep3(req) {
    return userService.registrationStep3(req).then((result) => result)
}

// User Login --- Kuldip
function login(req) {
    return userService.login(req).then((result) => result)
}

// User Logout --- Kuldip
function logout(req) {
    return userService.logout(req).then((result) => result)
}

// User Forgot Password Step-1 --- Kuldip
function forgotPasswordStep1(req) {
    return userService.forgotPasswordStep1(req).then((result) => result)
}

// User Forgot Password Step-2 --- Kuldip
function forgotPasswordStep2(req) {
    return userService.forgotPasswordStep2(req).then((result) => result)
}

// User Forgot Password Step-3 --- Kuldip
function forgotPasswordStep3(req) {
    return userService.forgotPasswordStep3(req).then((result) => result)
}

// User Reset Password --- Kuldip
function resetPassword(req) {
    return userService.resetPassword(req).then((result) => result)
}

// User Profile Manage --- Kuldip
function profileManage(req) {
    return userService.profileManage(req).then((result) => result)
}

// User Get Profile --- Kuldip
function getProfile(req) {
    return userService.getProfile(req).then((result) => result)
}

// User Add Card Details --- Kuldip
function addCardDetails(req) {
    return userService.addCardDetails(req).then((result) => result)
}

// User Edit Card Details --- Kuldip
function editCardDetails(req) {
    return userService.editCardDetails(req).then((result) => result)
}

// User Get Card Details --- Kuldip
function getCardDetails(req) {
    return userService.getCardDetails(req).then((result) => result)
}

// User Remove Card Details --- Kuldip
function removeCardDetails(req) {
    return userService.removeCardDetails(req).then((result) => result)
}

// User Get CMS Page --- Kuldip
function getCMSPage(req) {
    return userService.getCMSPage(req).then((result) => result)
}

// User Add Document --- Kuldip
function addDocument(req) {
    return userService.addDocument(req).then((result) => result)
}

// User Edit Document --- Kuldip
function editDocument(req) {
    return userService.editDocument(req).then((result) => result)
}

// User Remove Document --- Kuldip
function removeDocument(req) {
    return userService.removeDocument(req).then((result) => result)
}

// Add Favorite --- Kuldip
function addFavorite(req) {
    return userService.addFavorite(req).then((result) => result)
}

// Remove Favorite --- Kuldip
function removeFavorite(req) {
    return userService.removeFavorite(req).then((result) => result)
}

// Get Favorite List --- Kuldip
function getFavoriteList(req) {
    return userService.getFavoriteList(req).then((result) => result)
}

// Get My Reviews --- Kuldip
function getMyReviews(req) {
    return userService.getMyReviews(req).then((result) => result)
}

// Get Landlord Reviews --- Kuldip
function getLandlordReviews(req) {
    return userService.getLandlordReviews(req).then((result) => result)
}

// Contact Us --- Kuldip
function contactUs(req) {
    return userService.contactUs(req).then((result) => result)
}

// Verify Token --- Kuldip
function verifyUsrToken(req) {
    return userService.verifyUsrToken(req).then((result) => result)
}

// SignUp and SignIn Via Facebook and Google --- Kuldip
function socialLogin(req) {
    return userService.socialLogin(req).then((result) => result)
}

// Invite Friends --- Kuldip
function inviteFriends(req) {
    return userService.inviteFriends(req).then((result) => result)
}

// My Bookings --- Kuldip
function myBookings(req) {
    return userService.myBookings(req).then((result) => result)
}

// get Primary Card --- Kuldip
function getPrimaryCard(req) {
    return userService.getPrimaryCard(req).then((result) => result)
}

/**
 * Get user notifications
 * @param {String} userId mongo id of user to fetch notifications received
 * @param {Number} page page number of which records to be sent
 */
function getUserNotifications(userId, page) {

    return userService.getUserNotifications(userId, page).then(result => result)
}

/**
 * Get user unread notifications count
 * @param {String} userId mongo id of user to fetch notifications received
 */
function getUserNotificationCount(userId) {

    return userService.getUserNotificationCount(userId).then(result => result)
}

/**
 * Update notification status
 * @param {String} userId mongo id of user
 * @param {Array} notificationIds mongo ids of notifications to be marked read
 */
function updateNotificationStatus(userId, notificationIds) {

    return userService.updateNotificationStatus(userId, notificationIds).then(result => result)
}

// Get User Chat List --- Kuldip
function getChatList(req) {
    return userService.getChatList(req).then((result) => result)
}

// Get Chats --- Kuldip
function getChats(req) {
    return userService.getChats(req).then((result) => result)
}

// Delete Chats --- Kuldip
function deleteChats(req) {
    return userService.deleteChats(req).then((result) => result)
}

/**
 * Update bank details
 * @param {String} userId mongo id of user
 * @param {Object} details bank details for creating custom account
 */
function updateBankDetails(userId, details) {
    return userService.updateBankDetails(userId, details).then(result => result)
}

/**
 * Update device token
 * @param {String} userId mongo id of user
 * @param {String} fcmToken 
 */
function updateFCMToken(userId, fcmToken) {

    return userService.updateFCMToken(userId, fcmToken).then(result => result)
}

/**
 * Check user is logged in using same device or not
 * @param {String} userId mongo id of user
 * @param {String} deviceId devide id to check user logged in details
 */
function checkUserLogin(userId, deviceId) {

    return userService.checkUserLogin(userId, deviceId).then(result => result)
}

/**
 * Get bank details
 * @param {String} userId mongo id of user
 */
function getBankDetails(userId) {

    return userService.getBankDetails(userId).then(result => result)
}

/**
 * Get all active languages
 */
function getAllLanguages() {

    return userService.getAllLanguages().then(result => result)
}

function getStateCodes(userId, country) {

    return userService.getStateCodes(userId, country).then(result => result)
}

function getInvitationLinks() {

    return userService.getInvitationLinks().then(result => result)
}

function getAppleUserDetails(appleId) {

    return userService.getAppleUserDetails(appleId).then(result => result)
}

function setAppleUserDetails(details) {

    return userService.setAppleUserDetails(details).then(result => result)
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
    removeCardDetails,
    editCardDetails,
    getCardDetails,
    addCardDetails,
    getCMSPage,
    removeDocument,
    addFavorite,
    removeFavorite,
    getFavoriteList,
    getMyReviews,
    contactUs,
    verifyUsrToken,
    socialLogin,
    inviteFriends,
    myBookings,
    addDocument,
    editDocument,
    getLandlordReviews,
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