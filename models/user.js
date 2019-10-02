var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env')

//User Schema

var UserSchema = mongoose.Schema({

    description: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    photo: {
        type: String
    },
    token: {
        type: String
    },
    facebook: {
        id: String,
        token: String,
        profileUrl: String,
    },
    google: {
        id: String,
        token: String,
        profileUrl: String,
    },
    github: {
        id: String,
        token: String,
        profileUrl: String,

    },

    favourite: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }
    ],

    type: {
        type: String
    },

    technologies: { type: Object },
    rates: { type: Object },
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });

    });
}
module.exports.findOrCreate = function (name, email, id, photo, provider, url, token, done) {
    var res = email.split("@");
    console.log(res[1])
    var newEmail = email;
    if (res[1] == "gmail.com") {
        newEmail = res[0].replace(".", "") + "@" + res[1]
        //newEmail=email.replace(".","")
        console.log(newEmail)
    }
    var query = { email: newEmail };
    var newUser = {
        name: name,
        email: newEmail,
        photo: photo,

    }

    newUser[provider + ".id"] = id;
    newUser[provider + ".token"] = token;
    if (url !== null) {
        newUser[provider + ".profileUrl"] = url;
    }

    User.findOneAndUpdate(query, newUser, { upsert: true, new: true, }, function (err, user) {
        if (err) return done(err);;
        const token = jwt.sign(user._id.toJSON(), env.tokenSecret());
        user.token = token;
        user.save(done);
        return done(null, user);
    });

}

module.exports.updateUser = function (newUser, done) {
    //console.log(newUser)
    var res = newUser.email.split("@");
    //console.log(newUser)
    var newEmail = newUser.email;
    if (res[1] == "gmail.com") {
        newEmail = res[0].replace(".", "") + "@" + res[1]
        //newEmail=newUser.email.replace(".","")
        console.log(newEmail)
    }
    var query = { _id: newUser._id };
    User.findOneAndUpdate(query, newUser, { upsert: true, new: true, }, function (err, user) {
        if (err) return done(err);;
        const token = jwt.sign(user._id.toJSON(), env.tokenSecret());
        user.token = token;
        user.save();
        done(null, user.toJSON())
        //return done(null, user);
    });
}

module.exports.getUserByUsername = function (username, callback) {
    var query = { username: username };
    User.findOne(query, callback);
}
module.exports.getToken = function (id, callback) {
    const token = jwt.sign(id, env.tokenSecret());
    callback(null, token)
}
module.exports.getUserById = function (id, callback) {
    User.findById(id, "description name email photo facebook google github type technologies favourite rates", callback);
}


module.exports.searchProgrammers = function (search, callback) {
    const userRegex = new RegExp(search, 'i')
    User.find({ name: userRegex, type: { $exists: true } }, 'name photo type technologies', callback).limit(5)
}
module.exports.getProgrammers = function (limit, callback) {
    
    User.find({ type: { $exists: true } }, 'name photo type technologies facebook github', callback).limit(limit)
}

module.exports.addFavourite = function (id, projectId,callback) {
    User.update({ _id: id },{ $addToSet: { favourite: projectId } },callback)
}
module.exports.removeFavourite = function (id, projectId,callback) {
    User.update({ _id: id },{ $pull: { favourite: projectId } },callback)
}
module.exports.getFavourite = function (id,callback) {
    User.findById(id, "favourite", callback).populate("favourite");
}

module.exports.search = function (search, condition, limit,callback) {
    const userRegex = new RegExp(search, 'i')
    console.log(JSON.stringify({
        ...((condition === 'all' || condition === 'name') ? { name: userRegex } : {}),
        ...((condition === 'all' || condition === 'type') ? { type: userRegex } : {}),
        ...((condition === 'all' || condition === 'technologies') ? { 'technologies.value': userRegex } : {}),
    }));

    if (condition === 'all') {
        User.find(
            {
                $or: [
                    { name: userRegex },
                    { type: userRegex },
                    { 'technologies.value': userRegex },
                ],
                type: { $exists: true } 
            }, 'name photo type technologies', callback).limit(limit)
    } else {
        User.find(
            {
                ...(condition === 'name' ? { name: userRegex } : {}),
                ...(condition === 'type' ? { type: userRegex } : {}),
                ...(condition === 'technologies' ? { 'technologies.value': userRegex } : {}),
            }, 'name photo type technologies', callback).limit(limit)
    }

    //User.find({ name: userRegex, type: { $exists: true } }, 'name photo type technologies', callback).limit(5)
}

module.exports.addRating = function (userId, uId, rate, callback) {
    var rate = { uid: uId, rate: rate }
    //
    User.update(
        { _id: userId },
        { $pull: { rates: { uid: rate.uid } } },
        function (err, raw) {
            if (err) {
                return callback(err)
            }
            User.update(
                { _id: userId, 'rates.uid': { $ne: rate.uid } },
                { $push: { rates: rate } },
                callback);
        });
}

module.exports.getTopUsers = function (limit, callback) {
    User.aggregate([{ $addFields: { avgRate: { $sum: "$rates.rate" } } }, { "$sort": { "avgRate": -1 } }, { "$limit": limit },{ $project : { name : 1 , photo : 1, type : 1 , technologies : 1 , facebook : 1 , github : 1}}], function (err, users) {
        if (err) {
            console.log(err)
            return callback(err)
        }
        
            
            callback(null, users)
        
    })
}