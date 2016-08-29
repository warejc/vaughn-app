var express = require('express');
var expressHbs = require('express-handlebars');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ig = require('instagram-node').instagram();
var rp = require('request-promise');
var config = require('config');

var app = express();
var router = express.Router();
var token;
var cli_id = config.get("vaughn-app.ig_conf.cli_id");
var cli_secret = config.get("vaughn-app.ig_conf.cli_secret");

// view engine setup
app.set('views', path.join(__dirname, '/public/views'));
app.engine('handlebars', expressHbs({defaultLayout:'main.handlebars'}));
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(express.static(__dirname + '/public'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

ig.use({
        client_id: cli_id,
        client_secret: cli_secret
    });

var redirect_uri = 'http://localhost:3000/handleauth';

exports.authorize_user = function(req, res){
    res.redirect(ig.get_authorization_url(redirect_uri, {scope: ['likes'], state: 'a state'}));
};

exports.handleauth = function(req, res){
    ig.authorize_user(req.query.code, redirect_uri, function(err, result){
        if(err){
            console.log(err.body);
            res.render('error');
        } else {
            var picList = [];
            var jsonData = [];
            var newest = [];
            token = result.access_token;
            console.log("success");

            url2 = "https://api.instagram.com/v1/users/"+result.user.id+"/media/recent/?access_token="+token;

            var options = {
              uri : url2,
              json : true
            }

            rp(options)
              .then(function (data){
                jsonData = data["data"];

                for (var i = jsonData.length - 1; i >= 0; i--) {
                  //console.log(jsonData[i]["images"]["thumbnail"]["url"]);
                  picList.push(jsonData[i]["images"]["standard_resolution"]["url"]);
                }

                for(var j = 0; j < 4; j++){
                  newest.push(jsonData[j]["images"]["standard_resolution"]["url"]);
                }
                picList.reverse();
                console.log(newest.length);

                var data = {
                              token: result.access_token,
                              name: result.user["full_name"],
                              username: result.user["username"],
                              profilePic: result.user.profile_picture,
                              picList: picList,
                              newest: newest
                            };

                res.render('app', data);
              })
              .catch(function (err){
                console.log("Call failed");
                console.log(err.message);
                var data = {
                              error: err.message
                            }
                res.render('error', data);
              });
        }
    });
};

//routing using handlebars
app.get('/', exports.authorize_user);

app.get('/auth', exports.authorize_user);

app.get('/handleauth', exports.handleauth);

app.get('/about', function(req, res){
    res.render('about');
});
app.get('/app', function(req, res){
    //console.log(req);
    var data = {
                name: "Julius Other Ware"
                };
    res.render('app', data);
});

//app.use('express')
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
        message: err.message
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


module.exports = app;
