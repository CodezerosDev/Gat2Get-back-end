const amdService = require('./accomodationService');

// Add Aaccomodation --- Kuldip
function addAccomodation(req) {
    return amdService.addAccomodation(req).then((result) => result)
}

// List Aaccomodation --- Kuldip
function listAccomodation(req) {
    return amdService.listAccomodation(req).then((result) => result)
}

// Get Aaccomodation --- Kuldip
function getAccomodation(req) {
    return amdService.getAccomodation(req).then((result) => result)
}

// Edit Aaccomodation --- Kuldip
function editAccomodation(req) {
    return amdService.editAccomodation(req).then((result) => result)
}

// Delete Aaccomodation --- Kuldip
function deleteAccomodation(req) {
    return amdService.deleteAccomodation(req).then((result) => result)
}

// Status Change Aaccomodation --- Kuldip
function statusChangeAccomodation(req) {
    return amdService.statusChangeAccomodation(req).then((result) => result)
}

// Add Review --- Kuldip
function addReview(req) {
    return amdService.addReview(req).then((result) => result)
}

// Get Amenities --- Kuldip
function getAmenities(req) {
    return amdService.getAmenities(req).then((result) => result)
}

// Get Category --- Kuldip
function getCategory(req) {
    return amdService.getCategory(req).then((result) => result)
}

// Get Reviews --- Kuldip
function getReviews(req) {
    return amdService.getReviews(req).then((result) => result)
}

// Get Top Rated Home Office --- Kuldip
function getTopRatedHomeOffice(req) {
    return amdService.getTopRatedHomeOffice(req).then((result) => result)
}

// Get Top Rated Work Place --- Kuldip
function getTopRatedWorkPlace(req) {
    return amdService.getTopRatedWorkPlace(req).then((result) => result)
}

// Newly Added --- Kuldip
function newlyAdded(req) {
    return amdService.newlyAdded(req).then((result) => result)
}

// Create Booking --- Kuldip
function createBooking(req) {
    return amdService.createBooking(req).then((result) => result)
}

// Approve Booking --- Kuldip
function approveBooking(req) {
    return amdService.approveBooking(req).then((result) => result)
}

// Reject Booking --- Kuldip
function rejectBooking(req) {
    return amdService.rejectBooking(req).then((result) => result)
}

// Requested Booking List  --- Kuldip
function requestedBookingList(req) {
    return amdService.requestedBookingList(req).then((result) => result)
}

// Reserved Booking List  --- Kuldip
function reservedBookingList(req) {
    return amdService.reservedBookingList(req).then((result) => result)
}

// Home Page Mobile  --- Kuldip
function homePage(req) {
    return amdService.homePage(req).then((result) => result)
}

// Get Top Rated Home Office --- Kuldip
function getTopRatedHomeOfficeHomePage(req) {
    return amdService.getTopRatedHomeOfficeHomePage(req).then((result) => result)
}

// Get Top Rated Work Place --- Kuldip
function getTopRatedWorkPlaceHomePage(req) {
    return amdService.getTopRatedWorkPlaceHomePage(req).then((result) => result)
}

// Newly Added --- Kuldip
function newlyAddedHomePage(req) {
    return amdService.newlyAddedHomePage(req).then((result) => result)
}

// Dashboard --- Kuldip
function dashboard(req) {
    return amdService.dashboard(req).then((result) => result)
}

// Similar Place --- Kuldip
function similarPlace(req) {
    return amdService.similarPlace(req).then((result) => result)
}

// My Listing Mobile --- Kuldip
function myListingMobile(req) {
    return amdService.myListingMobile(req).then((result) => result)
}

// Search & Filter Home Office--- Kuldip
function searchnFilterHomeOffice(req) {
    return amdService.searchnFilterHomeOffice(req).then((result) => result)
}

// Search & Filter Work Place--- Kuldip
function searchnFilterWorkPlace(req) {
    return amdService.searchnFilterWorkPlace(req).then((result) => result)
}

// View Booking Detail--- Kuldip
function viewBookingDetail(req) {
    return amdService.viewBookingDetail(req).then((result) => result)
}

// Most Search Location--- Kuldip
function mostSearchLocation(req) {
    return amdService.mostSearchLocation(req).then((result) => result)
}

// Cancel Reservation--- Kuldip
function cancelReservation(req) {
    return amdService.cancelReservation(req).then((result) => result)
}

// Lock the property for some particular dates i.e., do not allow users to book
function addLockDates(req) {
    return amdService.addLockDates(req).then(result => result)
}

// Get list of all locked dates
function getAllLockedDates(req) {
    return amdService.getAllLockedDates(req).then(result => result)
}

// Get list of all locked dates
function unlockDates(req) {
    return amdService.unlockDates(req).then(result => result)
}

// Update locked dates
function updateLockedDates(req) {
    return amdService.updateLockedDates(req).then(result => result)
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