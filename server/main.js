import express from 'express';
import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import path from 'path';
import bodyParser from 'body-parser';
import mongoDbManager from './module/mongoDbManager';
import torrentManager from './module/torrentManager'

global.appRoot = path.resolve(__dirname) + "/../server";
global.modulePath = global.appRoot + "/module"

const app = express();
const port = 3000;
const devPort = 3001;

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

const streamHelper = new (require('./module/streamHelper.js')).streamHelper();
const fileLogger = new (require('./module/fileLogger.js')).fileLogger();

// hls
app.get('/hls/:movie', (req, res) => {
  var movie = req.params.movie;
  res.redirect('/file/' + movie + '.m3u8');
});

app.get('/file/:file', (req, res) => {
  streamHelper.responseMovie(req, res);
});

// psuedo streaming
app.get('/pseudo/:movie', (req, res) => {
  streamHelper.responsePseudoMovie(req, res);
});

app.post('/torrent/requestDownload', (req, res) => {
  var type = req.body.type;
  if (type == 'magnet') {
    let magnet = req.body.magnet;
    console.log(magnet);
    torrentManager.requestDownload(magnet);
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
