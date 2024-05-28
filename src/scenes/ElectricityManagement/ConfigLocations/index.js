import { Row, Col, Spin, Divider, Table, Form, Input, Button, Modal, DatePicker } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Tab from '~/components/Base/Tab';
import tabList from '../config/tabList';
import moment from 'moment';
import dayjs from 'dayjs';
import { historyParams, historyReplace, showNotify, parseIntegertoTime, checkPermission } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import { createLocationConfig, getListLocationsConfig, updateLocationConfig, destroy } from '~/apis/electricMangement/index'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { statusElectricLocations, basicStatus, dateFormat, dateTimeFormat  } from '~/constants/basic';
import DeleteButton from '~/components/Base/DeleteButton';


export class AccountConfig extends Component {
  constructor(props) {
    // let params = historyParams();
    // let month = params.month ? params.month : moment().format('M');
    // let year = params.year ? params.year : moment().format('Y');
    super(props)
    this.formRef = React.createRef();
    this.formModalRef = React.createRef();
    this.state = {
      loading: false,
      datas: [],
      data: {},
      visible: false,

    }
  }
  componentDidMount() {
    this.getDatas()
  }
  async getDatas(params = {}) {
    this.setState({ loading: true })
    let response = await getListLocationsConfig(params)
    if (response.status) {
      this.setState({ loading: false, datas: response.data.rows.rows })
    } else {
      showNotify('Notification', response.message, 'error');
      this.setState({ loading: false })
    }
  }
  submitForm() {
    let values = this.formRef.current.getFieldsValue()
    this.getDatas(values)
  }
  submitModal() {
    let values = this.formModalRef.current.getFieldsValue()
    if (!values.makh || !values.location_id) {
      showNotify('Notification', 'Please fill in all required fields', 'error');
      return;
    }
    if(values.opening_day){
      values = {
        ...values,
        opening_day: dayjs(values.opening_day).format(dateFormat)
      }
    }
    let xhr
    let message = ''
    if (this.state.data.id) {
      values = {
        ...values,
        id: this.state.data.id
      }
      xhr = updateLocationConfig(values)
      message = 'Updated success!'
    } else {
      values = {
        ...values,
        id: 0
      }
      xhr = createLocationConfig(values)
      message = 'Created Success!'
    }
    xhr.then(res => {
      if (res.status) {
        showNotify('Notification', message)
        let valuesSearch = this.formRef.current.getFieldsValue()
        this.getDatas(valuesSearch)
        this.setState({ visible: false })
      } else {
        showNotify('Notification', res.message, 'error')
      }
    })
    xhr.catch(err => showNotify('Notification', err, 'error'))
  }
  popupModal(data) {
    this.setState({ visible: true, data: data }, () => {
      this.formModalRef.current.setFieldsValue({
      ...data,
        opening_day: data.opening_day ? dayjs(data.opening_day) : null,
      })
  })
}
  async onRemove(id) {
    let response = await destroy(id)
    if (response.status) {
      showNotify('Notification', 'Deleted success!')
      let values = this.formRef.current.getFieldsValue()
      this.getDatas(values)
    } else {
      showNotify('Notification', response.message, 'error')
    }
  }
  render() {
    let { t, baseData: { locations } } = this.props;

    let titleModal = this.state.data.id ? 'Edit' : 'Add new'
    const columns = [
      {
        title: 'No.',
        render: r => this.state.datas.indexOf(r) + 1
      },
      {
        title: 'PE code',
        dataIndex: 'makh'
      },
      {
        title: 'Location',
        render: r => {
          const location = locations.find(l => l.id == r.location_id);
          return location?.name;
        }
      },
      {
        title: 'Password',
        dataIndex: 'pass_tracking'
      },
      {
        title: 'Tracking link',
        // dataIndex: 'link_tracking',
        render: r => <a href={r.link_tracking} target='_blank' >{r.link_tracking}</a>
      },
      {
        title: 'Status',
        render: r => statusElectricLocations[r.status]
      },
      {
        title: 'Department code',
        width: 150,
        render: r => r.department_code
      }
      ,
      {
        title: 'Opening day',
        width: 150,
        render: r => r.opening_day ? dayjs(r.opening_day).format(dateFormat) : ''
      },
      {
        title: 'Division',
        width: 150,
        render: r => basicStatus[r.division]
      }
      ,
      {
        title: 'Useable area (m2)',
        width: 150,
        render: r => r.useable_area
      },
      {
        title: 'Vendor code',
        width: 150,
        render: r => r.vender_code
      },
      {
        title: 'Note',
        dataIndex: 'note',
        width: 200
      },
      {
        title: 'Actions',
        render: r => <>
          {checkPermission('hr-tool-electricity-management-update') ?
            <Button icon={<FontAwesomeIcon icon={faPen} />}
              className='mr-2'
              type='primary'
              size='small'
              onClick={() => this.popupModal(r)} /> : null
          }
          {
            checkPermission('hr-tool-electricity-management-delete') ?
              <DeleteButton onConfirm={() => this.onRemove(r.id)} /> : null
          }
        </>
      },
    ]
    return (
      <div>
        <PageHeader title='Electricity Account Config'
          tags={
            checkPermission('hr-tool-electricity-management-create') ? <Button icon={<FontAwesomeIcon icon={faPlus} />} type='primary' onClick={() => this.setState({ visible: true, data: {} })}>&nbsp;Add new</Button> : null}
        />
        <Row className='card pl-3 pr-3 mb-3'>
          <Tab tabs={tabList()} />
          <Form
            className="mt-2 form_Electricity"
            ref={this.formRef}
            name="searchForm"
            onFinish={this.submitForm.bind(this)}
          >
            <Row gutter={24}>
              <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                <Form.Item name={'makh'} >
                  <Input placeholder='PE code' />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                <Form.Item name={'location_id'} >
                  <Dropdown datas={locations} defaultOption='-- All locations --' />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                <Form.Item name={'status'}>
                  <Dropdown datas={statusElectricLocations} defaultOption='All status' />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                <Button type="primary" htmlType="submit">Search</Button>
              </Col>
            </Row>
          </Form>
        </Row>
        <Table
          rowKey='id'
          loading={this.state.loading}
          columns={columns}
          dataSource={this.state.datas}
          pagination={{ pageSize: 30, showSizeChanger: false }} />
        <Modal title={titleModal}
          width='60%'
          visible={this.state.visible}
          onCancel={() => this.setState({ visible: false, data: {} })}
          onOk={() => this.submitModal()}
          afterClose={() => {
            this.formModalRef.current.resetFields()
            this.setState({ data: {} })
          }}
        >
          <Form layout="vertical" ref={this.formModalRef}>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item name={'makh'} label='PE code' rules={[{
                  required: true,
                  message: 'Please input PE code'
                }]} >
                  <Input placeholder='PE code'  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={'location_id'} label='Location' rules={[{
                  required: true,
                  message: 'Please input location'
                }]}>
                  <Dropdown datas={locations} defaultOption='-- All locations --' />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={'pass_tracking'} label='Password' >
                  <Input placeholder='Password' />
                </Form.Item>
              </Col>
              <Col span={20}>
                <Form.Item name={'link_tracking'} label='Link tracking'>
                  <Input placeholder='Link tracking' />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name={'status'} label='Status' initialValue={1}>
                  <Dropdown datas={statusElectricLocations} defaultOption='All status' />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item name={'department_code'} label='Department code' >
                  <Input placeholder='Department code' />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item name={'division'} label='Division' initialValue={0} >
                  <Dropdown datas={basicStatus} defaultOption='All status' />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name={'opening_day'} label='Opening Day'>
                  <DatePicker />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={'useable_area'} label='Useable area (m2)' >
                  <Input placeholder='Useable area (m2)' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={'vender_code'} label='Vendor code' >
                  <Input placeholder='Vendor code' />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name={'link_invoice'} label='Link Invoice' >
                  <Input placeholder='Link Invoice' />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name={'note'} label='Note' >
                  <Input placeholder='Note' />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    )
  }
}

/**
* Map redux state to component props
* @param {Object} state 
*/
const mapStateToProps = (state) => {
  return {
    auth: state.auth.info,
    baseData: state.baseData
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(AccountConfig)