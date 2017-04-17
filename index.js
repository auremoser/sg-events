// 'use strict';
// var GitHubApi = require("github");
// // var GitHubApi = require('github');
// var matter = require('gray-matter');
// var mkdirp = require('mkdirp');
// var Bluebird = require('bluebird');


var GitHubApi = require("github");

var github = new GitHubApi({
    // optional
    debug: true,
    protocol: "https",
    host: "github.my-GHE-enabled-company.com", // should be api.github.com for GitHub
    pathPrefix: "/api/v3", // for some GHEs; none for GitHub
    headers: {
        "user-agent": "My-Cool-GitHub-App" // GitHub is happy with a unique user agent
    },
    Promise: require('bluebird'),
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    timeout: 5000
});

// TODO: optional authentication here depending on desired endpoints. See below in README.

github.users.getFollowingForUser({
    // optional
    // headers: {
    //     "cookie": "blahblah"
    // },
    username: "defunkt"
}, function(err, res) {
    console.log(JSON.stringify(res));
});


// var github = new GitHubApi({
//     // optional
//     debug: true,
//     protocol: "https",
//     host: "github.my-GHE-enabled-company.com", // should be api.github.com for GitHub
//     pathPrefix: "/api/v3", // for some GHEs; none for GitHub
//     headers: {
//         "user-agent": "My-Cool-GitHub-App" // GitHub is happy with a unique user agent
//     },
//     Promise: require('bluebird'),
//     followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
//     timeout: 5000
// });

// var github = new GitHubApi({
//     debug: true,
//     protocol: 'https',
//     host: 'api.github.com',
//     pathPrefix: '/api/v3',
//     timeout: 5000,
//     headers: {
//         'user-agent': 'My-Cool-GitHub-App'
//     }
// });

// github.authenticate({
//     type: 'oauth',
//     token: '81e18c18fabdceba33aede480c46fe5e650f04c0'
// });

// var repository = 'studyGroup';
// var username = 'mozillascience';

// var offset = 0;
// var pageSize = 33;

// getForkCount(username, repository).then(function(total){

//     var promise, promises = [];
//     for(offset=0; offset < Math.ceil(total/pageSize); offset++){
//         promise = processForkBatch(username, repository, offset, pageSize);
//         promises.push(promise);
//     }

//     Bluebird.all(promises).then(function(batches){
//         batches.map(function(batch){
//             processContent(batch);
//         });
//     }).catch(function(err){
//         console.error('Batch download error');
//         console.error('ERROR: %s.\n%s', err.message, err.stack);
//     });
// });

// function getForkCount(user, repo){
//     return new Bluebird(function(resolve, reject){
//         github.repos.get({
//             user: user,
//             repo: repo,
//         }, function(err, res){
//             console.log('Total forks', res.forks);
//             if(err) return reject(err);
//             resolve(res.forks);
//         });
//     });
// }

// function processForkBatch(user, repo, offset, size){
//     if(size > 100) size = 100;

//     return new Bluebird(function(resolve, reject){
//         //First we need to know how many forks we have,
//         //since we will have to paginage.
//         github.repos.getForks({
//             user: user,
//             repo: repo,
//             page: offset,
//             per_page: size
//         }, function(err, res) {
//             if(err) return reject(err);

//             console.log('Batch size', res.length);
//             var forks = [];
//             res.map(function(fork){
//                 forks.push({
//                     user: fork.owner.login,
//                     repo: fork.name,
//                     path: '_posts',
//                     ref: 'gh-pages',
//                     full_name: fork.full_name
//                 });
//             });
//             resolve(forks);
//         });
//     });
// }

// function processContent(forks){

//     console.log("FORTS", JSON.stringify(forks, null, 4));
//     forks.map(function(fork){
//         var repo = octo.repos(fork.user, fork.repo);
//         var filepath = require('path').resolve('./data/'+ fork.user);
//         mkdirp.sync(filepath);
//         repo.contents('_posts').fetch().then(function(contents) {        // `.fetch` is used for getting JSON

//             var promises = [];
//             contents.map(function(file){
//                 console.log(file.path);
//                 //use bluebird spread
//                 promises.push(repo.contents(file.path).read());
//             });

//             var file = [];
//             Bluebird.all(promises).then(function(files){
//                 files.map(function(contents){
//                     file.push(matter(contents).data);
//                 });
//                 require('fs').writeFileSync(filepath + '/data.json', JSON.stringify(file, null, 4), 'utf-8');
//             }).catch(function(err){
//                 console.error('Batch create file error');
//                 console.error('ERROR: %s.\n%s', err.message, err.stack);
//             });
//         }).catch(function(err){
//             console.error('Fetch repo _posts error');
//             console.error('ERROR: %s.\n%s', err.message, err.stack);
//         });
//     });
// }
