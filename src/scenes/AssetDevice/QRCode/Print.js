import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Col, Drawer, Row } from 'antd'
import { historyParams } from '~/services/helper'
import QRCode from "qrcode.react";
export class Print extends Component {
    constructor(props) {
        super(props)
        this.state = {
          datas : [],
        }
    }
  async componentDidMount(){
    var element = document.getElementsByTagName("style"), index;
    for (index = element.length - 1; index >= 0; index--) {
      element[index].parentNode.removeChild(element[index]);
    }
    let params = historyParams();
    let arrQRCode  = params.code?.split(',')
    if(document.querySelectorAll('[rel="stylesheet"]')[4]){
      document.querySelectorAll('[rel="stylesheet"]')[4].remove()
    }
    await this.setState({datas : arrQRCode})
    await window.print();
  }
  renderQR() {
    let { datas } = this.state
    let result = []
    const sizeChunk = 4;
    if (datas.length) {
      this.chunk(datas, sizeChunk).map((arrChunk, index) => {
        let arrCol = [];
        if (Array.isArray(arrChunk)) {
          arrChunk.map((i, indexChunk) => {
            let params = {
              key: "qr_mapping",
              code: i,
            };
            arrCol.push(<td className='mt-2 mr-2'>
              <div>
                <QRCode
                  id="qrCode"
                  value={JSON.stringify(params)}
                  style={{ marginTop: 20, marginRight: 10, width: 60, height: 60 }}
                />
              </div>
              <span style={{fontSize:12 , marginLeft:2}}>{i}</span>
            </td>)
          })
        }
        result.push(<tr gutter={[12, 24]}>{arrCol}</tr>)
      })
    }
    return result;
  }
  /**
     * Chunk array
     * @param {*} arr 
     * @param {*} size 
     * @returns 
     */
  chunk = (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  render() {
    return (
      <div>
          <table style={{ width:'100%', height:'100%', pageBreakAfter: 'always'}}>
            {this.renderQR()}
          </table>
      </div>
        
    )
  }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(Print)