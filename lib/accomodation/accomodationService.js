const amdDao = require('./accomodationDao');
const amdMapper = require('./accomodationMapper');
const amdConstants = require('./accomodationConstants');
let constants = require('../constants');
const mongoose = require('mongoose');
const mailHandler = require('../middleware/email');
const scrtKey = process.env.stripeSecretKey_test
const stripe = require('stripe')(scrtKey);
const sendPushNotification = require('../middleware/notification');
const ObjectId = mongoose.Types.ObjectId

// Add Accomodation --- Kuldip
function addAccomodation(req) {

    let saveData = {
        type: req.body.type,
        name: req.body.name,
        spaceAvailability: req.body.spaceAvailability,
        checkIn: req.body.checkIn,
        checkOut: req.body.checkOut,
        spaceReadyIn: req.body.spaceReadyIn,
        generalRules: req.body.generalRules,
        cancellationPolicy: req.body.cancellationPolicy,
        categoryId: req.body.categoryId,
        price: req.body.price,
        quantity: req.body.quantity,
        address: req.body.address,
        amenities: req.body.amenities,
        description: req.body.description,
        media: req.body.media,
        landlord: req.params.userId,
        createdAt: new Date().getTime(),
        createdBy: req.params.userId,
        editedAt: new Date().getTime(),
        editedBy: req.params.userId,
    }
    return amdDao.addAccomodation(saveData).then(async (response) => {
        if (response) {
            let query = {
                _id: req.params.userId
            }
            let update = {
                role: constants.ROLE.LANDLORD
            }
            let user = await amdDao.checkUserExist(query)

            if (user.role != constants.ROLE.LANDLORD) {
                update.roleChangedAt = new Date().getTime()

                let mailQuery = {
                    mailName: constants.EMAIL_TEMPLATES.LANDLORD_REGISTER,
                    status: constants.STATUS.ACTIVE
                }
                let templateDetail = await amdDao.getTemplateDetails(mailQuery);
                if (templateDetail) {
                    let userObj = {
                        firstName: user.firstName,
                        emailId: user.emailId
                    }
                    let mailSent = mailHandler.SEND_MAIL(userObj, templateDetail)
                }

            }

            let notificationQuery = {

                mailName: constants.EMAIL_TEMPLATES.NOTIFY_NEW_ACCOMODATION_REQUEST_BY_LANDLORD,
                status: constants.STATUS.ACTIVE
            }
            let notificationTemplateDetails = await amdDao.getTemplateDetails(notificationQuery)
            let notificationMessage = notificationTemplateDetails.notificationMessage

            Object.keys(notificationMessage).forEach((key, value) => {

                if (value > 0) {
                    let obj = {
                        name: response.name[key],
                        firstName: user.firstName,
                        lastName: user.lastName
                    }
                    notificationMessage[key] = mailHandler.convertNotificationMessage(obj, notificationMessage[key])
                }
            })

            let adminQuery = {
                role: constants.ROLE.ADMIN
            }
            let adminDetails = await amdDao.checkUserExist(adminQuery)

            if (notificationTemplateDetails) {

                let notificationObject = {
                    message: notificationMessage,
                    isRead: false,
                    receiverId: adminDetails._id,
                    createdAt: new Date().getTime(),
                    status: constants.STATUS.ACTIVE,
                    categoryType: constants.NOTIFICATION_CATEGORIES.ACCOMODATION,
                    refId: response._id
                }
                await amdDao.createNotification(notificationObject)
            }
            update.accomodations = user.accomodations + 1
            await amdDao.updateRole(query, update);
            if (user.role != constants.ROLE.LANDLORD) {

                let analyticsQuery = {
                    type: constants.ANALYTICS.LANDLORD,
                    year: new Date(update.roleChangedAt).getFullYear(),
                    month: new Date(update.roleChangedAt).getMonth() + 1
                }
                return amdDao.getAnalytics(analyticsQuery).then((analytics) => {

                    if (analytics) {

                        let qty = parseInt(analytics.qty)
                        qty += 1

                        let updateObj = {
                            qty: qty
                        }
                        return amdDao.updateAnalytics(analyticsQuery, updateObj).then((updated) => {

                            console.log({ updated })
                            return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.addedSuccess, response);
                            // return updated
                        }).catch((err) => {

                            console.log({ err })
                            return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
                        })
                    } else {

                        let newObj = {
                            type: constants.ANALYTICS.LANDLORD,
                            qty: 1,
                            year: new Date(update.roleChangedAt).getFullYear(),
                            month: new Date(update.roleChangedAt).getMonth() + 1
                        }
                        return amdDao.createAnalytics(newObj).then((created) => {

                            console.log({ created })
                            return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.addedSuccess, response);
                        }).catch((err) => {

                            console.log({ err })
                            return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
                        })

                    }
                }).catch((error) => {
                    console.log(error)
                    return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
                })

            } else {

                return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.addedSuccess, response);
            }
        }
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// List Accomodation --- Kuldip
async function listAccomodation(req) {
    let page = req.params.page;
    let skip = 0;
    if (page == 1) {
        skip = 0;
    } else {
        skip = (page - 1) * 12;
    }
    let option = {
        skip: skip,
        limit: 12
    };
    let query = {
        landlord: mongoose.Types.ObjectId(req.params.userId),
        status: constants.STATUS.ACTIVE
    }
    let amtQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'categories',
            localField: "categoryId",
            foreignField: '_id',
            as: 'categoryData'
        }
    }, {
        $project: {
            _id: "$_id",
            media: { $arrayElemAt: ["$media", 0] },
            totalImages: { $size: "$media" },
            type: "$type",
            name: "$name",
            categoryId: "$categoryId",
            categoryName: { $arrayElemAt: ["$categoryData.name", { $indexOfArray: ["$categoryData._id", "$categoryId"] }] },
            quantity: "$quantity",
            country: "$address.country",
            city: "$address.city",
            location: "$address.location",
            state: "$address.state",
            noOfAmenities: {
                $sum: {
                    $map: {
                        input: "$amenities.amt",
                        as: "item",
                        in: {
                            $size: "$$item"
                        }
                    }
                }
            },
            totalPrice: {
                $sum: "$price.rate"
            }
        },
    }, {
        $skip: option.skip
    }, {
        $limit: option.limit
    }]
    let totalRecord = await amdDao.totalAccomodation(query);
    let totalPage = await Math.ceil(totalRecord / option.limit);
    return amdDao.listAccomodation(amtQuery).then((response) => {
        let obj = {
            response: response,
            totalRecord: totalRecord,
            limit: option.limit,
            totalPage: totalPage
        }
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.getListSuccess, obj);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Get Accomodation --- Kuldip
function getAccomodation(req) {
    let query = {
        _id: mongoose.Types.ObjectId(req.params.propertyId),
        status: constants.STATUS.ACTIVE
    }
    let amdQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }, {
        $lookup: {
            from: 'amenities',
            localField: "amenities.amtId",
            foreignField: '_id',
            as: 'amtData'
        }
    }, {
        $lookup: {
            from: 'categories',
            localField: "categoryId",
            foreignField: '_id',
            as: 'categoryData'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }]
    let project = {
        $project: {
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            type: "$type",
            name: "$name",
            userId: "$userData._id",
            profilePicture: "$userData.profilePicture",
            joinDate: "$userData.createdAt",
            totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
            totalRatingsBy: { $size: "$reviewData" },
            checkIn: { $ifNull: ['$checkIn', ''] },
            checkOut: { $ifNull: ['$checkOut', ''] },
            spaceAvailability: "$spaceAvailability",
            spaceReadyIn: "$spaceReadyIn",
            amenities: {
                $map: {
                    input: "$amenities",
                    as: "item",
                    in: {
                        name: {
                            $arrayElemAt: ["$amtData.title", { $indexOfArray: ["$amtData._id", "$$item.amtId"] }]
                        },
                        amtId: "$$item.amtId",
                        amtName: "$$item.name",
                        amt: "$$item.amt",
                    }
                }
            },
            generalRules: "$generalRules",
            cancellationPolicy: "$cancellationPolicy",
            address: "$address",
            quantity: "$quantity",
            categoryId: "$categoryId",
            categoryName: { $arrayElemAt: ["$categoryData.name", { $indexOfArray: ["$categoryData._id", "$categoryId"] }] },
            price: "$price",
            description: "$description",
            media: "$media",
            totalPrice: {
                $sum: "$price.rate"
            },
            lockedDates: "$lockedDates"
        }
    }
    if (req.params.userId) {
        let lookup = {
            $lookup: {
                from: 'users',
                localField: "_id",
                foreignField: "favourites", //{ $in: ["_id","$favourites"] },
                as: 'userFavData'
            }
        }
        project['$project']['isFavorite'] = {
            $cond: {
                if: {
                    $gt: [{ $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.params.userId)] }, -1]
                },
                then: {
                    $in: ["$_id", { $arrayElemAt: ["$userFavData.favourites", { $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.params.userId)] }] }]
                },
                else: false
            }
        }
        amdQuery.push(lookup)
    }
    amdQuery.push(project)
    return amdDao.getAccomodation(amdQuery).then(async (response) => {
        // let adminQuery = {
        //     role: constants.ROLE.ADMIN
        // }
        // let admin = await amdDao.checkUserExist(adminQuery)
        if (response && response.length > 0) {

            let taxRate = 0
            let taxQuery = {
                country: response[0].address.country
            }

            let taxDetails = await amdDao.getTaxDetails(taxQuery)
            if (taxDetails) {

                if (taxDetails.type == constants.TAX_TYPES.COUNTRY) {

                    taxRate = taxDetails.rate
                } else {

                    let taxRates = taxDetails.stateTaxes
                    let stateTaxObj = taxRates.find(obj => obj.state == response[0].address.state)

                    if (stateTaxObj) {

                        taxRate = stateTaxObj.rate
                    }
                }
            }
            // let stateTaxQuery = {
            //     type: constants.TAX_TYPES.STATE,
            //     state: response[0].address.state
            // }

            // let stateTaxDetails = await amdDao.getTaxDetails(stateTaxQuery)

            // if (stateTaxDetails) {

            //     taxRate = stateTaxDetails.rate
            // } else {

            //     let countryTaxQuery = {
            //         type: constants.TAX_TYPES.COUNTRY,
            //         country: response[0].address.country
            //     }
            //     let countryTaxDetails = await amdDao.getTaxDetails(countryTaxQuery)
            //     taxRate = countryTaxDetails.rate
            // }

            let obj = {
                response: response,
                taxRate: taxRate,
                roomId: ""
            }
            if (req.params.userId) {

                let roomQuery = {
                    $and: [{
                        $or: [
                            { participateId1: req.params.userId },
                            { participateId2: req.params.userId }
                        ]
                    }, {
                        $or: [
                            { participateId1: response[0].userId },
                            { participateId2: response[0].userId }
                        ]
                    }]
                }
                return amdDao.checkRoom(roomQuery).then((roomExists) => {

                    if (roomExists) {
                        obj.roomId = roomExists._id
                    }
                    return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.getAmdSuccess, obj);

                }).catch((error) => {
                    console.log(error)
                    return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
                })
            } else {

                return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.getAmdSuccess, obj);
            }
        } else {

            return amdMapper.responseMapping(amdConstants.CODE.notFound, amdConstants.MESSAGE.accomodationNotFound);
        }
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Edit Accomodation --- Kuldip
function editAccomodation(req) {
    let query = {
        landlord: req.params.userId,
        _id: req.params.propertyId
    }

    return amdDao.getAccomodationDetails(query).then((accomodationDetails) => {

        if (accomodationDetails) {

            let update = {
                type: req.body.type,
                name: req.body.name,
                spaceAvailability: req.body.spaceAvailability,
                checkIn: req.body.checkIn,
                checkOut: req.body.checkOut,
                spaceReadyIn: req.body.spaceReadyIn,
                generalRules: req.body.generalRules,
                cancellationPolicy: req.body.cancellationPolicy,
                categoryId: req.body.categoryId,
                price: req.body.price,
                quantity: req.body.quantity,
                address: req.body.address,
                amenities: req.body.amenities,
                description: req.body.description,
                media: req.body.media,
                landlord: req.params.userId,
                editedAt: new Date().getTime(),
                editedBy: req.params.userId
            }
            return amdDao.updateAccomodation(query, update).then(async (response) => {

                if (response) {

                    let unsetAccomodationVerification = await amdDao.unsetAccomodationVerification(query)
                    return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.updateSuccess, unsetAccomodationVerification);
                } else {

                    return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr)
                }
            }).catch((error) => {
                console.log(error)
                return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
            })
        } else {

            return amdMapper.responseMapping(amdConstants.CODE.notFound, amdConstants.MESSAGE.accomodationNotFound);
        }
    }).catch((err) => {

        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Delete Accomodation --- Kuldip
function deleteAccomodation(req) {
    let query = {
        landlord: req.params.userId,
        _id: req.params.propertyId,
        status: constants.STATUS.ACTIVE
    }
    let update = {
        status: constants.STATUS.INACTIVE
    }
    return amdDao.updateAccomodation(query, update).then((response) => {
        return amdMapper.responseMapping(amdConstants.CODE.ok, amdConstants.MESSAGE.deleteSuccess);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Status Change Accomodation --- Kuldip
function statusChangeAccomodation(req) {
    let query = {
        landlord: req.params.userId,
        _id: req.params.propertyId
    }
    let update = {
        status: constants.STATUS.ACTIVE
    }
    return amdDao.updateAccomodation(query, update).then((response) => {
        return amdMapper.responseMapping(amdConstants.CODE.ok, amdConstants.MESSAGE.deleteSuccess);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Add Review --- Kuldip
function addReview(req) {
    let saveData = {
        ratings: req.body.ratings,
        ratingsBy: req.params.userId,
        review: req.body.review,
        propertyId: req.params.propertyId,
        createdAt: new Date().getTime(),
        createdBy: req.params.userId
    }
    return amdDao.addReview(saveData).then(async (response) => {

        let userQuery = {
            _id: req.params.userId
        }
        let propertyQuery = {
            _id: req.params.propertyId
        }
        let userDetails = await amdDao.checkUserExist(userQuery)
        let accomodationDetails = await amdDao.getAmd(propertyQuery)
        if (userDetails) {

            let notificationQuery = {

                mailName: constants.EMAIL_TEMPLATES.NOTIFY_REVIEW_RATINGS_BY_USER,
                status: constants.STATUS.ACTIVE
            }
            let notificationTemplateDetails = await amdDao.getTemplateDetails(notificationQuery)
            let notificationMessage = notificationTemplateDetails.notificationMessage

            Object.keys(notificationMessage).forEach((key, value) => {

                if (value > 0) {
                    let obj = {
                        name: accomodationDetails.name[key],
                        firstName: userDetails.firstName,
                        lastName: userDetails.lastName
                    }
                    notificationMessage[key] = mailHandler.convertNotificationMessage(obj, notificationMessage[key])
                }
            })

            if (notificationTemplateDetails) {

                let notificationObject = {
                    message: notificationMessage,
                    isRead: false,
                    receiverId: accomodationDetails.landlord,
                    createdAt: new Date().getTime(),
                    status: constants.STATUS.ACTIVE,
                    categoryType: constants.NOTIFICATION_CATEGORIES.REVIEW_RATINGS,
                    refId: req.params.propertyId
                }
                await amdDao.createNotification(notificationObject)
            }

        }
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.addReviewSuccess, response);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Get Amenities --- Kuldip
function getAmenities(req) {
    let amenities = req.body.amenities
    amenities.push("General")
    let query = {
        title: { $in: amenities },
        status: constants.STATUS.ACTIVE
    }
    return amdDao.getAmenities(query).then((response) => {
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.getAmenitiesSuccess, response);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Get Category --- Kuldip
function getCategory(req) {
    let query = { type: req.params.type, status: constants.STATUS.ACTIVE }
    return amdDao.getCategory(query).then((response) => {
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.getCategorySuccess, response);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

async function getHomeCategory(req) {
    let page = req.params.page;
    let skip = 0;
    if (page == 1) {
        skip = 0;
    } else {
        skip = (page - 1) * 12;
    }
    let option = {
        skip: skip,
        limit: 12
    };
    let getCategoryQuery = [{
        $match: {
            type: req.params.type,
            status: constants.STATUS.ACTIVE,
            isVerified: true
        }
    }, {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }, {
        $sort: {
            createdAt:  -1
        }
    }]
    let project = {
        $project: {
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            type: "$type",
            name: "$name",
            totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
            totalRatingsBy: { $size: "$reviewData" },
            country: "$address.country",
            city: "$address.city",
            location: "$address.location",
            state: "$address.state",
            media: { $arrayElemAt: ["$media", 0] },
            price: {
                $sum: "$price.rate"
            },
            landlordProfilePicture : "$userData.profilePicture",
            createdAt: "$createdAt"
        }
    }
    if (req.body.userId) {
        let lookup = {
            $lookup: {
                from: 'users',
                localField: "_id",
                foreignField: "favourites", //{ $in: ["_id","$favourites"] },
                as: 'userFavData'
            }
        }

        project['$project']['isFavorite'] = {
            $cond: {
                if: {
                    $gt: [{ $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }, -1]
                },
                then: {
                    $in: ["$_id", { $arrayElemAt: ["$userFavData.favourites", { $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }] }]
                },
                else: false
            }
        }
        getCategoryQuery.push(lookup)
    }
    let skipData = {
        $skip: option.skip
    }
    let limitData = {
        $limit: option.limit
    }
    getCategoryQuery.push(project)
    let totalRecord = await amdDao.getAccomodation(getCategoryQuery);
    let totalPage = await Math.ceil(totalRecord.length / option.limit);
    getCategoryQuery.push(skipData);
    getCategoryQuery.push(limitData);

    let gethomeCat = await amdDao.getTopRated(getCategoryQuery)
    let response = {
        getCategoryPlace: gethomeCat,
        totalPage: totalPage,
        totalRecord: totalRecord.length,
    }
    return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.getCategorySuccess, response);
}

// Get Reviews --- Kuldip
async function getReviews(req) {
    let sum = 0;
    let landlordSum = 0;
    let query = {
        _id: mongoose.Types.ObjectId(req.params.propertyId)
    }
    let amdQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }, {
        $unwind: "$reviewData"
    }, {
        $lookup: {
            from: 'users',
            localField: "reviewData.ratingsBy",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }, {
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'landlordData'
        }
    }, {
        $lookup: {
            from: 'accomodations',
            localField: "landlordData._id",
            foreignField: 'landlord',
            as: 'landlordPropertyData'
        }
    }, {
        $lookup: {
            from: 'reviews',
            localField: "landlordPropertyData._id",
            foreignField: 'propertyId',
            as: 'landlordReviewData'
        }
    }, {
        $sort: {
            "reviewData.createdAt": -1
        }
    }]
    return amdDao.getAccomodation(amdQuery).then((response) => {
        let reviews = []
        response.map((x) => {
            reviews.push({
                _id: x._id,
                firstName: x.userData.firstName,
                lastName: x.userData.lastName,
                photo: x.userData.profilePicture,
                ratings: x.reviewData.ratings,
                review: x.reviewData.review,
                createdAt: x.reviewData.createdAt
            })
        })
        reviews.map((x) => {
            sum += x.ratings
        })
        let obj = {
            response: reviews,
            totalRatings: (sum / reviews.length),
            totalRatingsBy: reviews.length
        }
        if (response.length) {
            let lanlordTotalReviews = response[0].landlordReviewData
            lanlordTotalReviews.map((x) => {
                landlordSum += x.ratings
            })
            obj.totalLandlordRatings = (landlordSum / response[0].landlordReviewData.length);
            obj.totalLandlordRatingsBy = response[0].landlordReviewData.length;
        }
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.success, obj);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Get Top Rated Home Office --- Kuldip
async function getTopRatedHomeOffice(req) {
    let page = req.params.page;
    console.log("GET TOP RATED HOME OFFICE: ", typeof page)
    let skip = 0;
    if (page == 1) {
        skip = 0;
    } else {
        skip = (page - 1) * 12;
    }
    let option = {
        skip: skip,
        limit: 12
    };
    let query = {
        type: constants.ACCOMODATIONS.HOME_OFFICE,
        status: constants.STATUS.ACTIVE,
        isVerified: true
    }
    let amdQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }]
    let project = {
        $project: {
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            type: "$type",
            name: "$name",
            totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
            totalRatingsBy: { $size: "$reviewData" },
            country: "$address.country",
            city: "$address.city",
            location: "$address.location",
            state: "$address.state",
            media: { $arrayElemAt: ["$media", 0] },
            price: {
                $sum: "$price.rate"
            },
            createdAt: "$createdAt"
        }
    }
    if (req.body.userId) {
        let lookup = {
            $lookup: {
                from: 'users',
                localField: "_id",
                foreignField: "favourites", //{ $in: ["_id","$favourites"] },
                as: 'userFavData'
            }
        }
        project['$project']['isFavorite'] = {
            $cond: {
                if: {
                    $gt: [{ $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }, -1]
                },
                then: {
                    $in: ["$_id", { $arrayElemAt: ["$userFavData.favourites", { $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }] }]
                },
                else: false
            }
        }
        amdQuery.push(lookup)
    }
    let skipData = {
        $skip: option.skip
    }

    let limitData = {
        $limit: option.limit
    }

    let sortData = {
        $sort: {
            totalRatings: -1
        }
    }
    amdQuery.push(project)
    amdQuery.push(skipData)
    amdQuery.push(limitData)
    amdQuery.push(sortData)
    let totalRecord = await amdDao.totalAccomodation(query);
    let totalPage = await Math.ceil(totalRecord / option.limit);
    return amdDao.getTopRated(amdQuery).then((response) => {
        // console.log({ response })
        let obj = {
            response: response,
            totalRecord: totalRecord,
            limit: option.limit,
            totalPage: totalPage
        }
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.getTopRatedHomeOfficeSuccess, obj);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Get Top Rated Work Place --- Kuldip
async function getTopRatedWorkPlace(req) {
    let page = req.params.page;
    let skip = 0;
    if (page == 1) {
        skip = 0;
    } else {
        skip = (page - 1) * 12;
    }
    let option = {
        skip: skip,
        limit: 12
    };
    let query = {
        type: constants.ACCOMODATIONS.WORKPLACE,
        status: constants.STATUS.ACTIVE,
        isVerified: true
    }
    let amdQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }]
    let project = {
        $project: {
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            type: "$type",
            name: "$name",
            totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
            totalRatingsBy: { $size: "$reviewData" },
            country: "$address.country",
            city: "$address.city",
            location: "$address.location",
            state: "$address.state",
            media: { $arrayElemAt: ["$media", 0] },
            price: {
                $sum: "$price.rate"
            },
            createdAt: "$createdAt"
        }
    }
    if (req.body.userId) {
        let lookup = {
            $lookup: {
                from: 'users',
                localField: "_id",
                foreignField: "favourites", //{ $in: ["_id","$favourites"] },
                as: 'userFavData'
            }
        }
        project['$project']['isFavorite'] = {
            $cond: {
                if: {
                    $gt: [{ $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }, -1]
                },
                then: {
                    $in: ["$_id", { $arrayElemAt: ["$userFavData.favourites", { $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }] }]
                },
                else: false
            }
        }
        amdQuery.push(lookup)
    }
    let skipData = {
        $skip: option.skip
    }

    let limitData = {
        $limit: option.limit
    }

    let sortData = {
        $sort: {
            totalRatings: -1
        }
    }
    amdQuery.push(project)
    amdQuery.push(skipData)
    amdQuery.push(limitData)
    amdQuery.push(sortData)
    let totalRecord = await amdDao.totalAccomodation(query);
    let totalPage = await Math.ceil(totalRecord / option.limit);
    return amdDao.getTopRated(amdQuery).then((response) => {
        // console.log({ response })
        let obj = {
            response: response,
            totalRecord: totalRecord,
            limit: option.limit,
            totalPage: totalPage
        }
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.getTopRatedWorkPlaceSuccess, obj);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Newly Added --- Kuldip
async function newlyAdded(req) {
    let page = req.params.page;
    let skip = 0;
    if (page == 1) {
        skip = 0;
    } else {
        skip = (page - 1) * 12;
    }
    let option = {
        skip: skip,
        limit: 12
    };
    let query = {
        status: constants.STATUS.ACTIVE,
        isVerified: true
    }
    let amdQuery = [{
        $match: query
    },
    {
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'landlordData'
        }
    }, {
        $unwind: "$landlordData"
    }, {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    },
    {
        $project: {
            type: "$type",
            name: "$name",
            country: "$address.country",
            city: "$address.city",
            location: "$address.location",
            state: "$address.state",
            createdAt: "$createdAt",
            media: { $arrayElemAt: ["$media", 0] },
            price: {
                $sum: "$price.rate"
            },
            firstName: "$landlordData.firstName",
            lastName: "$landlordData.lastName",
            totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
            totalRatingsBy: { $size: "$reviewData" },
        }
    }, {
        $skip: option.skip
    }, {
        $limit: option.limit
    }, {
        $sort: {
            createdAt: -1
        }
    }]
    let totalRecord = await amdDao.totalAccomodation(query);
    let totalPage = await Math.ceil(totalRecord / option.limit);
    return amdDao.getTopRated(amdQuery).then((response) => {
        let obj = {
            response: response,
            totalRecord: totalRecord,
            limit: option.limit,
            totalPage: totalPage
        }
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.getNewlyAddedSuccess, obj);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Create Booking --- Kuldip
function createBooking(req) {
    let query = {
        _id: req.params.propertyId,
        status: constants.STATUS.ACTIVE
    }
    let userQuery = {
        _id: req.params.userId
    }

    // let cardData = []
    return amdDao.getAmd(query).then((response) => {
        let accomodationDetails = response
        if (response) {
            return new Promise((resolve, reject) => {
                stripe.tokens.create({
                    card: {
                        number: req.body.cardNumber,
                        exp_month: req.body.exp_month,
                        exp_year: req.body.exp_year,
                        cvc: req.body.cvc
                    },
                }, (err, token) => {
                    if (err) {
                        console.log({ err })
                        resolve(amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr));
                    } else {
                        // let admin = await amdDao.checkUserExist(adminQuery)
                        // let totalAmount = (req.body.price + (req.body.price * parseInt(admin.serviceFee))) / parseInt(admin.serviceFee)
                        // let serviceRate = parseFloat(admin.serviceFee)
                        // let paidAmount = parseFloat(req.body.price)

                        // let serviceFeeCharged = parseFloat((paidAmount / serviceRate))
                        // let baseFare = paidAmount - serviceFeeCharged

                        // console.log({ paidAmount })
                        // console.log({ serviceFeeCharged }, { baseFare })

                        if (typeof req.body.price == String) {

                            req.body.price = parseFloat(req.body.price)
                        }
                        stripe.charges.create({
                            amount: parseInt(req.body.price * 100),
                            currency: "usd",
                            source: token.id,
                            capture: true,
                        }, (err, result) => {
                            if (err) {
                                console.log({ err })
                                resolve(amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr));
                            } else {

                                console.log({ result })
                                console.log("Payment Method:", result.payment_method_details)
                                let saveData = {
                                    propertyId: req.params.propertyId,
                                    propertyType: response.type,
                                    userId: req.params.userId,
                                    fromDate: req.body.fromDate,
                                    toDate: req.body.toDate,
                                    categoryId: req.body.categoryId,
                                    quantity: req.body.quantity,
                                    basePrice: req.body.basePrice,  // base fare
                                    price: req.body.price,// total amount
                                    taxes: req.body.taxes, // taxes,
                                    taxRate: req.body.taxRate, // tax rate
                                    // totalPrice: parseFloat(result.amount) / 100,
                                    chargeId: result.id,
                                    createdAt: new Date().getTime(),
                                    receiptUrl: result.receipt_url,
                                    payStatus: result.object,
                                    cardNumber: result.source.last4,
                                    cardBrand: result.source.brand,
                                    nameOnCard: req.body.nameOnCard
                                }
                                // let basePrice = totalAmount - saveData.taxes
                                // saveData.basePrice = basePrice

                                return amdDao.createBooking(saveData).then(async (response) => {
                                    let obj = {
                                        chargeId: response.chargeId,
                                        amount: response.totalPrice,
                                        status: result.status,
                                        receiptUrl: response.receiptUrl
                                    }
                                    let user = await amdDao.checkUserExist(userQuery)
                                    let landlordQuery = {
                                        _id: accomodationDetails.landlord
                                    }
                                    let landlord = await amdDao.checkUserExist(landlordQuery)
                                    if (user) {

                                        if (landlord.fcmToken) {

                                            let to = landlord.fcmToken
                                            let title = `Gat2Get`
                                            let type = constants.PUSH_NOTIFICATION_CATEGORIES.BOOKING_REQUEST_RECEIVED
                                            let refId = response._id
                                            let msg = `A new booking request received for ${accomodationDetails.name.en} `
                                            sendPushNotification.sendMessage(to, title, msg, type, refId)
                                        }

                                        let landlordMailQuery = {
                                            mailName: constants.EMAIL_TEMPLATES.TO_LANDLORD_NEW_BOOKING_REQUEST_BY_USER,
                                            status: constants.STATUS.ACTIVE
                                        }
                                        let userMailQuery = {
                                            mailName: constants.EMAIL_TEMPLATES.TO_USER_NEW_BOOKING_REQUEST_BY_USER,
                                            status: constants.STATUS.ACTIVE
                                        }
                                        let landlordTemplateDetail = await amdDao.getTemplateDetails(landlordMailQuery);
                                        let userTemplateDetail = await amdDao.getTemplateDetails(userMailQuery)

                                        let fromDate = new Date(req.body.fromDate)
                                        let toDate = new Date(req.body.toDate)
                                        if (landlordTemplateDetail) {
                                            let landlordObj = {
                                                firstName: landlord.firstName,
                                                emailId: landlord.emailId,
                                                propertyName: accomodationDetails.name.en,
                                                fromDate: fromDate.toDateString(),
                                                toDate: toDate.toDateString()
                                            }
                                            mailHandler.SEND_MAIL(landlordObj, landlordTemplateDetail)
                                        }

                                        if (userTemplateDetail) {
                                            let userObj = {
                                                firstName: user.firstName,
                                                emailId: user.emailId,
                                                propertyName: accomodationDetails.name.en,
                                                fromDate: fromDate.toDateString(),
                                                toDate: toDate.toDateString()
                                            }
                                            mailHandler.SEND_MAIL(userObj, userTemplateDetail)
                                        }

                                        // Create Notification
                                        let notificationQuery = {

                                            mailName: constants.EMAIL_TEMPLATES.NOTIFY_NEW_BOOKING_REQUEST_BY_USER,
                                            status: constants.STATUS.ACTIVE
                                        }
                                        let notificationTemplateDetails = await amdDao.getTemplateDetails(notificationQuery)
                                        let notificationMessage = notificationTemplateDetails.notificationMessage

                                        Object.keys(notificationMessage).forEach((key, value) => {

                                            if (value > 0) {
                                                let obj = {
                                                    name: accomodationDetails.name[key],
                                                    firstName: landlord.firstName,
                                                    lastName: landlord.lastName
                                                }
                                                notificationMessage[key] = mailHandler.convertNotificationMessage(obj, notificationMessage[key])
                                            }
                                        })

                                        if (notificationTemplateDetails) {

                                            let notificationObject = {
                                                message: notificationMessage,
                                                isRead: false,
                                                receiverId: accomodationDetails.landlord,
                                                createdAt: new Date().getTime(),
                                                status: constants.STATUS.ACTIVE,
                                                categoryType: constants.NOTIFICATION_CATEGORIES.BOOKING_REQUESTED,
                                                refId: response._id
                                            }
                                            await amdDao.createNotification(notificationObject)
                                        }

                                    }
                                    resolve(amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.bookRequestedSuccess, obj));
                                }).catch((error) => {
                                    console.log(error)
                                    resolve(amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr));
                                })
                            }
                        })
                    }
                });
            })
        } else {

            return amdMapper.responseMapping(amdConstants.CODE.notFound, amdConstants.MESSAGE.accomodationNotFound);
        }
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Approve Booking --- Kuldip
function approveBooking(req) {
    let query = {
        userId: req.params.bookingUserId,
        propertyId: req.params.propertyId,
        _id: req.params.bookingId
    }
    let update = {
        status: constants.BOOKINGSTATUS.APPROVED
    }
    return amdDao.updateBookings(query, update).then(async (response) => {
        // let bookingDetail = response

        let userQuery = {
            _id: req.params.bookingUserId
        }
        let propertyQuery = {
            _id: req.params.propertyId
        }
        let userDetails = await amdDao.checkUserExist(userQuery)
        let accomodationDetails = await amdDao.getAmd(propertyQuery)

        let fromDate = new Date(response.fromDate).toDateString()
        let toDate = new Date(response.toDate).toDateString()
        if (userDetails) {

            // Sending mail to user
            let mailQuery = {
                mailName: constants.EMAIL_TEMPLATES.BOOKING_APPROVED_BY_LANDLORD,
                status: constants.STATUS.ACTIVE
            }
            let templateDetail = await amdDao.getTemplateDetails(mailQuery);

            if (templateDetail) {
                let usrObj = {
                    firstName: userDetails.firstName,
                    emailId: userDetails.emailId,
                    propertyName: accomodationDetails.name.en,
                    fromDate: fromDate,
                    toDate: toDate
                }
                mailHandler.SEND_MAIL(usrObj, templateDetail)
            }

            // Creating notification of user
            let notificationQuery = {

                mailName: constants.EMAIL_TEMPLATES.NOTIFY_USER_BOOKING_APPROVED_BY_LANDLORD,
                status: constants.STATUS.ACTIVE
            }
            let notificationTemplateDetails = await amdDao.getTemplateDetails(notificationQuery)
            let notificationMessage = notificationTemplateDetails.notificationMessage

            Object.keys(notificationMessage).forEach((key, value) => {

                if (value > 0) {
                    let obj = {
                        name: accomodationDetails.name[key],
                        firstName: userDetails.firstName,
                        lastName: userDetails.lastName
                    }
                    notificationMessage[key] = mailHandler.convertNotificationMessage(obj, notificationMessage[key])
                }
            })

            if (notificationTemplateDetails) {

                let notificationObject = {
                    message: notificationMessage,
                    isRead: false,
                    receiverId: userDetails._id,
                    createdAt: new Date().getTime(),
                    status: constants.STATUS.ACTIVE,
                    categoryType: constants.NOTIFICATION_CATEGORIES.BOOKING_APPROVED,
                    refId: req.params.bookingId
                }
                await amdDao.createNotification(notificationObject)
            }

            // Sending push notification to user
            if (userDetails.fcmToken) {

                let to = userDetails.fcmToken
                let title = `Gat2Get`
                let type = constants.PUSH_NOTIFICATION_CATEGORIES.BOOKING_APPROVED
                let refId = req.params.bookingId
                let msg = `Your booking for ${accomodationDetails.name.en} is confirmed`
                sendPushNotification.sendMessage(to, title, msg, type, refId)
            }

            return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.bookApprovedSuccess, response);
        } else {

            return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);

        }

    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Reject Booking --- Kuldip
function rejectBooking(req) {
    let query = {
        userId: req.params.bookingUserId,
        propertyId: req.params.propertyId,
        _id: req.params.bookingId
    }
    let update = {
        status: constants.BOOKINGSTATUS.REJECTED,
        reason: req.body.reason
    }
    let userQuery = {
        _id: req.params.bookingUserId
    }
    return amdDao.updateBookings(query, update).then((response) => {
        return new Promise((resolve, reject) => {
            stripe.refunds.create({
                charge: response.chargeId
            }, (err, result) => {
                if (err) {
                    reject(amdMapper.responseMapping(amdConstants.CODE.badrequest, err.raw.message))
                } else {
                    let updateData = {
                        refundId: result.id,
                        payStatus: result.object
                    }
                    return amdDao.updateBookings(query, updateData).then(async (response) => {
                        let user = await amdDao.checkUserExist(userQuery)
                        if (user) {
                            let propertyQuery = {
                                _id: req.params.propertyId
                            }
                            let accomodationDetails = await amdDao.getAmd(propertyQuery)
                            let fromDate = new Date(response.fromDate).toDateString()
                            let toDate = new Date(response.toDate).toDateString()

                            // Sending mail to user
                            let mailQuery = {
                                mailName: constants.EMAIL_TEMPLATES.BOOKING_REJECTED_BY_LANDLORD,
                                status: constants.STATUS.ACTIVE
                            }
                            let templateDetail = await amdDao.getTemplateDetails(mailQuery);
                            if (templateDetail) {
                                let userObj = {
                                    firstName: user.firstName,
                                    emailId: user.emailId,
                                    propertyName: accomodationDetails.name.en,
                                    fromDate: fromDate,
                                    toDate: toDate
                                }
                                mailHandler.SEND_MAIL(userObj, templateDetail)
                            }


                            // Creating notification for user
                            let notificationQuery = {

                                mailName: constants.EMAIL_TEMPLATES.NOTIFY_USER_BOOKING_REJECTED_BY_LANDLORD,
                                status: constants.STATUS.ACTIVE
                            }
                            let notificationTemplateDetails = await amdDao.getTemplateDetails(notificationQuery)
                            let notificationMessage = notificationTemplateDetails.notificationMessage

                            Object.keys(notificationMessage).forEach((key, value) => {

                                if (value > 0) {
                                    let obj = {
                                        name: accomodationDetails.name[key],
                                        firstName: user.firstName,
                                        lastName: user.lastName
                                    }
                                    notificationMessage[key] = mailHandler.convertNotificationMessage(obj, notificationMessage[key])
                                }
                            })

                            if (notificationTemplateDetails) {

                                let notificationObject = {
                                    message: notificationMessage,
                                    isRead: false,
                                    receiverId: user._id,
                                    createdAt: new Date().getTime(),
                                    status: constants.STATUS.ACTIVE,
                                    categoryType: constants.NOTIFICATION_CATEGORIES.BOOKING_REJECTED,
                                    refId: req.params.bookingId
                                }
                                await amdDao.createNotification(notificationObject)
                            }

                            // Sending push notification to user
                            if (user.fcmToken) {

                                let to = user.fcmToken
                                let title = `Gat2Get`
                                let type = constants.PUSH_NOTIFICATION_CATEGORIES.BOOKING_APPROVED
                                let refId = req.params.bookingId
                                let msg = `Your booking for ${accomodationDetails.name.en} is rejected`
                                sendPushNotification.sendMessage(to, title, msg, type, refId)
                            }
                        }
                        resolve(amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.bookRejectedSuccess, result));
                    })
                }
            })
        })
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Requested Booking List  --- Kuldip
async function requestedBookingList(req) {
    let page = req.params.page;
    let match = {}
    let skip = 0;
    if (page == 1) {
        skip = 0;
    } else {
        skip = (page - 1) * 12;
    }
    let option = {
        skip: skip,
        limit: 12
    };
    let query = {
        landlord: mongoose.Types.ObjectId(req.params.userId),
        status: constants.STATUS.ACTIVE
    }
    let amdQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'bookings',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'bookingData'
        }
    }, {
        $unwind: "$bookingData"
    }]

    // if (req.body.status == "APPROVED") {
    //     match = {
    //         $match: {
    //             "bookingData.status": constants.BOOKINGSTATUS.APPROVED
    //         }
    //     }
    // } else if (req.body.status == "REJECTED") {
    //     match = {
    //         $match: {
    //             "bookingData.status": constants.BOOKINGSTATUS.REJECTED
    //         }
    //     }
    // } else {
    //     match = {
    //         $match: {
    //             "bookingData.status": constants.BOOKINGSTATUS.REQUESTED
    //         }
    //     }
    // }

    if (req.body.status) {

        match = {
            $match: {
                "bookingData.status": req.body.status
            }
        }
    } else {

        match = {
            $match: {
                "bookingData.status": constants.BOOKINGSTATUS.REQUESTED
            }
        }
    }

    let categoryLookup = {
        $lookup: {
            from: 'categories',
            localField: "categoryId",
            foreignField: '_id',
            as: 'categoryData'
        }
    }

    let categoryUnwind = {
        $unwind: "$categoryData"
    }

    let userLookup = {
        $lookup: {
            from: 'users',
            localField: "bookingData.userId",
            foreignField: '_id',
            as: 'userData'
        }
    }

    let userUnwind = {
        $unwind: "$userData"
    }

    let project = {
        $project: {
            bookingId: "$bookingData._id",
            bookingUserId: "$bookingData.userId",
            propertyId: "$bookingData.propertyId",
            userId: "$landlord",
            propertyName: "$name",
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            bookingDate: {
                from: "$bookingData.fromDate",
                to: "$bookingData.toDate"
            },
            categoryId: "$categoryId",
            categoryName: "$categoryData.name",
            totalQuantity: "$quantity",
            bookedQuantity: { $size: "$bookingData.categoryId" },
            bookingStatus: "$bookingData.status",
            quantity: "$bookingData.quantity",
            createdAt: "$bookingData.createdAt",
            spaceCycle: "$spaceAvailability.spaceCycle",
            price: "$bookingData.price",
            taxes: "$bookingData.taxes",
            taxRate: "$bookingData.taxRate",
            basePrice: "$bookingData.basePrice",
        }
    }

    let skipData = {
        $skip: option.skip
    }
    // if (req.body.status == "APPROVED") {
    //     match = {
    //         $match: {
    //             "bookingData.status": constants.BOOKINGSTATUS.APPROVED
    //         }
    //     }
    // } else if (req.body.status == "REJECTED") {
    //     match = {
    //         $match: {
    //             "bookingData.status": constants.BOOKINGSTATUS.REJECTED
    //         }
    //     }
    // } else {
    //     match = {
    //         $match: {
    //             "bookingData.status": constants.BOOKINGSTATUS.REQUESTED
    //         }
    //     }
    // }

    let limitData = {
        $limit: option.limit
    }

    let sortData = {
        $sort: {
            createdAt: -1
        }
    }
    amdQuery.push(match)
    amdQuery.push(categoryLookup)
    amdQuery.push(categoryUnwind)
    amdQuery.push(userLookup)
    amdQuery.push(userUnwind)
    amdQuery.push(project)
    let totalRecord = await amdDao.getAccomodation(amdQuery);
    let totalPage = await Math.ceil(totalRecord.length / option.limit);
    amdQuery.push(skipData)
    amdQuery.push(limitData)
    amdQuery.push(sortData)
    return amdDao.getAccomodation(amdQuery).then((response) => {
        let obj = {
            response: response,
            totalRecord: totalRecord.length,
            limit: option.limit,
            totalPage: totalPage
        }
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.getRequestedSuccess, obj);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Reserved Booking List  --- Kuldip
async function reservedBookingList(req) {
    let page = req.params.page;
    let skip = 0;
    if (page == 1) {
        skip = 0;
    } else {
        skip = (page - 1) * 12;
    }
    let option = {
        skip: skip,
        limit: 12
    };
    let matchQuery = {
        landlord: mongoose.Types.ObjectId(req.params.userId),
        status: constants.STATUS.ACTIVE
    }
    if (req.body.time == "Past") {
        matchQuery["bookingData.status"] = constants.BOOKINGSTATUS.COMPLETED

    } else {
        matchQuery["bookingData.status"] = constants.BOOKINGSTATUS.APPROVED
    }
    let amdQuery = [{
        $lookup: {
            from: 'bookings',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'bookingData'
        }
    }, {
        $unwind: "$bookingData"
    }, {
        $match: matchQuery
    },
    {
        $lookup: {
            from: 'categories',
            localField: "categoryId",
            foreignField: '_id',
            as: 'categoryData'
        }
    }, {

        $unwind: "$categoryData"
    },
    {
        $lookup: {
            from: 'users',
            localField: "bookingData.userId",
            foreignField: '_id',
            as: 'userData'
        }
    }, {

        $unwind: "$userData"
    },
    {
        $project: {
            bookingId: "$bookingData._id",
            bookingUserId: "$bookingData.userId",
            propertyId: "$bookingData.propertyId",
            bookingCreatedAt: "$bookingData.createdAt",
            propertyName: "$name",
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            bookingDate: {
                from: "$bookingData.fromDate",
                to: "$bookingData.toDate"
            },
            categoryId: "$categoryId",
            categoryName: "$categoryData.name",
            totalQuantity: "$quantity",
            bookedQuantity: { $size: "$bookingData.categoryId" },
            bookingStatus: "$bookingData.status",
            quantity: "$bookingData.quantity",
            price: "$bookingData.price",
            spaceCycle: "$spaceAvailability.spaceCycle",
            taxes: "$bookingData.taxes",
            taxRate: "$bookingData.taxRate",
            basePrice: "$bookingData.basePrice",
        }

    }]

    let skipData = {
        $skip: option.skip
    }

    let limitData = {
        $limit: option.limit
    }

    let sortData = {
        $sort: {
            "bookingCreatedAt": -1
        }
    }

    let totalRecord = await amdDao.getAccomodation(amdQuery);
    let totalPage = await Math.ceil(totalRecord.length / option.limit);
    amdQuery.push(skipData)
    amdQuery.push(limitData)
    amdQuery.push(sortData)
    return amdDao.getAccomodation(amdQuery).then((response) => {
        let obj = {
            response: response,
            totalRecord: totalRecord.length,
            limit: option.limit,
            totalPage: totalPage
        }
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.getReservedSuccess, obj);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Home Page Mobile  --- Kuldip
async function homePage(req) {
    let mostVisitedPlaceQuery = [{
        $match: {
            // type: constants.ACCOMODATIONS.HOME_OFFICE,
            status: constants.STATUS.ACTIVE,
            isVerified: true
        }
    }, {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }, {
        $limit: 8
    }, {
        $sort: {
            visited: -1
        }
    }]
    let topRatedHomeOfficeQuery = [{
        $match: {
            type: constants.ACCOMODATIONS.HOME_OFFICE,
            status: constants.STATUS.ACTIVE,
            isVerified: true
        }
    }, {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }, {
        $limit: 4
    }, {
        $sort: {
            totalRatings: -1
        }
    }]
    let topRatedWorkPlaceQuery = [{
        $match: {
            type: constants.ACCOMODATIONS.WORKPLACE,
            status: constants.STATUS.ACTIVE,
            isVerified: true
        }
    }, {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }, {
        $limit: 4
    }, {
        $sort: {
            totalRatings: -1
        }
    }]
    let project = {
        $project: {
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            type: "$type",
            name: "$name",
            totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
            totalRatingsBy: { $size: "$reviewData" },
            country: "$address.country",
            city: "$address.city",
            location: "$address.location",
            state: "$address.state",
            media: { $arrayElemAt: ["$media", 0] },
            price: {
                $sum: "$price.rate"
            },
            landlordProfilePicture : "$userData.profilePicture",
            createdAt: "$createdAt"
        }
    }
    if (req.body.userId) {
        let lookup = {
            $lookup: {
                from: 'users',
                localField: "_id",
                foreignField: "favourites", //{ $in: ["_id","$favourites"] },
                as: 'userFavData'
            }
        }

        project['$project']['isFavorite'] = {
            $cond: {
                if: {
                    $gt: [{ $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }, -1]
                },
                then: {
                    $in: ["$_id", { $arrayElemAt: ["$userFavData.favourites", { $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }] }]
                },
                else: false
            }
        }
        topRatedHomeOfficeQuery.push(lookup)
        topRatedWorkPlaceQuery.push(lookup)
        mostVisitedPlaceQuery.push(lookup)
    }
    let newlyAddedQuery = [{
        $match: {
            status: constants.STATUS.ACTIVE,
            isVerified: true
        }
    }, {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'userData'
        }
    },{
        $unwind: "$userData"
    },{
        $limit: 8
    }, {
        $sort: {
            createdAt: -1
        }
    }, {
        $project: {
            type: "$type",
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            name: "$name",
            country: "$address.country",
            city: "$address.city",
            location: "$address.location",
            state: "$address.state",
            createdAt: "$createdAt",
            totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
            totalRatingsBy: { $size: "$reviewData" },
            media: { $arrayElemAt: ["$media", 0] },
            landlordProfilePicture : "$userData.profilePicture",
            price: {
                $sum: "$price.rate"
            }
        }
    }]
    mostVisitedPlaceQuery.push(project)
    topRatedHomeOfficeQuery.push(project)
    topRatedWorkPlaceQuery.push(project)
    let mostSearchPlace = await amdDao.mostSearchLocation()
    let topRatedHomeOffice = await amdDao.getTopRated(topRatedHomeOfficeQuery)
    let topRatedWorkPlace = await amdDao.getTopRated(topRatedWorkPlaceQuery)
    let newlyAdded = await amdDao.getTopRated(newlyAddedQuery)
    let mostVsited = await amdDao.getTopRated(mostVisitedPlaceQuery)
    let response = {
        topRatedHomeOffice: topRatedHomeOffice,
        topRatedWorkPlace: topRatedWorkPlace,
        newlyAdded: newlyAdded,
        mostSearchPlace: mostSearchPlace,
        mostVisitedPlace: mostVsited,
    }
    return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.success, response);
}

// Get Top Rated Home Office --- Kuldip
async function getTopRatedHomeOfficeHomePage(req) {
    let query = {
        type: constants.ACCOMODATIONS.HOME_OFFICE,
        status: constants.STATUS.ACTIVE,
        isVerified: true
    }
    let amdQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }]
    let project = {
        $project: {
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            type: "$type",
            name: "$name",
            totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
            totalRatingsBy: { $size: "$reviewData" },
            country: "$address.country",
            city: "$address.city",
            location: "$address.location",
            state: "$address.state",
            media: { $arrayElemAt: ["$media", 0] },
            price: {
                $sum: "$price.rate"
            },
            createdAt: "$createdAt"
        }
    }
    if (req.body.userId) {
        let lookup = {
            $lookup: {
                from: 'users',
                localField: "_id",
                foreignField: "favourites",
                as: 'userFavData'
            }
        }
        project['$project']['isFavorite'] = {
            $cond: {
                if: {
                    $gt: [{ $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }, -1]
                },
                then: {
                    $in: ["$_id", { $arrayElemAt: ["$userFavData.favourites", { $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }] }]
                },
                else: false
            }
        }
        amdQuery.push(lookup)
    }
    let limitData = {
        $limit: 4
    }

    let sortData = {
        $sort: {
            totalRatings: -1
        }
    }
    amdQuery.push(project)
    amdQuery.push(limitData)
    amdQuery.push(sortData)
    return amdDao.getTopRated(amdQuery).then((response) => {
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.getTopRatedHomeOfficeSuccess, response);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Get Top Rated Work Place --- Kuldip
async function getTopRatedWorkPlaceHomePage(req) {
    let query = {
        type: constants.ACCOMODATIONS.WORKPLACE,
        status: constants.STATUS.ACTIVE,
        isVerified: true
    }
    let amdQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }]
    let project = {
        $project: {
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            type: "$type",
            name: "$name",
            totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
            totalRatingsBy: { $size: "$reviewData" },
            country: "$address.country",
            city: "$address.city",
            location: "$address.location",
            state: "$address.state",
            media: { $arrayElemAt: ["$media", 0] },
            price: {
                $sum: "$price.rate"
            },
            createdAt: "$createdAt"
        }
    }
    if (req.body.userId) {
        let lookup = {
            $lookup: {
                from: 'users',
                localField: "_id",
                foreignField: "favourites", //{ $in: ["_id","$favourites"] },
                as: 'userFavData'
            }
        }
        project['$project']['isFavorite'] = {
            $cond: {
                if: {
                    $gt: [{ $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }, -1]
                },
                then: {
                    $in: ["$_id", { $arrayElemAt: ["$userFavData.favourites", { $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }] }]
                },
                else: false
            }
        }
        amdQuery.push(lookup)
    }

    let limitData = {
        $limit: 4
    }

    let sortData = {
        $sort: {
            totalRatings: -1
        }
    }
    amdQuery.push(project)
    amdQuery.push(limitData)
    amdQuery.push(sortData)
    return amdDao.getTopRated(amdQuery).then((response) => {
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.getTopRatedWorkPlaceSuccess, response);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Newly Added --- Kuldip
async function newlyAddedHomePage(req) {
    let query = {
        status: constants.STATUS.ACTIVE,
        isVerified: true
    }
    let amdQuery = [
    {
        $match: query
    },{
        $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "createdBy",
            as: "usersData"
        }
    },{
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }, {
        $limit: 5
    }, {
        $sort: {
            createdAt: -1
        }
    }
    , {
        $project: {
            type: "$type",
            name: "$name",
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
            totalRatingsBy: { $size: "$reviewData" },
            country: "$address.country",
            city: "$address.city",
            location: "$address.location",
            state: "$address.state",
            landloardProfilePicture : "$userData.profilePicture",
            createdAt: "$createdAt",
            media: { $arrayElemAt: ["$media", 0] },
            price: {
                $sum: "$price.rate"
            }
        }
    }
]
    return amdDao.getTopRated(amdQuery).then((response) => {
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.getNewlyAddedSuccess, response);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Dashboard --- Kuldip
async function dashboard(req) {
    let query = {
        landlord: mongoose.Types.ObjectId(req.params.userId),
        status: constants.STATUS.ACTIVE
    }
    let requestedAmdQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'bookings',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'bookingData'
        }
    }, {
        $unwind: "$bookingData"
    }, {
        $match: {
            "bookingData.status": constants.BOOKINGSTATUS.REQUESTED
        }
    }, {
        $lookup: {
            from: 'categories',
            localField: "categoryId",
            foreignField: '_id',
            as: 'categoryData'
        }
    }, {
        $unwind: "$categoryData"
    }, {
        $lookup: {
            from: 'users',
            localField: "bookingData.userId",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }, {
        $limit: 4
    }, {
        $project: {
            bookingId: "$bookingData._id",
            bookingUserId: "$bookingData.userId",
            propertyId: "$bookingData.propertyId",
            userId: "$landlord",
            propertyName: "$name",
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            bookingDate: {
                from: "$bookingData.fromDate",
                to: "$bookingData.toDate"
            },
            categoryId: "$categoryId",
            categoryName: "$categoryData.name",
            totalQuantity: "$quantity",
            bookedQuantity: { $size: "$bookingData.categoryId" },
            bookingStatus: "$bookingData.status",
            createdAt: "$bookingData.createdAt",
            spaceCycle: "$spaceAvailability.spaceCycle"
        }
    }, {
        $sort: {
            createdAt: -1
        }
    }]
    let reservedAmdQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'bookings',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'bookingData'
        }
    }, {
        $unwind: "$bookingData"
    }, {
        $match: {
            "bookingData.status": constants.BOOKINGSTATUS.APPROVED
        }
    }, {
        $lookup: {
            from: 'categories',
            localField: "categoryId",
            foreignField: '_id',
            as: 'categoryData'
        }
    }, {
        $unwind: "$categoryData"
    }, {
        $lookup: {
            from: 'users',
            localField: "bookingData.userId",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }, {
        $limit: 4
    }, {
        $project: {
            bookingId: "$bookingData._id",
            bookingUserId: "$bookingData.userId",
            propertyId: "$bookingData.propertyId",
            userId: "$landlord",
            propertyName: "$name",
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            bookingDate: {
                from: "$bookingData.fromDate",
                to: "$bookingData.toDate"
            },
            categoryId: "$categoryId",
            categoryName: "$categoryData.name",
            totalQuantity: "$quantity",
            bookedQuantity: { $size: "$bookingData.categoryId" },
            bookingStatus: "$bookingData.status",
            quantity: "$bookingData.quantity",
            price: "$bookingData.price",
            spaceCycle: "$spaceAvailability.spaceCycle"
        }
    }, {
        $sort: {
            createdAt: -1
        }
    }]
    let requestedAmd = await amdDao.getAccomodation(requestedAmdQuery)
    let reservedAmd = await amdDao.getAccomodation(reservedAmdQuery)
    let response = {
        requestedAmd: requestedAmd,
        reservedAmd: reservedAmd
    }
    return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.success, response);
}

// Similar Place --- Kuldip
function similarPlace(req) {
    let query = {
        type: req.params.type,
        "address.city": req.params.city,
        _id: { $ne: mongoose.Types.ObjectId(req.params.propertyId) }
    }
    let amdQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }, {
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }]
    let project = {
        $project: {
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            type: "$type",
            name: "$name",
            totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
            totalRatingsBy: { $size: "$reviewData" },
            country: "$address.country",
            city: "$address.city",
            location: "$address.location",
            state: "$address.state",
            media: { $arrayElemAt: ["$media", 0] },
            price: {
                $sum: "$price.rate"
            }
        }
    }
    if (req.body.userId) {
        let lookup = {
            $lookup: {
                from: 'users',
                localField: "_id",
                foreignField: "favourites", //{ $in: ["_id","$favourites"] },
                as: 'userFavData'
            }
        }
        project['$project']['isFavorite'] = {
            $cond: {
                if: {
                    $gt: [{ $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }, -1]
                },
                then: {
                    $in: ["$_id", { $arrayElemAt: ["$userFavData.favourites", { $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }] }]
                },
                else: false
            }
        }
        amdQuery.push(lookup)
    }
    amdQuery.push(project)
    return amdDao.getAccomodation(amdQuery).then((response) => {
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.getSimilarAmdSuccess, response);
    }).catch((error) => {
        console.log(error)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// My Listing Mobile --- Kuldip
async function myListingMobile(req) {
    let query = {
        landlord: mongoose.Types.ObjectId(req.params.userId),
        status: constants.STATUS.ACTIVE
    }
    let requestQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'bookings',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'bookingData'
        }
    }, {
        $unwind: "$bookingData"
    }, {
        $match: {
            "bookingData.status": constants.BOOKINGSTATUS.REQUESTED
        }
    }, {
        $project: {
            bookingId: "$bookingData._id",
            bookingUserId: "$bookingData.userId",
            propertyId: "$bookingData.propertyId",
            userId: "$landlord",
            propertyName: "$name",
            bookingDate: {
                from: "$bookingData.fromDate",
                to: "$bookingData.toDate"
            },
            categoryId: "$categoryId",
            totalQuantity: "$quantity",
            bookedQuantity: { $size: "$bookingData.categoryId" },
            bookingStatus: "$bookingData.status",
            quantity: "$bookingData.quantity",
            createdAt: "$bookingData.createdAt"
        }
    }]
    let reservationQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'bookings',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'bookingData'
        }
    }, {
        $unwind: "$bookingData"
    }, {
        $match: {
            "bookingData.status": constants.BOOKINGSTATUS.APPROVED
        }
    }, {
        $project: {
            bookingId: "$bookingData._id",
            bookingUserId: "$bookingData.userId",
            propertyId: "$bookingData.propertyId",
            userId: "$landlord",
            propertyName: "$name",
            bookingDate: {
                from: "$bookingData.fromDate",
                to: "$bookingData.toDate"
            },
            categoryId: "$categoryId",
            totalQuantity: "$quantity",
            bookedQuantity: { $size: "$bookingData.categoryId" },
            bookingStatus: "$bookingData.status",
            quantity: "$bookingData.quantity",
            createdAt: "$bookingData.createdAt"
        }
    }]
    let reviewsQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewsData'
        }
    }]
    let totalRequest = await amdDao.getAccomodation(requestQuery)
    let totalReservation = await amdDao.getAccomodation(reservationQuery)
    let totalProperty = await amdDao.getListAmd(query)
    let totalReviews = await amdDao.getAccomodation(reviewsQuery)

    let reviewCount = 0
    totalReviews.map((x) => {
        reviewCount += x.reviewsData.length
    })

    let obj = {
        totalRequest: totalRequest.length,
        totalReservation: totalReservation.length,
        totalProperty: totalProperty,
        totalReviews: reviewCount
    }
    return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.success, obj);
}

// Search & Filter Home Office--- Kuldip
async function searchnFilterHomeOffice(req) {
    let priceMatch = {}
    let page = req.params.page;
    let match = {}
    let skip = 0;
    if (page == 1) {
        skip = 0;
    } else {
        skip = (page - 1) * 12;
    }
    let option = {
        skip: skip,
        limit: 12
    };
    let query = {
        type: constants.ACCOMODATIONS.HOME_OFFICE,
        isVerified: true
    }

    if (req.body.city) {
        let cityName = req.body.city
        query['address.city'] = { $regex: new RegExp(cityName, "i") }
        let search = {
            searchCity: req.body.city
        }
        await amdDao.searchCount(search).then(async (result) => {
            if (result) {
                let count = result.searchCount + 1
                let update = {
                    searchCount: count
                }
                await amdDao.updateSearchCount(search, update)
            } else {
                let saveData = {
                    searchCity: req.body.city,
                    searchCount: 1
                }
                await amdDao.saveSearchCount(saveData)
            }
        })
    }

    if (req.body.spaceCycle) {
        query['spaceAvailability.spaceCycle'] = req.body.spaceCycle
    }

    if (req.body.categoryId) {
        query['categoryId'] = mongoose.Types.ObjectId(req.body.categoryId)
    }

    if (req.body.fromDate) {

        query['$or'] = [
            {
                "lockedDates.0": { $exists: false }
            }, {
                "lockedDates": {
                    $elemMatch: {
                        $or: [
                            {
                                $and: [
                                    { "startDate": { $lt: req.body.fromDate } },
                                    { "endDate": { $lt: req.body.fromDate } }

                                ]
                            }, {
                                $and: [
                                    { "startDate": { $gt: req.body.fromDate } },
                                    { "startDate": { $gt: req.body.toDate } }

                                ]
                            }
                        ]
                    }
                }
            }
        ]

    }
    let searchQuery = [{
        $match: query
    }]

    let reviewLookup = {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }


    let userLookup = {
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'landlordData'
        }
    }

    let userUnwind = {
        $unwind: '$landlordData'
    }

    let project = {
        $project: {
            firstName: "$landlordData.firstName",
            lastName: "$landlordData.lastName",
            type: "$type",
            name: "$name",
            totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
            totalRatingsBy: { $size: "$reviewData" },
            totalQuantity: '$quantity',
            amenities: { $arrayElemAt: ["$amenities.amt", 0] },
            country: "$address.country",
            city: "$address.city",
            location: "$address.location",
            state: "$address.state",
            media: { $arrayElemAt: ["$media", 0] },
            categories: "$price",
            price: {
                $sum: "$price.rate"
            }
        }
    }

    if (req.body.minPrice && !req.body.maxPrice) {
        priceMatch = {
            $match: {
                price: { $gte: req.body.minPrice }
            }
        }
    }

    if (!req.body.minPrice && req.body.maxPrice) {
        priceMatch = {
            $match: {
                price: { $lte: req.body.maxPrice }
            }
        }
    }

    if (req.body.minPrice && req.body.maxPrice) {
        priceMatch = {
            $match: {
                price: {
                    $lte: req.body.maxPrice,
                    $gte: req.body.minPrice
                }
            }
        }
    }

    if (req.body.fromDate) {
        let amdLookup = {
            $lookup: {
                from: 'bookings',
                localField: "_id",
                foreignField: 'propertyId',
                as: 'bookingData'
            }
        }
        project['$project']['bookingDetail'] = {
            $cond: {
                if: { $gt: [{ $size: '$bookingData' }, 0] },
                then: {
                    $filter: {
                        input: "$bookingData",
                        as: "item",
                        cond: {
                            $cond: {
                                if: {
                                    $or: [
                                        {
                                            $and: [
                                                { $eq: ["$$item.status", constants.BOOKINGSTATUS.APPROVED] },
                                                { $gt: [req.body.fromDate, "$$item.fromDate"] },
                                                { $gt: [req.body.fromDate, "$$item.toDate"] }
                                            ]
                                        }, {
                                            $and: [
                                                { $eq: ["$$item.status", constants.BOOKINGSTATUS.APPROVED] },
                                                { $lt: [req.body.fromDate, "$$item.fromDate"] },
                                                { $lt: [req.body.toDate, "$$item.fromDate"] }
                                            ]
                                        }
                                    ]
                                },
                                then: false,
                                else: "$$item"
                            }
                        }
                    }
                },
                else: '$quantity'
            }
        }
        searchQuery.push(amdLookup);
    }

    if (req.body.userId) {
        let favLookup = {
            $lookup: {
                from: 'users',
                localField: "_id",
                foreignField: "favourites", //{ $in: ["_id","$favourites"] },
                as: 'userFavData'
            }
        }
        project['$project']['isFavorite'] = {
            $cond: {
                if: {
                    $gt: [{ $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }, -1]
                },
                then: {
                    $in: ["$_id", { $arrayElemAt: ["$userFavData.favourites", { $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }] }]
                },
                else: false
            }
        }
        searchQuery.push(favLookup)
    }

    let skipData = {
        $skip: option.skip
    }

    let limitData = {
        $limit: option.limit
    }

    searchQuery.push(reviewLookup);
    searchQuery.push(userLookup);
    searchQuery.push(userUnwind);
    searchQuery.push(project);

    if (req.body.amenities) {
        amenitiesMatch = {
            $match: {
                amenities: {
                    $in: [req.body.amenities, "$amenities"]
                }
            }
        }
        searchQuery.push(amenitiesMatch);
    }
    if (req.body.minPrice || req.body.maxPrice || (req.body.minPrice && req.body.maxPrice)) {
        searchQuery.push(priceMatch);
    }
    let totalRecord = await amdDao.getAccomodation(searchQuery);
    let totalPage = await Math.ceil(totalRecord.length / option.limit);
    searchQuery.push(skipData);
    searchQuery.push(limitData);
    return amdDao.getAccomodation(searchQuery).then((response) => {
        let properties = []
        let obj = {
            totalRecord: totalRecord.length,
            limit: option.limit,
            totalPage: totalPage
        }
        if (response && response.length) {
            response.map((property) => {
                let guestSum = 0
                property.categoryAvailable = []
                let categories = property.categories
                if (property.bookingDetail && property.bookingDetail.length) {
                    let booking = property.bookingDetail
                    property.availableQuantity = property.totalQuantity
                    let bookingId = []
                    booking.map((booked) => {
                        booked.categoryId.map((y) => {
                            bookingId.push(y.toString())
                        })
                    })
                    categories.filter((o) => {
                        if (bookingId.indexOf(o._id.toString()) === -1) {
                            property.categoryAvailable.push(o)
                        }
                    });
                    booking.map((booked) => {
                        property.availableQuantity = property.availableQuantity - booked.categoryId.length
                    })
                } else {
                    categories.filter((o) => {
                        property.categoryAvailable.push(o)
                    });
                    property.availableQuantity = property.totalQuantity
                }
                property.categoryAvailable.map((x) => {
                    guestSum += x.guestCapacity
                })
                if (req.body.guests) {
                    if (guestSum >= req.body.guests) {
                        properties.push(property)
                    } else {
                        const index = response.indexOf(property);
                        if (index > -1) {
                            response.splice(index, 1);
                        }
                    }
                    obj.response = properties;
                } else {
                    obj.response = response;
                }
                delete property.bookingDetail
                delete property.categories
            })
        }

        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.success, obj);
    }).catch((err) => {
        console.log(err)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}
// async function searchnFilterHomeOffice(req) {
//     let ids = []
//     let priceMatch = {}
//     let amenitiesMatch = {}
//     let page = req.params.page;
//     let match = {}
//     let skip = 0;
//     if (page == 1) {
//         skip = 0;
//     } else {
//         skip = (page - 1) * 12;
//     }
//     let option = {
//         skip: skip,
//         limit: 10
//     };
//     let srcQuery = {
//         _id: { $nin: ids },
//         type: constants.ACCOMODATIONS.HOME_OFFICE
//     }
//     let query = {
//         propertyType: constants.ACCOMODATIONS.HOME_OFFICE,
//         fromDate: { $lte: req.body.fromDate },
//         toDate: { $gte: req.body.fromDate },
//         status: constants.BOOKINGSTATUS.APPROVED,
//     }
//     let bookingData = await amdDao.search(query)
//     bookingData.map((x) => {
//         ids.push(x.propertyId)
//     })

//     if (req.body.city) {
//         srcQuery['address.city'] = req.body.city
//         let search = {
//             searchCity: req.body.city
//         }
//         await amdDao.searchCount(search).then(async(result) => {
//             if (result) {
//                 let count = result.searchCount + 1
//                 let update = {
//                     searchCount: count
//                 }
//                 await amdDao.updateSearchCount(search, update)
//             } else {
//                 let saveData = {
//                     searchCity: req.body.city,
//                     searchCount: 1
//                 }
//                 await amdDao.saveSearchCount(saveData)
//             }
//         })
//     }

//     if (req.body.spaceCycle) {
//         srcQuery['spaceAvailability.spaceCycle'] = req.body.spaceCycle
//     }

//     let searchQuery = [{
//         $match: srcQuery
//     }]

//     let amdLookup = {
//         $lookup: {
//             from: 'bookings',
//             localField: "_id",
//             foreignField: 'propertyId',
//             as: 'bookingData'
//         }
//     }

//     let userLookup = {
//         $lookup: {
//             from: 'users',
//             localField: "landlord",
//             foreignField: '_id',
//             as: 'userData'
//         }
//     }

//     let userUnwind = {
//         $unwind: '$userData'
//     }

//     let reviewLookup = {
//         $lookup: {
//             from: 'reviews',
//             localField: "_id",
//             foreignField: 'propertyId',
//             as: 'reviewData'
//         }
//     }

//     let project = {
//         $project: {
//             firstName: "$userData.firstName",
//             lastName: "$userData.lastName",
//             type: "$type",
//             name: "$name",
//             totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
//             totalRatingsBy: { $size: "$reviewData" },
//             availableQuantity: {
//                 $cond: {
//                     if: { $gt: [{ $size: '$bookingData' }, 0] },
//                     then: {
//                         $cond: {
//                             if: {
//                                 $indexOfArray: ["$bookingData.status", constants.BOOKINGSTATUS.APPROVED]
//                             },
//                             then: { $subtract: ["$quantity", { $size: { $arrayElemAt: ["$bookingData.categoryId", { $indexOfArray: ["$bookingData.status", constants.BOOKINGSTATUS.APPROVED] }] } }] },
//                             else: false
//                         }
//                     },
//                     else: '$quantity'
//                 }
//             },
//             totalQuantity: '$quantity',
//             amenities: { $arrayElemAt: ["$amenities.amt", 0] },
//             country: "$address.country",
//             city: "$address.city",
//             location: "$address.location",
//             media: { $arrayElemAt: ["$media", 0] },
//             price: {
//                 $sum: "$price.rate"
//             }
//         }
//     }

//     if (req.body.minPrice && !req.body.maxPrice) {
//         priceMatch = {
//             $match: {
//                 price: { $gte: req.body.minPrice }
//             }
//         }
//     }

//     if (!req.body.minPrice && req.body.maxPrice) {
//         priceMatch = {
//             $match: {
//                 price: { $lte: req.body.maxPrice }
//             }
//         }
//     }

//     if (req.body.minPrice && req.body.maxPrice) {
//         priceMatch = {
//             $match: {
//                 price: {
//                     $lte: req.body.maxPrice,
//                     $gte: req.body.minPrice
//                 }
//             }
//         }
//     }

//     if (req.body.userId) {
//         let favLookup = {
//             $lookup: {
//                 from: 'users',
//                 localField: "_id",
//                 foreignField: "favourites", //{ $in: ["_id","$favourites"] },
//                 as: 'userFavData'
//             }
//         }
//         project['$project']['isFavorite'] = {
//             $cond: {
//                 if: {
//                     $gt: [{ $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }, -1]
//                 },
//                 then: {
//                     $in: ["$_id", { $arrayElemAt: ["$userFavData.favourites", { $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }] }]
//                 },
//                 else: false
//             }
//         }
//         searchQuery.push(favLookup)
//     }

//     let skipData = {
//         $skip: option.skip
//     }

//     let limitData = {
//         $limit: option.limit
//     }

//     searchQuery.push(amdLookup);
//     searchQuery.push(userLookup);
//     searchQuery.push(userUnwind);
//     searchQuery.push(reviewLookup);
//     searchQuery.push(project);

//     if (req.body.amenities) {
//         amenitiesMatch = {
//             $match: {
//                 amenities: {
//                     $in: [req.body.amenities, "$amenities"]
//                 }
//             }
//         }
//         searchQuery.push(amenitiesMatch);
//     }

//     if (req.body.minPrice || req.body.maxPrice || (req.body.minPrice && req.body.maxPrice)) {
//         searchQuery.push(priceMatch);
//     }
//     let totalRecord = await amdDao.getAccomodation(searchQuery);
//     let totalPage = await Math.ceil(totalRecord.length / option.limit);
//     searchQuery.push(skipData);
//     searchQuery.push(limitData);
//     return amdDao.getAccomodation(searchQuery).then((response) => {
//         let obj = {
//             response: response,
//             totalRecord: totalRecord.length,
//             limit: option.limit,
//             totalPage: totalPage
//         }
//         return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.success, obj);
//     }).catch((err) => {
//         console.log(err)
//         return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
//     })
// }

// Search & Filter Work Place--- Kuldip
async function searchnFilterWorkPlace(req) {
    let priceMatch = {}
    let page = req.params.page;
    let match = {}
    let skip = 0;
    if (page == 1) {
        skip = 0;
    } else {
        skip = (page - 1) * 12;
    }
    let option = {
        skip: skip,
        limit: 12
    };
    let query = {
        type: constants.ACCOMODATIONS.WORKPLACE,
        isVerified: true
    }

    if (req.body.city) {
        let cityName = req.body.city
        query['address.city'] = { $regex: new RegExp(cityName, "i") }
    }

    if (req.body.spaceCycle) {
        query['spaceAvailability.spaceCycle'] = req.body.spaceCycle
    }

    if (req.body.categoryId) {
        query['categoryId'] = mongoose.Types.ObjectId(req.body.categoryId)
    }

    if (req.body.fromDate) {

        query['$or'] = [
            {
                "lockedDates.0": { $exists: false }
            }, {
                "lockedDates": {
                    $elemMatch: {
                        $or: [
                            {
                                $and: [
                                    { "startDate": { $lt: req.body.fromDate } },
                                    { "endDate": { $lt: req.body.fromDate } }

                                ]
                            }, {
                                $and: [
                                    { "startDate": { $gt: req.body.fromDate } },
                                    { "startDate": { $gt: req.body.toDate } }

                                ]
                            }
                        ]
                    }
                }
            }
        ]
    }

    let searchQuery = [{
        $match: query
    }]

    let reviewLookup = {
        $lookup: {
            from: 'reviews',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    }

    let amdLookup = {
        $lookup: {
            from: 'bookings',
            localField: "_id",
            foreignField: 'propertyId',
            as: 'bookingData'
        }
    }

    let userLookup = {
        $lookup: {
            from: 'users',
            localField: "landlord",
            foreignField: '_id',
            as: 'userData'
        }
    }

    let userUnwind = {
        $unwind: '$userData'
    }

    let project = {
        $project: {
            firstName: "$userData.firstName",
            lastName: "$userData.lastName",
            type: "$type",
            name: "$name",
            totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
            totalRatingsBy: { $size: "$reviewData" },
            totalQuantity: '$quantity',
            amenities: { $arrayElemAt: ["$amenities.amt", 0] },
            country: "$address.country",
            city: "$address.city",
            location: "$address.location",
            state: "$address.state",
            categories: "$price",
            media: { $arrayElemAt: ["$media", 0] },
            price: {
                $sum: "$price.rate"
            }
        }
    }

    if (req.body.minPrice && !req.body.maxPrice) {
        priceMatch = {
            $match: {
                price: { $gte: req.body.minPrice }
            }
        }
    }

    if (!req.body.minPrice && req.body.maxPrice) {
        priceMatch = {
            $match: {
                price: { $lte: req.body.maxPrice }
            }
        }
    }

    if (req.body.minPrice && req.body.maxPrice) {
        priceMatch = {
            $match: {
                price: {
                    $lte: req.body.maxPrice,
                    $gte: req.body.minPrice
                }
            }
        }
    }

    if (req.body.userId) {
        let favLookup = {
            $lookup: {
                from: 'users',
                localField: "_id",
                foreignField: "favourites", //{ $in: ["_id","$favourites"] },
                as: 'userFavData'
            }
        }
        project['$project']['isFavorite'] = {
            $cond: {
                if: {
                    $gt: [{ $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }, -1]
                },
                then: {
                    $in: ["$_id", { $arrayElemAt: ["$userFavData.favourites", { $indexOfArray: ["$userFavData._id", mongoose.Types.ObjectId(req.body.userId)] }] }]
                },
                else: false
            }
        }
        searchQuery.push(favLookup)
    }

    if (req.body.fromDate) {
        let amdLookup = {
            $lookup: {
                from: 'bookings',
                localField: "_id",
                foreignField: 'propertyId',
                as: 'bookingData'
            }
        }
        project['$project']['bookingDetail'] = {
            $cond: {
                if: { $gt: [{ $size: '$bookingData' }, 0] },
                then: {
                    $filter: {
                        input: "$bookingData",
                        as: "item",
                        cond: {
                            $cond: {
                                if: {
                                    $or: [
                                        {
                                            $and: [
                                                { $eq: ["$$item.status", constants.BOOKINGSTATUS.APPROVED] },
                                                { $gt: [req.body.fromDate, "$$item.fromDate"] },
                                                { $gt: [req.body.fromDate, "$$item.toDate"] }
                                            ]
                                        }, {
                                            $and: [
                                                { $eq: ["$$item.status", constants.BOOKINGSTATUS.APPROVED] },
                                                { $lt: [req.body.fromDate, "$$item.fromDate"] },
                                                { $lt: [req.body.toDate, "$$item.fromDate"] }
                                            ]
                                        }
                                    ]
                                },
                                then: false,
                                else: "$$item"
                            }
                        }
                    }
                },
                else: '$quantity'
            }
        }
        searchQuery.push(amdLookup);
    }

    let skipData = {
        $skip: option.skip
    }

    let limitData = {
        $limit: option.limit
    }

    searchQuery.push(reviewLookup);
    searchQuery.push(amdLookup);
    searchQuery.push(userLookup);
    searchQuery.push(userUnwind);
    searchQuery.push(project);

    if (req.body.amenities) {
        amenitiesMatch = {
            $match: {
                amenities: {
                    $in: [req.body.amenities, "$amenities"]
                }
            }
        }
        searchQuery.push(amenitiesMatch);
    }
    if (req.body.minPrice || req.body.maxPrice || (req.body.minPrice && req.body.maxPrice)) {
        searchQuery.push(priceMatch);
    }
    let totalRecord = await amdDao.getAccomodation(searchQuery);
    let totalPage = await Math.ceil(totalRecord.length / option.limit);
    searchQuery.push(skipData);
    searchQuery.push(limitData);
    return amdDao.getAccomodation(searchQuery).then((response) => {
        if (response && response.length) {
            response.map((property) => {
                property.categoryAvailable = []
                let categories = property.categories
                if (property.bookingDetail && property.bookingDetail.length) {
                    let booking = property.bookingDetail
                    property.availableQuantity = property.totalQuantity
                    let bookingId = []
                    booking.map((booked) => {
                        booked.categoryId.map((y) => {
                            bookingId.push(y.toString())
                        })
                    })
                    categories.filter((o) => {
                        if (bookingId.indexOf(o._id.toString()) === -1) {
                            property.categoryAvailable.push(o)
                        }
                    });
                    booking.map((booked) => {
                        property.availableQuantity = property.availableQuantity - booked.categoryId.length
                    })
                } else {
                    categories.filter((o) => {
                        property.categoryAvailable.push(o)
                    });
                    property.availableQuantity = property.totalQuantity
                }
                delete property.bookingDetail
                delete property.categories
            })
        }
        let obj = {
            response: response,
            totalRecord: totalRecord.length,
            limit: option.limit,
            totalPage: totalPage
        }
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.success, obj);
    }).catch((err) => {
        console.log(err)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// View Booking Detail--- Kuldip
function viewBookingDetail(req) {
    let query = {
        _id: mongoose.Types.ObjectId(req.params.bookingId)
    }

    let bookingQuery = [{
        $match: query
    }, {
        $lookup: {
            from: 'accomodations',
            localField: "propertyId",
            foreignField: "_id",
            as: 'amdData'
        }
    }, {
        $unwind: "$amdData"
    },
    // {
    //     $match: {
    //         "amdData.landlord": mongoose.Types.ObjectId(req.params.userId)
    //     }
    // },
    {
        $lookup: {
            from: 'users',
            localField: "userId",
            foreignField: "_id",
            as: 'userData'
        }
    }, {
        $unwind: "$userData"
    }, {
        $lookup: {
            from: 'users',
            localField: "amdData.landlord",
            foreignField: "_id",
            as: 'landlordData'
        }
    }, {
        $unwind: "$landlordData"
    }, {
        $lookup: {
            from: 'categories',
            localField: "amdData.categoryId",
            foreignField: '_id',
            as: 'categoryData'
        }
    }, {
        $lookup: {
            from: 'reviews',
            localField: "propertyId",
            foreignField: 'propertyId',
            as: 'reviewData'
        }
    },
    {
        $lookup: {
            from: 'accomodations',
            foreignField: 'price._id',
            localField: "categoryId",
            as: 'bookedCategoriesss'
        }
    }, {
        $lookup: {
            from: 'amenities',
            localField: "amdData.amenities.amtId",
            foreignField: '_id',
            as: 'amtData'
        }
    }
    ]

    let projectObj = {

        bookingId: "$_id",

        // user details who has booked the property
        bookingUserId: "$userId",
        joinDate: "$userData.createdAt",
        document: "$userData.document",

        // property details
        propertyId: "$propertyId",
        type: "$amdData.type",
        name: "$amdData.name",
        country: "$amdData.address.country",
        city: "$amdData.address.city",
        location: "$amdData.address.location",
        state: "$amdData.address.state",
        media: { $arrayElemAt: ["$amdData.media", 0] },
        spaceAvailability: "$amdData.spaceAvailability",
        cancellationPolicy: "$amdData.cancellationPolicy",
        spaceReadyIn: "$amdData.spaceReadyIn",
        generalRules: "$amdData.generalRules",
        description: "$amdData.description",
        amenities: {
            $map: {
                input: "$amdData.amenities",
                as: "item",
                in: {
                    name: {
                        $arrayElemAt: ["$amtData.title", { $indexOfArray: ["$amtData._id", "$$item.amtId"] }]
                    },
                    amtId: "$$item.amtId",
                    amtName: "$$item.name",
                    amt: "$$item.amt",
                }
            }
        },

        // landlord details of the property
        userId: "$amdData.landlord",
        userFirstName: "$landlordData.firstName",   // landlord first name of the property
        userLastName: "$landlordData.lastName",    // landlord last name of the property
        userProfilePicture: "$landlordData.profilePicture",    // landlord profile picture of the property

        // booking details
        quantity: "$quantity",
        status: "$status",
        checkIn: "$fromDate",
        checkOut: "$toDate",
        createdAt: "$createdAt",
        price: "$price",
        taxes: "$taxes",
        taxRate: "$taxRate",
        basePrice: "$basePrice",
        cardNumber: "$cardNumber",
        cardBrand: "$cardBrand",
        nameOnCard: "$nameOnCard",
        status: "$status",
        // price: { $sum: "$amdData.price.rate" },

        // booked category details from property category
        bookedCategories: { $size: "$categoryId" },
        propertyCategories: "$amdData.price",
        bookedCategoryList: "$categoryId",

        // property- category details
        categoryId: "$amdDate.categoryId",
        categoryName: { $arrayElemAt: ["$categoryData.name", { $indexOfArray: ["$categoryData._id", "$amdDate.categoryId"] }] },

        // review rating of property
        totalRatings: { $ifNull: [{ $avg: "$reviewData.ratings" }, 0] },
    }

    let userQuery = {
        _id: req.params.userId,
        status: constants.STATUS.ACTIVE,
        role: { $in: [constants.ROLE.USER, constants.ROLE.LANDLORD] }
    }
    return amdDao.checkUserExist(userQuery).then((userDetails) => {

        if (userDetails) {

            if (userDetails.role == constants.ROLE.USER) {

                projectObj.firstName = "$landlordData.firstName"
                projectObj.lastName = "$landlordData.lastName"
                projectObj.profilePicture = "$landlordData.profilePicture"
                projectObj.isAccountVerified = "$landlordData.isAccountVerified"
            } else {

                projectObj.firstName = "$userData.firstName"
                projectObj.lastName = "$userData.lastName"
                projectObj.profilePicture = "$userData.profilePicture"
                projectObj.isAccountVerified = "$userData.isAccountVerified"
            }

            bookingQuery.push({
                $project: projectObj
            })
            return amdDao.searchAggregate(bookingQuery).then((response) => {

                if (req.params.userId && response && response.length > 0) {

                    let bookingData = response[0]

                    let docs = bookingData.document
                    if (docs && docs.length > 0) {

                        let verifiedDoc = docs.find(obj => obj.isKYCVerified)
                        if (verifiedDoc) {
                            bookingData.document = verifiedDoc
                        } else {
                            bookingData.document = []
                        }
                    }

                    let bookedCategories = bookingData.bookedCategoryList
                    let allPropertyCategories = bookingData.propertyCategories
                    let filteredData = []
                    bookedCategories.map(i => {
                        filteredData.push(allPropertyCategories.find(j => j._id.toString() == i.toString()))
                    })
                    bookingData.bookedCategoryList = filteredData
                    delete bookingData.propertyCategories

                    response[0] = bookingData

                    // 1. logged in user => bookingUserId
                    //    chat with landlord => other

                    // 2. logged in user => landlord
                    // chat with bookingUser => other

                    let participant1 = req.params.userId
                    let participant2 = response[0].userId

                    if (req.params.userId == response[0].userId) {
                        participant2 = response[0].bookingUserId
                    }

                    let roomQuery = {
                        $and: [{
                            $or: [
                                { participateId1: participant1 },
                                { participateId2: participant1 }
                            ]
                        }, {
                            $or: [
                                { participateId1: participant2 },
                                { participateId2: participant2 }
                            ]
                        }]
                    }
                    return amdDao.checkRoom(roomQuery).then((roomExists) => {

                        if (roomExists) {
                            response[0].roomId = roomExists._id
                        } else {
                            response[0].roomId = ""
                        }
                        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.success, response)

                    }).catch((error) => {
                        console.log(error)
                        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
                    })
                } else {

                    return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.success, response)
                }

            }).catch((err) => {
                console.log(err)
                return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr)
            })
        } else {

            return amdMapper.responseMapping(amdConstants.CODE.notFound, amdConstants.MESSAGE.UserNotFound);
        }

    }).catch((err) => {
        console.log(err)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })

}

// Most Search Location--- Kuldip
function mostSearchLocation(req) {
    return amdDao.mostSearchLocation().then((response) => {
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.success, response);
    }).catch((err) => {
        console.log(err)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Cancel Reservation--- Kuldip
function cancelReservation(req) {
    let query = {
        userId: req.params.userId,
        _id: req.params.bookingId,
        propertyId: req.params.propertyId
    }
    let update = {
        status: constants.BOOKINGSTATUS.CANCELLED,
        reason: req.body.reason
    }
    let userQuery = {
        _id: req.params.userId
    }
    return amdDao.updateBookings(query, update).then(async (response) => {
        let user = await amdDao.checkUserExist(userQuery)
        let propertyQuery = [{
            $match: {
                _id: mongoose.Types.ObjectId(req.params.propertyId)
            }
        }, {
            $lookup: {
                from: 'users',
                localField: "landlord",
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
                'name': 1,
                'landlordDetails.firstName': 1,
                'landlordDetails.emailId': 1
            }
        }]

        let accomodationDetails = await amdDao.getAccomodation(propertyQuery)

        if (user && accomodationDetails && accomodationDetails.length > 0) {
            let userMailQuery = {
                mailName: constants.EMAIL_TEMPLATES.TO_USER_BOOKING_CANCELLED_BY_USER,
                status: constants.STATUS.ACTIVE
            }
            let fromDate = new Date(response.fromDate).toDateString()
            let toDate = new Date(response.toDate).toDateString()

            let userTemplateDetail = await amdDao.getTemplateDetails(userMailQuery);
            if (userTemplateDetail) {
                let userObj = {
                    firstName: user.firstName,
                    emailId: user.emailId,
                    propertyName: accomodationDetails[0].name.en,
                    fromDate: fromDate,
                    toDate: toDate
                }
                mailHandler.SEND_MAIL(userObj, userTemplateDetail)
            }
            let landlordMailQuery = {
                mailName: constants.EMAIL_TEMPLATES.TO_LANDLORD_BOOKING_CANCELLED_BY_USER,
                status: constants.STATUS.ACTIVE
            }
            let landlordTemplateDetail = await amdDao.getTemplateDetails(landlordMailQuery);
            if (landlordTemplateDetail) {
                let landlordObj = {
                    firstName: accomodationDetails[0].landlordDetails.firstName,
                    emailId: accomodationDetails[0].landlordDetails.emailId,
                    propertyName: accomodationDetails[0].name.en,
                    fromDate: fromDate,
                    toDate: toDate
                }
                mailHandler.SEND_MAIL(landlordObj, landlordTemplateDetail)
            }
        }
        return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.bookingCancelled, response);
    }).catch((err) => {
        console.log(err)
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr);
    })
}

// Lock the property for some particular dates i.e., do not allow users to book
function addLockDates(req) {

    let landlordQuery = {
        _id: req.params.userId,
        role: constants.ROLE.LANDLORD,
        status: constants.STATUS.ACTIVE
    }

    let propertyQuery = {
        _id: req.params.propertyId,
        landlord: req.params.userId,
        status: constants.STATUS.ACTIVE
    }

    return Promise.all([amdDao.checkUserExist(landlordQuery), amdDao.getAccomodationDetails(propertyQuery)]).then((details) => {

        if (!details[0]) {

            return amdMapper.responseMapping(amdConstants.CODE.notFound, amdConstants.MESSAGE.UserNotFound)
        } else if (!details[1]) {

            return amdMapper.responseMapping(amdConstants.CODE.notFound, amdConstants.MESSAGE.accomodationNotFound)
        } else {

            let propertyDetails = details[1]
            let lockedDates = []

            if (propertyDetails.lockedDates && propertyDetails.lockedDates.length > 0) {
                lockedDates = propertyDetails.lockedDates
            }

            let updatedLockedDates = [...lockedDates, ...req.body.lockedDates];

            console.log("updatedLockedDates", updatedLockedDates)

            let updateObj = {
                lockedDates: updatedLockedDates
            }

            return amdDao.updateAccomodation(propertyQuery, updateObj).then((updated) => {

                if (updated) {

                    return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.DatesLockedSuccess, updated)
                } else {

                    console.log("Failed to add lock dates")
                    return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr)
                }
            }).catch((err) => {

                console.log({ err })
                return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr)
            })
        }
    }).catch((err) => {

        console.log({ err })
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr)
    })
}

// Get list of all locked dates
function getAllLockedDates(req) {

    let landlordQuery = {
        _id: req.params.userId,
        role: constants.ROLE.LANDLORD,
        status: constants.STATUS.ACTIVE
    }

    let propertyQuery = {
        _id: req.params.propertyId,
        landlord: req.params.userId,
        status: constants.STATUS.ACTIVE
    }

    return Promise.all([amdDao.checkUserExist(landlordQuery), amdDao.getAccomodationDetails(propertyQuery)]).then((details) => {

        if (!details[0]) {

            return amdMapper.responseMapping(amdConstants.CODE.notFound, amdConstants.MESSAGE.UserNotFound)
        } else if (!details[1]) {

            return amdMapper.responseMapping(amdConstants.CODE.notFound, amdConstants.MESSAGE.accomodationNotFound)
        } else {

            let propertyDetails = details[1]

            let lockedDates = propertyDetails.lockedDates
            return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.success, lockedDates)
        }
    }).catch((err) => {

        console.log({ err })
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr)
    })
}

// Unlock dates
function unlockDates(req) {

    let landlordQuery = {
        _id: req.params.userId,
        role: constants.ROLE.LANDLORD,
        status: constants.STATUS.ACTIVE
    }

    let propertyQuery = {
        _id: req.params.propertyId,
        landlord: req.params.userId,
        status: constants.STATUS.ACTIVE
    }

    return Promise.all([amdDao.checkUserExist(landlordQuery), amdDao.getAccomodationDetails(propertyQuery)]).then((details) => {

        if (!details[0]) {

            return amdMapper.responseMapping(amdConstants.CODE.notFound, amdConstants.MESSAGE.UserNotFound)
        } else if (!details[1]) {

            return amdMapper.responseMapping(amdConstants.CODE.notFound, amdConstants.MESSAGE.accomodationNotFound)
        } else {

            let updateObj = {}
            updateObj['$pull'] = {
                'lockedDates': {
                    '_id': { $in: req.body.lockedDates }
                }
            }

            return amdDao.unlockDates(propertyQuery, updateObj).then((datesUpdated) => {

                if (datesUpdated) {

                    return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.UnlockdatesSuccess, datesUpdated)
                } else {

                    console.log("Failed to unlock dates")
                    return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr)
                }

            }).catch((err) => {

                console.log({ err })
                return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr)
            })

        }
    }).catch((err) => {

        console.log({ err })
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr)
    })
}

// Update locked dates
function updateLockedDates(req) {

    let landlordQuery = {
        _id: req.params.userId,
        role: constants.ROLE.LANDLORD,
        status: constants.STATUS.ACTIVE
    }

    let propertyQuery = {
        _id: req.params.propertyId,
        landlord: req.params.userId,
        status: constants.STATUS.ACTIVE
    }

    return Promise.all([amdDao.checkUserExist(landlordQuery), amdDao.getAccomodationDetails(propertyQuery)]).then((details) => {

        if (!details[0]) {

            return amdMapper.responseMapping(amdConstants.CODE.notFound, amdConstants.MESSAGE.UserNotFound)
        } else if (!details[1]) {

            return amdMapper.responseMapping(amdConstants.CODE.notFound, amdConstants.MESSAGE.accomodationNotFound)
        } else {

            let propertyDetails = details[1]

            if (propertyDetails.lockedDates && propertyDetails.lockedDates.length > 0) {

                let lockedDates = propertyDetails.lockedDates
                // let dateObj = lockedDates.find(obj => obj._id.toString() == req.params.dateId.toString())

                let dateObjIndex = lockedDates.findIndex(obj => obj._id.toString() == req.params.dateId.toString());

                let dateObj = lockedDates[dateObjIndex]
                if (dateObj) {


                    dateObj.startDate = req.body.startDate
                    dateObj.endDate = req.body.endDate
                    lockedDates[dateObjIndex] = dateObj;

                    let updateObj = {
                        lockedDates: lockedDates
                    }
                    return amdDao.updateAccomodation(propertyQuery, updateObj).then((updated) => {

                        if (updated) {

                            return amdMapper.responseMappingWithData(amdConstants.CODE.ok, amdConstants.MESSAGE.LockedDatesUpdatedSuccess, updated)

                        } else {

                            console.log("Failed to update locked dates details")
                            return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr)

                        }
                    }).catch((err) => {

                        console.log({ err })
                        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr)
                    })

                } else {

                    return amdMapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.InvalidLockedDateDetails)
                }
            } else {

                return amdMapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.InvalidLockedDateDetails)
            }

        }
    }).catch((err) => {

        console.log({ err })
        return amdMapper.responseMapping(amdConstants.CODE.requiredField, amdConstants.MESSAGE.intrnlSrvrErr)
    })
}
module.exports = {
    addAccomodation,
    listAccomodation,
    getAccomodation,
    editAccomodation,
    deleteAccomodation,
    addReview,
    getAmenities,
    getCategory,
    getHomeCategory,
    getReviews,
    statusChangeAccomodation,
    getTopRatedHomeOffice,
    getTopRatedWorkPlace,
    newlyAdded,
    createBooking,
    approveBooking,
    rejectBooking,
    requestedBookingList,
    reservedBookingList,
    homePage,
    getTopRatedHomeOfficeHomePage,
    getTopRatedWorkPlaceHomePage,
    newlyAddedHomePage,
    dashboard,
    similarPlace,
    myListingMobile,
    searchnFilterHomeOffice,
    searchnFilterWorkPlace,
    viewBookingDetail,
    mostSearchLocation,
    cancelReservation,
    addLockDates,
    getAllLockedDates,
    unlockDates,
    updateLockedDates
}
