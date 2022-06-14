/**
 * @author Kavya Patel
 */

/*#################################            Load modules start            ########################################### */

const mongoose = require('mongoose')
let BaseDao = require('../dao/BaseDao')
const constants = require('../constants');
const User = require('../generic/models/userModel');
const usrDao = new BaseDao(User);
const Template = require('../generic/models/templateModel')
const tmpDao = new BaseDao(Template)
const CMS = require('../generic/models/cmsModel')
const cmsDao = new BaseDao(CMS)
const Language = require('../generic/models/languageModel')
const lanDao = new BaseDao(Language)
const Category = require('../generic/models/categoryModel')
const catDao = new BaseDao(Category)
const Amenities = require('../generic/models/amenitiesModel')
const amenitiesDao = new BaseDao(Amenities)
const Accomodations = require('../generic/models/accomodationModel')
const accDao = new BaseDao(Accomodations)
const ContactUs = require('../generic/models/contactUsModel')
const contDao = new BaseDao(ContactUs)
const Notification = require('../generic/models/notificationModel')
const notifyDao = new BaseDao(Notification)
const Booking = require('../generic/models/bookingModel')
const bookingDao = new BaseDao(Booking)
const Review = require('../generic/models/reviewModel');
const reviewDao = new BaseDao(Review)
const Analytics = require('../generic/models/analyticsModel');
const analyticsDao = new BaseDao(Analytics)
const Tax = require('../generic/models/taxModel')
const taxDao = new BaseDao(Tax)
const InvitationLink = require('../generic/models/invitationLinkModel')
const linkDao = new BaseDao(InvitationLink)

/*#################################            Load modules end            ########################################### */

/**
 * Get admin details
 * @param {object} query  query elements to find admin record
 */
function getAdminDetails(query) {

    return usrDao.findOne(query)
}

/**
 * Update profile
 * @param {object} query query elements to find admin record
 * @param {object} updateObj profile updating details
 */
function updateProfile(query, updateObj) {

    let update = {}
    update['$set'] = updateObj

    let options = {
        new: true
    }

    return usrDao.findOneAndUpdate(query, update, options)
}

/**
 * Get template details
 * @param {Object} query query elements to find template
 */
function getTemplateDetails(query) {

    return tmpDao.findOne(query)
}

/**
 * Create CMS
 * @param {Object} obj creating CMS page details
 */
function createCMS(obj) {

    let cmsObj = new CMS(obj)
    return cmsDao.save(cmsObj)
}

/**
 * Get CMS page details
 * @param {Object} query query elements to find CMS page
 */
function getCMSDetails(query) {

    return cmsDao.findOne(query)
}

/**
 * Get all CMS Pages
 */
function getAllCMS() {

    return cmsDao.find()
}

/**
 * Update CMS page
 * @param {Object} query query elements to find CMS page and update
 * @param {Object} updateObj CMS page updating details
 */
function updateCMS(query, updateObj) {

    let update = {}
    update['$set'] = updateObj

    let options = {
        new: true
    }
    return cmsDao.findByIdAndUpdate(query, update, options)
}

/**
 * Get language details
 * @param {Object} query query elements to find language details
 */
function getLanguageDetails(query) {

    return lanDao.findOne(query)
}

/**
 * Add language
 * @param {Object} obj language details to be added
 */
function addLanguage(obj) {

    let lanObj = new Language(obj)
    return lanDao.save(lanObj)
}

/**
 * Get all languages
 */
function getAllLanguages() {

    return lanDao.find()
}

/**
 * Update language
 * @param {Object} query language finding query
 * @param {Object} updateObj language updating details
 */
function updateLanguage(query, updateObj) {

    let update = {}
    update['$set'] = updateObj

    let options = {
        new: true
    }

    return lanDao.findOneAndUpdate(query, update, options)
}

/**
 * Get category details
 * @param {Object} query category details finding query
 */
function getCategoryDetails(query) {

    return catDao.findOne(query)
}

/**
 * Create category
 * @param {Object} obj category creating details
 */
function createCategory(obj) {

    let catObj = new Category(obj)
    return catDao.save(catObj)
}

/**
 * Get all categories
 * @param {Object} query categories finding query
 */
function getAllCategories(query) {

    return catDao.find(query)
}

/**
 * Update category
 * @param {Object} query query elements to find category
 * @param {Object} updateObj category updating details
 */
function updateCategory(query, updateObj) {

    let update = {}
    update['$set'] = updateObj

    let options = {
        new: true
    }
    return catDao.findOneAndUpdate(query, update, options)
}

/**
 * Create template
 * @param {object} obj template creating details
 */
function createTemplate(obj) {

    let tempObj = new Template(obj)
    return tmpDao.save(tempObj)
}

/**
 * Get all templates
 * @param {Object} query aggregation pipeline query
 */
function getAllTemplates(query) {

    return tmpDao.aggregate(query)
}

/**
 * Update template
 * @param {Object} query template finding query elements
 * @param {Object} updateObj template updating details
 */
function updateTemplate(query, updateObj) {

    let update = {}
    update['$set'] = updateObj
    let options = {
        new: true
    }

    return tmpDao.findByIdAndUpdate(query, update, options)
}


/**
 * Get all users
 * @param {Object} query mongo query to find all users
 */
function getAllUsers(query) {

    return usrDao.aggregate(query)
}

/**
 * Add user
 * @param {Object} obj user details to be added
 */
function addUser(obj) {

    let userObj = new User(obj)
    return usrDao.save(userObj)
}

/**
 * Get counts
 * @param {Object} query query to count records
 */
function getCounts(query) {

    return usrDao.count(query)
}

/**
 * Get amenities details
 * @param {Object} query query to find amenities
 */
function getAmenitiesDetails(query) {

    return amenitiesDao.findOne(query)
}

/**
 * Create amenities
 * @param {Object} obj amenities to be created
 */
function createAmenities(obj) {

    let amenitiesObj = new Amenities(obj)
    return amenitiesDao.save(amenitiesObj)
}

/**
 * Get all amenities
 */
function getAllAmenities() {

    return amenitiesDao.find()
}

/**
 * Update amenities
 * @param {Object} query query to find amenities for updating
 * @param {Object} updateObj amenities details to be updated
 */
function updateAmenities(query, updateObj) {

    let update = {}
    update['$set'] = updateObj

    let options = {
        new: true
    }
    return amenitiesDao.findOneAndUpdate(query, update, options)
}

/**
 * Add amenities
 * @param {Object} query query to find the amenities category to add amenities in list
 * @param {Object} update amenities details to be added
 */
function addRemoveAmenities(query, update) {

    let options = {
        new: true
    }
    return amenitiesDao.findOneAndUpdate(query, update, options)
}


/**
 * Get accomodation list as per query
 * @param {Object} query query to get accomodations
 * @param {Object} sortQuery query prams to sort accomodations
 * @param {Number} skip records to be skipped
 * @param {Number} limit records to be limit
 */
async function getAllAccomodations(query, sortQuery, skip, limit) {

    let aggPipe = [{
        '$match': query
    },
    {
        '$lookup': {
            'foreignField': '_id',
            'localField': 'landlord',
            'from': 'users',
            'as': 'landlordDetails'
        }
    },
    {
        '$lookup': {
            'foreignField': '_id',
            'localField': 'categoryId',
            'from': 'categories',
            'as': 'categoryDetails'
        }
    },
    {
        $unwind: {
            path: '$landlordDetails',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $unwind: {
            path: '$categoryDetails',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: 'amenities',
            localField: "amenities.amtId",
            foreignField: '_id',
            as: 'amtData'
        }
    },
    {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewDetails'
        }
    },
    {
        $sort: sortQuery
    },
    {
        $skip: parseInt(skip)
    },
    {
        $limit: parseInt(limit)
    },
    {
        '$project': {
            '_id': 1,
            'spaceAvailability': 1,
            'address': 1,
            'media': 1,
            'status': 1,
            'isVerified': 1,
            'type': 1,
            'name': 1,
            'price': 1,
            'quantity': 1,
            'createdAt': 1,
            'spaceReadyIn': 1,
            'generalRules': 1,
            'cancellationPolicy': 1,
            'categoryDetails._id': 1,
            'categoryDetails.name': 1,
            'description': 1,
            'landlordDetails._id': 1,
            'landlordDetails.firstName': 1,
            'landlordDetails.lastName': 1,
            'landlordDetails.emailId': 1,
            'totalRatings': { $ifNull: [{ $avg: "$reviewDetails.ratings" }, 0] },
            amenities: {
                $map: {
                    input: "$amenities",
                    as: "item",
                    in: {
                        name: {
                            $arrayElemAt: ["$amtData.title", { $indexOfArray: ["$amtData._id", "$$item.amtId"] }]
                        },
                        amtId: "$$item.amtId",
                        uniqueId: "$$item.uniqueId",
                        amt: "$$item.amt",
                    }
                }
            }
        }
    }]
    let accomodationDetails = await accDao.aggregate(aggPipe)

    return accomodationDetails
}

/**
 * Get accomodation details
 * @param {Object} query query to get accomodation details
 */
async function getAccomodationDetails(query) {

    let aggPipe = [{
        '$match': query
    },
    {
        '$lookup': {
            'foreignField': '_id',
            'localField': 'landlord',
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
        '$lookup': {
            'foreignField': '_id',
            'localField': 'categoryId',
            'from': 'categories',
            'as': 'categoryDetails'
        }
    },
    {
        $unwind: {
            path: '$categoryDetails',
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: 'amenities',
            localField: "amenities.amtId",
            foreignField: '_id',
            as: 'amtData'
        }
    },
    {
        '$project': {
            '_id': 1,
            'spaceAvailability': 1,
            'address': 1,
            'media': 1,
            'status': 1,
            'isVerified': 1,
            'type': 1,
            'name': 1,
            'price': 1,
            'quantity': 1,
            'createdAt': 1,
            'spaceReadyIn': 1,
            'generalRules': 1,
            'cancellationPolicy': 1,
            'categoryDetails._id': 1,
            'categoryDetails.name': 1,
            'description': 1,
            'landlordDetails._id': 1,
            'landlordDetails.firstName': 1,
            'landlordDetails.lastName': 1,
            'landlordDetails.emailId': 1,
            amenities: {
                $map: {
                    input: "$amenities",
                    as: "item",
                    in: {
                        name: {
                            $arrayElemAt: ["$amtData.title", { $indexOfArray: ["$amtData._id", "$$item.amtId"] }]
                        },
                        amtId: "$$item.amtId",
                        uniqueId: "$$item.uniqueId",
                        amt: "$$item.amt",
                    }
                }
            }
        }
    },
    ]
    let accomodationDetails = await accDao.aggregate(aggPipe)

    return accomodationDetails
}

/**
 * Update accomodation
 * @param {Object} query query to find accomodation
 * @param {Object} updateObj accomodation updating details
 */
function updateAccomodation(query, updateObj) {

    let update = {}
    update['$set'] = updateObj

    let options = {
        new: true
    }

    return accDao.findOneAndUpdate(query, update, options)
}

/**
 * Get all support queries
 * @param {Object} query mongo query to fetch support queries
 */
function getAllQueries(query) {

    return contDao.aggregate(query)
}

/**
 * Get support query details
 * @param {Object} query query to find support query details
 */
function getQueryDetails(query) {

    return contDao.findOne(query)
}

/**
 * Update support query
 * @param {Object} query query to find support query
 * @param {Object} updateObj details to update support query
 */
function updateSupportQuery(query, updateObj) {

    let update = {}
    update['$set'] = updateObj

    let options = {
        new: true
    }

    return contDao.findOneAndUpdate(query, update, options)
}

/**
 * Get accomodation counts
 * @param {Object} query query params for getting counts
 */
function getAccomodationCounts(query) {

    return accDao.count(query)
}

/**
 * Get support query counts
 * @param {Object} query query params for getting counts of support query
 */
function getQueryCounts(query) {

    return contDao.count(query)
}

/**
 * Get email template counts
 * @param {Object} query query params for counting records
 */
function getTemplateCounts(query) {

    return tmpDao.count(query)
}

/**
 * Create notification record
 * @param {Object} notificationObj create notification
 */
function createNotification(notificationObj) {

    let obj = new Notification(notificationObj)
    return notifyDao.save(obj)
}

/**
 * Get admin notifications
 * @param {Object} query query to fetch notifications received
 */
function getAdminNotifications(query, skip, limit) {

    return notifyDao.findWithPagination(query, parseInt(skip), parseInt(limit))
}

/**
 * Update notification
 * @param {Object} query query to fetch notifications
 * @param {Object} updateObj update notifications details
 */
function updateNotifications(query, updateObj) {

    let update = {}
    update['$set'] = updateObj
    let options = {
        new: true,
        multi: true
    }
    return notifyDao.update(query, update, options)
}

/**
 * Get unread notification counts
 * @param {Object} query query to find unread notification counts
 */
function getNotificationCount(query) {

    return notifyDao.count(query)
}

/**
 * Get booking counts
 * @param {Object} query count bookings according to query
 */
function getBookingCounts(query) {

    return bookingDao.count(query)
}

/**
 * Get all bookings
 * @param {Object} query aggregation query to fetch booking list
 */
function getAllBookings(query) {

    return bookingDao.aggregate(query)
}

/**
 * Get all reviews posted on property
 * @param {Object} query query to find property reviews
 */
function getAllReviews(query, skip, limit) {

    return reviewDao.findWithPagination(query, parseInt(skip), parseInt(limit))
}

/**
 * Get booking details
 * @param {Object} query query to get booking details
 */
function getBookingDetails(query) {

    return bookingDao.findOne(query)
}

/**
 * Update booking details
 * @param {Object} query query to find booking details
 * @param {Object} updateObj details to be updated
 */
function updateBooking(query, updateObj) {

    let update = {}
    update['$set'] = updateObj
    let options = {
        new: true
    }

    return bookingDao.findOneAndUpdate(query, update, options)
}

/**
 * Update booking payment status
 * @param {Object} query query to find bookings
 * @param {Object} updateObj booking details to be updated
 */
function updatePaymentStatus(query, updateObj) {

    let update = {}
    update['$set'] = updateObj
    let options = {
        new: true,
        multi: true
    }

    return bookingDao.update(query, update, options)
}

/**
 * Get review counts
 * @param {Object} query query to count records
 */
function getReviewCounts(query) {

    return reviewDao.count(query)
}

/**
 * Get all analytics
 * @param {Object} query query to fetch all analytics
 */
function getAllAnalytics(query) {

    return analyticsDao.find(query)
}

/**
 * Get analytics
 * @param {Object} query query params to find analytics
 */
function getAnalytics(query) {

    return analyticsDao.findOne(query)
}

/**
 * Update analytics
 * @param {Object} query query params to find analytics
 * @param {Object} updateObj details to update analytics
 */
function updateAnalytics(query, updateObj) {

    let update = {}
    update['$set'] = updateObj

    let options = {
        new: true
    }
    return analyticsDao.findOneAndUpdate(query, update, options)
}

/**
 * Create analytics
 * @param {Object} obj analytics to be added
 */
function createAnalytics(obj) {

    let analyticObj = new Analytics(obj)
    return analyticsDao.save(analyticObj)
}

/**
 * Get tax details
 * @param {Object} query query to find tax details
 */
function getTaxDetails(query) {

    return taxDao.findOne(query)
}

/**
 * Add tax details
 * @param {Object} obj tax details to be added
 */
function addTax(obj) {

    let taxDetails = new Tax(obj)
    return taxDao.save(taxDetails)
}

/**
 * Get all tax rates
 */
function getAllTaxes() {

    return taxDao.find()
}

/**
 * Update tax rate
 * @param {Object} query mongo query to find tax details
 * @param {Object} updateObj rate to be updated
 */
function updateTax(query, updateObj) {

    let update = {}
    update['$set'] = updateObj
    let options = {
        new: true
    }

    return taxDao.findOneAndUpdate(query, update, options)
}

/**
 * Delete tax rate
 * @param {Object} query mongo query to delete tax
 */
function deleteTax(query) {

    return taxDao.findOneAndDelete(query)
}

/**
 * Get invitation link details
 * @param {Object} query mongo query to find invitation link details
 */
function getLinkDetails(query) {

    return linkDao.findOne(query)
}

/**
 * Create invitation link
 * @param {Object} linkObj details to be created
 */
function createLink(linkObj) {

    let linkDetails = new InvitationLink(linkObj)
    return linkDao.save(linkDetails)
}

/**
 * Get all invitation links
 * @param {Object} query mongo query to find all invitation links
 */
function getAllLinks(query) {

    return linkDao.find(query)
}

/**
 * Update link
 * @param {Object} query mongo query to find link details
 * @param {Object} updateObj details to be updated
 */
function updateLink(query, updateObj) {

    let update = {}
    update['$set'] = updateObj

    let options = {
        new: true
    }

    return linkDao.findOneAndUpdate(query, update, options)
}
module.exports = {

    getAdminDetails,

    updateProfile,

    getTemplateDetails,

    createCMS,

    getCMSDetails,

    getAllCMS,

    updateCMS,

    getLanguageDetails,

    addLanguage,

    getAllLanguages,

    updateLanguage,

    getCategoryDetails,

    createCategory,

    getAllCategories,

    updateCategory,

    createTemplate,

    getAllTemplates,

    updateTemplate,

    getAllUsers,

    addUser,

    getCounts,

    getAmenitiesDetails,

    createAmenities,

    getAllAmenities,

    updateAmenities,

    addRemoveAmenities,

    getAllAccomodations,

    getAccomodationDetails,

    updateAccomodation,

    getAllQueries,

    getQueryDetails,

    updateSupportQuery,

    getAccomodationCounts,

    getQueryCounts,

    getTemplateCounts,

    createNotification,

    getAdminNotifications,

    updateNotifications,

    getNotificationCount,

    getBookingCounts,

    getAllBookings,

    getAllReviews,

    getBookingDetails,

    updateBooking,

    updatePaymentStatus,

    getReviewCounts,

    getAllAnalytics,

    getAnalytics,

    updateAnalytics,

    createAnalytics,

    getTaxDetails,

    addTax,

    getAllTaxes,

    updateTax,

    deleteTax,

    getLinkDetails,

    createLink,

    getAllLinks,

    updateLink
}