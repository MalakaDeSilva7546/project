var express = require('express');
var router = express.Router();
var Project = require('../models/project');
var User = require('../models/user');
//var Report= require('../models/report');
const nodemailer = require('nodemailer');
var handlebars = require('handlebars');
var fs = require('fs');

router.post('/projects', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`Getting Projects `);

    Project.getProjects(req.body.limit, function (err, projects) {
        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        res.end(JSON.stringify(projects))
    })

});

router.post('/getprojectsByOwnerId', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`projectByOwnerId ${req.body.id}`);
    var user = req.user
    Project.getProjectsByOwnerId(req.body.id, function (err, Projects) {
        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        res.end(JSON.stringify(Projects))
    })

});

router.post('/favouriteProjects', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`Getting Favourite Projects ${req.body.id}`);

    if (!req.body.id) {

        return res.sendStatus(404)
    }
    User.getFavourite(req.body.id, function (err, projects) {
        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        res.end(JSON.stringify(projects))
    })

});

router.post('/project', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`Getting Project ${JSON.stringify(req.body)} `);
    if (!req.body.id) {
        return res.sendStatus(403)
    }
    Project.getProjectById(req.body.id, function (err, project) {
        if (err) { return res.sendStatus(404) }
        res.end(JSON.stringify(project))
    })

});

router.post('/user', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`Getting User ${JSON.stringify(req.body)} `);
    if (!req.body.id) {
        return res.sendStatus(403)
    }
    User.getUserById(req.body.id, function (err, user) {
        if (err) { return res.sendStatus(404) }
        res.end(JSON.stringify(user))
    })

});
router.post('/developers', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`Getting Developers `);

    User.getProgrammers(req.body.limit, function (err, developers) {
        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        res.end(JSON.stringify(developers))
    })

});

//Test
router.post('/getTopRankProjects', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`Getting Projects `);

    Project.getTopProjects(req.body.limit, function (err, projects) {
        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        res.end(JSON.stringify(projects))
    })

});


router.post('/search', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`Search  ${JSON.stringify(req.body)} `);
    if (req.body.type === "projects") {
        Project.searchProjects(req.body.search, req.body.condition, req.body.limit, function (err, projects) {
            if (err) { return res.sendStatus(404) }
            res.end(JSON.stringify(projects))
        })
    } else if (req.body.type === 'developers') {
        User.search(req.body.search, req.body.condition, req.body.limit, function (err, developers) {
            if (err) { return res.sendStatus(404) }
            res.end(JSON.stringify(developers))
        })
    }

});
var readHTMLFile = function (path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};
router.post('/sendEmail', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`send email ${JSON.stringify(req.body)} `);
    if (!req.body.id) {
        return res.sendStatus(403)
    }

    Project.getProjectById(req.body.id, function (err, project) {
        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        // res.end(JSON.stringify(projects))
       
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            //port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'glitchfy.community@gmail.com', // generated ethereal user
                pass: 'glitchfy19960318' // generated ethereal password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        readHTMLFile(__dirname + '/email/email.html', function (err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                username: "Dear User",
                title: project.title,
                description: project.description,
                ownerName: project.owner.name,
                projectURL:project.project

            };
            var htmlToSend = template(replacements);
            var mailOptions = {
                from: '"Glitchfy Community" <glitchfy.community@gmail.com>', // sender address
                to: req.body.email, // list of receivers
                subject: 'Glitchfy Project Download', // Subject line
                html: htmlToSend
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                res.sendStatus(200)

            }
            )




            // send mail with defined transport object
            

        })

    });
});


router.post('/getTopRankDevelopers', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`Getting Projects `);

    User.getTopUsers(req.body.limit, function (err, users) {
        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        res.end(JSON.stringify(users))
    })

});

router.post('/getReports', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    //res.redirect(env.frontendPath() + '/profile');
    console.log(`Getting Projects `);

    User.getReports(req.body.id,req.body._id ,function (err, projects) {
        if (err) {
            console.log(err)
            return res.sendStatus(500)
        }
        res.end(JSON.stringify(projects))
    })

});



module.exports = router;