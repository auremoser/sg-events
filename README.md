### Crawler

You need a github token, which you can generate [here][token]

To run the program:

```
$ NODE_GITHUB_TOKEN=<token> node index.js
```

#### Flow and Requirements

Flow:

- Get all forks from:
    `https://github.com/mozillascience/studyGroup`
- From each fork, list all files inside:
    `https://github.com/mozillascience/studyGroup/tree/gh-pages/_posts` from github-pages branch
- Download/request each file and parse to create json object (graymatter)

Requirements:

- It should recover from crashes
- It should run x times a month

TODO:

- Handle errors
- Ignore forks that did not create new events

#### Data
Entry parsed:

```js
{ title: 'Data Carpentry Genomics Workshop',
 text: 'The focus of this workshop will be on working with genomics data and data management and analysis for genomics research.',
 location: 'B18 Staff Conference Room',
 link: 'https://github.com/smcclatchy/studyGroup/issues/6',
 date: 2016-04-14T00:00:00.000Z,
 startTime: '09:00',
 endTime: '17:00' }
```

Fork payload:

```json
   {
        "id": 47545411,
        "name": "studyGroup",
        "full_name": "salim1991/studyGroup",
        "owner": {
            "login": "salim1991",
            "id": 16188473,
            "avatar_url": "https://avatars.githubusercontent.com/u/16188473?v=3",
            "gravatar_id": "",
            "url": "https://api.github.com/users/salim1991",
            "html_url": "https://github.com/salim1991",
            "followers_url": "https://api.github.com/users/salim1991/followers",
            "following_url": "https://api.github.com/users/salim1991/following{/other_user}",
            "gists_url": "https://api.github.com/users/salim1991/gists{/gist_id}",
            "starred_url": "https://api.github.com/users/salim1991/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/salim1991/subscriptions",
            "organizations_url": "https://api.github.com/users/salim1991/orgs",
            "repos_url": "https://api.github.com/users/salim1991/repos",
            "events_url": "https://api.github.com/users/salim1991/events{/privacy}",
            "received_events_url": "https://api.github.com/users/salim1991/received_events",
            "type": "User",
            "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/salim1991/studyGroup",
        "description": "",
        "fork": true,
        "url": "https://api.github.com/repos/salim1991/studyGroup",
        "forks_url": "https://api.github.com/repos/salim1991/studyGroup/forks",
        "keys_url": "https://api.github.com/repos/salim1991/studyGroup/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/salim1991/studyGroup/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/salim1991/studyGroup/teams",
        "hooks_url": "https://api.github.com/repos/salim1991/studyGroup/hooks",
        "issue_events_url": "https://api.github.com/repos/salim1991/studyGroup/issues/events{/number}",
        "events_url": "https://api.github.com/repos/salim1991/studyGroup/events",
        "assignees_url": "https://api.github.com/repos/salim1991/studyGroup/assignees{/user}",
        "branches_url": "https://api.github.com/repos/salim1991/studyGroup/branches{/branch}",
        "tags_url": "https://api.github.com/repos/salim1991/studyGroup/tags",
        "blobs_url": "https://api.github.com/repos/salim1991/studyGroup/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/salim1991/studyGroup/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/salim1991/studyGroup/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/salim1991/studyGroup/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/salim1991/studyGroup/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/salim1991/studyGroup/languages",
        "stargazers_url": "https://api.github.com/repos/salim1991/studyGroup/stargazers",
        "contributors_url": "https://api.github.com/repos/salim1991/studyGroup/contributors",
        "subscribers_url": "https://api.github.com/repos/salim1991/studyGroup/subscribers",
        "subscription_url": "https://api.github.com/repos/salim1991/studyGroup/subscription",
        "commits_url": "https://api.github.com/repos/salim1991/studyGroup/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/salim1991/studyGroup/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/salim1991/studyGroup/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/salim1991/studyGroup/issues/comments{/number}",
        "contents_url": "https://api.github.com/repos/salim1991/studyGroup/contents/{+path}",
        "compare_url": "https://api.github.com/repos/salim1991/studyGroup/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/salim1991/studyGroup/merges",
        "archive_url": "https://api.github.com/repos/salim1991/studyGroup/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/salim1991/studyGroup/downloads",
        "issues_url": "https://api.github.com/repos/salim1991/studyGroup/issues{/number}",
        "pulls_url": "https://api.github.com/repos/salim1991/studyGroup/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/salim1991/studyGroup/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/salim1991/studyGroup/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/salim1991/studyGroup/labels{/name}",
        "releases_url": "https://api.github.com/repos/salim1991/studyGroup/releases{/id}",
        "deployments_url": "https://api.github.com/repos/salim1991/studyGroup/deployments",
        "created_at": "2015-12-07T10:29:59Z",
        "updated_at": "2015-12-07T10:30:56Z",
        "pushed_at": "2015-12-04T21:41:51Z",
        "git_url": "git://github.com/salim1991/studyGroup.git",
        "ssh_url": "git@github.com:salim1991/studyGroup.git",
        "clone_url": "https://github.com/salim1991/studyGroup.git",
        "svn_url": "https://github.com/salim1991/studyGroup",
        "homepage": null,
        "size": 21563,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "JavaScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "has_pages": false,
        "forks_count": 0,
        "mirror_url": null,
        "open_issues_count": 1,
        "forks": 0,
        "open_issues": 1,
        "watchers": 0,
        "default_branch": "gh-pages"
    }
```


[token]:https://github.com/settings/tokens
