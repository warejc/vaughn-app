var express = require('express');
var router = express.Router();
var ig = require('instagram-node').instagram();
var config = require('config');
var rp = require('request-promise');
var cli_id = config.get("vaughn-app.ig_conf.cli_id");
var cli_secret = config.get("vaughn-app.ig_conf.cli_secret");

var picList = [];
var jsonData = [];
var newest = [];

const redirect_uri = 'http://localhost:4000/auth';

ig.use({
        client_id: cli_id,
        client_secret: cli_secret
});

exports.handleauth = function(req, res){
    ig.authorize_user(req.query.code, redirect_uri, function(err, result){
        if(err){
            console.log(err.body);
            res.render('error');
        } else {
            token = result.access_token;
            url = "https://api.instagram.com/v1/users/"+result.user.id+"/media/recent/?access_token="+token;

            var options = {
              uri : url,
              json : true
            }
            //A hack because auth for ig client doesn't fully work
            rp(options)
              .then(function (data){
                jsonData = data["data"];
                picList = jsonData.map(x => x["images"]["standard_resolution"]["url"]);
                newest = jsonData.map(x => x["images"]["low_resolution"]["url"]);
                newest = newest.slice(0,5);
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

router.get('/', exports.handleauth)

module.exports = router;
