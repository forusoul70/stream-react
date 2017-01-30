import path from 'path';
import WebTorrent from 'webtorrent';
import mongoDbManager from './mongoDbManager';

const STATUS_DOWNLOADING = 'downloading';
const STATUS_DONE = 'done';

/**
* 프로젝트 root path 찾기
*/
var getRootPath = function() {
  var filePath = path.resolve(__dirname);
  return filePath.substring(0, filePath.lastIndexOf('/'));
};

/**
* "./resource/movie" 폴더 리턴
*/
var getDefualtMoviePath = function() {
  var rootPath = getRootPath();
  return rootPath + '/resource/movie';
};

/**
* "./module" 폴더 리턴
*/
var getModulePath = function() {
  var rootPath = getRootPath();
  return rootPath + '/module';
};

/**
*  Human readable bytes util
*/
var prettyBytes = function(num) {
	var exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	if (neg) num = -num
	if (num < 1) return (neg ? '-' : '') + num + ' B'
	exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
	num = Number((num / Math.pow(1000, exponent)).toFixed(2))
	unit = units[exponent]
	return (neg ? '-' : '') + num + ' ' + unit
}

/**
* Web Torrent module
*/
var torrentManager = function() {
  this.downloadMap = {};
  this.listenerMap = {};
};

/**
* torrent 다운로드 요청.
*/
torrentManager.prototype.requestDownload = function(torrentId, downloadPath, listener) {
  // validation check
  if (typeof torrentId !== 'string' || torrentId.length == 0) {
    console.log('Invalid torrent id');
    return;
  }

  var client = new WebTorrent();
  var option = {
    path: downloadPath || getDefualtMoviePath()
  };

  var self = this;
  client.add(torrentId, option, function(torrent){
    console.log('Client is downloading: ', torrent.infoHash);
    console.log('Download path: ', torrent.path);

    // insert torrent to dictionary
    self.downloadMap[torrentId] = torrent;
    self.listenerMap[torrentId] = listener;

    // update torrent status to db
    torrent.downloadStatus = STATUS_DOWNLOADING;
    mongoDbManager.updateTorrent(torrentId, torrent).then(function(){
      console.log('update db finished');
    }).catch(function(err) {
      console.log('Failed to update db! : ' +  err);
    });

    // Handle Error
    torrent.on('error', function(err) {
      console.log('Error occurred : ', err);
    });

    torrent.on('download', function(bytes) {
        var status = self.getStatus(torrentId);
        if (status !== undefined) {
          torrent.downloadStatus = JSON.stringify(status);
          mongoDbManager.updateTorrent(torrentId, torrent).then(function(){
            console.dir(status);
            var listener = self.listenerMap[torrentId];
            if (listener !== undefined) {
              listener(status);
            }
          }).catch(function(err) {
            console.log('Failed to update status : ' + err);
          });

        }
    });

    // Handle Download finish
    torrent.on('done', function(err) {
      // update torrent status to db
      torrent.downloadStatus = STATUS_DONE;
      mongoDbManager.updateTorrent(torrentId, torrent).then(function(){
        console.log('update db finished');
      }).catch(function(err) {
        console.log('Failed to update db : ' + err);
      });

      console.log('Download fisished path : ' + torrent.path);
      torrent.files.forEach(function(file){
        console.log('%s[%d][%b]', file.name, file.length, file.downloaded);
      });

      delete self.downloadMap[torrentId];
      delete self.listenerMap[torrentId];
    });
  });
};

/**
* 다운로드 중인 torrent 의 status 를 가져온다.
*/
torrentManager.prototype.getStatus = function (torrentId) {
  if (this.downloadMap.hasOwnProperty(torrentId) == false) {
    console.log('getStats(), Failed to find torrent : ' + torrentId);
    return undefined;
  }

  var torrent = this.downloadMap[torrentId];
  // Download status
  var percent = Math.round(torrent.progress * 100);
  return {
    percent : percent,
    downloadSpeed : prettyBytes(torrent.downloadSpeed)
  };
};

// Singleton
torrentManager.instance = null;
torrentManager.getInstance = function() {
  if (this.instance === null) {
    this.instance = new torrentManager()
  }
  return this.instance;
};

module.exports = torrentManager.getInstance();
