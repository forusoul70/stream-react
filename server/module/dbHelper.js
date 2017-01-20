var mongodb = require('mongodb');
const DB_URL = 'mongodb://localhost:27017/stream';
const COLLECTION_TORRENT = 'torrent';

/**
* Mongo db 접근을 위한 모듈
*/
var dbHelper = function() {
  this.isConnected = false;
  this.requestConnect();
};

/**
* 연결 요청.
*/
dbHelper.prototype.requestConnect = function() {
  // connect
  var self = this;
  mongodb.MongoClient.connect(DB_URL, function(err, database) {
      if (err) {
        console.error('Failed to connect database : ' + err);
        return;
      }

      console.log('Database connection ready');
      self.isConnected = true;
      self.db = database;
  });
};

/**
* Torrent 정보를 가져옴.
*/
dbHelper.prototype.getTorrent = function(torrentId) {
  var self = this;
  return new Promise(function(success, failed) {
    if (self.isConnected == false) {
      throw 'Database is not connected';
    }

    if (torrentId == false) {
      throw 'Invalid torrent id';
    }

    // get collection
    var collection = self.db.collection(COLLECTION_TORRENT);
    collection.find({
      id: torrentId
    }).limit(1).next(function(err, torrent){
      if (err) {
        throw err;
      }

      if (torrent === undefined || torrent === null) {
          console.log('Failed to find torernt by ' + torrentId);
          failed();
          return;
      }
      success(torrent);
    });
  });
}

/**
* Torrent 를 업데이트 함.
*/
dbHelper.prototype.updateTorrent= function(id, torrent) {
  var self = this;
  return new Promise(function(success) {
    if (self.isConnected == false) {
      throw 'Database is not connected';
    }

    if (id === null || id === undefined ||
      torrent === null || torrent === undefined) {
      throw 'Invalid input paramas';
    }

    // make row
    var torrentRow = {
      id: id === undefined ? '' : id
      ,infoHash: torrent.infoHash
      ,magnetURI: torrent.magnetURI
      ,downloaded: torrent.downloaded
      ,path : torrent.path
      ,downloadStatus : torrent.downloadStatus
    };

    self.getTorrent(id).then(function(torrent){ // 이미 있다면
      var torrentRow = {
        id: id
        ,infoHash: torrent.infoHash
        ,magnetURI: torrent.magnetURI
        ,downloaded: torrent.downloaded
        ,path : torrent.path
        ,downloadStatus : torrent.downloadStatus
      };
      self.db.collection(COLLECTION_TORRENT).update({id: id}, torrentRow, {}/*option*/,  function(e, result){
        if (e) {
          throw e;
        }
        if (result == false) {
          throw 'Failed to insert';
        }
        // 성공
        success();
      });
    }, function(){ // 없는 경우 새로 넣어야함.
      self.db.collection(COLLECTION_TORRENT).insert(torrentRow, {}/*option*/, function(e, result) {
        if (e) {
          throw e;
        }
        if (result == false) {
          throw 'Failed to insert';
        }
        // 성공
        success();
      });
    }).catch(function(err) {      
      throw err;
    });
  });
};

module.exports.dbHelper = dbHelper;
