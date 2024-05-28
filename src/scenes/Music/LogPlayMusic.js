import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Tag } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { getListLogShop } from '~/apis/music/songs';
import { showNotify } from '~/services/helper';
import dayjs from 'dayjs';
import Tab from '~/components/Base/Tab';
import TabsMucsic from './config/TabsMucsic';

class LogPlayMusic extends Component {
  constructor(props) {
    super(props)
    this.formRef = React.createRef();
    this.state = {
      loading: false,
      datas: []
    }
  }
  componentDidMount() {
    this.getList()
  }
  async getList() {
    this.setState({ loading: true })
    let response = await getListLogShop()
    if (response.status) {
      this.setState({ datas: response.data , loading : false })
    } else {
      showNotify('Notification', response.message, 'error')
    }
  }
  render() {
    let {t , baseData : {locations}} = this.props
    const columns = [
      {
        title: t('No.'),
        width: 30,
        render: r => this.state.datas.indexOf(r) + 1,
        align: 'center'
      },
      {
        title: t('location'),
        render: r => <span>{r.location}</span>,
      },
      {
        title: t('hr:shop'),
        width: '20%',
        render: r => <>
          <Tag color={r.shop_active ? 'green' : ''}>{r.shop_active ? t('active') : t('inactive')}</Tag><br></br>
          <span className='mt-1' style={{ fontSize: 11 }}>
            {r.shop_begin ? dayjs(r.shop_begin).format('HH:mm DD/MM ') : t('hr:no_working')} 
            - {r.shop_time ? dayjs(r.shop_time).format(' HH:mm DD/MM') : t('hr:no_working')}
          </span>
        </>,
        align: 'center'
      },
      {
        title:t('hr:clinic'),
        width: '20%',
        render : r =>  <>
        <Tag color={r.clinic_active ? 'green' : ''}>{r.clinic_active ?  t('active') : t('inactive')}</Tag><br></br>
        <span className='mt-1' style={{fontSize : 11 }}> 
          {r.clinic_begin ? dayjs(r.clinic_begin).format('HH:mm DD/MM ') : t('hr:no_working')} 
           - {r.clinic_time ? dayjs(r.clinic_time).format(' HH:mm DD/MM') : t('hr:no_working')}
          </span>
        </> ,
        align: 'center'
      },
      // {
      //   title: t('Shop Play'),
      //   width: '20%',
      //   render: r => <span>{r.shop_time ? dayjs(r.shop_time).format('HH:mm DD/MM') : 'Không hoạt động'}</span>,
      // },
      // {
      //   title: t('Clinic Play'),
      //   width: '20%',
      //   render: r => <span>{r.clinic_time ? dayjs(r.clinic_time).format('HH:mm DD/MM') : 'Không hoạt động'}</span>,
      // },
    ]
    return (
      <div>
        <PageHeader title={t('hr:log_play_music')} />
        <Row className="card pl-3 pr-3 mb-3" >
          <Tab tabs={TabsMucsic(this.props)} />
        </Row>
        <Row>
          <Col span={24}>
          <Table
            rowKey='id'
            dataSource={this.state.datas}
            columns={columns}
            pagination={false}
            loading={this.state.loading}
          />
          </Col>
        </Row>
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

const mapDispatchToProps = (dispatch) => {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(LogPlayMusic));
