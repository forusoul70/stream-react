import express from 'express';
import session from 'express-session';
import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import path from 'path';
import bodyParser from 'body-parser';
import bkfd2Password from 'pbkdf2-password'
import mongoDbManager from './module/mongoDbManager';
import torrentManager from './module/torrentManager'
import socket from 'socket.io';
var io = null;

const app = express();
const port = 3000;
const devPort = 3001;
const hasher = bkfd2Password();
const SOCKET_EVENT_ON_DOWNLOAD = 'onDownload';
const streamHelper = new (require('./module/streamHelper.js')).streamHelper();

const SALT = '889302F278F3A45D5479B4A9D0A6E0AE';
const PASSWORD = 'txFgSnjHlZydh0ik7PHN+hhTAirTyk7o6ILqF72fxWJTKPsRboaeHaIiRLSWFOcO1qxybA7N78oM+G/bF2Kr5S1R9j/hFNlQFGFdcH9YnH7p8a9nj5J13ZncelERke1XSJMZDqlStSjn+VmxPXlwcHiL/gR8fTTfMQlhGX51KtI=';

if (process.env.NODE_ENV == 'development') {
    console.log('Server is running on development mode');

    const config = require('../webpack.dev.config');
    let compiler = webpack(config);
    let devServer = new WebpackDevServer(compiler, config.devServer);
    devServer.listen(devPort, () => {
        console.log('webpack-dev-server is listening on port', devPort);
    });
}

app.use('/', express.static(__dirname + '/../public'));
app.use('/resource/', express.static(__dirname + '/resource'));
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());
app.use(session({
  secret: '1234DSFs@adf1234!@#$asd',
  resave: false,
  saveUninitialized: true
}));

app.post('/login', (req, res) => {
  var password = req.body.password;

  hasher({password : password,  salt : SALT}, (err, pass, salt, hash) => {
    if (hash === PASSWORD) {
      req.session.isLogin = true;
      req.session.save(function(){
        res.status(200).json({
          message : 'success login',
          result : true
        });
      });
    } else {
      res.status(200).json({
        message : 'failed login',
        result : false
      });
    }
  });
});

app.get('/torrentPage', (req, res) => {
  if (req.session.isLogin) {
    res.sendFile(path.join(__dirname, '../public/torrent.html'));
  } else {
    res.redirect('/');
  }
});

// hls
app.get('/hls/:movie', (req, res) => {
  var movie = req.params.movie;
  res.redirect('/file/' + movie + '.m3u8');
});

app.get('/file/:file', (req, res) => {
  streamHelper.responseMovie(req, res);
});

// psuedo streaming
app.get('/stream/:movie', (req, res) => {
  streamHelper.responsePseudoMovie(req, res);
});

app.post('/torrent/requestDownload', (req, res) => {
  var type = req.body.type;
  if (type == 'magnet') {
    let magnet = req.body.magnet;
    var listener = function(event) {
      if (io  !== null) {
        io.emit(SOCKET_EVENT_ON_DOWNLOAD, event);
      }
    };
    torrentManager.requestDownload(magnet, null, listener);
  }

  res.status(200).send('finished');
});

app.post('/torrent/getTorrentList', (req, res) => {
  mongoDbManager.getAllTorret().then(function(list) {
    res.status(200).json(list);
  }).catch(function(err){
    console.log('Error : ' + err);
    res.status(400).send(err);
  })
});

const server = app.listen(port, () => {
    console.log('Express listening on port', port);
});

// init socket.io
io = socket(server);
io.on('connection', (socket) => {
  console.log('Connected socket');
});
