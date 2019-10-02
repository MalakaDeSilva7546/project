var mongoose = require('mongoose');
const env = require('../config/env')

var TeamSchema = mongoose.Schema({
    title: {
        type: String,

    },
    description: {
        type: String
    },

    image: {
        type: String
    },

    team: [
        {
            member: {
                type: mongoose.Schema.Types.ObjectId, ref: 'User' 
            },
            status: {
                type: String,
                default: "Pending"
            },
        }
    ],
   

    owner: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "Active"
    },

});

var Team = module.exports = mongoose.model('Team', TeamSchema);

module.exports.createTeam = function (newTeam, callback) {
    Team.create(newTeam, callback)
}
module.exports.getTeamById = function (id, callback) {
    Team.findById(id, callback).populate("owner", "name photo email").populate("team.member", "name email photo technologies type");
}

module.exports.getTeams = function (callback) {
    Team.find(null, callback).populate("owner", "name photo").populate("team.member", "name photo technologies type");
}
module.exports.getTeamsByMemberId = function (id, callback) {
    var ObjectId = require('mongoose').Types.ObjectId;
    var objId = new ObjectId((id.length < 12) ? "123456789012" : id);
    Team.find({
        $or: [
            { 'owner': objId },
            { 'team.member': objId }
        ]
    }, callback).populate("owner", "name photo").populate("team.member", "name photo technologies type").sort({ 'uploadDate': 'desc' });
}

module.exports.updateTeamMemberStatus = function (projectId, memberId, status,callback) {
    Team.findOneAndUpdate(
        { _id: projectId, 'team.member':memberId  },
        {'$set': {
            'team.$.status':status,
            
        }},
        {  new: true },
        callback
    ).populate("owner", "name photo").populate("team.member", `name photo email technologies type`);
}