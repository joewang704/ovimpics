'use strict'
const request = require('request');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use('/assets', express.static('assets'));
app.use('/lib', express.static('lib'));

app.get('/', (req, res) => {
  res.sendfile('index.html');
});

app.get('/getCode', (req, res) => {
  const repoStarsMin = 100;
  const repoStarsMax = 1000;
  let options = {
    uri: `https://api.github.com/search/repositories?q=stars:${repoStarsMin}..${repoStarsMax}&sort=stars&order=desc`,
    method: 'GET',
    headers: {
      'User-Agent': 'vattles'
    }
  };
  request(options, (err, response, body) => {
    if (!err && response.statusCode === 200) {
      const repos = JSON.parse(body).items;
      const selectedRepoId = Math.floor(Math.random() * repos.length);
      options.uri = `https://api.github.com/search/code?q=repo:${repos[selectedRepoId].full_name}`;
      request(options, (err, response, body) => {
        if (!err && response.statusCode === 200) {
          const urls = JSON.parse(body).items;
          const selectedUserId = Math.floor(Math.random() * urls.length);
          const path = urls[selectedUserId].path.startsWith('/') ?
            urls[selectedUserId].path.slice(1) :
            urls[selectedUserId].path;
          options.uri = `https://raw.githubusercontent.com/${repos[selectedRepoId].full_name}/master/${path}`;
          request(options, (err, response, body) => {
            if (!err && response.statusCode === 200) {
              return res.send(body);
            }
            return res.send(response);
          });
        } else {
          return res.send(response);
        }
      });
    } else {
      return res.send(response);
    }
  });
});

app.listen(port, () => {
  if (!process.env.PORT) {
    console.log('Listening to port 3000...');
  }
});
