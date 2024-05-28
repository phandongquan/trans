import React, { Component } from 'react';
import logo from '~/assets/images/logo_1.png';
export default class index extends Component {
  render() {
    return (
      <div className="w-100 d-flex flex-column justify-content-center align-items-center" style={{height: '100vh', backgroundColor: '#fff'}}>
        
        {this.props.children}
      </div>
    )
  }
}
