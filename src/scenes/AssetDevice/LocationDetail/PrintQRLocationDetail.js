import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Col, Drawer, Row } from 'antd'
import { historyParams } from '~/services/helper'
import QRCode from "qrcode.react";
import { getList as apiGetList } from '~/apis/assetDevice/location_detail'
export class PrintQRLocationDetail extends Component {
    constructor(props) {
        super(props)
        this.state = {
          datas : [],
          datasLocation : []
        }
    }
  async componentDidMount(){
    await this.getListLocation()
    var element = document.getElementsByTagName("style"), index;
    for (index = element.length - 1; index >= 0; index--) {
      element[index].parentNode.removeChild(element[index]);
    }
    let params = historyParams();
    let arrID  = params.location_detail_id?.split(',')
    if(document.querySelectorAll('[rel="stylesheet"]')[4]){
      document.querySelectorAll('[rel="stylesheet"]')[4].remove()
    }
    await this.setState({datas : arrID})
    await window.print();
  }
  async getListLocation(){
    let params = {
      limit : -1
    }
    let response = await apiGetList(params)
    if(response.status){
      this.setState({datasLocation : response.data.rows})
    }
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
            let areaFind = this.state.datasLocation.find(d => d.id == i)
            let params = {
              key: "location_detail_id",
              location_detail_id: i,
            };
            arrCol.push(<td className='mt-2 mr-2'>
              <div>
                <QRCode
                  id="qrCode"
                  value={JSON.stringify(params)}
                  style={{ marginTop: 20, marginRight: 10, width: 60, height: 60 }}
                />
              </div>
              <span style={{fontSize:12 , marginLeft:2}}>{areaFind?.area}</span>
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

export default connect(mapStateToProps, mapDispatchToProps)(PrintQRLocationDetail)