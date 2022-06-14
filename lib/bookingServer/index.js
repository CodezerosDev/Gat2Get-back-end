const dao = require('../admin/adminDao')
const async = require('async')
const constants = require('../constants')


async function updateBookingStatus() {

    console.log("BOOKING COMPLETED MONITORING STARTED")
    let aggQuery = [{
        $match: {
            status: constants.BOOKINGSTATUS.APPROVED
        }
    }]
    let bookings = await dao.getAllBookings(aggQuery);

    async.forEachLimit(bookings, 1, (obj, cb) => {

        // console.log({ obj })

        let fromDate = new Date(obj.fromDate)
        let toDate = new Date(obj.toDate)

        let currDate = new Date().setHours(24, 0, 0, 0)

        if (currDate > fromDate && currDate > toDate) {

            let query = {
                _id: obj._id
            }
            let bookingUpdateObj = {
                status: constants.BOOKINGSTATUS.COMPLETED
            }

            // add booking analytics

            let analyticsQuery = {
                type: constants.ANALYTICS.BOOKING,
                year: new Date(obj.fromDate).getFullYear(),
                month: new Date(obj.fromDate).getMonth() + 1
            }
            dao.getAnalytics(analyticsQuery).then((analytics) => {

                if (analytics) {

                    let qty = parseInt(analytics.qty)
                    qty += 1

                    let analyticsUpdateObj = {
                        qty: qty
                    }
                    dao.updateAnalytics(analyticsQuery, analyticsUpdateObj).then((analyticsUpdated) => {

                        console.log({ analyticsUpdated })

                        dao.updateBooking(query, bookingUpdateObj).then(updated => {

                            cb()

                        }).catch((err) => {
                            console.log({ err })
                            cb()
                        })
                    }).catch((err) => {

                        console.log({ err })
                        cb()
                    })
                } else {

                    let newObj = {
                        type: constants.ANALYTICS.BOOKING,
                        qty: 1,
                        year: new Date(obj.fromDate).getFullYear(),
                        month: new Date(obj.fromDate).getMonth() + 1
                    }
                    dao.createAnalytics(newObj).then((created) => {

                        console.log({ created })
                        dao.updateBooking(query, bookingUpdateObj).then(updated => {

                            cb()

                        }).catch((err) => {
                            console.log({ err })
                            cb()
                        })
                    }).catch((err) => {

                        console.log({ err })
                        cb()
                    })

                }
            }).catch((error) => {
                console.log(error)
                cb()
            })

        } else {
            cb()
        }

    })
}

async function updateBookingExpiryStatus() {

    console.log("BOOKING EXPIRY MONITORING STARTED")
    let aggQuery = [{
        $match: {
            status: constants.BOOKINGSTATUS.REQUESTED
        }
    }]
    let bookings = await dao.getAllBookings(aggQuery);

    async.forEachLimit(bookings, 1, (obj, cb) => {

        // console.log({ obj })

        let fromDate = new Date(obj.fromDate)

        let currDate = new Date().setHours(24, 0, 0, 0)

        if (currDate > fromDate) {

            let query = {
                _id: obj._id
            }
            let bookingUpdateObj = {
                status: constants.BOOKINGSTATUS.REQUEST_EXPIRED
            }

            // add booking analytics     

            dao.updateBooking(query, bookingUpdateObj).then(updated => {

                cb()

            }).catch((err) => {
                console.log({ err })
                cb()
            })

        } else {
            cb()
        }

    })
}

async function createUserAnalytics() {

    let aggQuery = [{
        $match: {
            role: constants.ROLE.USER
        }
    }]
    let users = await dao.getAllUsers(aggQuery);

    async.forEachLimit(users, 1, (obj, cb) => {

        // add booking analytics

        let analyticsQuery = {
            type: constants.ANALYTICS.USER,
            year: new Date(obj.createdAt).getFullYear(),
            month: new Date(obj.createdAt).getMonth() + 1
        }
        dao.getAnalytics(analyticsQuery).then((analytics) => {

            if (analytics) {

                let qty = parseInt(analytics.qty)
                qty += 1

                let analyticsUpdateObj = {
                    qty: qty
                }
                dao.updateAnalytics(analyticsQuery, analyticsUpdateObj).then((analyticsUpdated) => {

                    console.log({ analyticsUpdated })
                    cb()
                }).catch((err) => {

                    console.log({ err })
                    cb()
                })
            } else {

                let newObj = {
                    type: constants.ANALYTICS.USER,
                    qty: 1,
                    year: new Date(obj.createdAt).getFullYear(),
                    month: new Date(obj.createdAt).getMonth() + 1
                }
                dao.createAnalytics(newObj).then((created) => {

                    console.log({ created })
                    cb()
                }).catch((err) => {

                    console.log({ err })
                    cb()
                })

            }
        }).catch((error) => {
            console.log(error)
            cb()
        })
    })
}

async function createLandlordAnalytics() {

    let aggQuery = [{
        $match: {
            role: constants.ROLE.LANDLORD
        }
    }]
    let landlords = await dao.getAllUsers(aggQuery);

    async.forEachLimit(landlords, 1, (obj, cb) => {

        // add booking analytics

        let analyticsQuery = {
            type: constants.ANALYTICS.LANDLORD,
            year: new Date(obj.roleChangedAt).getFullYear(),
            month: new Date(obj.roleChangedAt).getMonth() + 1
        }
        dao.getAnalytics(analyticsQuery).then((analytics) => {

            if (analytics) {

                let qty = parseInt(analytics.qty)
                qty += 1

                let analyticsUpdateObj = {
                    qty: qty
                }
                dao.updateAnalytics(analyticsQuery, analyticsUpdateObj).then((analyticsUpdated) => {

                    console.log({ analyticsUpdated })
                    cb()
                }).catch((err) => {

                    console.log({ err })
                    cb()
                })
            } else {

                let newObj = {
                    type: constants.ANALYTICS.LANDLORD,
                    qty: 1,
                    year: new Date(obj.roleChangedAt).getFullYear(),
                    month: new Date(obj.roleChangedAt).getMonth() + 1
                }
                dao.createAnalytics(newObj).then((created) => {

                    console.log({ created })
                    cb()
                }).catch((err) => {

                    console.log({ err })
                    cb()
                })

            }
        }).catch((error) => {
            console.log(error)
            cb()
        })
    })
}
// setInterval(updateBookingStatus, 1000 * 60 * 60 * 24)
// setInterval(updateBookingExpiryStatus, 1000 * 60 * 60 * 24)


// updateBookingStatus()
// updateBookingExpiryStatus()
// createUserAnalytics()
// createLandlordAnalytics()