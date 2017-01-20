var path = require('path');

// find torrent helper
var appRoot = path.resolve(__dirname);
var torrentHelper = new (require(appRoot + '/../module/torrentHelper.js')).torrentHelper();

var torrentId = 'https://webtorrent.io/torrents/sintel.torrent'
torrentHelper.requestDownload(torrentId);

setInterval(function(){
  var status = torrentHelper.getStats(torrentId);
  if (status !== undefined) {
    console.log('Downloaded : ' + status.percent);
    console.log('Speed : ' + status.downloadSpeed);
  }
}, 1000);
