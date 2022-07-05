/**
 * @author Kavya Patel
 */

let messages = {
    InvalidCredentials: 'Please provide valid credentials and try again',
    internalServerError: 'Internal server error. Please try after some time.',
    InvalidDetails: 'Please provide valid details.',
    Success: 'Success',
    TOKEN_NOT_PROVIDED: 'Please provide a valid authorization details',
    SocialAccAddSuccess: "Your social account has been added successfully",
    userUpdatedSuccess: "User updated successfully",
    InvalidEmailId: "Account doesn't exists with this email id",
    InvalidPassword: 'Please provide valid password',
    LoginSuccess: 'Login successful',
    ProfileUpdated: 'Profile updated successfully',
    ResetPasswordMailSent: 'Please reset your password using the link provided in your mail',
    PasswordUpdateSuccess: "Password reset successful",
    ResetPasswordLinkExpired: "Your reset password link is expired",
    OldEmailVerification: 'Verification code that has been sent to your registered email id',
    InvalidVerificationCode: 'Please provide a valid verification code',
    EmailAlreadyExists: 'Email id already exists',
    EmailResetSuccessful: 'Email id updated successfully',
    CMSPageAlreadyExists: 'CMS Page already exists',
    CMSPageCreatedSuccess: 'CMS Page added successfully',
    CMSPageNotFound: "CMS page doesn't exists",
    CMSPageUpdatedSuccess: 'CMS page updated successfully',
    CMSPageActivated: 'CMS page activated successfully',
    CMSPageDeactivated: 'CMS page deactivated successfully',
    LanguageAlreadyExists: 'Language is already added',
    LanguageAddedSuccess: 'Language added successfully',
    LanguageNotFound: "Language doesn't exists",
    LanguageUpdatedSuccess: 'Language updated successfully',
    LanguageActivated: 'Language activated successfully',
    LanguageDeactivated: 'Language deactivated successfully',
    CategoryAlreadyExists: 'Category is already added',
    CategoryCreatedSuccess: 'Category added successfully',
    CategoryNotFound: "Category doesn't exists",
    CategoryUpdatedSuccess: "Category updated successfully",
    CategoryActivated: 'Category activated successfully',
    CategoryDeactivated: 'Category deactivated successfully',
    UserNotFound: 'Please provide valid user details',
    UserAlreadyExists: 'Account with the same credentials already exists',
    UserCreatedSuccess: 'User added successfully',
    TemplateAlreadyExists: 'Template with the same name already exists',
    TemplateCreatedSuccess: 'Template created successfully',
    TemplateNotFound: "Template does not exists",
    TemplateUpdated: 'Template updated successfully',
    TemplateActivated: 'Template activated successfully',
    TemplateDeactivated: 'Template deactivated successfully',
    UserActivated: 'User activated successfully',
    UserDeactivated: 'User deactivated successfully',
    AmenitiesAlreadyExists: 'Amenities category is already been created',
    AmenitiesCreatedSuccess: 'Amenities created successfully',
    AmenitiesNotFound: 'Please provide valid amenities details',
    AmenitiesAdded: 'Amenities added successfully',
    AmenitiesUpdated: 'Amenities updated successfully',
    AmenitiesActivated: 'Amenities activated successfully',
    AmenitiesDeactivated: 'Amenities deactivated successfully',
    AmenitiesRemoved: 'Amenities removed successfully',
    LandlordKYCUpdated: 'Landlord KYC verification updated successfully',
    AccomodationNotFound: 'Please provide valid accomodation details',
    AccomodationVerificationUpdated: 'Accomodation verification updated successfully',
    AccomodationUpdatedSuccess: 'Accomodation updated successfully',
    AccomodationActivated: 'Accomodation activated successfully',
    AccomodationDeactivated: 'Accomodation deactivated successfully',
    SupportQueryNotFound: 'Please provide valid support query reference',
    SupportQueryReplySent: 'Reply sent successfully',
    SupportQueryOpened: 'Support query opened successfully',
    SupportQueryClosed: 'Support query closed successfully',
    ServiceFeeSetSuccess: 'Service fee set successfully',
    NotificationStatusUpdated: 'Notifications marked as read',
    BookingNotFound: 'Please provide valid booking details',
    PropertyNotFound: 'Please provide valid property details',
    RefundSuccess: 'Payment refunded successfully',
    PaymentReleasedSuccess: 'Payment released to landlord successfully',
    AccountIdNotAdded: "Landlord has not updated bank details",
    TaxAlreadyExists: "Tax rates are already been added for this country. Please try updating it",
    TaxAddedSuccess: "Tax rate added successfully",
    InvalidTaxDetails: "Please provide valid tax details",
    TaxUpdatedSuccess: "Tax rate updated successfully",
    TaxDeletedSuccess: "Tax rate deleted successfully",
    InvitationLinkAlreadyCreated: "Invitation link is already been added. Please try updating it",
    InvitationLinkCreated: "Invitation link added successfully",
    InvitationLinkNotFound: "Please provide valid invitation link details",
    InvitationLinkUpdated: "Invitation link updated successfully",
    InvitationLinkActivated: "Invitation link activated successfully",
    InvitationLinkDeactivated: "Invitation link deactivated successfully"
}

let codes = {
    FRBDN: 403,
    INTRNLSRVR: 500,
    Success: 200,
    DataNotFound: 404,
    BadRequest: 400,
}

module.exports = {
    CODE: codes,
    MESSAGE: messages
}