import React from 'react';
import axios from 'axios'

const IDLE = 0;
const DOWNLOADING = 1;
const FINISHED = 2;

const REQUEST_DOWNLOAD_URL = '/torrent/requestDownload';

export default class App extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
          downloadState : 0,
          magnetUrl : ''
      };

      this.handleChange = this.handleChange.bind(this);
      this.requestDownload = this.requestDownload.bind(this);
    }

    requestDownload() {
      axios.post(REQUEST_DOWNLOAD_URL, {
        type : 'magnet',
        magent : this.state.magnetUrl
      }).then(res => {
        console.log(res);
      }).catch(res => {
        console.log(res);
      });
    }

    handleChange(e) {
      this.setState({
        magnetUrl : e.target.value
      });
    }

    render() {
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
          </div>
        )
    }
}
