var path = require('path');
var fs = require('fs');
var events = require("events");
const RESOURCE_PATH = 'resource/movie/';
const MIME_MP4 = 'video/mp4'
var handler = new events.EventEmitter();
var fileLogger = new (require(global.modulePath + '/fileLogger.js')).fileLogger();

// error handler define
handler.on('badRequest', (res, error) => {
  res.status(400).send("<!DOCTYPE html><html lang=\"en\">" +
		"<head><title>400 Bad request</title></head>" +
		"<body>" +
		"<h1>Error</h1>" +
		"<p>" + error + "</p>" +
		"</body></html>");
});

// pseudo streaming 시 지원하는 mime type
const supportTypes = {
	".mp4": "video/mp4",
};

/*
* File 이름으로 mime type 을 찾아서 지원하는 mime type 인지 리턴
*/
var _isSupportType = function(fileName) {
  var ext = path.extname(fileName);
  var mime = supportTypes[ext.toLowerCase()];
  if (mime === null || mime === undefined || mime.length === 0) {
    return false;
  }

  return true;
}
/**
* 파일이 존재하는 검사
**/

var _isFileExist = function(filePath) {
  return new Promise(function(exist) {
    fs.exists(filePath, function(isExist) {
      if (isExist) { // 존재 할때
        exist();
      } else { // 존재 하지 않을 때
        throw 'File not exist [' + filePath + ']';
      }
    });
  });
}

/**
* 파일 사이즈를 가지고 오는 함수
**/
var _getFileSize = function(filePath) {
  return new Promise(function(size) {
    fs.stat(filePath, function(err, stat) {
      size(stat.size);
    });
  });
}

/*
* 숫자 형태 인지 확인하는 함수
* // http://stackoverflow.com/a/1830844/648802
*/
var _isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/*
* file 이름으로 저장된 폴더 찾기
* 1. 확장자를 띄고
* 2. 숫자를 모두 띈다
*/
var _findFolder = function(fileName) {
  var folder = fileName.substring(0, fileName.indexOf('.'));
  var folder = folder.replace(/[0-9]+/g, '');
  return folder;
}

/*
* 파일을 정보를 request 로 부터 찾아서 header 정보를 만들어서 리턴.
* 1. 요청된 Range check
*
*/
var _makePseudoResponseHeader = function(filePath, reqRange) {

  return new Promise(function(cb) {
    // return value 초기화
    var info = {};

    // 파일 정보 가져오기,
    // TODO 일단 try catch 는 신경쓰지 말자 나에겐 아직 그런 실력이 없으니까..
    var stat = fs.statSync(filePath);
    info.start = 0;
    info.end = stat.size - 1;
    info.size = stat.size;
    info.modified = stat.mtime;
    info.rangeRequest = false;

    // 요청된 파일 범위 체크
    var range = reqRange;
    range = typeof range === 'string' ? range : undefined;
    if (range !== undefined && (range = range.match(/bytes=(.+)-(.+)?/)) !== null) {
      // Check range contains numbers and they fit in the file.
  		// Make sure info.start & info.end are numbers (not strings) or stream.pipe errors out if start > 0.
      info.start = _isNumber(range[1]) && range[1] >= 0 && range[1] < info.end ? range[1]: info.start;
  		info.end = _isNumber(range[2]) && range[2] > info.start && range[2] <= info.end ? range[2] : info.end;
  		info.rangeRequest = true;
    }
    info.length = info.end - info.start + 1;

    // promise call
    cb(info);
  });
}

/**
* send M3u8
**/
var _sendM3u8 = function(filePath, res) {
  fs.readFile(filePath, function(err, content) {
    if (err) {
      res.status(400).send('Error when read file : ' + fileName);
    } else if (content) {
      res.header('Content-Type', 'application/vnd.apple.mpegurl');
      res.status(200).send(content);
    } else {
      res.status(400).send('Empty play list');
    }
  });
}

/**
* send ts
**/
var _sendTsStream = function(filePath, res) {
  _getFileSize(filePath).catch(function(e) {
    res.status(400).send('Failed to get file size [' + filepath + ']');
  }).then(function(size) {
    res.header('Content-Type', 'video/mp2t');
    res.header('Accept-Ranges', 'bytes');
    res.header('Content-Length', size);
    res.header('Connection', 'keep-alive');
    res.status(200);

    var stream = fs.createReadStream(filePath);
    // for debug
    stream.on('data', function(data) {
	     console.log(filePath + '[' + data.length + ']');
     });

    stream.on('end', function () {
    	console.log('finished [' + filePath + ']');
    });

    stream.on('error', function(err) {
    	console.log('something is wrong : [' + err + ']');
    });

    // pipe to response
    stream.pipe(res);
    });
  }

module.exports.streamHelper = function() {
  /**
  * Response for hls stremaing request
  **/
  this.responseMovie = function(req, res) {
    // file format 검사
    var movie = req.params.file;
    var folder = _findFolder(movie);
    var filePath = path.join(global.appRoot, RESOURCE_PATH + folder + '/' + movie);

    // file 찾기
    _isFileExist(filePath).catch(function(e){
      res.status(400).send(e);
    }).then(function(){
      switch (path.extname(movie)) {
        case '.m3u8':
          _sendM3u8(filePath, res);
          break;
        case '.ts':
          _sendTsStream(filePath, res);
          break;
        default:
      }
    });
  }

  /**
  * Response for pseudo stremaing request
  **/
  this.responsePseudoMovie = function(req, res) {
    try {
      // 먼저 파일이 있는 지 체크
      var movie = req.params.movie;

      var filePath = path.join(global.appRoot, RESOURCE_PATH + '/' + movie);
      if (_isSupportType(movie) == false) {
        handler.emit('badRequest', res, 'Unsupport mime type');
        return;
      }

      _isFileExist(filePath).then(function() {
        return _makePseudoResponseHeader(filePath, req.get('Range'));
      }).then(function(info) {
        // 헤더를 만든다.
        res.header('Content-Type', MIME_MP4);
        res.header('Connection', 'keep-alive');
        res.header('Accept-Ranges', 'bytes');
        res.header('Last-Modified', info.modified.toUTCString());
        res.header('Content-Length', info.length);
        if (info.rangeRequest) {
          res.header('Content-Range', 'bytes ' + info.start + '-' + info.end + '/' + info.size);
          res.status(206); // response code 206 Partial Content
        } else {
          res.status(200);
        }

        // Raad stream 연결
        var stream = fs.createReadStream(filePath, {
          flags : 'r',
          start : parseFloat(info.start),
          end : parseFloat(info.end)
        });
        stream.pipe(res);
      });
    } catch (e) {
      handler.emit('badRequest', res, e);
    }
  };
}
