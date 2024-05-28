import { Row, Col, Spin, Divider, Table, Form, Input, Button } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Tab from '~/components/Base/Tab';
import tabList from './config/tabList';
import moment from 'moment';
import { exportToXLS, historyParams, historyReplace, showNotify } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import { getListMonthly } from '~/apis/electricMangement/index'
import { Chart, Interval, Tooltip } from 'bizcharts';
import { uniqueId } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { formatData, formatHeader } from './config/exportElectricMonthly';
import dayjs from 'dayjs';
export class ElectricityManagementMonthly extends Component {
  constructor(props) {
    // let params = historyParams();
    // let month = params.month ? params.month : moment().format('M');
    // let year = params.year ? params.year : moment().format('Y');
    super(props)
    this.formRef = React.createRef();
    this.state = {
      loading: false,
      // totalDaysInMonthForm: 0,
      arrTotalMonth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      year: moment().format('Y'),
      datas: [],
      data: {},
      datasChart: []
    }
  }
  componentDidMount() {
    let { auth: { staff_info } } = this.props
    let params = historyParams();
    let year = params.year ? params.year : moment().format('Y');
    this.formRef.current.setFieldsValue({
      ...params,
      year,
      // location_id : staff_info.staff_loc_id
    })
    let values = this.formRef.current.getFieldsValue()
    this.getDatasElectric(values)
  }
  async getDatasElectric(params = {}) {
    this.setState({ loading: true })
    historyReplace(params)
    let response = await getListMonthly(params)
    if (response.status) {
      this.setState({ loading: false, datasChart: response.data.summary, datas: response.data.rows })
    } else {
      showNotify('Notification', response.message, 'error')
      this.setState({ loading: false })
    }
  }
  submitForm() {
    let values = this.formRef.current.getFieldsValue()
    this.setState({ year: values.year }, () => this.getDatasElectric(values))

  }
  async exportDatas(){
    this.setState({loading: true})
        let values = this.formRef.current.getFieldsValue()
        let response = await getListMonthly(values)
        if (response.status) {
            let header = formatHeader();
            let data = formatData(response.data.rows );
            let fileName = `Electric-Management-Monthly-${dayjs().format('YYYY')}`;
            let dataFormat = [...header, ...data]
            exportToXLS(fileName, dataFormat,[null,{ width: 30 },{ width: 30 },])
        } else {
            showNotify('Notification', response.message, 'error')
        }
        this.setState({ loading: false })
  }
  render() {
    let { t, baseData: { locations } } = this.props;

    let { year, month } = this.state
    let currentYear = Number(moment().format('Y'));
    let optionYears = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++)
      optionYears.push({ id: i, name: i })
    const columns = [
      {
        title: 'No.',
        fixed: 'left',
        width: 60,
        render: r => this.state.datas.indexOf(r) + 1
      },
      {
        title: 'Location',
        fixed: 'left',
        width: 200,
        render: r => {
          if (r.address == null) {
            return '';
          }
          const newAddress = r.address.split(',');
          const province = newAddress[newAddress.length - 1];
          const address = r.name + ' - ' + province;
          return address
        }
      },
      {
        title: 'Mã PE',
        fixed: 'left',
        width: 150,
        render: r => r.makh
      },
      ...this.state.arrTotalMonth.map((item, index) => ({
        title: item,
        width: 120,
        render: r => {
          let datasMonth = r.records
          let datasFromNcc = r.monthly_records
          let dataElectric = {}
          let dataElectricNcc = {}
          let electricHigher = false
          let electricHigherNcc = false
          if (datasMonth.length) {
            datasMonth.map((data, i) => {
              if (index == i) {
                // electricHigher = datasMonth[i-1]?.total < data.total ? true : false
                electricHigher = data.percent > 0
                dataElectric = data
              }
            })
          }
          if(datasFromNcc) {
            datasFromNcc.map((data, i) => {
              if (index == i) {
                electricHigherNcc = data.percent > 0
                dataElectricNcc = data
              }
            })
          }
          return <span>
            {dataElectric?.total ?
              dataElectric?.total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : Number(0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }
            {
              electricHigher && <small style={{ fontSize: 12, color: electricHigher ? 'red' : '' }}>({dataElectric?.percent}%)</small>
            }
            <br />
            {
              dataElectricNcc?.total ?
                dataElectricNcc?.total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : Number(0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }
            {
              electricHigherNcc && <small style={{ fontSize: 12, color: electricHigherNcc ? 'red' : '' }}>({dataElectricNcc?.percent}%)</small>
            }
          </span>
        }
      }))
    ]
    return (
      <div>
        <PageHeader title='Report Electric Monthly' 
          tags={<Button type='primary' icon={<FontAwesomeIcon icon={faFileExcel} />} onClick={() => this.exportDatas()}> Export
          </Button>} />
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
                <Form.Item name={'year'} rules={[{ required: true, message: t("Please input year") }]}  >
                  <Dropdown datas={optionYears} defaultOption="-- All Years --" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                <Form.Item name={'location_id'} >
                  <Dropdown datas={locations} defaultOption="-- All locations --" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                <Button type="primary" htmlType="submit">Search</Button>
              </Col>
            </Row>
          </Form>
        </Row>

        {
          this.state.datasChart.length > 0 && <Row className='mt-3 mb-3 p-2'>
            <Chart height={300} autoFit data={this.state.datasChart} interactions={['active-region']} padding="auto" >
              <Interval position="months*total" />
              <Tooltip shared />
            </Chart>
          </Row>
        }
        <Table
          pagination={false}
          loading={this.state.loading}
          columns={columns}
          dataSource={this.state.datas}
          rowKey={r=> uniqueId(r.id)}
          scroll={{ x: 900 , y :300}}
        />

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

export default connect(mapStateToProps, mapDispatchToProps)(ElectricityManagementMonthly)