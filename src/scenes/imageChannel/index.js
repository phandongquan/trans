import { Row, Col, Form, Button, Dropdown as DropdownAnt ,Image, Divider } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import DropDown from '~/components/Base/Dropdown';
import { getList } from '~/apis/imageShop';
import { showNotify } from '~/services/helper';
import { uniqueId } from 'lodash';
import Lighbox from '~/components/Base/Lighbox';
import './config/showimagechannel.css'
import Axios from 'axios';

export class ShowImageChannel extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef()
    this.state = {
      loading: false,
      strore_id : '',
      ips: [],
      ip: '',
      ports: [],
      port: '',
      dates: [],
      date: '',
      datasTime: [],
      images: [],
    }
  }
  async getListIP(id) {
    if (id) {
      this.formRef.current.setFieldsValue({ ip: null, port: null, date: null, datasTime: null })
      this.setState({ ips: [], ports: [], dates: [], datasTime: [], images: [] })
      let { t, baseData: { locations } } = this.props;
      let arrIP = []
      let response = await getList({ store_id: id })
      if (response.status) {
        (response.ip).map(v => {
          arrIP.push({ id: v, name: v })
        })
        this.setState({ ips: arrIP , strore_id : id })
      } else {
        showNotify('Notification', (t('hr:no_data') + t(' IP')), 'error')
      }
    } else {
      this.formRef.current.setFieldsValue({ ip: null, port: null, date: null, datasTime: null })
      this.setState({ ips: [], ports: [], dates: [], datasTime: [], images: [] })
    }
  }
  async getListPort(ip) {
    this.formRef.current.setFieldsValue({port : null, date : null , datasTime : null })
    this.setState({ ip, ports: [], dates: [], datasTime: [] ,images : [] })
    let response = await getList({ store_id: this.state.strore_id , ip: ip })
    let arrPORTS = []
    if (response.status) {
      if (Array.isArray(response.port) && (response.port).length) {
        (response.port).map(v => {
          arrPORTS.push({ id: v, name: v })
        })
        this.setState({ ports: arrPORTS })
      }
    } else {
      showNotify('Notification', response.message, 'error')
    }
  }
  async getListdates(port) {
    this.formRef.current.setFieldsValue({ date: null, datasTime: null })
    this.setState({ port, dates: [], datasTime: [], images: [] })
    // let response = await getList({ store_id: this.state.strore_id , ip: this.state.ip, port: port })
    let response = await Axios.get(`https://camera-image-service.app.rdhasaki.com/data`,
      {
        params: { store_id: this.state.strore_id, ip: this.state.ip, port: port }
      },
    )
    let arrDates = []
    if (response.status) {
      if (Array.isArray(response.data.date) && (response.data.date).length) {
        (response.data.date).map(v => {
          arrDates.push({ id: v, name: v })
        })
        this.setState({ dates: arrDates })
      }
    } else {
      showNotify('Notification', response.message, 'error')
    }
  }
  async getListTimes(date) {
    this.formRef.current.setFieldsValue({ datasTime: null })
    this.setState({ date, datasTime: [], images: [] })
    // let response = await getList({ store_id: this.state.strore_id , ip: this.state.ip, port: this.state.port, date: date })
    let response = await Axios.get(`https://camera-image-service.app.rdhasaki.com/data`,
      {
        params: { store_id: this.state.strore_id, ip: this.state.ip, port: this.state.port, date: date }
      },
    ) 
    let arrTimes = []
    if (response.status) {
      if (Array.isArray(response.data.logs) && (response.data.logs).length) {
        this.setState({datasTime : response.data.logs })
      }
    } else {
      showNotify('Notification', response.message, 'error')
    }
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
    let { t, baseData: { locations } } = this.props;
    let { ips, ports, dates} = this.state
    return (
      <div>
        <PageHeader title={t('hr:image_shop')} />
        <Row className="card pl-3 pr-3 mb-3">
          <Form ref={this.formRef} className="pt-3" name="searchForm"
          // onFinish={this.submitForm.bind(this)}
          >
            <Row gutter={12}>
              <Col span={4}>
                <Form.Item name={'locations'} hasFeedback={ips.length ? true : false} >
                  <DropDown datas={locations} defaultOption={t('hr:all_location')} onChange={v => this.getListIP(v)} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name={'ip'} hasFeedback={ports.length ? true : false}>
                  <DropDown datas={ips} defaultOption={t('hr:all_ip')} onChange={v => this.getListPort(v)} />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item name={'port'} hasFeedback={dates.length ? true : false}>
                  <DropDown datas={ports} defaultOption={t('hr:all_port')} onChange={v => this.getListdates(v)} />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item name={'date'} hasFeedback={this.state.datasTime.length ? true : false}>
                  <DropDown datas={dates} defaultOption={t('hr:all_date_image_channel')} onChange={v => this.getListTimes(v)} />
                </Form.Item>
              </Col>
            </Row>

          </Form>
        </Row>
        <div>
          {
            this.state.datasTime.length ?
              this.state.datasTime.map((d, index) => {
                return <Row className='mt-2 list-image-shop' key={uniqueId(index)} >
                  <Lighbox datas={d.urls} isFullPath={true} isImgAI = {true}/>
                  <Divider />
                </Row>
              })
              : []
          }
        </div>

      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.auth.info,
    baseData: state.baseData
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ShowImageChannel)