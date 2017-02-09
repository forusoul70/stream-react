import mongodb from 'mongodb';
import mongoose from 'mongoose';

const DB_URL = 'mongodb://localhost:27017/stream';
const COLLECTION_TORRENT = 'torrent';

/**
* Mongo db 접근을 위한 모듈
*/
var mongoDbManager = function() {
  this.isConnected = false;
  this.model = null;
  this.requestConnect();
};

/**
* 연결 요청.
*/
mongoDbManager.prototype.requestConnect = function() {
  // connect
  var self = this;
  let db = mongoose.connect(DB_URL);
  db = mongoose.connection;

  db.on('error', function(err) {
    console.log('error  : ' + err);
  });

  db.once('open', function() {
    console.log('database has been connected');

    // Schema
    let torrentSchema = mongoose.Schema({
      id: String,
      infoHash: String,
      magnetURI: String,
      downloaded: Boolean,
      path : String,
      downloadStatus : String,
      files: [mongoose.Schema.Types.Mixed]
    });

    try {
      self.model = mongoose.model(COLLECTION_TORRENT, torrentSchema);
      self.model.on('error', function(err) {
        console.log('error  : ' + err);
      });
      self.isConnected = true;
    } catch (err) {
      console.log('Failed : ' + err);
    }
  });
};

/**
* Torrent 정보를 가져옴.
*/
mongoDbManager.prototype.getTorrent = function(torrentId) {
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
      success({
        infoHash: model.infoHash,
        magnetURI: model.magnetURI,
        downloaded: model.downloaded,
        path : model.path,
        downloadStatus : model.downloadStatus,
        files : model.files
      });
    });
  });
}

mongoDbManager.prototype.getAllTorret = function() {
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

      success(models.map(function(model) {
        return {
          infoHash: model.infoHash,
          magnetURI: model.magnetURI,
          downloaded: model.downloaded,
          path : model.path,
          downloadStatus : model.downloadStatus,
          files : model.files
        }
      }));
    });
  });
}

/**
* Torrent 를 업데이트 함.
*/
mongoDbManager.prototype.updateTorrent= function(id, torrent) {
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
      ,files : torrent.files.map(function(file) {
        return {
          name : file.name,
          path : file.path,
          length : file.length
        }
      })
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

mongoDbManager.prototype.removeTorrentByInfoHash = function(hash) {
  console.log(hash);
  var self = this;
  return new Promise(function(success, fail) {
    if (self.isConnected == false) {
        throw 'Database is not connected';
    }

    self.model.findOneAndRemove({infoHash : hash}, function(err, doc, result) {
        if (err) throw err;

        console.log(doc);
        console.log(result);
        if (doc) {
          success(doc);
        } else {
          fail();
        }
    });
  });
};

// Singleton
mongoDbManager.instance = null;
mongoDbManager.getInstance = function() {
  if (this.instance === null) {
    this.instance = new mongoDbManager()
  }
  return this.instance;
};

module.exports = mongoDbManager.getInstance();
