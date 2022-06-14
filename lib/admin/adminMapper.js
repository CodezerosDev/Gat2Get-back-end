
/**
 * @author Kavya Patel
 */

function responseMapping(code, msg) {
    return {
        responseCode: code,
        responseMessage: msg
    }
}

function responseMappingWithData(code, msg, data) {
    return {
        responseCode: code,
        responseMessage: msg,
        responseData: data
    }
}

function filterAdminResponse(obj) {

    let { _id, firstName, lastName, emailId, contactNumber, profilePicture, role, createdAt, isLoggedOut, status, isAccountVerified, isCodeVerified, document, isRegister } = obj
    return { _id, firstName, lastName, emailId, contactNumber, profilePicture, role, createdAt, isLoggedOut, status, isAccountVerified, isCodeVerified, document, isRegister }
}

function filterAllowedAdminUpdateFields(obj) {

    return {
        firstName, lastName, profilePicture, contactNumber
    } = obj
}

function allowedCMSUpdatingFields(obj) {

    return {
        title, description
    } = obj
}

function allowedLanguageUpdateFields(obj) {

    return {
        name
    } = obj
}

function filterAllowedTemplateFields(templateDetails) {

    return {
        _id, mailName, mailTitle, mailBody, mailSubject, notificationMessage
    } = templateDetails
}

function filterTemplateUpdateFields(templateDetails) {

    return {
        mailTitle, mailBody, mailSubject, notificationMessage
    } = templateDetails
}
module.exports = {

    responseMapping,

    responseMappingWithData,

    filterAdminResponse,

    filterAllowedAdminUpdateFields,

    allowedCMSUpdatingFields,

    allowedLanguageUpdateFields,

    filterAllowedTemplateFields,

    filterTemplateUpdateFields

}