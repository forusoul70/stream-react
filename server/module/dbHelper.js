import mongodb from 'mongodb';
import mongoose from 'mongoose';

const DB_URL = 'mongodb://localhost:27017/stream';
const COLLECTION_TORRENT = 'torrent';

/**
* Mongo db 접근을 위한 모듈
*/
var dbHelper = function() {
  this.isConnected = false;
  this.model = null;
  this.requestConnect();
};

/**
* 연결 요청.
*/
dbHelper.prototype.requestConnect = function() {
  // connect
  var self = this;
  // mongoose.connect(DB_URL);
  let db = mongoose.createConnection(DB_URL);
  db.once('open', function() {
    console.log('database has been connected');

    // Schema
    let torrentSchema = mongoose.Schema({
      id: String,
      infoHash: String,
      magnetURI: String,
      downloaded: Boolean,
      path : String,
      downloadStatus : String
    });

    try {
      self.model = mongoose.model(COLLECTION_TORRENT, torrentSchema);
      self.isConnected = true;
    } catch (err) {
      console.log('Failed : ' + err);
    }
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

    var query = self.model.where({id : torrentId});
    query.findOne(function(err, model) {
      if (err) throw err;

      if (model === undefined || model === null) {
        console.log('Failed to find torernt by ' + torrentId);
        failed();
        return;
      }
      success(model);
    });
  });
}

dbHelper.prototype.getAllTorret = function() {
  var self = this;
  return new Promise(function(success, failed) {
    if (self.isConnected == false) {
      throw 'Database is not connected';
    }

    var list = self.model.find({}, function(err, models) {
      if (err) throw err;

      if (models === undefined || models === null) {
        console.log('Failed to get torrent list');
        failed();
        return;
      }

      success(models);
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

    self.model.findOneAndUpdate({id : id}, torrentRow, {upsert : true}, function(err, doc){
      if (err) throw err;

      if (doc === undefined || doc === null) {
        throw 'Failed to update';
      }

      success();
    });
  });
};

// Singleton
dbHelper.instance = null;
dbHelper.getInstance = function() {
  if (this.instance === null) {
    this.instance = new dbHelper()
  }
  return this.instance;
};

module.exports = dbHelper.getInstance();
