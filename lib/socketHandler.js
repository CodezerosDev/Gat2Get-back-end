const userDao = require("./user/userDao");
let onlineUsers = []
let users = {}
const constants = require('./constants')
const mailHandler = require('./middleware/email')
const sendPushNotification = require('./middleware/notification');

module.exports = function (io) {
    io.on('connection', function (socket) {
        console.log("Socket Connected")

        socket.on('userConnected', (data) => {
            let obj = {
                socketObj: socket,
                socketid: socket.id
            }
            socket.senderId = data.senderId;
            users[socket.id] = data.senderId;
            onlineUsers[data.senderId] = obj;
            // console.log({ users, onlineUsers })
        });

        socket.on('get-online-members', function (data) {
            var online_member = [];
            i = Object.keys(onlineUsers);
            for (var j = 0; j < i.length; j++) {
                socket_id = i[j];
                socket_data = onlineUsers[socket_id];
                temp1 = { "senderId": socket_data.socketObj.senderId };
                online_member.push(temp1);
            }
            io.sockets.emit('online-members', online_member);
        });

        socket.on('sendMessage', function (data) {
            var msg = data.msg.trim();
            var messages = []
            let query = {
                $and: [{
                    $or: [
                        { participateId1: data.senderId },
                        { participateId2: data.senderId }
                    ]
                }, {
                    $or: [
                        { participateId1: data.receiverId },
                        { participateId2: data.receiverId }
                    ]
                }]
            }
            userDao.checkRoom(query).then((response) => {

                let receiver = data.receiverId
                let sender = data.senderId
                if (response) {
                    let roomQuery = {
                        _id: response._id
                    }
                    messages = response.data
                    messages.push({
                        message: msg,
                        senderId: data.senderId,
                        receiverId: data.receiverId,
                        // type: data.type
                    })
                    let update = {
                        data: messages,
                        lastMessageTime: new Date().getTime()
                    }
                    userDao.chatUpdate(roomQuery, update).then(async (result) => {

                        let senderQuery = {
                            _id: sender
                        }
                        let receiverQuery = {
                            _id: receiver
                        }
                        let senderDetails = await userDao.checkUserExist(senderQuery)
                        let receiverDetails = await userDao.checkUserExist(receiverQuery)

                        let notificationQuery = {

                            mailName: constants.EMAIL_TEMPLATES.NOTIFY_NEW_MESSAGE_RECEIVED,
                            status: constants.STATUS.ACTIVE
                        }
                        let notificationTemplateDetails = await userDao.getTemplateDetails(notificationQuery)
                        let notificationMessage = notificationTemplateDetails.notificationMessage

                        Object.keys(notificationMessage).forEach((key, value) => {

                            if (value > 0) {
                                let obj = {
                                    firstName: senderDetails.firstName,
                                    lastName: senderDetails.lastName
                                }
                                notificationMessage[key] = mailHandler.convertNotificationMessage(obj, notificationMessage[key])
                            }
                        })

                        if (notificationTemplateDetails) {

                            let notificationObject = {
                                message: notificationMessage,
                                isRead: false,
                                receiverId: receiver,
                                createdAt: new Date().getTime(),
                                status: constants.STATUS.ACTIVE,
                                categoryType: constants.NOTIFICATION_CATEGORIES.CHAT,
                                refId: response._id,
                                senderDetails: {
                                    _id: senderDetails._id,
                                    firstName: senderDetails.firstName,
                                    lastName: senderDetails.lastName,
                                    profilePicture: senderDetails.profilePicture
                                }
                            }
                            await userDao.createNotification(notificationObject)
                        }

                        if (receiverDetails.fcmToken) {

                            let to = receiverDetails.fcmToken
                            let title = `Gat2Get`
                            let type = constants.PUSH_NOTIFICATION_CATEGORIES.CHAT
                            let refId = response._id
                            let msg = `A new message received from ${senderDetails.firstName} ${senderDetails.lastName}`
                            sendPushNotification.sendMessage(to, title, msg, type, refId)
                        }
                        let len = result.data.length
                        socket.join(result._id);
                        io.to(result._id).emit('sendMessage', result.data[len - 1]);
                    })

                } else {
                    messages.push({
                        message: msg,
                        senderId: data.senderId,
                        receiverId: data.receiverId,
                        // type: data.type
                    })
                    let saveData = {
                        participateId1: data.senderId,
                        participateId2: data.receiverId,
                        data: messages,
                        lastMessageTime: new Date().getTime()
                    }
                    userDao.chatSave(saveData).then(async (data) => {
                        if (data) {

                            let senderQuery = {
                                _id: sender
                            }
                            let senderDetails = await userDao.checkUserExist(senderQuery)

                            let notificationQuery = {

                                mailName: constants.EMAIL_TEMPLATES.NOTIFY_NEW_MESSAGE_RECEIVED,
                                status: constants.STATUS.ACTIVE
                            }
                            let notificationTemplateDetails = await userDao.getTemplateDetails(notificationQuery)
                            let notificationMessage = notificationTemplateDetails.notificationMessage

                            Object.keys(notificationMessage).forEach((key, value) => {

                                if (value > 0) {
                                    let obj = {
                                        firstName: senderDetails.firstName,
                                        lastName: senderDetails.lastName
                                    }
                                    notificationMessage[key] = mailHandler.convertNotificationMessage(obj, notificationMessage[key])
                                }
                            })

                            if (notificationTemplateDetails) {

                                let notificationObject = {
                                    message: notificationMessage,
                                    isRead: false,
                                    receiverId: receiver,
                                    createdAt: new Date().getTime(),
                                    status: constants.STATUS.ACTIVE,
                                    categoryType: constants.NOTIFICATION_CATEGORIES.CHAT,
                                    refId: data._id,
                                    senderDetails: {
                                        _id: senderDetails._id,
                                        firstName: senderDetails.firstName,
                                        lastName: senderDetails.lastName,
                                        profilePicture: senderDetails.profilePicture
                                    }
                                }
                                await userDao.createNotification(notificationObject)
                            }
                            let len = data.data.length
                            socket.join(data._id);
                            io.to(data._id).emit('sendMessage', data.data[len - 1]);
                        }
                    })
                }
            })
        });


        socket.on('disconnect', () => {
            let userID = users[socket.id];
            delete onlineUsers[userID];
            delete users[socket.id];
            online_member = [];
            x = Object.keys(onlineUsers);
            for (var k = 0; k < x.length; k++) {
                socket_id = x[k];
                socket_data = onlineUsers[socket_id];
                temp1 = { "users": socket_data.socketObj.senderId };
                online_member.push(temp1);
            }
            io.sockets.emit('online-members', online_member);
        })
    });
}