var path = require('path');

// find db helper
var appRoot = path.resolve(__dirname);
var dbHelper = require(appRoot + '/../module/dbHelper.js');

setTimeout(function(){
  let testTorrentId = 'test torrent id';
  var torrent = {
    infoHash : 'infoHash test',
    magnetURI : 'magnet test',
    downloaded : false,
    path : 'path test',
    downloadStatus : 'downloading'
  };

  console.dir(dbHelper);

  // insert or update
  for (var i = 0; i < 10; i++) {
    dbHelper.updateTorrent(testTorrentId + '_' + i, torrent).
    then(function(){
      console.log('success');
    }).catch(function(err) {
      console.log('Failed  : ' + err);
    });
  }

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
      console.dir('Download status is ' + model.downloadStatus);
    }
  }).catch(function(err) {
    console.log('Failed  : ' + err);
  });

  // get all torrent list
  dbHelper.getAllTorret().then(function(models){
    models.forEach(function(model) {
      console.log(model.magnetURI);
    });
  }).catch(function(err){
    console.log('Failed ' + err);
  });

}, 2000);
