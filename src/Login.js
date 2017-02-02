import React from 'react';
import axios from 'axios'

const REQUEST_LOGIN_URL = '/login';

export default class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      password : ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.requestLogin = this.requestLogin.bind(this);

  };

  handleChange(e) {
    this.setState({
      password : e.target.value
    });
  }


  requestLogin() {
    axios.post(REQUEST_LOGIN_URL, {
      password : this.state.password
    }).then(res => {
      if (res.data.result) {
        window.location.replace('/torrentPage');
      } else {
        alert('로그인 실패');
      }
    }).catch(err => {
      console.log(err);
    })
  }

  render() {
    return (
      <div>
        <p><input type='password' onChange={this.handleChange}></input></p>
        <p><button onClick={this.requestLogin}>login</button></p>
      </div>
    )
  }
}
