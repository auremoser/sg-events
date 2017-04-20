'use strict';
// var GitHubApi = require("github");
// var matter = require('gray-matter');
// var mkdirp = require('mkdirp');
// var Bluebird = require('bluebird');

var Crawler = require("crawler");
// var url = require('url');
var userArray = [];
var repArray = [];
var Octokat = require('octokat');
var octo = new Octokat({
    token: "0aaefcc5166d2133ab5c740651320ab1d3eb1bd2"
});


function startCrawler(usr,rep) {
    crawlerNode(usr[0],rep[0])
    console.log(usr[0])
    console.log(rep[0])

}

function crawlerNode(usr,rep) {
    var repo = octo.repos(usr, rep);
    repo.contents('README.md').read() // Use `.read` to get the raw file.
    .then((contents) => {        // `.fetch` is used for getting JSON
      console.log(contents)
    });
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
        startCrawler(userArray,repArray);
        done();
    }
});

c.queue('https://github.com/mozillascience/studyGroup/network/members');



