'use strict';

const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');
const path = require('path');
const bodyParser = require('body-parser');
const request = require('promise-request');
const pug = require('pug');
const template = pug.compileFile('template.pug');
const config = require('./config');

router.use(bodyParser.urlencoded());

router.get('/', function(req, res){
    res.render('task2');
    //res.sendFile(path.join(__dirname + '/public/task2.html'));
});

router.post('/search', function (req, res) {

    if ( !( Math.floor(req.body.searchValue) === Math.ceil(req.body.searchValue) && req.body.searchValue > 0 ) ) {
        res.status(400).render('task2', {data:'Please enter positive integer.'});
    } else {
        // request posts by user id
        config.path = '/posts?userId=' + req.body.searchValue + '&_limit=' + config.limit;
        request(config).then(function (bodyPosts) {

            if ( bodyPosts.data.length == 0 ){
                res.status(204).send('Nothing to show.');
            } else {
                Promise // proceed with merging comments to posts
                    .all(mergeCommentsToPosts(bodyPosts.data, config))
                    .then(merged => {
                        res.render('task2', {data: template({ data : merged })});
                        return merged;
                    })
                    .catch(reason => {
                        console.log(reason + ' >> Error while merging comments for posts.')
                    });
            }
        }, function(error) {
            console.error(error);
        });
    }
});
module.exports = router;

function mergeCommentsToPosts(posts, config){
    var mergeCommentsToPostsPromise = [];
    posts.forEach (function(post) { // for each post merge comments to it
        mergeCommentsToPostsPromise.push(new Promise((resolve, reject) => {
            config.path = '/comments?postId=' + post.id;
            request(config).then(function (bodyComments) {
                post["comments"] = bodyComments.data;
            }).then(() => {
                return resolve(post);
            }, function(error) {
                console.error(error);
            });
        }));
    });
    return mergeCommentsToPostsPromise
}