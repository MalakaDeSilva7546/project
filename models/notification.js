var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
const env =require('../config/env')

var NotificationSchema = mongoose.Schema({
    title:{
        type:String
    },
    content:{
        type:String
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId, ref:'User'
    }, 
    receiver: {
        type:mongoose.Schema.Types.ObjectId, ref:'User'
    },
    sent_at:{
        type: Date, default: Date.now
    },
    is_read:{
        type:Boolean,
        default: false
    } 

    
});
var Notification = module.exports = mongoose.model('Notification', NotificationSchema);
//Notification.watch().on('change', data => console.log(new Date(), data))

module.exports.createNotificatin = function (newNotification, callback) {
    Notification.create(newNotification, callback)
}


