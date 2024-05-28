import { Row, Col, Spin, Divider, Table, Form, Input, Button } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Tab from '~/components/Base/Tab';
import tabList from './config/tabList';
import dayjs from 'dayjs';
import { exportToXLS, historyParams, historyReplace, showNotify } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import { getList, reloadList } from '~/apis/electricMangement/index'
import { Axis, Chart, Interval, Tooltip } from 'bizcharts';
import { uniqueId } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { formatData, formatHeader } from './config/exportElectricDaily';
export class ElectricityManagement extends Component {
    constructor(props) {
        // let params = historyParams();
        // let month = params.month ? params.month : dayjs().format('M');
        // let year = params.year ? params.year : dayjs().format('Y');
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            // totalDaysInMonthForm: 0,
            arrTotalDays: [],
            month: dayjs().format('MM'),
            year: dayjs().format('YYYY'),
            datas: [],
            data: {},
            datasChart: []
        }
    }
    componentDidMount() {
        let params = historyParams();
        let month = params.month ? params.month : dayjs().format('MM');
        let year = params.year ? params.year : dayjs().format('YYYY');
        let monthFormat = parseInt(month, 10)
        // let { year , month } = this.state
        // this.setState({totalDaysInMonthForm: dayjs([year, month]).daysInMonth()})
        let totalDaysInMonthForm = dayjs(`${year}-${monthFormat.length == 1 ? '0'+ monthFormat : monthFormat}-01}-01`, 'YYYY-MM-DD').daysInMonth()
        let arrTotalDays = this.convertArrayTotalDaysMonth(totalDaysInMonthForm)
        this.setState({ arrTotalDays })
        this.formRef.current.setFieldsValue({
            ...params,
            year,
            month : monthFormat,
        })
        let values = this.formRef.current.getFieldsValue()
        this.getDatasElectric(values)
    }
    async getDatasElectric(params = {}) {
        this.setState({ loading: true })
        historyReplace(params)
        let response = await getList(params)
        if (response.status) {
            let datasChart = response.data.summary;
            if (datasChart.length) {
                datasChart.map(d => d.date = dayjs(d.date).format('DD'))
            }
            this.setState({ loading: false, datas: response.data.rows, datasChart: response.data.summary })
        } else {
            showNotify('Notification', response.message, 'error')
            this.setState({ loading: false })
        }
    }
    convertArrayTotalDaysMonth(total) {
        let result = []
        for (let i = 1; i <= total; i++) {
            result.push(i)
        }
        return result
    }
    submitForm() {
        let values = this.formRef.current.getFieldsValue()
        let totalDaysInMonthForm = dayjs(`${values.year}-${values.month.length == 1 ? '0' + values.month : values.month}-01`).daysInMonth()
        let arrTotalDays = this.convertArrayTotalDaysMonth(totalDaysInMonthForm)
        this.setState({arrTotalDays , month: values.month, year: values.year }, () => this.getDatasElectric(values))

    }
    async reloadDatas(keyDate , dataElectric, data) {
        this.setState({ loading: true })
        let params = {}
        if(keyDate == 'month'){
            let values = this.formRef.current.getFieldsValue()
            let monthSubmit = dayjs().month((values.month) - 1).startOf('month') // 0 là tháng 1
            params = {
                makh: data.makh,
                from_date : monthSubmit.format('YYYY-MM-DD'),
            }
        }else{
            params = {
                makh: data.makh,
                date: dataElectric.date
            }
        }
        
        let response = await reloadList(params)
        if (response.status) {
            if (response.status) {
                let values = this.formRef.current.getFieldsValue()
                this.getDatasElectric(values)
                showNotify('Notification', 'Success!')
            } else {
                showNotify('Notification', response.message, 'error')
                this.setState({ loading: false })
            }
        } else {
            showNotify('Notification', response.message, 'error')
            this.setState({ loading: false })
        }
    }
    async exportDatas(){
        this.setState({loading: true})
        let values = this.formRef.current.getFieldsValue()
        let totalDaysInMonthForm = dayjs(`${values.year}-${values.month.length == 1 ? '0' + values.month : values.month}-01`).daysInMonth()
        let arrTotalDays = this.convertArrayTotalDaysMonth(totalDaysInMonthForm)
        let response = await getList(values)
        if (response.status) {
            let header = formatHeader(arrTotalDays);
            let data = formatData(response.data.rows , arrTotalDays);
            let fileName = `Electric-Management-Daily-${dayjs().format('YYYY-MM')}`;
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
                render: r => <a href='#' onClick={() => this.reloadDatas('month',{}, r)}>{r.makh}</a>
            },
            ...this.state.arrTotalDays.map(item => ({
                title: `${dayjs([year, month, item]).format('DD(dd)')}`,
                width: 120,
                render: r => {
                    let dataElectric = {}
                    let datasDaily = r.records
                    let electricHigher = false
                    if (datasDaily.length) {
                        datasDaily.map((data, i) => {
                            if (dayjs(data.date).format('DD') == item) {
                                // electricHigher = datasDaily[i-1]?.total < data.total ? true : false
                                electricHigher = data.pecent > 0
                                dataElectric = data
                            }
                        })
                    }

                    return (
                        <span className='cursor-pointer' onClick={() => {
                            if (dataElectric.total == 0) {
                                this.reloadDatas('day', dataElectric, r);
                            }
                        }}>
                            {dataElectric.total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            {electricHigher && <small style={{ fontSize: 12, color: 'red' }}>({dataElectric?.pecent}%)</small>}
                        </span>
                    );
                }
            }))
        ]
        let optionYears = [];
        const currentYear = dayjs().format('YYYY');
        for (let i = currentYear - 2; i <= currentYear + 1; i++)
            optionYears.push({ id: i, name: i })

        let optionMonths = [];
        for (let i = 1; i <= 12; i++)
            optionMonths.push({ id: i, name: 'Month ' + i })

        return (
            <div>
                <PageHeader title='Report Electric Daily' 
                tags={<Button type='primary' icon={<FontAwesomeIcon icon={faFileExcel}/>} onClick={() => this.exportDatas()}> Export
                </Button>}/>
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
                                <Form.Item name={'month'} rules={[{ required: true, message: t("Please input month") }]}>
                                    <Dropdown datas={optionMonths} defaultOption="-- All Month --" />
                                </Form.Item>
                            </Col>
                            {/* <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                <Form.Item name={'makh'}>
                                    <Input className='w-100' placeholder='Mã KH' />
                                </Form.Item>
                            </Col> */}
                            <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                <Form.Item name={'location_id'}>
                                    <Dropdown datas={locations} defaultOption="-- All Locations --" />
                                </Form.Item>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                <Button type="primary" htmlType="submit">Search</Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                {
                    this.state.datasChart.length > 0 && <div className='mt-3 mb-3 p-2' 
                    // style={{
                    //     position: 'fixed' , 
                    //     width: '85%',
                    //     height: '320px',
                    //     left: '13%',
                    //     top: '24%',
                    //     zIndex:'10'
                    // }}
                    >
                        <Chart height={300} autoFit data={this.state.datasChart} interactions={['active-region']} padding="auto" >
                            <Interval position="date*total" />
                            <Tooltip shared />
                            <Axis
                                name="date"
                                label={{
                                    offset: 20,
                                }}
                                visible={true}
                            />
                        </Chart>
                    </div>
                }

                <Table
                    // style={{marginTop:'22%'}}
                    dataSource={[...this.state.datas]}
                    loading={this.state.loading}
                    className='pb-3'
                    columns={columns}
                    scroll={{ x: 900 , y :300 }}
                    bordered
                    size="small"
                    rowKey={r=> uniqueId(r.id)}
                    pagination={false}
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

export default connect(mapStateToProps, mapDispatchToProps)(ElectricityManagement)