// Load user routes
const usrRouter = require('../user/userRoute')
const admRouter = require('../admin/adminRoute')
const imgRouter = require('../imageUploading')
const accRouter = require('../accomodation/accomodationRoute')
    // const cron=require('../croneUtils');
    // Load video routes
    // const responseHandler = require('../responseHandler');


//========================== Load Modules End ==============================================

//========================== Export Module Start ====== ========================

module.exports = function(app) {

    // Attach User Routes

    app.use('/gat2get/v1/api/user', usrRouter)
    app.use('/gat2get/v1/api/admin', admRouter)
    app.use('/gat2get/v1/api/amd', accRouter)
    app.use('/gat2get/v1/api', imgRouter)
        // Attach ErrorHandler to Handle All Errors
        // app.use(responseHandler.hndlError);

};