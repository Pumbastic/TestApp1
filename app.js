'use strict';

var express = require('express');
var app = express();

// set up handlebars view engine
var handlebars = require('express3-handlebars')
    .create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000);

app.get('/', function(req, res){
    res.render('home');
});

app.use('/task1', require('./task1'));

app.use('/task2', require('./task2'));

app.listen(app.get('port'), function(){
    console.log( 'Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.' );
});


var path = require('path');
var fs = require('fs')
var sass = require('node-sass');
sass.render({
    file: './public/styles.scss',
    outFile: './public/styles.css',
}, function(err, result) {
    if(!err){
        //console.log('No errors during the compilation, writing the result on the disk')
        fs.writeFile('./public/styles.css', result.css, function(err){
            if(!err){
                // console.log('scss compiled, file written to disc');
            } else {
                console.error(error);
            }
        });
    } else {
        console.error(error);
    }
});