import React from 'react';
import axios from 'axios'

import TorrentInfo from './TorrentInfo'

const IDLE = 0;
const DOWNLOADING = 1;
const FINISHED = 2;

const REQUEST_DOWNLOAD_URL = '/torrent/requestDownload';
const REQUEST_GET_TORRENT_LIST = '/torrent/getTorrentList';

const SOCKET_EVENT_ON_DOWNLOAD = 'onDownload';

export default class DownloadDetail extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
          downloadState : 0,
          magnetUrl : '',
          torrentList: []
      };

      this.handleChange = this.handleChange.bind(this);
      this.requestDownload = this.requestDownload.bind(this);
      this.getDownloadList = this.getDownloadList.bind(this);
      this.handleDeleteTorrent = this.handleDeleteTorrent.bind(this);

      // init push listener
      this.socket = io.connect();
      var self = this;
      this.socket.on(SOCKET_EVENT_ON_DOWNLOAD, (event) => {
        self.getDownloadList();
      });
      this.getDownloadList();
    }

    getDownloadList() {
      axios.post(REQUEST_GET_TORRENT_LIST, {})
      .then(res => {
        this.setState({
          torrentList : res.data
        });
      }).catch(res => {
        console.log(res);
      })
    }

    requestDownload() {
      const self = this;

      axios.post(REQUEST_DOWNLOAD_URL, {
        type : 'magnet',
        magnet : this.state.magnetUrl
      }).then(res => {
        console.log('download request finished, res is ' + res);
      }).catch(err => {
        console.log(err);
      })
    }

    handleChange(e) {
      this.setState({
        magnetUrl : e.target.value
      });
      console.log(this.state.magnetUrl);
    }

    handleDeleteTorrent() {      
      this.getDownloadList();
    }

    render() {
      var empty = (<div>empty</div>);
      var torrentList = (list) => {
        return list.map((torrent, i) => {
          return (<TorrentInfo torrent={torrent} key={i} onDeleteTorentListener={this.handleDeleteTorrent}/>);
        });
      }


      return (
        <div>
          <p>Insert Magnet</p>
          <p><input
            placeholder='magent'
            name='magmentInput'
            onChange={this.handleChange}
            /></p>
          <p>
            <button
              onClick={this.requestDownload}
            >download</button>
          </p>
          {this.state.torrentList.length === 0 ? empty : torrentList(this.state.torrentList)}
        </div>
      )
    }
}
