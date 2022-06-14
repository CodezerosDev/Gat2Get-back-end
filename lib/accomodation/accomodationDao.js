'use strict'

let dao = require('../dao/BaseDao');

const accomodationModel = require('../generic/models/accomodationModel');
let accomodationMasterDao = new dao(accomodationModel);

const userModel = require('../generic/models/userModel');
let userMasterDao = new dao(userModel);

const reviewModel = require('../generic/models/reviewModel');
let reviewMasterDao = new dao(reviewModel);

const amenitiesModel = require('../generic/models/amenitiesModel');
let amenitiesMasterDao = new dao(amenitiesModel);

const categoryModel = require('../generic/models/categoryModel');
let categoryMasterDao = new dao(categoryModel);

const templateModel = require('../generic/models/templateModel');
let templateMasterDao = new dao(templateModel);

const bookingModel = require('../generic/models/bookingModel');
let bookingMasterDao = new dao(bookingModel);

const notificationModel = require('../generic/models/notificationModel')
let notificationDao = new dao(notificationModel)

const searchModel = require('../generic/models/searchModel');
let searchMasterDao = new dao(searchModel);

const analyticsModel = require('../generic/models/analyticsModel');
let analyticsDao = new dao(analyticsModel)

const roomModel = require('../generic/models/roomModel')
let roomDao = new dao(roomModel)

const TaxModel = require('../generic/models/taxModel')
const taxDao = new dao(TaxModel)

function addAccomodation(data) {
    return accomodationMasterDao.save(data).then((result) => result)
}

async function updateRole(query, updateDetails) {
    let update = {}
    update['$set'] = updateDetails;
    let options = { new: true }
    return await userMasterDao.findOneAndUpdate(query, update, options);
}

function checkUserExist(query) {
    return userMasterDao.findOne(query).then((result) => result)
}

function listAccomodation(query) {
    return accomodationMasterDao.aggregate(query).then((result) => result)
}

function totalAccomodation(query) {
    return accomodationMasterDao.count(query).then((result) => result)
}

function getAccomodation(query) {
    return accomodationMasterDao.aggregate(query).then((result) => result)
}

async function updateAccomodation(query, updateDetails) {
    let update = {}
    update['$set'] = updateDetails;
    let options = { new: true }
    return await accomodationMasterDao.findOneAndUpdate(query, update, options);
}

function addReview(data) {
    return reviewMasterDao.save(data).then((result) => result)
}

function getAmenities(query) {
    return amenitiesMasterDao.find(query).then((result) => result)
}

function getCategory(query) {
    return categoryMasterDao.find(query).then((result) => result)
}

function getReviews(query) {
    return reviewMasterDao.aggregate(query).then((result) => result)
}

function getTemplateDetails(query) {
    return templateMasterDao.findOne(query).then((result) => result)
}

function getTopRated(query) {
    return accomodationMasterDao.aggregate(query).then((result) => result)
}

function createBooking(data) {
    return bookingMasterDao.save(data).then((result) => result)
}

async function updateBookings(query, updateDetails) {
    let update = {}
    update['$set'] = updateDetails;
    let options = { new: true }
    return await bookingMasterDao.findOneAndUpdate(query, update, options);
}

function getAmd(query) {
    return accomodationMasterDao.findOne(query).then((result) => result)
}

function getListAmd(query) {
    return accomodationMasterDao.count(query).then((result) => result)
}

async function saveUserDetails(query, updateDetails) {
    let update = {}
    update['$set'] = updateDetails;
    let options = { new: true }
    return await userMasterDao.findOneAndUpdate(query, update, options);
}

function search(data) {
    return bookingMasterDao.find(data).then((result) => result)
}

function searchAggregate(data) {
    return bookingMasterDao.aggregate(data).then((result) => result)
}

function listProperty(query) {
    return accomodationMasterDao.find(query).then((result) => result)
}

function getReviewsList(query) {
    return reviewMasterDao.find(query).then((result) => result)
}

function createNotification(obj) {

    return notificationDao.save(obj)
}
function searchCount(query) {
    return searchMasterDao.findOne(query).then((result) => result)
}

async function updateSearchCount(query, updateDetails) {
    let update = {}
    update['$set'] = updateDetails;
    let options = { new: true }
    return await searchMasterDao.findOneAndUpdate(query, update, options);
}

function saveSearchCount(data) {
    return searchMasterDao.save(data).then((result) => result)
}


function mostSearchLocation() {
    return searchMasterDao.customFind({}, {}, 9, { searchCount: -1 }).then((result) => result)
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

function checkRoom(query) {
    return roomDao.findOne(query)
}

function getAccomodationDetails(query) {

    return accomodationMasterDao.findOne(query)
}

function unsetAccomodationVerification(query) {

    let update = {}
    update['$unset'] = {
        isVerified: 1
    }
    let options = {
        new: true
    }
    return accomodationMasterDao.findOneAndUpdate(query, update, options)
}

function getTaxDetails(query) {

    return taxDao.findOne(query)
}

function unlockDates(query, update) {

    let options = {
        new: true
    }
    return accomodationMasterDao.findOneAndUpdate(query, update, options)
}
module.exports = {
    addAccomodation,
    updateRole,
    checkUserExist,
    listAccomodation,
    totalAccomodation,
    getAccomodation,
    updateAccomodation,
    addReview,
    getAmenities,
    getCategory,
    getReviews,
    getTemplateDetails,
    getTopRated,
    createBooking,
    updateBookings,
    getAmd,
    getListAmd,
    saveUserDetails,
    search,
    searchAggregate,
    listProperty,
    getReviewsList,
    createNotification,
    searchCount,
    updateSearchCount,
    saveSearchCount,
    mostSearchLocation,
    getAnalytics,
    updateAnalytics,
    createAnalytics,
    checkRoom,
    getAccomodationDetails,
    unsetAccomodationVerification,
    getTaxDetails,
    unlockDates
}