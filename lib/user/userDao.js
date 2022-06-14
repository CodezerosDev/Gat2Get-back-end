'use strict'

let dao = require('../dao/BaseDao');

const userModel = require('../generic/models/userModel');
let userMasterDao = new dao(userModel);

const templateModel = require('../generic/models/templateModel');
let templateMasterDao = new dao(templateModel);

const cmsModel = require('../generic/models/cmsModel');
let cmsMasterDao = new dao(cmsModel);

const reviewModel = require('../generic/models/reviewModel');
let reviewMasterDao = new dao(reviewModel);

const contactUsModel = require('../generic/models/contactUsModel');
let contactUsMasterDao = new dao(contactUsModel);

const bookingModel = require('../generic/models/bookingModel');
let bookingMasterDao = new dao(bookingModel);

const accomodationModel = require('../generic/models/accomodationModel');
let amdMasterDao = new dao(accomodationModel);

const notificationModel = require('../generic/models/notificationModel')
let notifyDao = new dao(notificationModel)

const roomModel = require('../generic/models/roomModel')
let roomDao = new dao(roomModel)

const analyticsModel = require('../generic/models/analyticsModel');
let analyticsDao = new dao(analyticsModel)

const languageModel = require('../generic/models/languageModel')
let languageDao = new dao(languageModel)

const invitationLinkModel = require('../generic/models/invitationLinkModel')
const linkDao = new dao(invitationLinkModel)

const appleUserModel = require('../generic/models/appleUserModel')
const appleUserDao = new dao(appleUserModel)



function getTemplateDetails(query) {
    return templateMasterDao.findOne(query).then((result) => result)
}

function checkUserExist(query) {
    return userMasterDao.findOne(query).then((result) => result)
}

function getUserData(query, project) {
    return userMasterDao.findOne(query, project).then((result) => result)
}

function saveVerificationCode(data) {
    return userMasterDao.save(data).then((result) => result)
}

async function codeVerified(query, updateDetails) {
    let update = {}
    update['$set'] = updateDetails;
    let options = { new: true }
    return await userMasterDao.findOneAndUpdate(query, update, options);
}

async function forgotPasswordCodeVerified(query) {
    return await userMasterDao.findOne(query);
}

async function saveUserDetails(query, updateDetails) {
    let update = {}
    update['$set'] = updateDetails;
    let options = { new: true }
    return await userMasterDao.findOneAndUpdate(query, update, options);
}

async function setPassword(query, updateDetails) {
    let update = {}
    update['$set'] = updateDetails;
    let options = { new: true }
    return await userMasterDao.findOneAndUpdate(query, update, options);
}

function getCMSPage(query) {
    return cmsMasterDao.findOne(query).then((result) => result)
}

function getFavoriteList(query) {
    return userMasterDao.aggregate(query).then((result) => result)
}

function getMyReviews(query) {
    return reviewMasterDao.aggregate(query).then((result) => result)
}

function getLandlordReviews(query) {
    return amdMasterDao.aggregate(query).then((result) => result)
}

function addContactUs(data) {
    return contactUsMasterDao.save(data).then((result) => result)
}

function getMyBookings(query) {
    return bookingMasterDao.aggregate(query).then((result) => result)
}

function getMyBookingsCount(query) {
    return bookingMasterDao.count(query).then((result) => result)
}

function checkIfTicketNoExists(query) {
    return contactUsMasterDao.findOne(query)
}

function getUserNotifications(query, skip, limit) {

    return notifyDao.findWithPagination(query, parseInt(skip), parseInt(limit))
}

function updateNotifications(query, updateObj) {

    let update = {}
    update['$set'] = updateObj
    let options = {
        new: true,
        multi: true
    }
    return notifyDao.update(query, update, options)
}

function getNotificationCount(query) {

    return notifyDao.count(query)
}

function chatSave(data) {
    return roomDao.save(data).then((result) => result)
}

function checkRoom(query) {
    return roomDao.findOne(query)
}

async function chatUpdate(query, updateDetails) {
    let update = {}
    update['$set'] = updateDetails;
    let options = { new: true }
    return await roomDao.findOneAndUpdate(query, update, options);
}

function getChatList(query) {
    return roomDao.aggregate(query).then((result) => result)
}

function getChats(query) {
    return roomDao.aggregate(query).then((result) => result)
}

function deleteChats(query) {
    return roomDao.findByIdAndRemove(query).then((result) => result)
}

function addDeviceToken(query, update) {

    let options = {
        new: true
    }
    return userMasterDao.findOneAndUpdate(query, update, options)
}

function createNotification(obj) {

    return notifyDao.save(obj)
}

function getAnalytics(query) {

    return analyticsDao.findOne(query)
}

function updateAnalytics(query, updateObj) {

    let update = {}
    update['$set'] = updateObj

    let options = {
        new: true
    }
    return analyticsDao.findOneAndUpdate(query, update, options)
}

function createAnalytics(obj) {

    let analyticObj = new analyticsModel(obj)
    return analyticsDao.save(analyticObj)
}

function getAllProperties(query) {

    return amdMasterDao.find(query, '_id')
}

function getReviewCount(query) {

    return reviewMasterDao.count(query)
}

function getAllLanguages(query) {

    return languageDao.find(query)
}

function getAllLinks(query) {

    return linkDao.find(query)
}

function getAppleUserDetails(query) {

    return appleUserDao.findOne(query)
}

function setAppleUserDetails(obj) {

    let appleUserObj = new appleUserModel(obj)
    return appleUserDao.save(appleUserObj)
}
module.exports = {
    getTemplateDetails,
    checkUserExist,
    saveVerificationCode,
    codeVerified,
    forgotPasswordCodeVerified,
    saveUserDetails,
    setPassword,
    getCMSPage,
    getFavoriteList,
    getMyReviews,
    addContactUs,
    getUserData,
    getMyBookings,
    getMyBookingsCount,
    getLandlordReviews,
    checkIfTicketNoExists,
    getUserNotifications,
    updateNotifications,
    getNotificationCount,
    chatSave,
    checkRoom,
    chatUpdate,
    getChatList,
    getChats,
    deleteChats,
    addDeviceToken,
    createNotification,
    getAnalytics,
    updateAnalytics,
    createAnalytics,
    getAllProperties,
    getReviewCount,
    getAllLanguages,
    getAllLinks,
    getAppleUserDetails,
    setAppleUserDetails
}