import torrentManager from '../module/torrentManager';
import path from 'path';

// find torrent helper
var appRoot = path.resolve(__dirname);

var torrentId = 'https://webtorrent.io/torrents/sintel.torrent'
torrentManager.requestDownload(torrentId);

setInterval(function(){
  try {
    var status = torrentManager.getStatus(torrentId);
    if (status !== undefined) {
      console.log('Downloaded : ' + status.percent);
      console.log('Speed : ' + status.downloadSpeed);
    }
  } catch(err) {
    console.log('error ' + err);
  }
}, 1000);
