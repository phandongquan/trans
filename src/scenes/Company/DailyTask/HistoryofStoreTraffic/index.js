import { Form, Row , DatePicker, Col, Button, Table, Avatar, Input } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { apiListHistory } from '~/apis/company/dailyTask/historyOfStoreTraffic';
import Tab from '~/components/Base/Tab';
import tabList from '../config/tabList'
import { dateFormat, dateTimeFormat, screenResponsive } from '~/constants/basic';
import Dropdown from '~/components/Base/Dropdown';
import { showNotify, timeFormatStandard, getThumbnailHR } from '~/services/helper';
import Lighbox from '~/components/Base/Lighbox';
import dayjs from 'dayjs';
import StaffDropdown from '~/components/Base/StaffDropdown';
const option_isCustomer = {
  1 : 'Customer',
  2 : 'Staff'
}
const type_Customer = 1
const type_Staff = 2

export class HistoryofStoreTraffic extends Component {
  constructor(props){
    super(props)
    this.formRef = React.createRef();
    this.state = {
        datas: [],
        visible: false,
        loading: false,
        page: 1,
        data : {},
        total : 0 ,
        pageSize : 0,
        isCustomer : 0,
        limit : 20,
    }
  }
  componentDidMount(){
    this.getListHistory()
  }
  async getListHistory(params = {}) {
    if(params.date) {
      params.from_date = timeFormatStandard(params.date[0], dateFormat)
      params.to_date = timeFormatStandard(params.date[1], dateFormat)
      delete(params.date)
    }
    params = {
      ...params,
      limit : this.state.limit,
      page : this.state.page
    }
    this.setState({loading: true})
    let response = await apiListHistory(params)
    if(response.status){
      this.setState({loading: false , datas : response.data.rows , total : response.data.total})
    }else{
      showNotify('Notification', response.message , 'error')
    }
  }
  submitForm = () => {
    let values = this.formRef.current.getFieldsValue();
    if(values.type == type_Customer){
      values.is_customer  = 1
    }else{
      values.is_staff  = 1
    }
    delete values.type
    this.setState({page : 1} , () => this.getListHistory(values)) 
  }
  onChangePage (page){
    let values = this.formRef.current.getFieldsValue();
    if(values.type == type_Customer){
      values.is_customer  = 1
    }else{
      values.is_staff  = 1
    }
    delete values.type
    this.setState({page} , () => this.getListHistory(values)) 
    window.scrollTo(0, 0)
  }
  render() {
    let {t, baseData: { locations , majors }} = this.props
    const columns = [
      {
        title : t('store'),
        width: '10%',
        render : r => locations.find(l => l.id == r.location_id)?.name
      },
      {
        title: t('hr:staff_customer'),
        width:'15%',
        render: (r) => {
          return r.customer_name ?
            <span >khách hàng : {r.customer_name}</span>
            :
            r.staff ?
              <div className="d-flex align-items-center">
                <div>
                  <Avatar
                    src={
                      r.staff?.user?.avatar
                        ? getThumbnailHR(r.staff?.user?.avatar, '40x40')
                        : ""
                    }
                  />
                </div>
                <div className="ml-2">
                  <div>
                    {r.staff?.staff_name} #{r.staff?.code}
                  </div>
                  <small>{r.staff?.staff_email}</small>
                </div>
              </div>
              : []
        }
      },
      {
        title :t('hr:supervisor_checkin'),
        width:'15%',
        render : r => (
          <>
            <div className="d-flex align-items-center">
              <div>
                <Avatar
                  src={
                    r.created_user?.avatar
                      ? getThumbnailHR(r.created_user?.avatar, '40x40')
                      : ""
                  }
                />
              </div>
              <div className="ml-2">
                {r.created_user?.name}
              </div>
            </div>
            <small>{r.created_at}</small>
          </>
        )
      },
      {
        title: t('hr:image_checkin'),
        width:'15%',
        render: (r) => {
          let arrPhotos = [];
          if (r?.images_in.length) {
            (r?.images_in).map((img) => {
              if(img){
                img = img.replace('/production/workplace/workplace','/production/workplace')
                img = img.replace('/production','/thumbnail/100x80/production')
                arrPhotos.push(img)
              }
            })
            return <>
              <div className='lightbox-list-verify' style={{ display: 'inline-block', width: '220px' }}>
                {
                    <Lighbox datas={arrPhotos}  isFullPath={true} isThumbnail={true}/>
                }
              </div>
              {
                r.note_in ?
                  <div className='p-2' style={{ background: '#f1f1d5' }}>{r.note_in}</div>
                  : []
              }
            </>
          }
        }
      },
      {
        title: t('hr:supervisor_checkout'),
        width: '15%',
        render: r => r.updated_user?.name ?
          <>
            <div className="d-flex align-items-center">
              <div>
                <Avatar
                  src={
                    r.updated_user?.avatar
                      ? getThumbnailHR(r.updated_user?.avatar, '40x40')
                      : ""
                  }
                />
              </div>
              <div className="ml-2">
                {r.updated_user?.name}
              </div>

            </div>
            <small>{r.updated_at}</small>
          </>

          : []

      },
      {
        title: t('hr:image_checkout'),
        width: '15%',
        render: (r) => {
          let arrPhotos = [];
          if (r?.images_out?.length) {
            (r?.images_out).map((img) => {
              if(img){
                img = img.replace('/production/workplace/workplace','/production/workplace')
                img = img.replace('/production','/thumbnail/100x80/production')
                arrPhotos.push(img)
              }
            })
            return <>
              <div className='lightbox-list-verify' style={{ display: 'inline-block', width: '220px' }}>
                  <Lighbox datas={arrPhotos}  isFullPath={true} isThumbnail={true} />
              </div>
              {r.note_out ?
                <div className='p-2' style={{ background: '#f1f1d5' }}>{r.note_out}</div>
                : []
              }
            </>
          }
        }
      },
    ]
    return (
      <div>
        <PageHeader title={t('store_access_history')} />
        <Row className="card pl-3 pr-3 mb-3">
          <div id="tab_responsive">
            <div className='tab_content_mantenance_device'>
              <Tab tabs={tabList(this.props)} />
            </div>
          </div>
          <Form
            className="pt-3"
            ref={this.formRef}
            name="searchStaffForm"
            onFinish={this.submitForm.bind(this)}
            layout="vertical"
          >
            <Row gutter={24}>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name='date'>
                  <DatePicker.RangePicker format={dateFormat} className='w-100' />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name='location_id'>
                  <Dropdown datas={locations} defaultOption={t('hr:all_location')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name='major_id'>
                  <Dropdown datas={majors} defaultOption={t('hr:all_major')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name='type'>
                  <Dropdown datas={option_isCustomer} defaultOption={t('hr:is_customer')} onChange={v => this.setState({isCustomer : v})}/>
                </Form.Item>
              </Col>
              {
                this.state.isCustomer == 1 ?
                  <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                    <Form.Item name='keywords'>
                      <Input placeholder={t('keywords')} />
                    </Form.Item>
                  </Col>
                  : []
              }
              {
                this.state.isCustomer == 2 ?
                  <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                    <Form.Item name="staff_id" >
                      <StaffDropdown defaultOption={t('hr:all_staff')} />
                    </Form.Item>
                  </Col>
                  : []
              }
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" className='mr-2'>
                    {t('search')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
          {window.innerWidth < screenResponsive  ? 
                <div className='block_scroll_data_table'>
                    <div className='main_scroll_table'> 
                      <Table 
                        dataSource={this.state.datas}
                        columns={columns}
                        rowKey={'id'}
                        pagination={{
                          pageSize: this.state.limit,
                          onChange: page => this.onChangePage(page),
                          current: this.state.page,
                          total: this.state.total ,
                          showSizeChanger : false,
                          showQuickJumper : true
                        }}
                      />
                    </div>
                </div>
              :
              <Table 
                dataSource={this.state.datas}
                columns={columns}
                rowKey={'id'}
                pagination={{
                  pageSize: this.state.limit,
                  onChange: page => this.onChangePage(page),
                  current: this.state.page,
                  total: this.state.total ,
                  showSizeChanger : false,
                  showQuickJumper : true
                }}
              />
            }
          </Col>
        </Row>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  baseData: state.baseData,
  auth: state.auth.info
});
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryofStoreTraffic)