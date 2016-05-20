'use strict';
var GitHubApi = require('node-github');
var Octokat = require('octokat');
var matter = require('gray-matter');
var mkdirp = require('mkdirp');
var Bluebird = require('bluebird');

//We authenticate to prevent API rate limits
var octo = new Octokat({
    token: process.env.NODE_GITHUB_TOKEN
});

/*
 * Im mixing both github libraries
 * because node-github does not implement
 * getContent, and I already had the fork
 * part working, I did not see how to do it
 * using Octokat...
 * I will probably refactor later.
 */
var github = new GitHubApi({
    version: '3.0.0',
    debug: true,
    protocol: 'https',
    host: 'api.github.com',
    pathPrefix: '/api/v3',
    timeout: 5000,
    headers: {
        'user-agent': 'My-Cool-GitHub-App'
    }
});

github.authenticate({
    type: 'oauth',
    token: process.env.NODE_GITHUB_TOKEN
});

var repository = 'studyGroup';
var username = 'mozillascience';

var offset = 0;
var pageSize = 33;

getForkCount(username, repository).then(function(total){

    var promise, promises = [];
    for(offset=0; offset < Math.ceil(total/pageSize); offset++){
        promise = processForkBatch(username, repository, offset, pageSize);
        promises.push(promise);
    }

    Bluebird.all(promises).then(function(batches){
        batches.map(function(batch){
            processContent(batch);
        });
    });
});

function getForkCount(user, repo){
    return new Bluebird(function(resolve, reject){
        github.repos.get({
            user: user,
            repo: repo,
        }, function(err, res){
            console.log('Total forks', res.forks);
            if(err) return reject(err);
            resolve(res.forks);
        });
    });
}

function processForkBatch(user, repo, offset, size){
    if(size > 100) size = 100;

    return new Bluebird(function(resolve, reject){
        //First we need to know how many forks we have,
        //since we will have to paginage.
        github.repos.getForks({
            user: user,
            repo: repo,
            page: offset,
            per_page: size
        }, function(err, res) {
            if(err) return reject(err);

            console.log('Batch size', res.length);
            var forks = [];
            res.map(function(fork){
                forks.push({
                    user: fork.owner.login,
                    repo: fork.name,
                    path: '_posts',
                    ref: 'gh-pages',
                    full_name: fork.full_name
                });
            });
            resolve(forks);
        });
    });
}

function processContent(forks){

    console.log("FORTS", JSON.stringify(forks, null, 4));
    forks.map(function(fork){
        var repo = octo.repos(fork.user, fork.repo);
        var filepath = require('path').resolve('./data/'+ fork.user);
        mkdirp.sync(filepath);
        repo.contents('_posts').fetch().then(function(contents) {        // `.fetch` is used for getting JSON

            var promises = [];
            contents.map(function(file){
                console.log(file.path);
                //use bluebird spread
                promises.push(repo.contents(file.path).read());
            });

            var file = [];
            Bluebird.all(promises).then(function(files){
                files.map(function(contents){
                    file.push(matter(contents).data);
                });
                require('fs').writeFileSync(filepath + '/data.json', JSON.stringify(file, null, 4), 'utf-8');
            });
        });
    });
}
