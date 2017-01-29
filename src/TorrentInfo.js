import React from 'react';

const REQUEST_STREAMING_URL = '/stream/';

export default class TorrentInfo extends React.Component {

  constructor(props) {
    super(props)

    console.dir(props.torrent.files);
    this.requestStreaming = this.requestStreaming.bind(this);
  }

  requestStreaming(fileName) {
    window.open(REQUEST_STREAMING_URL + fileName);
  }

  render() {
    var fileList = () => {
      return this.props.torrent.files.map((file, i) => {
        return (
          <button
            key={i}
            onClick={() => this.requestStreaming(file.name)}>
            {file.name}
          </button>);
      });
    }

    return(
      <div>
        <h2>{this.props.torrent.path} </h2>
        <p>status : {this.props.torrent.downloadStatus}</p>
        {fileList()}
      </div>
    )
  }
}
