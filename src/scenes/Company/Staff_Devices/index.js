import { PageHeader } from '@ant-design/pro-layout'
import { Button, Col, Form, Input, Row, Table } from 'antd'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getListDevices } from '~/apis/company/staff/staff_devices'
import Dropdown from '~/components/Base/Dropdown'
import StaffDropdown from '~/components/Base/StaffDropdown'
import { historyParams, historyReplace, showNotify } from '~/services/helper'

export class Staff_Device extends Component {
  constructor(props) {
    super(props)
    this.formRef = React.createRef()
    let params = historyParams();
    this.state = {
      loading: false,
      datas: [],
      data: {},
      limit: 30,
      offset: params.offset ? Number(params.offset) : 0,
      total: 0,
    }
  }
  componentDidMount() {
    let params = historyParams();
    this.formRef.current.setFieldsValue(params);
    let values = this.formRef.current.getFieldsValue();
    this.getList(values)
  }
  async getList(params = {}) {
    this.setState({ loading: true })
    params = {
      ...params,
      offset: this.state.offset,
      limit: this.state.limit,
    }
    historyReplace(params);
    let response = await getListDevices(params)
    if(response.status){
        this.setState({loading : false , datas : response.data.rows , total : response.data.total})
    }else{
        showNotify('Notification' , response.message , 'error')
        this.setState({loading: false})
    }
  }
  /**
   * On change page
   * @param {*} page 
   */
  onChangePage = page => {
    let values = this.formRef.current.getFieldsValue();
    this.setState({ offset: (page - 1) * this.state.limit }, () => this.getList({ ...values }));
  }
  submitForm(values){
    this.setState({offset : 0 } , () => this.getList(values))
}
  render() {
    let {t, baseData: { locations } } = this.props
    const columns = [
      {
        title : 'No.',
        render : r=> this.state.datas.indexOf(r) + 1
      },
      {
        title : t('staff'),
        render : r=> <span>{r.staff.staff_name} - <strong>{r.staff.code}</strong></span>
      },
      {
        title : t('hr:platform'),
        render : r=> r.platform
      },
      {
        title : t('hr:build'),
        render : r=> r.build
      },
      {
        title : t('hr:mac_address'),
        render : r=> r.mac_address
      },
      {
        title : t('version'),
        render : r=> r.version 
      },

    ]
    return (
      <div>
        <PageHeader title={t('hr:staff_device')} />
        <Row className="card pl-3 pr-3 mb-3">
          <Form
            className="pt-3"
            ref={this.formRef}
            onFinish={(this.submitForm.bind(this))}
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={3} xl={6}>
                <Form.Item name="staff_id">
                  <StaffDropdown defaultOption={t('all_staff')}/>
                </Form.Item>
              </Col>
              {/* <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                <Form.Item name="location_id">
                  <Dropdown datas={locations} defaultOption="-- All Locations --" />
                </Form.Item>
              </Col> */}
              <Col xs={24} sm={24} md={24} lg={6} xl={10} key="submit">
                <Form.Item>
                  <Button type="primary" htmlType="submit" className="mr-2">
                    {t('search')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Row>
        <Table 
          dataSource={this.state.datas}
          columns={columns}
          rowKey={r => r.id}
          pagination={{ 
            pageSize: this.state.limit, 
            showSizeChanger: false,
            onChange: page => this.onChangePage(page),
            current: (this.state.offset/this.state.limit) + 1,
            total: this.state.total
        }}
           />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
      auth: state.auth.info,
      baseData: state.baseData
  };
}
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(Staff_Device)