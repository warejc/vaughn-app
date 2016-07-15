var express = require('express');
var expressHbs = require('express-handlebars');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var api = require('instagram-node').instagram();
var http = require('http');
//var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();
var router = express.Router();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', expressHbs({defaultLayout:'main.handlebars'}));
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
api.use({
        client_id: "",
        client_secret: ""
    });
var redirect_uri = 'http://localhost/app';

exports.authorize_user = function(req, res){
    res.redirect(api.get_authorization_url(redirect_uri, {scope: ['likes'], state: 'a state'}));
};

exports.handleauth = function(req, res){
    api.authorize_user(req.query.code, redirect_uri, function(err, result){
        if(err){
            console.log(err.body);
            res.render('error');
        } else{
            console.log("success");
            console.log(result.access_token);
            res.render('app');

        }
    });
};
//app.use(express.static(path.join(__dirname, 'public')));

//routing using handlebars
app.get('/', function(req, res){
    res.render('auth');

});

app.get('/auth', exports.authorize_user);

app.get('/handleauth', exports.handleauth);

app.get('/about', function(req, res){
    res.render('about');
});

//set up the instagram stuff




//app.use('/', routes);
//app.use('/users', users);

//route to home page
/*router.get('/', function(req,res){
    res.send("i'm the home page ");

});*/

//route to about page
/*router.get('/about', function(req, res){
    res.send("i'm the about page");

});*/

//app.use('/', router);



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
    res.render('error');
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


module.exports = app;
