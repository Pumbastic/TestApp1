'use strict';

var express = require('express');
var router = express.Router();
var cheerio = require('cheerio');
var path = require('path');
var bodyParser = require('body-parser');
var request = require('request');

router.use(bodyParser.urlencoded());

router.get('/', function(req, res) {
    res.render('task1');
});

router.post('/search', function (req, res) {

    if (req.body.searchValue.length == 0) {

        res.status(204).send('Nothing to show.');

    } else {

        var search = req.body.searchValue;
        var options = {
            qs : {
                q : search
            }
        };

        request('http://www.google.pl/search', options, function (error, response, body) {

            if ( error ) {
                console.log("error while calling google", error);
                return res.status(400).send(error + " >> error while calling google");
            } else {

                // *****************************************
                var $ = cheerio.load(body);
                $ = $('#search').find('ol');
                if ($.length == 0) {
                    res.status(204).send('Nothing to show.');
                } else {
                    res.render('task1', {data: $.html()} );
                }
                // *****************************************
            }
        });
    }
});

module.exports = router;
