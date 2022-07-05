const STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE"
}

const CONTACTUSSTATUS = {
    OPEN: "OPEN",
    CLOSE: "CLOSE"
}

const DB_MODEL_REF = {
    USER: 'users',
    ACCOMODATION: 'accomodations',
    EMAILTEMPLATES: 'emailtemplates',
    CATEGORIES: 'categories',
    AMENITIES: 'amenities',
    LANGUAGES: 'languages',
    CMS_PAGES: 'cmspages',
    REVIEW: 'reviews',
    CONTACTUS: 'contactUs',
    BOOKING: 'bookings',
    NOTIFICATIONS: 'notifications',
    SEARCHES: 'searches',
    ROOMS: 'rooms',
    CHATS: 'chats',
    ANALYTICS: 'analytics',
    TAX: 'taxes',
    INVITATION_LINKS: 'invitationlinks',
    APPLE_USER: 'appleUsers'
}

let BOOKINGSTATUS = {
    REQUESTED: "REQUESTED",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED",
    COMPLETED: "COMPLETED",
    PAYMENT_RELEASED: "PAYMENT_RELEASED",
    PAYMENT_REFUNDED: "PAYMENT_REFUNDED",
    REQUEST_EXPIRED: "REQUEST_EXPIRED"
}

let CHATTYPE = {
    TEXT: "TEXT",
    EMOJI: "EMOJI",
    FILE: "FILE"
}

let ROOMSTATUS = {
    ONE2ONE: "ONE2ONE",
    GROUP: "GROUP"
}

const LOGIN_TYPE = {
    NORMAL: 'NORMAL',
    SOCIAL: 'SOCIAL',
    GOOGLE: 'GOOGLE'
}

const MESSAGES = {
    intrnlSrvrErr: "Please try after some time.",
    unAuthAccess: "Unauthorized access ",
    tokenGenError: "Error while generating access token",
    invalidEmail: "Please fill valid Email Address",
    invalidMobile: "Please fill valid Mobile No",
    blockedMobile: "Action Blocked for Illegal use of Services.",
    invalidOtp: "Invalid OTP",
    nameCantEmpty: "Name can't be empty",
    invalidZipcode: "please fill valid zip Code",
    invalidNum: "Please fill valid phone number or Do not add country code",
    passCantEmpty: "Password can't be empty",
    validationError: "Validation errors",
    incorrectPass: "Invalid email or passoword",
    userNotFound: "User not found.",
    accessTokenCantEmpty: "Access token cannot be empty",
    tokenSecretCantEmpty: "Secret token cannot be empty",
    incorrectTwToken: "Sorry, we could not contact twitter with the provided token",
    deviceIdCantEmpty: "Device id cannot be empty",
    platformCantEmpty: "Platform cannot be empty or invalid",
    fcmTokenCantEmpty: "Device token cannot be empty",
    ACCOUNT_DEACTIVATED: "Your account is suspended, please contact the SHiNE admin: vishalrana9915@gmail.com.",

};

const ROLE = {
    ADMIN: 'ADMIN',
    USER: 'USER',
    LANDLORD: 'LANDLORD'
}

const ACCOMODATIONS = {
    HOME_OFFICE: 'HOME_OFFICE',
    WORKPLACE: 'WORKPLACE'
}

const CMS = {
    TERMSANDCONDITIONS: 'TERMSANDCONDITIONS',
    PRIVACYPOLICY: 'PRIVACYPOLICY',
    ABOUTUS: 'ABOUTUS',
    HOWWEWORK: 'HOWWEWORK',
    TRUSTANDSAFETY: 'TRUSTANDSAFETY',
    CANCELLATIONPOLICY: 'CANCELLATIONPOLICY'
}

const LANGUAGES = {
    ENGLISH: 'ENGLISH',
    SPANISH: 'SPANISH',
    PORTUGUESE: 'PORTUGUESE'
}

const CODE = {
    FRBDN: 403,
    INTRNLSRVR: 500,
    Success: 200,
    DataNotFound: 404,
    BadRequest: 400,
}

const SPACEAVAILABILITY = {
    HOURLY: 'HOURLY',
    DAILY: 'DAILY',
    MONTHLY: 'MONTHLY'
}

const TYPE = {
    FILE: 'FILE',
    TEXT: 'TEXT'
}

const EMAIL_TEMPLATES = {

    'USER_VERIFICATION_CODE': 'USER_VERIFICATION_CODE',
    'ADMIN_NEW_LANDLORD': 'ADMIN_NEW_LANDLORD',
    'LANDLORD_REGISTER': 'LANDLORD_REGISTER',
    'LANDLORD_APPROVED': 'LANDLORD_APPROVED',
    'LANDLORD_REJECTED': 'LANDLORD_REJECTED',
    'ADMIN_FORGOT_PASSWORD': 'ADMIN_FORGOT_PASSWORD',
    'RESET_PASSWORD': 'RESET_PASSWORD',
    'ADMIN_UPDATE_EMAIL_VERIFICATION': 'ADMIN_UPDATE_EMAIL_VERIFICATION',
    'USER_FORGOT_PASSWORD': 'USER_FORGOT_PASSWORD',
    'NEW_ACCOMODATION_REQUEST': 'NEW_ACCOMODATION_REQUEST',
    'ACCOMODATION_APPROVED': 'ACCOMODATION_APPROVED',
    'ACCOMODATION_REJECTED': 'ACCOMODATION_REJECTED',
    'SUPPORT_QUERY_REPLY': 'SUPPORT_QUERY_REPLY',
    'INVITE_FRIENDS': 'INVITE_FRIENDS',
    'TO_LANDLORD_NEW_BOOKING_REQUEST_BY_USER': 'TO_LANDLORD_NEW_BOOKING_REQUEST_BY_USER',
    'TO_USER_NEW_BOOKING_REQUEST_BY_USER': 'TO_USER_NEW_BOOKING_REQUEST_BY_USER',
    "NOTIFY_USER_BOOKING_APPROVED_BY_LANDLORD": "NOTIFY_USER_BOOKING_APPROVED_BY_LANDLORD",
    "NOTIFY_USER_BOOKING_REJECTED_BY_LANDLORD": "NOTIFY_USER_BOOKING_REJECTED_BY_LANDLORD",
    "NOTIFY_LANDLORD_ACCOMODATION_APPROVED_BY_ADMIN": "NOTIFY_LANDLORD_ACCOMODATION_APPROVED_BY_ADMIN",
    "NOTIFY_LANDLORD_ACCOMODATION_REJECTED_BY_ADMIN": "NOTIFY_LANDLORD_ACCOMODATION_REJECTED_BY_ADMIN",
    "NOTIFY_NEW_BOOKING_REQUEST_BY_USER": "NOTIFY_NEW_BOOKING_REQUEST_BY_USER",
    "NOTIFY_REVIEW_RATINGS_BY_USER": "NOTIFY_REVIEW_RATINGS_BY_USER",
    "NOTIFY_NEW_ACCOMODATION_REQUEST_BY_LANDLORD": "NOTIFY_NEW_ACCOMODATION_REQUEST_BY_LANDLORD",
    "PAYMENT_REFUNDED": "PAYMENT_REFUNDED",
    "NOTIFY_NEW_MESSAGE_RECEIVED": "NOTIFY_NEW_MESSAGE_RECEIVED",
    "BOOKING_APPROVED_BY_LANDLORD": "BOOKING_APPROVED_BY_LANDLORD",
    "BOOKING_REJECTED_BY_LANDLORD": "BOOKING_REJECTED_BY_LANDLORD",
    "TO_USER_BOOKING_CANCELLED_BY_USER": "TO_USER_BOOKING_CANCELLED_BY_USER",
    "TO_LANDLORD_BOOKING_CANCELLED_BY_USER": "TO_LANDLORD_BOOKING_CANCELLED_BY_USER",
    "PAYOUT_SETTLED": "PAYOUT_SETTLED"
}

const TEMPLATE_ENTITIES = [{
    'templateName': 'USER_VERIFICATION_CODE',
    'templateEntities': ['firstName', 'verificationCode']
}, {
    'templateName': 'ADMIN_NEW_LANDLORD',
    'templateEntities': ['firstName', 'landlordName']
}, {
    'templateName': 'LANDLORD_REGISTER',
    'templateEntities': ['firstName']
}, {
    'templateName': 'LANDLORD_APPROVED',
    'templateEntities': ['firstName']
}, {
    'templateName': 'LANDLORD_REJECTED',
    'templateEntities': ['firstName', 'reason']
}, {
    'templateName': 'ADMIN_FORGOT_PASSWORD',
    'templateEntities': ['firstName', 'redisId']
}, {
    'templateName': 'RESET_PASSWORD',
    'templateEntities': ['firstName']
}, {
    'templateName': 'ADMIN_UPDATE_EMAIL_VERIFICATION',
    'templateEntities': ['firstName', 'redisId']
}, {
    'templateName': 'USER_FORGOT_PASSWORD',
    'templateEntities': ['firstName', 'verificationCode']
}, {
    'templateName': 'NEW_ACCOMODATION_REQUEST',
    'templateEntities': ['firstName', 'name', 'type', 'city', 'country']
}, {
    'templateName': 'ACCOMODATION_APPROVED',
    'templateEntities': ['firstName', 'name']
}, {
    'templateName': 'ACCOMODATION_REJECTED',
    'templateEntities': ['firstName', 'name', 'reason']
}, {
    'templateName': 'SUPPORT_QUERY_REPLY',
    'templateEntities': ['name', 'query', 'reply']
}, {
    'templateName': 'NOTIFY_USER_BOOKING_APPROVED_BY_LANDLORD',
    'templateEntities': ['name', 'date']
}, {
    'templateName': 'NOTIFY_USER_BOOKING_REJECTED_BY_LANDLORD',
    'templateEntities': ['name']
}, {
    'templateName': 'NOTIFY_LANDLORD_ACCOMODATION_APPROVED_BY_ADMIN',
    'templateEntities': ['name']
}, {
    'templateName': 'NOTIFY_LANDLORD_ACCOMODATION_REJECTED_BY_ADMIN',
    'templateEntities': ['name']
}, {
    'templateName': 'NOTIFY_NEW_BOOKING_REQUEST_BY_USER',
    'templateEntities': ['firstName', 'lastName', 'name', 'date']
}, {
    'templateName': 'NOTIFY_REVIEW_RATINGS_BY_USER',
    'templateEntities': ['firstName', 'lastName', 'name']
}, {
    'templateName': 'NOTIFY_NEW_ACCOMODATION_REQUEST_BY_LANDLORD',
    'templateEntities': ['firstName', 'lastName', 'name']
}, {
    'templateName': 'PAYMENT_REFUNDED',
    'templateEntities': ['firstName', 'lastName', 'propertyName', 'fromDate', 'toDate']
}, {
    'templateName': 'NOTIFY_NEW_MESSAGE_RECEIVED',
    'templateEntities': ['firstName', 'lastName']
}, {
    'templateName': 'BOOKING_APPROVED_BY_LANDLORD',
    'templateEntities': ['firstName', 'propertyName', 'fromDate', 'toDate']
}, {
    'templateName': 'BOOKING_REJECTED_BY_LANDLORD',
    'templateEntities': ['firstName', 'propertyName', 'fromDate', 'toDate']
}, {
    'templateName': 'TO_USER_BOOKING_CANCELLED_BY_USER',
    'templateEntities': ['firstName', 'propertyName', 'fromDate', 'toDate']
}, {
    'templateName': 'TO_LANDLORD_BOOKING_CANCELLED_BY_USER',
    'templateEntities': ['firstName', 'propertyName', 'fromDate', 'toDate']
}, {
    'templateName': 'PAYOUT_SETTLED',
    'templateEntities': ['firstName', 'currency', 'amount']
}, {
    'templateName': 'INVITE_FRIENDS',
    'templateEntities': []
}, {
    'templateName': 'TO_LANDLORD_NEW_BOOKING_REQUEST_BY_USER',
    'templateEntities': ['firstName', 'propertyName', 'fromDate', 'toDate']
}, {
    'templateName': 'TO_USER_NEW_BOOKING_REQUEST_BY_USER',
    'templateEntities': ['firstName', 'propertyName', 'fromDate', 'toDate']
}]

const TEMPLATE_TYPES = {
    'EMAIL': 'EMAIL',
    'NOTIFICATION': 'NOTIFICATION'
}

const NOTIFICATION_CATEGORIES = {
    'CHAT': 'CHAT',
    'BOOKING_APPROVED': 'BOOKING_APPROVED',
    'BOOKING_REJECTED': 'BOOKING_REJECTED',
    'BOOKING_REQUESTED': 'BOOKING_REQUESTED',
    'ACCOMODATION': 'ACCOMODATION',
    'REVIEW_RATINGS': 'REVIEW_RATINGS'
}

const PUSH_NOTIFICATION_CATEGORIES = {
    'NEW_DEVICE_LOGIN': 'NEW_DEVICE_LOGIN',
    'BOOKING_REQUEST_RECEIVED': 'BOOKING_REQUEST_RECEIVED',
    'BOOKING_APPROVED': 'BOOKING_APPROVED',
    'BOOKING_REJECTED': 'BOOKING_REJECTED',
    'REVIEW_RATINGS': 'REVIEW_RATINGS',
    'CHAT': 'CHAT',
}

const ANALYTICS = {
    'USER': 'USER',
    'LANDLORD': 'LANDLORD',
    'BOOKING': 'BOOKING'
}

const TAX_TYPES = {
    COUNTRY: 'COUNTRY',
    STATE: 'STATE'
}

const INVITATION_LINK_TYPES = {
    WEB: 'WEB',
    ANDROID: 'ANDROID',
    IOS: 'IOS'
}
module.exports = Object.freeze({

    APP_NAME: 'Gat@Get',

    TOKEN_EXPIRATION_TIME: 24 * 60, // in mins - 60

    DB_MODEL_REF,

    LOGIN_TYPE,

    MESSAGES,

    STATUS,

    ROLE,

    CONTACTUSSTATUS,

    ACCOMODATIONS,

    CMS,

    LANGUAGES,

    BOOKINGSTATUS,

    SPACEAVAILABILITY,

    TYPE,

    EMAIL_TEMPLATES,

    CODE,

    TEMPLATE_ENTITIES,

    TEMPLATE_TYPES,

    CHATTYPE,

    ROOMSTATUS,

    NOTIFICATION_CATEGORIES,

    PUSH_NOTIFICATION_CATEGORIES,

    ANALYTICS,

    TAX_TYPES,

    INVITATION_LINK_TYPES
});