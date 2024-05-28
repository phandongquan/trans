import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import { Button, DatePicker, Row, Col, Form , Tabs  } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import DropDown from '~/components/Base/Dropdown';
import { getList, reportByStore ,getListTop } from '~/apis/ailogcustomer/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { showNotify, exportToXLS, autofitColumnXLS, checkPermission } from '~/services/helper';
import { formatHeader, formatData } from './config/exportAiLogCus'

import {
    Chart,
    Geom,
    Axis,
    Tooltip,
    View,
    Interval,
    Legend,
    Coord,
    Point ,
    Line,
    Label,
    Interaction,
    
} from "bizcharts";



const dateFormat = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

class AiLogCustomer extends Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef()
        this.state = {
            loading: false,
            datas: [],
            modeChart : 'Month',
            shop :'' ,
            datasTop10 : []
        }
    }

    componentDidMount(){
        this.formRef.current.setFieldsValue({ date: dayjs()})
        let values = this.formRef.current.getFieldsValue();
        this.getLogCustomer(values, this.state.modeChart)
    }

    /**
     * get log customer
     * @returns data log
     */
    getLogCustomer = async (params = {}, mode) => {
        { }
        this.setState({loading : true})
        if(mode == 'Month' && typeof params.date !== undefined && params.date){
            params ={
                ...params,
                from_date : params.date.startOf('month').format('YYYY-MM-DD 00:00:00'),
                to_date : params.date.endOf('month').format('YYYY-MM-DD HH:mm:ss'),
                
            }
            delete(params.date);
        }
        if(mode == 'Days' && typeof params.date !== undefined && params.date){
            params ={
                ...params,
                from_date : params.date[0].startOf('day').format('YYYY-MM-DD 00:00:00'),
                to_date : params.date[1].endOf('day').format('YYYY-MM-DD HH:mm:ss'),
                
            }
            delete(params.date);
        }
        if(mode == 'Day'){
            params ={
                ...params,
                from_date : params.date.format('YYYY-MM-DD 00:00:00'),
                to_date : params.date.format('YYYY-MM-DD 23:59:59'),
                
            }
            delete(params.date);
        }
        let response = await getList(params)
        if(mode != 'Day'){
            let responseTop = await getListTop(params)
            if(response.status || responseTop.status){
                this.setState({loading : false , datas : response.data , datasTop10 : responseTop.data})
            }
        }else{
            if(response.status){
                this.setState({loading : false , datas : response.data , datasTop10 : []})
            }
        }
        
    }
    submitForm () {
        let values = this.formRef.current.getFieldsValue();
        this.getLogCustomer(values , this.state.modeChart)
    }
    /**
     * format data
     * @returns data
     */
    formatData (datas) {
        let result = []
        let {baseData: { locations }} = this.props
        // datas.map(n => {
        //     let keyTime = dayjs(n['created_at']).format('HH') + '-' + dayjs(n['created_at']).add(1, 'H').format('HH')+'h';
        //     let indexFound = result.findIndex(r => r.time == keyTime)
        //     if (indexFound == -1) {
        //         result.push({
        //             count: n.count,
        //             // day : dayjs(n['created_at']).format('YYYY-MM-DD'),
        //             time: dayjs(n['created_at']).format('HH') + '-' + dayjs(n['created_at']).add(1, 'H').format('HH')+'h',
        //             timeSort : dayjs(n['created_at']).format('HH')
        //             // channel : n['channel'],
        //             // ip : n['ip'],
        //             // location_id : n['location_id']
        //         })
        //     } else {
        //         result[indexFound]['count'] = result[indexFound]['count'] + n.count
        //     }
        // })
        // result.sort((a,b) => a.timeSort - b.timeSort);
        if(Array.isArray(datas) && datas.length){
            datas.map(n =>{
                const store = locations.find(l => l.id == n.location_id);
                result.push({
                    value: String(n.value),
                    count: Number(n.count),
                    store: store?.name ? store.name : null
                })
                
            })
        }
        return result
    }
    // change mode day month
    onChangeMode = (mode) =>{
        this.setState({modeChart : mode})
        if(mode == 'Month'){
            this.formRef.current.setFieldsValue({ date: dayjs()})
            let values = this.formRef.current.getFieldsValue();
            this.getLogCustomer(values, mode)
        }
        if(mode == 'Days'){
            this.formRef.current.setFieldsValue({ date: [dayjs().subtract(7, 'd'), dayjs()]})
            let values = this.formRef.current.getFieldsValue();
            this.getLogCustomer(values,mode)
        }
        if(mode == 'Day'){
            this.formRef.current.setFieldsValue({ date: dayjs()})
            let values = this.formRef.current.getFieldsValue();
            this.getLogCustomer(values, mode)
        }

    }

    /**
     * Format params
     */
    formatParams = (params) => {
        const mode = this.state.modeChart;
        let fromDate = null, toDate = null;

        switch(mode) {
            case 'Month':
                if(typeof params.date != 'undefined' && params.date) {
                    fromDate = params.date.startOf('month').format('YYYY-MM-DD HH:mm:ss')
                    toDate = params.date.endOf('month').format('YYYY-MM-DD HH:mm:ss')
                }
                break;
            case 'Days':
                if(typeof params.date != 'undefined' && params.date) {
                    fromDate = params.date[0].startOf('day').format('YYYY-MM-DD HH:mm:ss');
                    toDate = params.date[1].endOf('day').format('YYYY-MM-DD HH:mm:ss');
                }
                break;
            default:
                fromDate = params.date.startOf('day').format('YYYY-MM-DD HH:mm:ss');
                toDate = params.date.endOf('day').format('YYYY-MM-DD HH:mm:ss');
                break;
        }
        delete(params.date);
        return {
            ...params,
            from_date: fromDate,
            to_date: toDate,
        }
    }

    /**
     * Export Ai log customer
     */
    exportAiLogCustomer = async () => {
        const mode = this.state.modeChart;
        let params = this.formRef.current.getFieldsValue();
        let paramFormats = this.formatParams(params);
        let response = await reportByStore(paramFormats);
        if(response.status) {
            let header = formatHeader();
            let data = formatData(response.data, mode);
            let fileName = `Ai-log-customer-${dayjs().format('YYYY-MM-DD')}`;
            let datas = [...header, ...data];
            exportToXLS(fileName, datas, autofitColumnXLS(header));
        } else {
            showNotify('Notify', response.message, 'error')
        }
    }

    render() {
        let { t, baseData: { locations } } = this.props;
        let {datas , datasTop10} = this.state;
        let data = this.formatData(datas )
        let dataTop = this.formatData(datasTop10)
        const scale = {
            count: { min: 0 },
            // value : {sync : true},
            // store   : {sync : true},
        }
        
        return (
            <div>
                <PageHeader
                    className="site-page-header"
                    title={t('hr:customer_chart')}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Form ref={this.formRef} className="pt-3" name="searchStaffForm"
                    onFinish={this.submitForm.bind(this)}
                    >
                        <Row gutter={12}>
                            <Col span={4}>
                                <Form.Item name='location_id'>
                                    <DropDown datas={locations} defaultOption={t('hr:all_location')} />
                                </Form.Item>
                            </Col>
                            {
                                this.state.modeChart == 'Month' ?
                                    <Col span={3}>
                                        <Form.Item name='date'>
                                            <DatePicker picker="month"/>
                                        </Form.Item>
                                    </Col>
                                    :
                                    this.state.modeChart == 'Days'?
                                    <Col span={4}>
                                        <Form.Item name='date'>
                                            <RangePicker className='w-100'/>
                                        </Form.Item>
                                    </Col>
                                    :
                                    <Col span={3}>
                                        <Form.Item name='date'>
                                            <DatePicker/>
                                        </Form.Item>
                                    </Col>

                            }
                            
                            <Button type="primary" htmlType="submit">
                                {t('search')}
                            </Button>
                            {checkPermission('hr-tool-ai-log-customer-export') ? 
                                <Button className='ml-2' icon={<FontAwesomeIcon icon={faFileExport} />} type="primary" onClick={() => this.exportAiLogCustomer()}>
                                    {t('export_file')}
                                </Button> 
                                 : ''
                            }
                        </Row>

                    </Form>
                </Row>
                <Row className="card p-3">
                    <Tabs defaultActiveKey='Month' onChange={value => this.onChangeMode(value)}>
                        <TabPane tab={t('month')} key='Month'>
                        </TabPane>
                        <TabPane tab={t('hr:mutidays')} key="Days">
                        </TabPane>
                        <TabPane tab={t('hr:day')} key="Day">
                        </TabPane>
                    </Tabs>
                    {
                        datas.length ?
                         <h4 className='d-flex justify-content-center mt-4 pb-5'>{t('hr:analysis_chart')} </h4>
                         : 
                         <h4 className='d-flex justify-content-center mt-4'>{t('hr:no_data')} </h4>
                    }
                    {data.length ?
                        <div >
                            {/* <Chart height={500} witdh={120} padding={[50, 20, 200, 40]} autoFit data={data} interactions={['element-active']} >
                                <Interval position="value*count" label={[
                                    // "ratio*count",
                                    // (xValue) => {
                                    //     return {
                                    //         // content:'▼' + '▲' + '◄' + xValue + '%',
                                    //         content: '%',
                                    //         style: {
                                    //             fill: 'red',
                                    //         }
                                    //     };
                                    // }
                                ]}  />
                                <Tooltip shared={true} showCrosshairs />
                                <Axis name="value" label={{
                                    rotate: 1, style: { fill: 'rgba(0, 0, 0, 0.65)', stroke: '#ffffff', textAlign: 'center' }, offset: 50,
                                    // formatter(text, item, index) {
                                    //     let arr = text.split(' ');
                                    //     console.log(arr)
                                    //     return `${arr[0]}\n${arr[1]}`;
                                    // }
                                }} />

                            </Chart> */}
                            {/* <Chart height={500} padding={[50 , 75 , 100 , 50]} data={data} autoFit filter={[
                                ['count', val => val != null]
                            ]}
                            >
                                <Axis name='value' position='bottom' />
                                <Interval
                                    adjust={[
                                        {
                                            type: 'dodge',
                                            marginRatio: 0,
                                        },
                                    ]}
                                    // color="store"
                                    position="value*count"
                                />
                                <Tooltip shared position='left' showCrosshairs region={null} />
                                <Interaction type="active-region" />
                                <View data={dataTop} scale={scale} padding={0}>
                                    <Axis name='count' visible={false} />
                                    <Point position="value*count" color="store" shape='circle' />
                                    <Line shape="smooth" position="value*count" color="store" />
                                    <Tooltip title={'Top 10 cửa hàng'} shared position='right' showCrosshairs region={null} 
                                        domStyles={{'g2-tooltip-list-item' : {display : 'flex'}}}
                                        />
                                    <Legend background={{
                                        padding: [5, 100, 5, 36],
                                        style: {
                                            fill: '#eaeaea',
                                            stroke: '#fff'
                                        }
                                    }} />
                                </View>
                            </Chart> */}
                            <Chart height={500} padding={[50 , 75 , 100 , 50]} data={dataTop}  scale={scale} autoFit filter={[
                                ['count', val => val != null]
                            ]}
                            >
                                <Axis name='count' title position='left' visible={dataTop.length ? true : false}/>
                                <Point position="value*count" color="store" shape='circle' />
                                <Line shape="smooth" position="value*count" color="store" />
                                <Tooltip title={'Top 10 cửa hàng'} shared position='left' region={null}/>
                                <View data={data} padding={0}>
                                    <Axis title={{text : 'Total count'}} name='count'  position='right' 
                                        grid={{
                                            line: { 
                                                type: 'line', 
                                                style: {
                                                    stroke: '#d9d9d9', 
                                                    lineWidth: 1, 
                                                    lineDash: [4, 4] 
                                                }
                                            },
                                        }} />
                                    <Interval
                                        adjust={[
                                            {
                                                type: 'dodge',
                                                marginRatio: 0,
                                            },
                                        ]}
                                        // color="store"
                                        style = {{fill : 'rgb(0 103 255 / 20%)'}}
                                        position="value*count"
                                    />
                                    <Tooltip shared position='right' showCrosshairs region={null} domStyles={{'g2-tooltip-list-item' : {display : 'flex'}}}/>
                                    <Interaction type="active-region" />
                                </View>
                            </Chart>
                        </div>
                        : ''}
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AiLogCustomer));
