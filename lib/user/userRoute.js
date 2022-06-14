const userRouter = require("express").Router();
const userFacade = require('./userFacade');
const userValidation = require('./userValidators');
const userConstants = require('./userConstants');
const mapper = require('./userMapper');

// User : Registration Step-1 --- Kuldip
userRouter.route('/registrationStep1').post([userValidation.registrationStep1], (req, res) => {
    userFacade.registrationStep1(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Registration Step-2 --- Kuldip
userRouter.route('/registrationStep2/:emailId').post([userValidation.registrationStep2], (req, res) => {
    userFacade.registrationStep2(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Registration Step-3 --- Kuldip
userRouter.route('/registrationStep3/:id').post([userValidation.registrationStep3], (req, res) => {
    userFacade.registrationStep3(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Login --- Kuldip
userRouter.route('/login').post([userValidation.login], (req, res) => {
    userFacade.login(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Logout --- Kuldip
userRouter.route('/logout/:userId').get([userValidation.verifyUsrToken], (req, res) => {
    userFacade.logout(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
})


// User : Forgot Password Step-1 --- Kuldip
userRouter.route('/forgotPasswordStep1').post([userValidation.forgotPassword], (req, res) => {
    userFacade.forgotPasswordStep1(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Forgot Password Step-2 --- Kuldip
userRouter.route('/forgotPasswordStep2/:emailId').post([userValidation.registrationStep2], (req, res) => {
    userFacade.forgotPasswordStep2(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Forgot Password Step-3 --- Kuldip
userRouter.route('/forgotPasswordStep3/:emailId').post([userValidation.setNewPassword], (req, res) => {
    userFacade.forgotPasswordStep3(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Reset Password --- Kuldip
userRouter.route('/resetPassword/:userId').post([userValidation.resetPassword], (req, res) => {
    userFacade.resetPassword(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Profile Manage --- Kuldip
userRouter.route('/profileManage/:userId').post([userValidation.verifyUsrToken], (req, res) => {
    userFacade.profileManage(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Get Profile --- Kuldip
userRouter.route('/getProfile/:userId').get([userValidation.verifyUsrToken], (req, res) => {
    userFacade.getProfile(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Add Card Details --- Kuldip
userRouter.route('/addCardDetails/:userId').post([userValidation.verifyUsrToken], (req, res) => {
    userFacade.addCardDetails(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Edit Card Details --- Kuldip
userRouter.route('/editCardDetails/:userId/:cardId').post([userValidation.verifyUsrToken], (req, res) => {
    userFacade.editCardDetails(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Get Card Details --- Kuldip
userRouter.route('/getCardDetails/:userId/:cardId').get([userValidation.verifyUsrToken], (req, res) => {
    userFacade.getCardDetails(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Remove Card Details --- Kuldip
userRouter.route('/removeCardDetails/:userId/:cardId').get([userValidation.verifyUsrToken], (req, res) => {
    userFacade.removeCardDetails(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Get CMS Page
userRouter.route('/getCMSPage/:type').get((req, res) => {
    userFacade.getCMSPage(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
})

// User : Add Document --- Kuldip
userRouter.route('/addDocument/:userId').post([userValidation.verifyUsrToken], (req, res) => {
    userFacade.addDocument(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Edit Document --- Kuldip
userRouter.route('/editDocument/:userId/:docId').post([userValidation.verifyUsrToken], (req, res) => {
    userFacade.editDocument(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// User : Remove Document --- Kuldip
userRouter.route('/removeDocument/:userId/:docId').get([userValidation.verifyUsrToken], (req, res) => {
    userFacade.removeDocument(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Add Favorite --- Kuldip
userRouter.route('/addFavorite/:userId/:propertyId').get([userValidation.verifyUsrToken], (req, res) => {
    userFacade.addFavorite(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Remove Favorite --- Kuldip
userRouter.route('/removeFavorite/:userId/:propertyId').get([userValidation.verifyUsrToken], (req, res) => {
    userFacade.removeFavorite(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Get Favorite List --- Kuldip
userRouter.route('/getFavoriteList/:userId/:page').post([userValidation.verifyUsrToken], (req, res) => {
    userFacade.getFavoriteList(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Get My Reviews --- Kuldip
userRouter.route('/getMyReviews/:userId').get([userValidation.verifyUsrToken], (req, res) => {
    userFacade.getMyReviews(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Get Landlord Reviews --- Kuldip
userRouter.route('/getLandlordReviews/:userId').post([userValidation.verifyUsrToken], (req, res) => {
    userFacade.getLandlordReviews(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Contact Us --- Kuldip
userRouter.route('/contactUs').post((req, res) => {
    userFacade.contactUs(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Verify Token --- Kuldip
userRouter.route('/verifyToken/:userId').get([userValidation.verifyUsrToken], (req, res) => {
    userFacade.verifyUsrToken(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// SignUp and SignIn Via Facebook and Google --- Kuldip
userRouter.route('/socialLogin').post((req, res) => {
    userFacade.socialLogin(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// Invite Friends --- Kuldip
userRouter.route('/inviteFriends').post((req, res) => {
    userFacade.inviteFriends(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// My Bookings --- Kuldip
userRouter.route('/myBookings/:userId/:page').get([userValidation.verifyUsrToken], (req, res) => {
    userFacade.myBookings(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// get Primary Card --- Kuldip
userRouter.route('/getPrimaryCard/:userId').get([userValidation.verifyUsrToken], (req, res) => {
    userFacade.getPrimaryCard(req).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

userRouter.route('/getUserNotifications/:userId/:page').get([userValidation.verifyUsrToken], (req, res) => {

    let { userId, page } = req.params
    // let { skip, limit } = req.query
    userFacade.getUserNotifications(userId, page).then((result) => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

userRouter.route('/getUserNotificationCount/:userId').get([userValidation.verifyUsrToken], (req, res) => {

    let { userId } = req.params
    userFacade.getUserNotificationCount(userId).then((result) => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

userRouter.route('/updateNotificationStatus/:userId').put([userValidation.verifyUsrToken, userValidation.validateUpdateNotificationStatus], (req, res) => {

    let { userId } = req.params
    let { notificationIds } = req.body

    userFacade.updateNotificationStatus(userId, notificationIds).then((result) => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});


//Get User Chat List --- Kuldip
userRouter.route('/getChatList/:userId').get([userValidation.verifyUsrToken], (req, res) => {
    userFacade.getChatList(req).then((result) => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

//Get Chats --- Kuldip
userRouter.route('/getChats/:userId/:roomId').get([userValidation.verifyUsrToken], (req, res) => {
    userFacade.getChats(req).then((result) => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

//Delete Chats --- Kuldip
userRouter.route('/deleteChats/:userId/:roomId').get([userValidation.verifyUsrToken], (req, res) => {
    userFacade.deleteChats(req).then((result) => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

userRouter.route('/updateFCMToken/:userId').post([userValidation.verifyUsrToken], (req, res) => {

    let { userId } = req.params
    let { fcmToken } = req.body
    userFacade.updateFCMToken(userId, fcmToken).then((result) => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

userRouter.route('/updateBankDetails/:userId').post([userValidation.verifyUsrToken, userValidation.validateUpdateBankDetails], (req, res) => {

    let { userId } = req.params
    let details = req.body
    userFacade.updateBankDetails(userId, details).then((result) => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

userRouter.route('/checkUserLogin/:userId/:deviceId').get([], (req, res) => {

    let { userId, deviceId } = req.params
    userFacade.checkUserLogin(userId, deviceId).then((result) => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

userRouter.route('/getBankDetails/:userId').get([userValidation.verifyUsrToken], (req, res) => {

    let { userId } = req.params
    userFacade.getBankDetails(userId).then((result) => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

userRouter.route('/getAllLanguages').get([], (req, res) => {

    userFacade.getAllLanguages().then((result) => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

userRouter.route('/getStateCodes/:userId/:country').get([userValidation.verifyUsrToken], (req, res) => {

    let { userId, country } = req.params
    userFacade.getStateCodes(userId, country).then((result) => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

userRouter.route('/getInvitationLinks').get((req, res) => {

    userFacade.getInvitationLinks().then((result) => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    });
});

// APPLE USER DETAILS APIs
userRouter.route('/getAppleUserDetails/:appleId').get((req, res) => {

    let { appleId } = req.params
    userFacade.getAppleUserDetails(appleId).then((result) => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    })
})

userRouter.route('/setAppleUserDetails').post((req, res) => {

    let details = req.body
    userFacade.setAppleUserDetails(details).then((result) => {
        res.send(result)
    }).catch(err => {
        console.log(err)
        res.send(mapper.responseMapping(userConstants.CODE.badrequest, userConstants.MESSAGE.intrnlSrvrErr))
    })
})
module.exports = userRouter