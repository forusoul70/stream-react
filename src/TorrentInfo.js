import React from 'react';
import axios from 'axios'

const REQUEST_STREAMING_URL = '/stream/';
const REQUEST_REMOVE_TORRENT = '/torrent/removeTorrent/';

export default class TorrentInfo extends React.Component {

  constructor(props) {
    super(props);

    this.requestStreaming = this.requestStreaming.bind(this);
    this.requestDelete = this.requestDelete.bind(this);
  };

  requestStreaming(fileName) {
    window.open(REQUEST_STREAMING_URL + fileName);
  }

  requestDelete() {
    let self = this;
    axios.post(REQUEST_REMOVE_TORRENT, {
      infoHash : this.props.torrent.infoHash
    }).then(function(response){
      self.props.onDeleteTorentListener();
    }).catch(function(err) {
      console.log(err);
    });
  }

  render() {
    var fileList = () => {
      return this.props.torrent.files.map((file, i) => {
        return (
          <button
            key={i}
            onClick={() => this.requestStreaming(file.path)}>
            {file.name}
          </button>);
      });
    };

    return(
      <div>
        <div>
          <h2>{this.props.torrent.path} </h2>
          <p>status : {this.props.torrent.downloadStatus}</p>
          {fileList()}
        </div>
        <div>
          <button onClick={this.requestDelete}>delete</button>
        </div>
      </div>
    )
  };
}

TorrentInfo.propTypes = {
  torrent: React.PropTypes.object,
  onDeleteTorentListener: React.PropTypes.func
}

TorrentInfo.defaultProps = {
  torrent: undefined,
  onDeleteTorentListener: () => console.log('onDeleteTorentListener button listenner not implemented')
}
