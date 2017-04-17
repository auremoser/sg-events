'use strict';
// var GitHubApi = require("github");
// var matter = require('gray-matter');
// var mkdirp = require('mkdirp');
// var Bluebird = require('bluebird');

var Crawler = require("crawler");
// var url = require('url');
var userArray = [];
var repArray = [];



function yes(usr,rep) {
    console.log(usr);
    console.log(rep);

}

var c = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page 
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ is Cheerio by default 
            //a lean implementation of core jQuery designed specifically for the server 
            $( "div.repo" ).each(function( ) {
                var plainText = ""
                var ar =[]
                plainText = $(this).text().trim();
                ar = plainText.split("\n    /\n    ");
                userArray.push(ar[0]);
                repArray.push(ar[1]);
                // textArray.push($( this ).text().trim())
              // console.log($( this ).text().trim() );
            });
        }
        yes(userArray,repArray);
        done();
    }
});

c.queue('https://github.com/mozillascience/studyGroup/network/members');



