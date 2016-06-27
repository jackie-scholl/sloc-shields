'use strict';

const fs = require('fs');
const child_process = require('child_process');
//const sloc = require('sloc');
const del = require('del');
//const ls = require('ls');
//const util = require('util');
//const process = require('process');
const path = require('path');

//require('reflect-metadata');
//require('babel-polyfill');


(function(){
  const IS_DEV_MACHINE = !!process.env.LAMBDA_SHIELD_REDIRECT_LOCAL;
  //const TEMP_REPO = '/tmp/temp-linecount-repo';
  //const TEMP_REPO = 'tmp/temp-linecount-repo';
  const TEMP_REPO = (IS_DEV_MACHINE? '' : '/') + 'tmp/temp-linecount-repo';
  //const TEMP_REPO = 'tmp/temp-linecount-repo';
  //const TEMP_REPO = 'temp-linecount-repo';
  const lsRecursive = function lsRecursive2(path2) {
    //console.log(path2);
    try {
      const stat = fs.statSync(path2);
      if (stat.isDirectory()) {
        console.log(path2 + ' is directory');
        const result = [[path2]].concat(
          fs.readdirSync(path2).map((p) => path.join(path2, p)).map(lsRecursive)
        );
        //return [].concat.apply([], result);
        //return Reflect.apply([].concat, [], result);
        return result.reduce((a, b) => a.concat(b));
      } else {
        return [path2];
      }
    } catch (exception) {
      //console.log(exception);
      if (exception.code === 'ENOENT') {
        console.log('does not exist: '+exception.path);
      } else {
        throw exception;
      }
      //if (exception)
    }
    //fs.readdir(path)
  };
  const countLOC = function(callback) {
    //const exclusionRegex = '"hello"';
    //const child = child_process.exec('node node_modules/sloc/bin/sloc -f '+
    //TEMP_REPO,
    /*ls('./', '--all', function(er, list) {
      // here you could get a files list of the current directory
    })*/
    //console.log(ls);
    //console.log(ls('./src', {recurse: true}));
    /*fs.stat('./src', (err, stats) => {
      if (err) {
        console.log('err:' +err);
        console.log(err);
      } else {
        console.log(stats);
      }
    });*/

    console.log(lsRecursive('src'));


    /*console.log('traversing .');
    for (const file in ls('.')) {
      console.log('file:');
      console.log(file);
      console.log(file.name);
    }

    console.log('traversing temp-linecount-repo');
    for (const file in ls(TEMP_REPO)) {
      console.log(file.full);
    }*/

    console.log('running sloc command now');

    child_process.execFile('node',
        ['node_modules/sloc/bin/sloc', '-f', 'json', TEMP_REPO],
        {},
        (err, stdout, stderr) => {
          if (err || stderr) {
            console.log('catching sloc error');
            //process.stderr.write(JSON.stringify(err)+'\n');
            //process.stderr.write(stderr);
            console.log(JSON.stringify(err));
            console.log(stderr);
            return callback(err, null);
          } else {
            console.log('sloc has no error');
            //console.log(stdout);
            const obj = JSON.parse(stdout);
            //callback(obj.summary);
            return callback(null, obj.summary);
          }
          //console.log(stdout);

          //console.log(obj.summary);
        }
    );
  };
  const countLocPromise = () => (
    new Promise((resolve, reject) => {
      countLOC((err, success) => {
        if (err) {
          reject(err);
        } else {
          resolve(success);
        }
      });
    })
  );
  /*const gitClone = function(repoUrl, callback) {
    const nodeGit = require('nodegit');
    nodeGit.Clone(repoUrl, TEMP_REPO).then(function(repository) {
      // Work with the repository object here.
      callback();
    });
  };*/
  const gitClone2 = function(repoUrl, callback) {
    console.log('isDevMachine: ' + IS_DEV_MACHINE);
    const gitCommand = IS_DEV_MACHINE? 'git' :
        //'./compiled_binaries/ec2-linux-git';
        './compiled_binaries/ec2-linux-git-2';
    console.log('gitCommand: ' + gitCommand);
    //const clone_command = gitCommand + ' clone --depth 1 "'+repoUrl+'" '+
    //TEMP_REPO;
    //console.log(clone_command);
    //child_process.exec(clone_command, {}, (err, stdout, stderr) => {
    console.log('running git command now');
    child_process.execFile(gitCommand,
        ['clone', /*'--depth', '1',*/ repoUrl, TEMP_REPO],
        (err, stdout, stderr) => {
          if (err) {
            //process.stderr.write(JSON.stringify(err)+'\n');
            //process.stderr.write(stderr);
            console.log('err');
            console.log(JSON.stringify(err));
            console.log(stderr);
            return callback(err, null);
          } else {
            //process.stdout.write(stdout);
            console.log('gitCommand succeeded');
            console.log(stdout);
            return callback(null, TEMP_REPO);
          }
      /*if (stderr) {

      }*/
      //callback();
        }
    );
  };

  const gitClone3 = (repoUrl, callback) => {
    console.log('isDevMachine: ' + IS_DEV_MACHINE);
    console.log('running copy command now');
    //const command = 'curl -L -s "'+repoUrl+'" | tar -xz && mv * "'+TEMP_REPO;
    //const command = `mkdir tmp; rm -r tmp/*; cd tmp && curl -L -s
    //"${repoUrl}/tarball/master" | `+
    //    `tar -xz -C "${TEMP_REPO}" && echo "----" && ls && cd .. &&
    //mv tmp/* "${TEMP_REPO}"`;
    const command = `rm -rf "${TEMP_REPO}" && mkdir -p "${TEMP_REPO}" && `+
        `curl -L -s "${repoUrl}/tarball/master" | `+
        `tar -xz -C "${TEMP_REPO}" --strip-components 1`;
    child_process.exec(command, (err, stdout, stderr) => {
      if (err) {
        console.log('err');
        console.log(JSON.stringify(err));
        console.log(stderr);
        console.log(stdout);
        return callback(err, null);
      } else {
        //process.stdout.write(stdout);
        console.log('gitCommand succeeded');
        console.log(stdout);
        return callback(null, TEMP_REPO);
      }
    });
  };

  const gitClone2Promise = (repoUrl) => (
    new Promise((resolve, reject) => {
      gitClone3(repoUrl, (err, success) => {
        if (err) {
          console.log(err);
          console.log('rejecting with error in gitclone2promise');
          reject(err);
        } else {
          resolve(success);
        }
      });
    })
  );

  const repoLineCount2 = function(repoUrl, callback) {
    console.log('hello');
    console.log('Current directory: ' + process.cwd());
    console.log('__dirname: ' + __dirname);
    console.log('ls compiled_binaries: ' + lsRecursive('compiled_binaries'));
    //console.log('/usr/bin: ' + JSON.stringify(lsRecursive('/usr/bin')
    ///*.map(s => typeof s)*/)/*.filter((s) => (typeof s === 'string' &&
    //s.includes('git'))).join('\n')*/);
    //console.log('/usr/bin: ' + lsRecursive('/usr/bin')
    //console.log('/var/task: ' + lsRecursive('/var/task')
    //    .filter((s) => (typeof s === 'string' && s.includes('git'))));
    //console.log(`Current directory: ${process.cwd()}`);
    const promise =
        new Promise((resolve, reject) =>
          {console.log('starting promise stuff'); resolve('woo');})
        .then(() => {console.log('hello');})
        .then(() => del(TEMP_REPO))
        .catch(() => (null))
        //del(TEMP_REPO)
        .then(() => {console.log('del succeeded!');})
        .then(() => gitClone2Promise(repoUrl))
        .then(() => countLocPromise());
    promise.catch((err) => {console.log('catching promise error: ' +
        JSON.stringify(err));});
    //promise.then((val) => {console.log('success! val is' + val);});
    //promise.then(() => del(TEMP_REPO));
    //promise.catch(() => del(TEMP_REPO));
    promise.then((summary) => {callback(summary);});
    /*gitClone2(repoUrl, () => {
      countLOC((summary) => {
        del(TEMP_REPO).then((paths) => {
          callback(summary);
        });
      });
    });*/
  };

  /*const repoLineCount = function(repoUrl, callback) {
    gitClone2(repoUrl, () => {
      countLOC((summary) => {
        del(TEMP_REPO).then(() => {
          callback(summary);
        });
      });
    });
    /*const clone_command =
    'rm -rf temp-linecount-repo && git clone --depth 1 "'+repoUrl+
    '" temp-linecount-repo';
    child_process.exec(clone_command, {}, (err, stdout, stderr) => {
      if (err) {
        console.log(stdout);
      }
      console.log(stdout);
      console.log(stderr);
      countLOC(callback);
    });*/

    /*child.stdout.on('data', (data) => {
      process.stdout.write(`${data}`);
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(`${data}`);
    });

    child.on('close', (code) => {
      console.log(`sloc process exited with code ${code}`);
    });*/
    /*fs.readFile("mySourceFile.coffee", "utf8", function(err, code){
      if(err){ console.error(err); }
      else{
        var stats = sloc(code,"coffee");
        for(i in sloc.keys){
          var k = sloc.keys[i];
          console.log(k + " : " + stats[k]);
        }
      }
    });
  };*/
  const getRepoUrl = function(query) {
    const resultObj = {
      user: query.user || 'raptortech-js',
      repo: query.repo || 'ncf-web-contract-system'
    };
    if (query.branch) {
      throw new Error('can\'t handle branches');
    }
    //https://github.com/raptortech-js/ncf-web-contract-system.git

    return 'https://github.com/'
    //return 'git://github.com/'
        + resultObj.user
        + '/' + resultObj.repo
        ;//+ '.git';
  };
  const getLink = function(query) {
    const resultObj = {
      user: query.user || 'raptortech-js',
      repo: query.repo || 'ncf-web-contract-system',
      branch: query.branch || null
    };
    const resultLink = 'https://img.shields.io/travis/'
        + resultObj.user
        + '/' + resultObj.repo
        + (resultObj.branch? '/'+resultObj.branch : '')
        + '.svg';
    return resultLink;
  };

  const getLink2 = (opts) => {
    if (!opts.subject || !opts.status || !opts.color) {
      throw new Error('missing vital options; opts='+JSON.stringify(opts));
    }
    //const opts2 = opts;
    //opts2.extension = opts2.exten
    let extensions = [];
    if (opts.style) {
      extensions = extensions.concat(`style=${opts.style}`);
    }
    if (opts.maxAge) {
      extensions = extensions.concat(`maxAge=${opts.maxAge}`);
    }
    const extensionsString = /*extensions? '' :*/ '?' + extensions.join('&');
    const url = `https://img.shields.io/badge/${opts.subject}-${opts.status}`+
        `-${opts.color}.svg`+extensionsString;
    return url;
    //url = url + opts.style? `style=${opts.style}`
  };
  /*const getLocationHash = function(query, callback) {
    const repoUrl = getRepoUrl(query);
    repoLineCount(repoUrl, (summary) => {
      const obj = {
        repoUrl: repoUrl,
        summary: summary,
        evnt: event,
        context: context
      }
      const locationHash = '#'+JSON.stringify(obj);
      callback(locationHash);
    });
  };
  const getFullLink = function(query, callback) {
    const resultLink = getLink(query);
    getLocationHash(query, (locationHash) => {
      callback(resultLink + locationHash);
      /*context.succeed({
        location: resultLink + locationHash
      });
    });
  };*/
  const handler = function(event, context) {
    console.log('hello');
    console.log(event);
    const query = event.params.querystring;
    /*getFullLink(query, (link) => {
      context.succeed({
        location: link
      });
    });*/
    const resultLink = getLink(query);
    /*getLocationHash(query, (locationHash) => {
      context.succeed({
        location: resultLink + locationHash
      });
    });*/
    const repoUrl = getRepoUrl(query);
    repoLineCount2(repoUrl, (summary) => {
      const obj = {
        repoUrl: repoUrl,
        summary: summary,
        evnt: event,
        context: context
      };
      const locationHash = '#'+JSON.stringify(obj);
      //const locationHash = '#'+'summary='+JSON.stringify(summary)+'&event='+
      //JSON.stringify(event)+"&context="+JSON.stringify(context)
      const badge = {
        subject: 'LOC',
        status: summary.total,
        color: 'brightgreen'
      };
      if (query.maxAge) {
        badge.maxAge = query.maxAge;
      }
      badge.style = query.style;
      const resultLink2 = getLink2(badge);
      context.succeed({
        //location: resultLink + locationHash
        location: resultLink2 + locationHash
      });
    });
  };
  exports.handler = handler;
  if (!module.parent) {
    console.log(process.argv[2]);
    const query = JSON.parse(process.argv[2]);
    console.log(getLink(query));
    const repoUrl = getRepoUrl(query);
    repoLineCount2(repoUrl, (summary) => {
      console.log('summary: ');
      console.log(summary);
    });
    /*getFullLink(query, (link) => {
      console.log(link);
    });*/
    //console.log(get)
    //console.log(getLink(query));
    //reporter.createReport(process.argv[2]);
  }
})();

/* eslint-disable max-len */
/*
https://5ezz6jithh.execute-api.us-east-1.amazonaws.com/prod/lambda-shield-redirect?user=raptortech-js&repo=ncf-web-contract-system&branch=Thomas

https://github.com/raptortech-js/ncf-web-contract-system/tree/Thomas#event={\"body-json\":{},\"params\":{\"path\":{},\"querystring\":{\"branch\":\"Thomas\",\"repo\":\"ncf-web-contract-system\",\"user\":\"raptortech-js\"},\"header\":{\"Accept\":\"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,**;q=0.8\",\"Accept-Encoding\":\"gzip, deflate, sdch, br\",\"Accept-Language\":\"en-US,en;q=0.8\",\"CloudFront-Forwarded-Proto\":\"https\",\"CloudFront-Is-Desktop-Viewer\":\"true\",\"CloudFront-Is-Mobile-Viewer\":\"false\",\"CloudFront-Is-SmartTV-Viewer\":\"false\",\"CloudFront-Is-Tablet-Viewer\":\"false\",\"CloudFront-Viewer-Country\":\"US\",\"Host\":\"5ezz6jithh.execute-api.us-east-1.amazonaws.com\",\"Upgrade-Insecure-Requests\":\"1\",\"User-Agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36\",\"Via\":\"1.1 4ee3d5920fafcf4bca394fd489654c8c.cloudfront.net (CloudFront)\",\"X-Amz-Cf-Id\":\"1mRvbHNv7enker0gdAo5JeohYevWYnBtIkUxFvWOtQt11EIuBOwZyQ==\",\"X-Forwarded-For\":\"128.177.61.20, 204.246.168.64\",\"X-Forwarded-Port\":\"443\",\"X-Forwarded-Proto\":\"https\"}},\"stage-variables\":{},\"context\":{\"account-id\":\"\",\"api-id\":\"5ezz6jithh\",\"api-key\":\"\",\"authorizer-principal-id\":\"\",\"caller\":\"\",\"cognito-authentication-provider\":\"\",\"cognito-authentication-type\":\"\",\"cognito-identity-id\":\"\",\"cognito-identity-pool-id\":\"\",\"http-method\":\"GET\",\"stage\":\"prod\",\"source-ip\":\"128.177.61.20\",\"user\":\"\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36\",\"user-arn\":\"\",\"request-id\":\"c74e41e2-3bb6-11e6-882a-6dae75cfe1a3\",\"resource-id\":\"3eb1sb\",\"resource-path\":\"/lambda-shield-redirect\"}}&context={\"callbackWaitsForEmptyEventLoop\":true,\"logGroupName\":\"/aws/lambda/shield-redirect\",\"logStreamName\":\"2016/06/26/[$LATEST]ade83390a4504b96abc8424b21699969\",\"functionName\":\"shield-redirect\",\"memoryLimitInMB\":\"128\",\"functionVersion\":\"$LATEST\",\"invokeid\":\"c74f2c7f-3bb6-11e6-b8e6-f9102abce935\",\"awsRequestId\":\"c74f2c7f-3bb6-11e6-b8e6-f9102abce935\",\"invokedFunctionArn\":\"arn:aws:lambda:us-east-1:620048203451:function:shield-redirect\"}
*/
/* eslint-enable max-len */
