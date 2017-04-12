'use strict';

var express = require('express');
var router = express.Router();
var cheerio = require('cheerio');
var path = require('path');
var bodyParser = require('body-parser');
var request = require('promise-request');
var config = require('./config');
const pug = require('pug');
const template = pug.compileFile('template.pug');

router.use(bodyParser.urlencoded());

router.get('/', function(req, res){
    res.render('task2');
    //res.sendFile(path.join(__dirname + '/public/task2.html'));
});

router.post('/search', function (req, res) {

    if (isNaN(req.body.searchValue) ){
        res.status(400).render('task2', {data:'Please enter a number.'});
    } else {

        // ////////////////////////////////////////////////////
        // request posts by user id
        config.path = '/posts?userId=' + req.body.searchValue + '&_limit=' + config.limit;
        request(config).then(function (bodyPosts) {

            if ( bodyPosts.data.length == 0 ){
                res.status(204).send('Nothing to show.');
            } else {
                // ********************************************
                Promise // proceed with merging comments with posts
                    .all(mergeCommentsToPosts(bodyPosts.data, config))
                    .then(merged => {
                        res.render('task2', {data: template({ data : merged })});
                        return merged;
                    })
                    .catch(reason => {
                        console.log(reason + ' >> Error while merging comments for posts.')
                    });
                // ********************************************
            }
        // ////////////////////////////////////////////////////
        }, function(error) {
            console.error(error);
        });

    }

});
module.exports = router;

function mergeCommentsToPosts(posts, config){
    var mergeCommentsToPostsPromise = new Array(posts.length);
    var merged                      = new Array(posts.length);
    for (var i = 0; i < posts.length; i++) { // for each post merge comments to it
        mergeCommentsToPostsPromise[i] = new Promise((resolve, reject) => {
            (function(i) { // closure
                config.path = '/comments?postId=' + posts[i].id;
                request(config).then(function (bodyComments) {
                    // Caution: results are appended later by Promise.all as if in merged[i] = ...
                    merged = {"post":posts[i], "comments": bodyComments.data};
                }).then(() => {
                    return resolve(merged);
                }, function(error) {
                    console.error(error);
                });
            })(i);
        });
    }
    return mergeCommentsToPostsPromise
}