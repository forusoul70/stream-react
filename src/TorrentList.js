import React from 'react';
import axios from 'axios'

const REQUEST_GET_TORRENT_LIST = '/torrent/getTorrentList';

export default class TorrentList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list : []
    };
  };

  getDownloadList() {    
    axios.post(REQUEST_GET_TORRENT_LIST, {})
    .then(res => {
      console.log(res);
    }).catch(res => {
      console.log(res);
    })
  }

  render() {
    return (
      <div>
        <li>test</li>
        <button onClick={this.getDownloadList}>test</button>
      </div>
    )
  }
}
