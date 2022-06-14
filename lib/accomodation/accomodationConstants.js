const CODE = {
    requiredField: 500,
    ok: 200,
    badrequest: 400,
    Unauthorized: 401,
    forbiddenRequest: 403,
    notFound: 404
}

const REQUIREDFIELDS = {
    email: 'Email-Id is Required.',
    firstName: 'Firstname  is Required.',
    lastName: 'Lastname is Required.',
    contactNumber: 'Contact Number is Required.',
    password: 'Password is Required.',
    confirmPassword: 'Confirm Password is Required.',
    code: 'Verification-Code is Required',
    old_password: 'Old Password is Required',
    new_password: 'New Password is Required',
    type: 'Type is Required',
    name: 'Name is Required',
    spaceAvailability: 'Space Availibility is Required',
    spaceReadyIn: 'Space Ready in hours is Required',
    category: 'Category is Required',
    address: 'Address is Required',
    description: 'Description is Required',
    media: 'Photos is Required',
    ratings: 'Ratings is required'
}
const MESSAGE = {
    intrnlSrvrErr: "Please try after some time.",
    addedSuccess: "Accomodation Added Successfully",
    getListSuccess: "Get Property Listing Successfully",
    getAmdSuccess: "Get Accomodation Detail Successfully",
    deleteSuccess: "Accomodation Deleted Successfully",
    updateSuccess: "Accomodation Updated Successfully",
    addReviewSuccess: "Review Added Successfully",
    getAmenitiesSuccess: "Get Amenities Successfully",
    getCategorySuccess: "Get Category Successfully",
    bookRequestedSuccess: "Booking Requested Successfully",
    bookApprovedSuccess: "Booking Approved Successfully",
    bookRejectedSuccess: "Booking Rejected Successfully",
    getRequestedSuccess: "Get Requested Bookings Successfully",
    getReservedSuccess: "Get Reserved Bookings Successfully",
    getTopRatedHomeOfficeSuccess: "Get Top Rated Home Office Successfully",
    getTopRatedWorkPlaceSuccess: "Get Top Rated Workplace Successfully",
    getNewlyAddedSuccess: "Get Newly added Successfully",
    success: "Success",
    getSimilarAmdSuccess: "Get Similar Place Successfully",
    bookingCancelled: "Booking Cancelled Successfully",
    UserNotFound: 'Please provide valid user details',
    accomodationNotFound: "Please provide valid accomodation details",
    DatesLockedSuccess: "Dates locked successfully",
    UnlockdatesSuccess: "Dates unlocked succesfully",
    InvalidLockedDateDetails: "Please provide valid locked date details",
    LockedDatesUpdatedSuccess: "Dates updated successfully"
}
module.exports = {
    CODE,
    MESSAGE,
    REQUIREDFIELDS
}