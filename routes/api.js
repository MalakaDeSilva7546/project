var express = require('express');
var router = express.Router();
var passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy;
const jwt = require('jsonwebtoken');
var User = require('../models/user');
var Project = require('../models/project');
var Team = require('../models/team');
var Config = require('../config/config')
var env = require('../config/env')
//Register

router.post('/updateUser', function (req, res) {
    console.log("INFO: Update User " + JSON.stringify(req.user.name));
    var newUser = {
        _id: req.user._id,
        name: req.body.name ? req.body.name : req.user.name,
        email: req.body.email ? req.body.email : req.user.email,
        photo: req.body.photo ? req.body.photo : req.user.photo,
        type: req.body.type ? req.body.type : req.user.type,
        description: req.body.description ? req.body.description : req.user.description,

        technologies: req.body.technologies ? req.body.technologies : req.user.technologies,

        facebook: {
            profileUrl: req.body.facebook ? req.body.facebook : req.user.facebook.profileUrl,
        },
        google: {
            profileUrl: req.body.google ? req.body.google : req.user.google.profileUrl,
        },
        github: {
            profileUrl: req.body.github ? req.body.github : req.user.github.profileUrl,
        },
    }
    //console.log(" User: " + JSON.stringify(newUser));
    User.updateUser(newUser, function (err, user) {
        res.setHeader('Content-Type', 'application/json');
        console.log("ERROR: Update User: " + err);
        res.end(JSON.stringify(user));
    });
});

router.get('/verifyUser', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`VerifyUser ${req.user.name}`);
    var user = req.user
    User.getToken(req.user.id, function (err, token) {
        if (err) { res.sendStatus(500) }
        user.token = token;
        //console.log(req.user);
        res.end(JSON.stringify(user));
    })

});

router.post('/programmers', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`Getting Programmers ${JSON.stringify(req.body)} `);
    if (!req.body.search) {
        return res.sendStatus(404)
    }
    User.searchProgrammers(req.body.search, function (err, programmers) {
        if (err) { return res.sendStatus(500) }

        res.end(JSON.stringify(programmers));
    })

});

router.post('/createProject', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`User `);
    var newProject = {
        title: req.body.title,
        description: req.body.description,
        image1: req.body.image1,
        image2: req.body.image2,
        image3: req.body.image3,
        project: req.body.project,
        tag: req.body.tag,
        technologies: req.body.technologies,
        owner: req.user.id
    }
    Project.createProject(newProject, function (err, project) {
        if (err) { return res.sendStatus(500) }
        res.end(JSON.stringify(project))
    })

});

router.post('/createTeam', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`createTeam `);
    var newTeam = {
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,


        team: req.body.team.map(id => {
            return {
                member: id,
                status: "Pending"
            }
        }),

        owner: req.user.id
    }
    Team.createTeam(newTeam, function (err, team) {
        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        res.end(JSON.stringify(team))
    })

});

router.post('/addFavourite', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`Add Favourite `);

    User.addFavourite(req.user._id, req.body.projectId, function (err, user) {
        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        User.getUserById(req.user._id, function (err, user) {
            if (err) {
                console.log(err)
                return res.sendStatus(500)
            }
            User.getToken(req.user.id, function (err, token) {
                if (err) { res.sendStatus(500) }
                user.token = token;
                //console.log(req.user);
                res.end(JSON.stringify(user));
            })

        })
    })

});

router.post('/removeFavourite', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`Remove Favourite `);

    User.removeFavourite(req.user._id, req.body.projectId, function (err, user) {

        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        User.getUserById(req.user._id, function (err, user) {
            if (err) {
                console.log(err)
                return res.sendStatus(500)
            }
            User.getToken(req.user.id, function (err, token) {
                if (err) { res.sendStatus(500) }
                user.token = token;
                //console.log(req.user);
                res.end(JSON.stringify(user));
            })
        })
        //res.sendStatus(200)
    })

});

router.post('/rateProject', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`User `);

    Project.addRating(req.body.projectId, req.user.id, req.body.rate, function (err, project) {
        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        //Project.getRating(req.body.projectId)
        return res.sendStatus(200)
    })
});

router.get('/getTeams', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`getTeams `);

    Team.getTeamsByMemberId(req.user.id, function (err, project) {
        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        //Project.getRating(req.body.projectId)
        return res.end(JSON.stringify(project));
    })
});

router.post('/getTeam', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`Getting Project ${JSON.stringify(req.body)} `);
    if(!req.body.id){
        return res.sendStatus(403)
    }
    Team.getTeamById(req.body.id,function(err,team){
        if(err){return res.sendStatus(404)}
        res.end(JSON.stringify(team))
    })
    

});


router.post('/addComment', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`adding Comment ${JSON.stringify(req.body)} `);
    if(!req.body.projectId){
        return res.sendStatus(403)
    }
    Project.addCommment(req.body.projectId,req.user._id,req.body.comment,function(err,project){
        if(err){return res.sendStatus(404)}
        res.end(JSON.stringify(project))
    })
    

});
router.post('/updateProject', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`update Project ${JSON.stringify(req.body)} `);
    if(!req.body.id){
        return res.sendStatus(403)
    }
    var newProject = {
        title: req.body.title,
        description: req.body.description,
        image1: req.body.image1,
        image2: req.body.image2,
        image3: req.body.image3,
        project: req.body.project,
        tag: req.body.tag,
        technologies: req.body.technologies,
        owner: req.user.id
    }
    Project.updateProject(req.body.id,newProject,function(err,project){
        if(err){return res.sendStatus(404)}
        res.end(JSON.stringify(project))
    })
    

});


router.post('/setTeamMemberStatus', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`setTeamMemberStatus ${JSON.stringify(req.body)} `);
    if(!req.body.groupId){
        return res.sendStatus(403)
    }
    Team.updateTeamMemberStatus(req.body.groupId,req.user._id,req.body.response,function(err,team){
        if(err){
            console.log(err)
            return res.sendStatus(404)
        }
        res.end(JSON.stringify(team))
    })
    

});

router.post('/rateUser', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`User `);

    User.addRating(req.body.userId, req.user.id, req.body.rate, function (err, user) {
        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        //Project.getRating(req.body.projectId)
        return res.sendStatus(200)
    })
});

module.exports = router;

