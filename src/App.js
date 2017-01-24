import React from 'react';
import DownloadDetail from './DownloadDetail'
import TorrentList from './TorrentList'

export default class App extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <div>
        <DownloadDetail/>
        <TorrentList/>
      </div>
    )
  }
}
