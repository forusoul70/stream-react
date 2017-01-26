import React from 'react';
import axios from 'axios'
import TorrentInfo from './TorrentInfo'

const IDLE = 0;
const DOWNLOADING = 1;
const FINISHED = 2;

const REQUEST_DOWNLOAD_URL = '/torrent/requestDownload';
const REQUEST_GET_TORRENT_LIST = '/torrent/getTorrentList';

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
      this.getDownloadList();
    }

    getDownloadList() {
      axios.post(REQUEST_GET_TORRENT_LIST, {})
      .then(res => {
        console.log(res.data);
        this.setState({
          torrentList : res.data
        });
      }).catch(res => {
        console.log(res);
      })
    }

    requestDownload() {
      axios.post(REQUEST_DOWNLOAD_URL, {
        type : 'magnet',
        magnet : this.state.magnetUrl
      }).then(res => {
        console.log('download request finished, res is ' + res);

        const self = this;
        const polling = setInterval(function() {
          console.log('retry get torrent download list');
          self.getDownloadList();
        }, 1000);
      })
    }

    handleChange(e) {
      this.setState({
        magnetUrl : e.target.value
      });
      console.log(this.state.magnetUrl);
    }

    render() {
      var empty = (<div>empty</div>);
      var torrentList = (list) => {
        return list.map((torrent, i) => {
          return (<TorrentInfo torrent={torrent} key={i}/>);
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
