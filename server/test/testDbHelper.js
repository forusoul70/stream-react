var path = require('path');

// find db helper
var appRoot = path.resolve(__dirname);
var dbHelper = new (require(appRoot + '/../module/dbHelper.js')).dbHelper();

setTimeout(function(){
  let testTorrentId = 'test torrent id';
  var torrent = {
    infoHash : 'infoHash test',
    magnetURI : 'magnet test',
    downloaded : false,
    path : 'path test',
    downloadStatus : 'downloading'
  };

  // insert or update
  dbHelper.updateTorrent(testTorrentId, torrent).
  then(function(){
    console.log('success');
  }).catch(function(err) {
    console.log('Failed  : ' + err);
  });

  // update test
  torrent.downloadStatus = 'finished';
  dbHelper.updateTorrent(testTorrentId, torrent).
  then(function(){
    return dbHelper.getTorrent(testTorrentId);
  }).then(function(model) {
    if (model) {
      if (model.downloadStatus === 'finished') {
        console.log('success');
      } else {
        console.log('failed');
      }
      console.dir(model);
    }
  }).catch(function(err) {
    console.log('Failed  : ' + err);
  });


}, 2000);
