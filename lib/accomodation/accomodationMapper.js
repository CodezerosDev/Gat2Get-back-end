"use strict"

function responseMappingWithData(code, msg, data) {
    return {
        responseCode: code,
        responseMessage: msg,
        responseData: data
    }
}

function responseMapping(code, msg) {
    return {
        responseCode: code,
        responseMessage: msg
    }
}

module.exports = {
    responseMappingWithData,
    responseMapping
}