'use strict';
// var GitHubApi = require("github");
// var matter = require('gray-matter');
// var mkdirp = require('mkdirp');
// var Bluebird = require('bluebird');

var Crawler = require("crawler");
var userArray = [];
var repArray = [];
var Octokat = require('octokat');
var matter = require('gray-matter');


var octo = new Octokat({
    // token: "0aaefcc5166d2133ab5c740651320ab1d3eb1bd2"
});


function startCrawler(usr,rep) {
    var i = 0;
// Here I just test 10 repos for getting their _post lists
    for (i = 0; i < 10; i++) { 
        crawlerFileList(usr[i],rep[i])
    }
}

function crawlerFileList(usr,rep) {
    var repo = octo.repos(usr, rep);
    repo.contents('_posts').read() 
    .then((contents) => {        
      parsePathList(JSON.parse(contents));
    });

    // repo.contents('_posts/1977-01-01-myEvent.markdown').read() // Use `.read` to get the raw file.
    // .then((contents) => {        // `.fetch` is used for getting JSON
    //   console.log((matter(contents).data))
    // });
}

function parsePathList(json){
    json.forEach(function(element) {
    console.log(element.path);
// Here shows all paths for the files we need
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
            $( "div.repo" ).each(function( ) {
                var plainText = ""
                var ar =[]
                plainText = $(this).text().trim();
                ar = plainText.split("\n    /\n    ");
                userArray.push(ar[0]);
                repArray.push(ar[1]);
// This step is to read whole forks username and repos names. 
            });
        }
        startCrawler(userArray,repArray);
        done();
    }
});

c.queue('https://github.com/mozillascience/studyGroup/network/members');



