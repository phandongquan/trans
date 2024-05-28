import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import Tab from '~/components/Base/Tab';
import { Button, Row, Col, Input, Form, Divider, DatePicker ,Table } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import tabConfig from '~/scenes/Company/Staff/config/tab'
import { getListAsset , getListStock  ,product} from '~/apis/company/staff/adjustment';
import {detail as detailStaff} from '~/apis/company/staff/index'
import {  showNotify, historyReplace, historyParams } from '~/services/helper';
import _, { uniqueId } from 'lodash';
import dayjs from 'dayjs';

class Adjustment extends Component {
  /**
     * 
     * @param {*} props 
     */
  constructor(props) {
    super(props);
    // let params = historyParams();
    this.state = {
      loading: false,
      // limit: 20,
      // page: params.page ? Number(params.page) : 1,
      // total: 0,
      listAsset : [], //list danh sách các thiết bị nhân viên đang nắm giữ
      listStock : [] // list danh sách các văn phòng phẩm nhân viên đang nắm giữ
    };
  }
  componentDidMount(){
    let { id } = this.props.match.params;
    if (id) {
      let message = '';
      let xhr = detailStaff(id);
      xhr.then(res => {
        if(res.status){
          this.getListAsset(res.data.staff.code)
          this.getListStock(res.data.staff.staff_email)
        }
      })

      
    }
  }
  async getListAsset (staff_code){
    this.setState({loading: true})
    let params = {
      // staff_code : 21298
      staff_code : staff_code
    }
    let response = await getListAsset(params)   
    const sku = (response.data.rows).map(v=>{
      return v.product_sku
    });
    const dataProduct = await product({ sku, limit: `${sku.length}` });

    const objectProduct = Object.assign({}, ...(dataProduct.data.rows).map(c => { return { [c.product_sku]: c } }));
    const dataList = (response.data.rows).map(c => {

      const pr = objectProduct[c.product_sku] || {};
      return {
        ...c,
        name: pr.product_name || c.product_sku
      }
    });
    this.setState({listAsset : dataList , loading: false})
  


  }
  async getListStock (staff_email){
    this.setState({loading: true})
    let params ={
      // staff : 'thangna@hasaki.vn',
      staff: staff_email,
      type : 9,
      personal_used : 1
    }
    let response = await getListStock(params)
    let objectProduct = {};
    let totalCost = 0;
    response.data.rows && response.data.rows.map(adjustment => {
      const { properties = null, sku = null, qty = 0 } = adjustment;
      if (properties) {
        const objectData = JSON.parse(properties);
        const { items = null } = objectData;
        items && Object.keys(items).map(c => {
          objectProduct[c] = objectProduct[c] ? parseInt(objectProduct[c]) + parseInt(items[c]) : parseInt(items[c]);
        })
      } else {
        objectProduct[sku] = parseInt(qty);
      }
    });

    const sku = Object.keys(objectProduct);
    const dataProduct = await product({ sku, limit: `${sku.length}` });
    const dataList = (dataProduct.data.rows).map(c => {
      const qty = parseInt(objectProduct[c.product_sku]);
      totalCost += (c.product_latest_cost * qty);
      const start_time = 1234;
      const last_time = 1234;
      return { ...c, qty , start_time,  last_time}
    });


    if(dataProduct.status){
      this.setState({listStock : dataList , loading: false})
    }
  }
  render() {
    let { t, match} = this.props;
    let id = match.params.id;
    const constTablist = tabConfig(id,this.props);
    const columnsAsset = [
      {
        title : 'No.',
        render: r => this.state.listAsset.indexOf(r) + 1,
        width: '5%'
      },
      {
        title: t('hr:device'),
        render: r => <span>{r.name}</span>,
        width: '50%'
      },
      {
        title : 'SKU',
        render: r => <span>{r.product_sku}</span>,
        width: '10%'
      },
      {
        title : t('hr:label'),
        render: r => <span>{r.code}</span>
      },
      {
        title: t('hr:time_start'),
        render : r => <span>{dayjs(r.created_at).format('YYYY-MM-DD')}</span>
      },
      {
        title: t('hr:time_end'),
        render : r => <span>{dayjs(r.updated_at).format('YYYY-MM-DD')}</span>
      }
    ]
    const columnsStock = [
      {
        title : 'No.',
        render: r => this.state.listStock.indexOf(r) + 1,
        width: '5%'
      },
      {
        title: t('hr:stationery'),
        render: r => <span>{r.product_name}</span>,
        width: '50%'
      },
      {
        title: 'SKU',
        render : r => <span>{r.product_sku}</span>,
        width: '10%'
      },
      {
        title: t('hr:qty'),
        render: r => <span>{r.qty}</span>
      },
      {
        title: t('hr:time_end'),
        render : r => <span>{dayjs(r.product_utime*1000).format('YYYY-MM-DD')}</span>
      }
    ]
    return (
      <div>
        <PageHeader
          title={t('hr:adjustment')}
        />
        <Row className="card p-3 mb-3 pt-0">
          <Tab tabs={constTablist} />
        </Row>
        <Row className='card mb-1 p-3'>
          <PageHeader title={t('hr:device')}/>
          <Table dataSource={this.state.listAsset.length ? this.state.listAsset : []}
            columns={columnsAsset}
            loading={this.state.loading}
            // pagination={{ pageSize: 1000, hideOnSinglePage: true }}
            rowKey={(h) => h.id} />
        </Row>
        <Row className='card p-3'>
          <PageHeader title='CCDC/VPP'/>
          <Table dataSource={this.state.listStock.length ? this.state.listStock : []}
            columns={columnsStock}
            rowKey={(r,i) => uniqueId(i)} 
            loading={this.state.loading}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Adjustment));
