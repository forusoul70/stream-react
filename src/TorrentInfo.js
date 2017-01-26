import React from 'react';

export default class TorrentInfo extends React.Component {
  render() {
    return(
      <div>
        <li>info hash : {this.props.torrent.infoHash} </li>
        <li>magent: {this.props.torrent.magnetURI} </li>
        <li>download : {this.props.torrent.downloaded} </li>
        <li>path : {this.props.torrent.path} </li>
        <li>status : {this.props.torrent.downloadStatus} </li>
      </div>
    )
  }
}
