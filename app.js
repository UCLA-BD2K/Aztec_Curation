var logger = require("./config/logger");
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');
var configMongo = require('./config/mongo.js');
mongoose.connect(configMongo.url); // connect to our database

var routes = require('./routes/website_router');
var api = require('./routes/api_router');
var suggester = require('./routes/suggest_router');
var User = require('./models/mysql/user.js');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Authentication module.
var Util = require('./utility/generalUtil');
var config = require('./config/app.json');
var auth = require('http-auth');
var basic = auth.basic({
	realm: "Dev Site",
  skipUser: true,
  msg401: '401 Error: Authentication Failure.'
}, function(username, password, callback){
	callback(username==Util.decrypt('user', config.authUser) && password==Util.decrypt('password',config.authPassword));
});
app.use(auth.connect(basic));


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
logger.debug("Overriding 'Express' logger");
app.use(require('morgan')({ "stream": logger.stream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret strategic xxzzz code',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/suggest', suggester);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, function(email, password, done) {
   new User({EMAIL: email}).fetch().then(function(data) {
      var user = data;
      if(user === null) {
				 logger.info('User %s: invalid username', email);
         return done(null, false, {message: 'Invalid username or password'});
      } else {
         user = data.toJSON();
         if(!bcrypt.compareSync(password, user.PASSWORD)) {
					 	logger.info('User %s: invalid password', email);
            return done(null, false, {message: 'Invalid username or password'});
         } else {
					  logger.info('User %s: Successful login', email);
            return done(null, user);
         }
      }
   });
}));

passport.serializeUser(function(user, done) {
  done(null, user.EMAIL);
});

passport.deserializeUser(function(email, done) {
   new User({EMAIL: email}).fetch().then(function(user) {
      done(null, user);
   });
});


module.exports = app;
