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
    new_password: 'New Password is Required'
}
const MESSAGE = {
    intrnlSrvrErr: "Please try after some time.",
    validToken: "Token is valid",
    UnauthorizedAccess: "Unauthorized access",
    TOKEN_NOT_PROVIDED: 'Please provide a valid authorization details',
    checkMailVerificationCode: "Verification Code Send on your Mail",
    wrongVerificationCode: "Sorry! wrong verification code",
    emailAlreadyExist: "Email Already Registered",
    codeVerified: "Code Verified Successfully",
    registrationSuccess: "User Registered Successfully",
    invalidEmailPattern: "Email Pattern is Invalid. Example: abc@example.com",
    passwordNotMatch: "Password Not Match",
    userNotExist: "Please provide valid credentials",
    loginSuccess: "Login Successfully",
    invalidLoginDetail: "Invalid Email-Id or Password. Please try again.",
    forgotPasswordLinkSent: "Forgot Password Link send on you Mail. Please check for further process",
    setNewPasswordSuccess: "New Passoword Set Successfully.",
    passwordNotSet: "Set New Password Failed. Please try again.",
    resetPasswordSuccess: "Password Changed Successfully.",
    invalidPassword: "Sorry! wrong password. Please try again.",
    updateSuccess: "Profile Updated Successfully",
    errorInUpdate: "Update Profile Failed. Please try again",
    getProfileSuccess: "Get User Detail Successfully",
    cardDetailAddSuccess: "Card Details Added Successfully",
    cardEditedSuccess: "Payment Method edited Successfully",
    pleaseSelectAddPrimary: "Unable to delete primary card",
    cardRemovedSuccess: "Card Details Removed",
    cardNotMatched: "Unable to remove Card.",
    getCardSuccess: "Get Card Details Successfully.",
    accountNotVerified: "Account is not Verified",
    logoutSuccess: "LoggedOut Successfully",
    getCMSSuccess: "Get CMS Page Successfully",
    documentRemovedSuccess: "Document Removed Successfully",
    addedFavoriteSuccess: "Added in Favorite Successfully",
    unableToAdd: "Unable to add in Favorite Please try again.",
    removeFavoriteSuccess: "Removed from Favorite Successfully",
    unableToRemove: "Unable to remove from Favorite Please try again.",
    getFavoriteSuccess: "Get Favorite List Successfully",
    registrationRemain: "Please complete your registration process",
    getReviewsSuccess: "Get Reviews Successfully",
    contactUsSuccess: "ContactUs message sent Successfully",
    noDocAvail: "no Document available",
    inviteFriends: "Invitation Sent Successfully",
    unableToAddCard: "Unable to add primary card",
    getBookingSuccess: "Get Booking Successfully",
    addDocumentSuccess: "Document Added Successfully",
    editdDocumentSuccess: "Document Edited Successfully",
    success: "Success",
    invalidDetails: "Please provide valid details",
    NotificationStatusUpdated: "Notifications marked as read",
    InvalidBankDetails: "Please provide valid bank details",
    InvalidContactNumber: "Your contact number is invalid. Please provide valid contact number in your account details",
    AppleIdAlreadyExists: 'Apple user already exists'
}
module.exports = {
    CODE,
    MESSAGE,
    REQUIREDFIELDS
}