import React, { Component } from 'react'
import logo from '~/assets/images/logo_1.png'
export default class index extends Component {
  render() {
    return (
      <div className="w-100" style={{ height: '100vh', zIndex: 100 }}>
        {this.props.children}
      </div>
    )
  }
}
