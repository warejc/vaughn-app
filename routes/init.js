var express = require('express');
var router = express.Router();
var ig = require('instagram-node').instagram();
var config = require('config');
var cli_id = config.get("vaughn-app.ig_conf.cli_id");
var cli_secret = config.get("vaughn-app.ig_conf.cli_secret");

ig.use({
        client_id: cli_id,
        client_secret: cli_secret
});

const redirect_uri = 'http://localhost:4000/auth';

/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect(ig.get_authorization_url(redirect_uri, {scope: ['likes'], state: 'a state'}));
});

module.exports = router;
