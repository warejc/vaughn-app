var express = require('express');
var expressHbs = require('express-handlebars');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var config = require('config');
var auth =  require('./routes/auth');
var init = require('./routes/init');

var app = express();

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

// routing
app.use('/', init);
app.use('/auth', auth);


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
