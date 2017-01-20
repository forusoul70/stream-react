var path = require('path');
var fs = require('fs');
var fileConsole = null;

var _getConsole = function() {
    if (fileConsole === null) {
      var outPath = path.join(global.appRoot, 'out.log');
      var errorPath = path.join(global.appRoot, 'error.log');
      const output = fs.createWriteStream(outPath);
      const errorOutput = fs.createWriteStream(errorPath);

      const Console = console.Console;
      fileConsole = new Console(output, errorOutput);
    }
    return fileConsole;
}

module.exports.fileLogger = function() {
  /**
  * 일반로그
  */
  this.log = function(log, params) {
    if (params === undefined) {
      _getConsole().log(log);
      console.log(log);
    } else {
      _getConsole().log(log, params);
      console.log(log, params);
    }
  }

  /**
  * 에러로그
  */
  this.error = function(log, params) {
    if (params === undefined) {
      _getConsole().error(log);
      console.error(log, params);
    } else {
      _getConsole().error(log, params);
      console.error(log, params);
    }
  }
}
