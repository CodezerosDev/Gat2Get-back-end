const amdRouter = require("express").Router();
const amdFacade = require('./accomodationFacade');
const userValidation = require('../user/userValidators');
const amdConstants = require('./accomodationConstants');
const mapper = require('./accomodationMapper');
const amdValidation = require('./accomodationValidators');

// Add Accomodation --- Kuldip
amdRouter.route('/addAccomodation/:userId').post([userValidation.verifyUsrToken, amdValidation.addAccomodation], (req, res) => {
    amdFacade.addAccomodation(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// List Accomodation --- Kuldip
amdRouter.route('/listAccomodation/:userId/:page').get([userValidation.verifyUsrToken], (req, res) => {
    amdFacade.listAccomodation(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Get Accomodation --- Kuldip
amdRouter.route('/getAmd/:propertyId').get((req, res) => {
    amdFacade.getAccomodation(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Get Accomodation using Login --- Kuldip
amdRouter.route('/getAccomodation/:userId/:propertyId').get([userValidation.verifyUsrToken], (req, res) => {
    amdFacade.getAccomodation(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Edit Accomodation --- Kuldip
amdRouter.route('/editAccomodation/:userId/:propertyId').post([userValidation.verifyUsrToken, amdValidation.addAccomodation], (req, res) => {
    amdFacade.editAccomodation(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Delete Accomodation --- Kuldip
amdRouter.route('/deleteAccomodation/:userId/:propertyId').get([userValidation.verifyUsrToken], (req, res) => {
    amdFacade.deleteAccomodation(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Status Change Accomodation --- Kuldip
amdRouter.route('/statusChangeAccomodation/:userId/:propertyId').get([userValidation.verifyUsrToken], (req, res) => {
    amdFacade.statusChangeAccomodation(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Add Review & Ratings --- Kuldip
amdRouter.route('/addReview/:userId/:propertyId').post([userValidation.verifyUsrToken, amdValidation.addReviews], (req, res) => {
    amdFacade.addReview(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Get Amenities --- Kuldip
amdRouter.route('/getAmenities').post((req, res) => {
    amdFacade.getAmenities(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Get Category --- Kuldip
amdRouter.route('/getCategory/:type').get((req, res) => {
    amdFacade.getCategory(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

amdRouter.route('/getCategorys/:type/:page').post((req, res) => {
    amdFacade.getHomeCategory(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Get Reviews --- Kuldip
amdRouter.route('/getReviews/:propertyId').get((req, res) => {
    amdFacade.getReviews(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Get Top Rated Home Office --- Kuldip
amdRouter.route('/getTopRatedHomeOffice/:page').post((req, res) => {
    amdFacade.getTopRatedHomeOffice(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Get Top Rated Work Place --- Kuldip
amdRouter.route('/getTopRatedWorkPlace/:page').post((req, res) => {
    amdFacade.getTopRatedWorkPlace(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Newly Added --- Kuldip
amdRouter.route('/newlyAdded/:page').get((req, res) => {
    amdFacade.newlyAdded(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Create Booking --- Kuldip
amdRouter.route('/createBooking/:userId/:propertyId').post([userValidation.verifyUsrToken], (req, res) => {
    amdFacade.createBooking(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Approve Booking --- Kuldip
amdRouter.route('/approveBooking/:userId/:propertyId/:bookingId/:bookingUserId').get([userValidation.verifyUsrToken], (req, res) => {
    amdFacade.approveBooking(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Reject Booking --- Kuldip
amdRouter.route('/rejectBooking/:userId/:propertyId/:bookingId/:bookingUserId').post([userValidation.verifyUsrToken], (req, res) => {
    amdFacade.rejectBooking(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Requested Booking List --- Kuldip
amdRouter.route('/requestedBookingList/:userId/:page').post([userValidation.verifyUsrToken], (req, res) => {
    amdFacade.requestedBookingList(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Reserved Booking List --- Kuldip
amdRouter.route('/reservedBookingList/:userId/:page').post([userValidation.verifyUsrToken], (req, res) => {
    amdFacade.reservedBookingList(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Home Page Mobile --- Kuldip
amdRouter.route('/homePage').post((req, res) => {
    amdFacade.homePage(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Get Top Rated Home Office --- Kuldip
amdRouter.route('/getTopRatedHomeOfficeHomePage').post((req, res) => {
    amdFacade.getTopRatedHomeOfficeHomePage(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Get Top Rated Work Place --- Kuldip
amdRouter.route('/getTopRatedWorkPlaceHomePage').post((req, res) => {
    amdFacade.getTopRatedWorkPlaceHomePage(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Newly Added --- Kuldip
amdRouter.route('/newlyAddedHomePage').get((req, res) => {
    amdFacade.newlyAddedHomePage(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Dashboard --- Kuldip
amdRouter.route('/dashboard/:userId').get([userValidation.verifyUsrToken], (req, res) => {
    amdFacade.dashboard(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Similar Place --- Kuldip
amdRouter.route('/similarPlace/:type/:city/:propertyId').post((req, res) => {
    amdFacade.similarPlace(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// My Listing Mobile --- Kuldip
amdRouter.route('/myListingMobile/:userId').get([userValidation.verifyUsrToken], (req, res) => {
    amdFacade.myListingMobile(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Search & Filter Home Office--- Kuldip
amdRouter.route('/searchnFilterHomeOffice/:page').post((req, res) => {
    amdFacade.searchnFilterHomeOffice(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Search & Filter Work Place--- Kuldip
amdRouter.route('/searchnFilterWorkPlace/:page').post((req, res) => {
    amdFacade.searchnFilterWorkPlace(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// View Booking Detail--- Kuldip
amdRouter.route('/viewBookingDetail/:userId/:bookingId').get([userValidation.verifyUsrToken], (req, res) => {
    amdFacade.viewBookingDetail(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Most Search Location--- Kuldip
amdRouter.route('/mostSearchLocation').get((req, res) => {
    amdFacade.mostSearchLocation(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Cancel Reservation--- Kuldip
amdRouter.route('/cancelReservation/:userId/:bookingId/:propertyId').post([userValidation.verifyUsrToken], (req, res) => {
    amdFacade.cancelReservation(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

amdRouter.route('/addLockDates/:userId/:propertyId').post([userValidation.verifyUsrToken, amdValidation.validateLockDateRequest], (req, res) => {
    amdFacade.addLockDates(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

amdRouter.route('/getAllLockedDates/:userId/:propertyId').get([userValidation.verifyUsrToken], (req, res) => {
    amdFacade.getAllLockedDates(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

amdRouter.route('/unlockDates/:userId/:propertyId').put([userValidation.verifyUsrToken, amdValidation.validateUnlockDatesRequest], (req, res) => {
    amdFacade.unlockDates(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});

amdRouter.route('/updateLockedDates/:userId/:propertyId/:dateId').put([userValidation.verifyUsrToken, amdValidation.validateUpdateLockDatesRequest], (req, res) => {
    amdFacade.updateLockedDates(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(amdConstants.CODE.badrequest, amdConstants.MESSAGE.intrnlSrvrErr))
    });
});
module.exports = amdRouter