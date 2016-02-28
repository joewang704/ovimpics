'use strict'
const request = require('request-promise');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use('/src', express.static('src'));

app.get('/', (req, res) => {
  getCode().then((code) => {
    res.render('index.ejs', {code: code});
  });
});

function getCode(language) {
  const repoStarsMin = 100;
  const repoStarsMax = 1000;
  let repos;
  let selectedRepoId;
  const lang = language || 'javascript';
  let options = {
    uri: `https://api.github.com/search/repositories?q=stars:${repoStarsMin}..${repoStarsMax}+language:${lang}&sort=stars&order=desc`,
    method: 'GET',
    headers: {
      'User-Agent': 'ovimpics',
    }
  };
  return request(options)
    .then((repoResponse) => {
      repos = JSON.parse(repoResponse).items;
      selectedRepoId = Math.floor(Math.random() * repos.length);
      options.uri = `https://api.github.com/search/code?q=repo:${repos[selectedRepoId].full_name}+language:${lang}`;
      return request(options);
    })
    .then((urlsResponse) => {
      const urls = JSON.parse(urlsResponse).items;
      const selectedUserId = Math.floor(Math.random() * urls.length);
      const path = urls[selectedUserId].path.startsWith('/') ?
        urls[selectedUserId].path.slice(1) :
        urls[selectedUserId].path;
      options.uri = `https://raw.githubusercontent.com/${repos[selectedRepoId].full_name}/master/${path}`;
      return request(options);
    })
    .then((code) => {
      return code;
    });
}

function renderHtml(code) {
  return `
    <!doctype html>
    <html>
    <head>
      <title>ovimpics - like olympics but with vim</title>
      <meta charset="utf-8"/>
      <link rel="stylesheet" href="./assets/css/docs.css">
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
      <link rel="stylesheet" href="./assets/css/codemirror.css">
      <link rel="stylesheet" href="./assets/css/solarized.css">
      <link rel="stylesheet" type="text/css" href="assets/css/style.css">
    </head>
    <body>
      <div id="container">
        <form action>
          <textarea id="code" name="code">${code}</textarea>
        </form>
        <div class='terminal-green'>key log: <span class="white" id="key-logger">empty</span></div>
        <div class='terminal-green'># of commands: <span class="white" id="key-count">0</span></div>
        <div class='terminal-green'>timer: <span class="white" id="clock">0</span></div>
      </div>
      <script src="./assets/bundle.js"></script>
    </body>
    </html>
  `;
}

app.listen(port, () => {
  if (!process.env.PORT) {
    console.log('Listening to port 3000...');
  }
});
