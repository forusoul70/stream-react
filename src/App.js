import React from 'react';
import DownloadDetail from './DownloadDetail'

export default class App extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <div>
        <DownloadDetail/>
      </div>
    )
  }
}
