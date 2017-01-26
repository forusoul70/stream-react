import path from 'path';
import mongoDbManager from '../module/mongoDbManager';

// find db helper
var appRoot = path.resolve(__dirname);;

setTimeout(function(){
  let testTorrentId = 'test torrent id';
  var torrent = {
    infoHash : 'infoHash test',
    magnetURI : 'magnet test',
    downloaded : false,
    path : 'path test',
    downloadStatus : 'downloading'
  };

  console.log('Insert or update test');
  // insert or update
  for (var i = 0; i < 10; i++) {
    mongoDbManager.updateTorrent(testTorrentId + '_' + i, torrent).
    then(function(){
      console.log('success');
    }).catch(function(err) {
      console.log('Failed  : ' + err);
    });
  }

  // update test
  torrent.downloadStatus = 'finished';
  mongoDbManager.updateTorrent(testTorrentId, torrent).
  then(function(){
    return mongoDbManager.getTorrent(testTorrentId);
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
  mongoDbManager.getAllTorret().then(function(models){
    models.forEach(function(model) {
      console.dir(model);
    });
  }).catch(function(err){
    console.log('Failed ' + err);
  });

}, 2000);
