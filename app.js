var express = require('express');
var path = require('path');
const fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var User = require('./models/user')
const mongoose = require('mongoose');
const http = require('http')
const passport = require('passport');

const socketio = require('socket.io')
const passportInit = require('./Auth/passport')
//mongoose.connect('mongodb://localhost/glitchfy', { useNewUrlParser: true });

mongoose.connect('mongodb://heroku_1fckkp95:50kagnq59pcd08ipf5nahgj0jf@ds355357.mlab.com:55357/heroku_1fckkp95', { useNewUrlParser: true, useFindAndModify: false  });
var db = mongoose.connect;

const certOptions = {
    key: fs.readFileSync(path.resolve('certs/server.key')),
    cert: fs.readFileSync(path.resolve('certs/server.crt'))
}



//Init App
var app = express();
const server = http.createServer( app);
var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api')
var auth = require('./routes/auth')
var public = require('./routes/public')

var cors = require('cors')

const io = socketio(server)
app.set('io', io)


app.use(cors())

// View Engine
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'handlebars');

// Handelbar Helpers


app.engine('handlebars', exphbs({

    defaultLayout: 'layout'
}));

//BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 30 * 60 * 1000 }
}));



//Passport Init
app.use(passport.initialize());
app.use(passport.session());
passportInit()
//Express Validater

app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';

        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

//Connect Flash
app.use(flash());

//Globle var
app.use(function (reg, res, next) {
    res.locals.success_msg = reg.flash('success_msg');
    res.locals.error_msg = reg.flash('error_msg');
    res.locals.error = reg.flash('error');
    res.locals.user = reg.user || null;

    next();
});

app.use('/', routes);
app.use('/users',users);
app.use('/api',passport.authenticate('jwt', {session: false}), api);
app.use('/auth', auth);
app.use('/public', public);

//Set Port
app.set('port', (process.env.PORT || 3002));

server.listen(app.get('port'), function () {
    console.log('Server start on port ' + app.get('port'));
});