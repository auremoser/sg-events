'use strict';
var GitHubApi = require('node-github');
var Octokat = require('octokat');
var matter = require('gray-matter');
var mkdirp = require('mkdirp');
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var low = require('lowdb');
var db = low('db.json');

var ignoreEventTitles = ['Make Your First Event', 'undefined',];


/* --- Github API initiation --- */

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
    token: process.env.NODE_GITHUB_TOKEN,
});

var repository = 'studyGroup';
var username = 'mozillascience';

var offset = 0;
var pageSize = 33;

/* --- Google API initiation --- */
var sheets = google.sheets('v4');
var SHEET_ID = process.env.SHEET_ID;

// If modifying these scopes, delete your previously saved credentials
// at ./credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_PATH = './token.json';
var oauth2Holder;


readSecret().then(function(content){
  authorize(JSON.parse(content))
    .then(function(oauth2Client){
      oauth2Holder = oauth2Client;
      initDB();
      getForkCount(username, repository).then(function(total){
        var promise, promises = [];
        for(offset=0; offset < Math.ceil(total/pageSize); offset++){
            promise = processForkBatch(username, repository, offset, pageSize);
            promises.push(promise);
        }

        Promise.all(promises).then(function(batches){
            var processingPromises = [];
            batches.map(function(batch){
              batch.map(function(fork){
                processingPromises.push(
                  processContent(fork)
                );
              });
            });

            Promise.all(processingPromises).then(function(resolves){
              pushEvents();
            }).catch(function(err){
              console.log(err);
            });
        }).catch(function(err){
            console.error('Batch download error');
            console.error('ERROR: %s.\n%s', err.message, err.stack);
        });
      });
    });
});

/* --- Google sheets api logic --- */

/**
* Reads the `client_secret.json` file that has the google Oauth client credentials.
* check https://developers.google.com/sheets/api/quickstart/nodejs for details
*/
function readSecret(){
  return new Promise(function(resolve, reject){
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
      if (err) {
        reject('Error loading client secret file: ' + err);
      }
      resolve(content);
    });
  });

}

/**
* Authorize a client with the loaded credentials.
*
* @param {object} credentials, the client secrets information.
*/
function authorize(credentials) {
  return new Promise(function(resolve, reject){
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) {
        console.log('Error while reading token from file: ' + err);
        getNewToken(oauth2Client).then(function(oauth2Client){
          resolve(oauth2Client);
        });
      } else {
        oauth2Client.credentials = JSON.parse(token);
        resolve(oauth2Client);
      }
    });
  });
}

/**
* Get and store new token after prompting for user authorization.
*
* @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
**/
function getNewToken(oauth2Client) {
  return new Promise(function(resolve, reject){
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: \n', authUrl);
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('>> Enter the code from that page here: ', function(code) {
      rl.close();
      oauth2Client.getToken(code, function(err, token) {
        if (err) {
          reject('Error while trying to retrieve access token', err);
        }
        oauth2Client.credentials = token;
        storeToken(token);
        resolve(oauth2Client);
      });
    });
  });
}

/**
* Store token to disk to be used in later program executions.
*
* @param {Object} token, The token to store to disk.
*/
function storeToken(token) {
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/* --- Github logic --- */

/**
* get repo fork count
*
* @param {string} user
* @param {string} repo
*/
function getForkCount(user, repo){
    return new Promise(function(resolve, reject){
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

/**
* retrieve forks of a repo
*
* @param {string} user
* @param {string} repo
* @param {number} offset, number of page to start from
* @param {number} size, number of pages to retrieve
*/
function processForkBatch(user, repo, offset, size){
    if(size > 100) size = 100;

    return new Promise(function(resolve, reject){
        //First we need to know how many forks we have,
        //since we will have to paginate.
        github.repos.getForks({
            user: user,
            repo: repo,
            page: offset,
            per_page: size
        }, function(err, res) {
            if(err) return reject(err);

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

/**
* Creates a local directory representing the fork,
* fetches the events in '_posts' remote directory of the fork,
* writes events to local data.json then appends events to local database.
*
* @param {Object} fork
*/
function processContent(fork){
  return new Promise(function(resolve, reject){
    console.log('FORTS', JSON.stringify(fork, null, 4));
    var repo = octo.repos(fork.user, fork.repo);
    var filepath = require('path').resolve('./data/'+ fork.user);
    mkdirp.sync(filepath);

    // `.fetch` is used for getting JSON
    repo.contents('_posts').fetch().then(function(contents) {

      var promises = [];
      contents.map(function(file){
        promises.push(
          // Needed to add an explicit .catch on this so that it returns,
          // else it won't be possible for the promise.all() to resolve...
          repo.contents(file.path).read().catch(function(e){
            console.log('Error reading contents of: ', file.path);
            console.log(e);
            return {e: e};
          })
        );
      });

      var data = [];
      Promise.all(promises).then(function(files){
        files.map(function(file){
          data.push(matter(file).data);
          appendEvent(matter(file).data);
        });
        require('fs').writeFileSync(filepath + '/data.json', JSON.stringify(data, null, 4), 'utf-8');
        resolve(filepath);
      }).catch(function(err){
        console.error('Batch create file error');
        console.error('ERROR: %s.\n%s', err.message, err.stack);
        return reject('Batch create file error');
      });
    }).catch(function(err){
      console.error('Fetch repo _posts error');
      console.error('ERROR: %s.\n%s', err.message, err.stack);
      return reject('Fetch repo _posts error');
    });
  }).catch(function(e){
    // Needed to add an explicit .catch on this so that it returns,
    // else it won't be possible for the promise.all() to resolve...
    return {e: e};
  });
}

/**
* initializes the json db
*/
function initDB(){
  console.log('initing json db ...');

  var events = db.has('events').value();
  if (!events){
    db.defaults({ events: [] })
    .write();
  }
  clearSheet();
}

/**
* clears the google spreadsheet
*/
function clearSheet(){
  var request = {
    spreadsheetId: SHEET_ID,
    range: 'warka!A1:Z',
    auth: oauth2Holder
  };

  sheets.spreadsheets.values.clear(request, function(err, response) {
    if (err) {
      console.log('The API returned an error on clear: \n' + err);
    }
    else{
      console.log(JSON.stringify(response, null, 4));
    }
  });
}

/**
* Appends an event to the local json db.
*
* @param {object} event
*/
function appendEvent(event){
  if (!event) return;
  // check if event is an empty object
  if( (typeof(event) === 'object') && (Object.keys(event).length === 0) ){
    return;
  }

  var exists = eventExists(event);
  var ignored = ignoreEventTitles.indexOf(event.title);
  if (!exists && (ignored === -1)){
    console.log('Adding event ', event.title, ' to the database.');
    db.get('events')
      .push(replaceEmpties(event))
      .write();
  } else {
    console.log('Event with title "' + event.title + '"already exists.');
  }
}

/**
* checks if an event exists in the jsondb.
* uniqueness by both title and link.
*
* @param {object} event
*/
function eventExists(event){
  var val = db.get('events')
              .find({
                title: event.title,
                link: event.link
               })
              .value();
  return val;
}

/**
* itters over the json db to form batches to send to the google spreadsheet
* this is done to avoid google API rate limiting.
*/
function pushEvents() {
  var numEvents = db.get('events').size().value();
  var batch = [];
  var BATCH_SIZE = 50;

  console.log('Preparing events to push...');
  for (var i = 0; i <= numEvents; i+=1) {
    var event = db.get('events[' + i + ']').value();

    if (event){
      if (Object.keys(event).length !== 0){
        batch.push( objToArray(event) );
      }
    }
    if (batch.length % BATCH_SIZE === 0 || i === numEvents ){
      pushBatch(batch);
      batch = [];
    }
  }
}

/**
* pushes an events batch to the google spreadsheet
*
* @param {object} rows, array of arrays (sheet rows)
*/
function pushBatch(batch){
  console.log('pushing batch ...');

  var request = {
    spreadsheetId: SHEET_ID,
    range: 'warka',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: batch
    },
    auth: oauth2Holder
  };

  sheets.spreadsheets.values.append(request, function(err, response) {
    if (err) {
      console.log('The API returned an error on write: ' + err);
      return;
    }
    else{
      console.log(JSON.stringify(response, null, 4));
    }
  });
}

/**
* Make sure the empty event values are replaced by dummy value,
* so that they can later be easily ignored.
* @param {object} event
*/
function replaceEmpties(event){
  var eventKeys = ['title', 'text', 'location',
    'link', 'date', 'startTime', 'endTime'
  ];
  var eventCopy = {};

  for(var index in eventKeys){
    var key = eventKeys[index];
    if (!event[key]){
      eventCopy[key] = 'unspecified';
    } else{
      eventCopy[key] = event[key];
    }
  }
  return eventCopy;
}

/**
* converts an event object to an array that respects the order of sheet columns.
*
* @param {object} obj
*/
function objToArray(obj){
  var arr = [
    obj.title,
    obj.text,
    obj.location,
    obj.link,
    obj.date,
    obj.startTime,
    obj.endTime
  ];
  return arr;
}

db.get('events')
.push({"Study Group Event": "title", "Event Description": "text", "Event Location": "location", "Study Group Name": "link", "Date of the Event": "date", "Start Time": "startTime", "End Time": "endTime"})
.write();
