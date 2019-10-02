var mongoose = require('mongoose');
const env = require('../config/env')

var ProjectSchema = mongoose.Schema({
    title: {
        type: String,

    },
    description: {
        type: String
    },

    image1: {
        type: String
    },
    image2: {
        type: String
    },
    image3: {
        type: String
    },
    project: {
        type: String
    },
    tag: { type: Object },
    technologies: { type: Object },
    owner: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: Number,
        default: 0
    },
    comments:[{
        owner: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        comment: {
            type: String
        },

    }],
    views: {
        type: Number,
        default: 0
    },
    rates: { type: Object },
    avgRate: {
        type: Number,
        default: 0
    }
});

var Project = module.exports = mongoose.model('Project', ProjectSchema);

module.exports.createProject = function (newProject, callback) {
    Project.create(newProject, callback)
}
module.exports.updateProject = function (id,updatedProject, callback) {
    Project.findOneAndUpdate({ _id: id },updatedProject, callback)
}
module.exports.getProjectById = function (id, callback) {
    Project.findOneAndUpdate({ _id: id }, { $inc: { views: 1 } }, callback).populate("owner", "name photo").populate("comments.owner", "name photo");;
}

module.exports.getProjects = function (limit, callback) {
    Project.find(null, callback).populate("owner", "name photo ").limit(limit);
}
module.exports.getTopProjects = function (limit, callback) {
    Project.aggregate([{ $addFields: { avgRate: { $sum: "$rates.rate" } } }, { "$sort": { "avgRate": -1 } }, { "$limit": limit }], function (err, projects) {
        if (err) {
            console.log(err)
            return callback(err)
        }
        projects = projects.map(project => {
            return new Project(project)
        })
        //console.log( JSON.stringify( projects, undefined, 2 ) );
        Project.populate(projects, { path: 'owner', select: 'name photo' }, function (err, results) {
            if (err) {
                console.log(err)
                return callback(err)
            }
            //console.log( JSON.stringify( results, undefined, 2 ) );
            callback(null, results)
        });
        //callback(null,projects)
    })
}

module.exports.getProjectsByOwnerId = function (id, callback) {
    var query = { owner: { _id: id } };
    Project.find(query, callback);
}
module.exports.searchProjects = function (search, condition, limit, callback) {
    const userRegex = new RegExp(search, 'i')
    console.log(JSON.stringify({
        ...((condition === 'all' || condition === 'title') ? { title: userRegex } : {}),
        ...((condition === 'all' || condition === 'tag') ? { tag: userRegex } : {}),
        ...((condition === 'all' || condition === 'technologies') ? { 'technologies.value': userRegex } : {}),
    }));
    if (condition === 'all') {
        Project.find(
            {
                $or: [
                    { title: userRegex },
                    { tag: userRegex },
                    { 'technologies.value': userRegex },
                ]
            }, callback).limit(limit).populate("owner", "name photo")
    } else {
        Project.find(
            {
                ...(condition === 'title' ? { title: userRegex } : {}),
                ...(condition === 'tag' ? { tag: userRegex } : {}),
                ...(condition === 'technologies' ? { 'technologies.value': userRegex } : {}),
            }, callback).limit(limit).populate("owner", "name photo")
    }

}
module.exports.addRating = function (projectId, userId, rate, callback) {
    var rate = { uid: userId, rate: rate }
    //
    Project.update(
        { _id: projectId },
        { $pull: { rates: { uid: rate.uid } } },
        function (err, raw) {
            if (err) {
                return callback(err)
            }
            Project.update(
                { _id: projectId, 'rates.uid': { $ne: rate.uid } },
                { $push: { rates: rate } },
                callback);
        });
}
module.exports.addCommment = function (projectId, userId, comment, callback) {
    var comment = {
        owner: userId,
        
        comment: comment,

    }
    //

    Project.findOneAndUpdate(
        { _id: projectId,  },
        { $push: { comments: comment } },
        {  new: true },
        callback).populate("comments.owner", "name photo").populate("owner", "name photo");

}

