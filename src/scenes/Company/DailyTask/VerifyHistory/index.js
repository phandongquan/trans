import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Form, Row, Col, DatePicker, Tabs, Table, Image as ImageAnt, Button, Image , Avatar } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import { dateFormat, screenResponsive } from '~/constants/basic'
import Tab from '~/components/Base/Tab';
import tabList from '../config/tabList'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { apiListReport  , apiListReportStaff} from '~/apis/company/dailyTask';
import { checkPermission,exportToXLS, getThumbnailAvatarHR, getThumbnailHR, getURLHR, showNotify, timeFormatStandard } from '~/services/helper';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import { faEye, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { UserOutlined } from '@ant-design/icons';
import { MEDIA_URL_HR, URL_HR } from '~/constants';
import { formatData, getHeader } from './config/ReportFilterTaskExport';
import { formatDataStaff, getHeaderStaff } from './config/ReportFilterStaffExport';
import Dropdown from '~/components/Base/Dropdown';
import StaffDropdown from "~/components/Base/StaffDropdown";

const optionFilterTask = 1;
const optionFilterStaff = 2;

const typeIs_valid = {
    1: 'Hợp lệ',
    2: 'Không hợp lệ'
}
export class VerifyHistory extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.assginStaffRef = null;
        this.formRef = React.createRef();
        this.formModalRef = React.createRef()
        this.formSubmitRef = React.createRef()
        this.state = {
            loading: false,
            datas : [],
            option : optionFilterTask,
            datasStaff : [] ,
            loadingStaff : false
        };
    }
    componentDidMount() {
        
        this.formRef.current.setFieldsValue({
            date: [dayjs().startOf('month'), dayjs()],
            // task_id: "56",
        })
        let values = this.formRef.current.getFieldsValue();
        this.getListReport(values)
        this.getListReportFilterStaff(values)

    }
    componentDidUpdate(prevProps, prevState) {
    }
    async getListReportFilterStaff(params = {}){
        this.setState({ loadingStaff: true })
        if (params.date) {
            params.from_date = timeFormatStandard(params.date[0], dateFormat);
            params.to_date = timeFormatStandard(params.date[1], dateFormat);
            delete (params.date)
        }
        let response = await apiListReportStaff(params)
        if(response.status){
            this.setState({datasStaff : response.data , loadingStaff: false})
        }else{
            showNotify('Notification' , response.message , 'error')
            this.setState({loadingStaff: false})
        }
    }
    async getListReport (params = {}) {
        this.setState({ loading: true })
        if (params.date) {
            params.from_date = timeFormatStandard(params.date[0], dateFormat);
            params.to_date = timeFormatStandard(params.date[1], dateFormat);
            delete (params.date)
        }
        let response = await apiListReport(params)
        if(response.status){
            this.setState({datas : response.data , loading: false})
        }else{
            showNotify('Notification' , response.message , 'error')
            this.setState({loading: false})
        }
    }
    submitForm = () => {
        let values = this.formRef.current.getFieldsValue();
        if(this.state.option == optionFilterTask){
            this.getListReport(values);
        }
        if(this.state.option == optionFilterStaff){
        this.getListReportFilterStaff(values);
        }
    }
    async exportData(){
        let params = this.formRef.current.getFieldsValue();
        if (params.date) {
            params.from_date = timeFormatStandard(params.date[0], dateFormat);
            params.to_date = timeFormatStandard(params.date[1], dateFormat);
            delete (params.date)
        }
        if(this.state.option == optionFilterTask){
            this.setState({loading: true})
            let response = await apiListReport(params)
            if(response.status){
                let header = getHeader();
                let data = formatData(response.data)
                let fileName = `Report-Verify-Task-${dayjs().format('YYYY-MM-DD')}`;
                let datasExcel = [...header, ...data];
                exportToXLS(fileName, datasExcel, [
                    { width: 10 },
                    { width: 70 },
                    { width: 15 },
                    { width: 15 },
                    { width: 15 },
                    { width: 15 },
                ])
            }else{
                showNotify('Notification', response.message ,'error')
            }
            this.setState({loading: false})
        }
        if(this.state.option == optionFilterStaff){
            this.setState({loadingStaff: true})
            let response = await apiListReportStaff(params)
            if(response.status){
                let header = getHeaderStaff();
                let data = formatDataStaff(response.data)
                let fileName = `Report-Verify-Staff-${dayjs().format('YYYY-MM-DD')}`;
                let datasExcel = [...header, ...data];
                exportToXLS(fileName, datasExcel, [
                    { width: 25 },
                    null,
                    { width: 25 },
                    { width: 20 },
                    { width: 15 },
                    { width: 20 },
                    { width: 15 },
                    { width: 15 },
                ])
            }else{
                showNotify('Notification', response.message ,'error')
            }
            this.setState({loadingStaff: false})
        }
    }
    renderOptionFilterTask() {
        let { datas } = this.state;
        let {t, baseData: { locations } } = this.props;

        const columns = [
            {
                title: "ID",
                width: "5%",
                dataIndex: 'id',
            },
            {
                title: t("name"),
                width: "50%",
                dataIndex: 'name',
            },
            {
                title: t('hr:total_task'),
                align: "center",
                width: "10%",
                dataIndex: 'total_task',
            },
            {
                title: t("hr:total_verify" + " 1"),
                align: "center",
                width: "10%",
                dataIndex: 'totalVerify',
            },
            {
                title: t('hr:total_no_verify' + " 1"),
                align: "center",
                width: "10%",
                render: r => (r.total_task - r.totalVerify)
            },
            {
                title: t("hr:total_verify" + " 2"),
                align: "center",
                width: "10%",
                dataIndex: 'totalVerify2',
            },
            {
                title: t("action"),
                align: "center",
                width: "10%",
                render: r => {
                    let values = this.formRef.current.getFieldsValue()
                    values.from_date = dayjs(values?.date[0]).format('YYYY-MM-DD')
                    values.to_date = dayjs(values?.date[1]).format('YYYY-MM-DD')
                    return <Link to={{
                        pathname: `/company/daily-task/history-verify/detail`,
                        search: `?step_id=${r.id}&from_date=${values.from_date}&to_date=${values.to_date}&verify_by=${values.staff_id}`,
                    }}>
                        {
                            checkPermission('hr-daily-task-history-verify-preview') ? 
                                <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faEye} />} />
                            : ''
                        }
                    </Link>
                },
            },

        ]
        return <Table
            loading={this.state.loading}
            columns={columns}
            dataSource={this.state.datas}
            // pagination={{
            //     total: this.state.total,
            //     pageSize: 30,
            //     hideOnSinglePage: true,
            //     showSizeChanger: false,
            //     current: this.state.page,
            //     onChange: page => this.onChangePage(page)
            // }}
            pagination={false}
            rowKey='id' />
    }
    renderOptionFilterStaff(){
        let { datas } = this.state;
        let {t, baseData: { locations  , majors , divisions , departments} } = this.props;

        const columns = [
            {
                title: t('avatar'),
                width: '10%',
                align: 'center',
                render: r => {
                    if (r.verify_user && r.verify_user.avatar) {
                        return <Image className='staff_image'
                        preview={{ src: MEDIA_URL_HR + '/' + r?.verify_user?.avatar }} 
                            src={getThumbnailHR(r?.verify_user?.avatar, '40x40')} />
                    } else {
                        return <Avatar size={40} icon={<UserOutlined />} />
                    }
                }
            },
            {
                title: t('name'),
                width : '20%',
                render: r => (
                    <div>
                        <span>{r?.verify_user?.name}</span> #<strong>{r?.verify_user?.staff?.code}</strong><br />
                        <small>{r?.verify_user?.email}</small><br />
                    </div>
                )
            },
            {
                title: t('hr:location_division_major_dept'),
                render: r => (
                    <div>
                        {locations.map(m => m.id == r?.verify_user?.staff?.staff_loc_id && m.name)}  / 
                        {divisions.map(d => d.id == r?.verify_user?.staff?.division_id && d.name)}  / 
                        {majors.map(m => m.id == r?.verify_user?.staff?.major_id && m.name)} / 
                        {departments.map(de => de.id == r?.verify_user?.staff?.staff_dept_id && de.name)}  / 
                    </div>
                )
            },
            {
                title: t("hr:total_verify"),
                align: "center",
                width: "10%",
                dataIndex: 'total_verify',
            },
            {
                title: "KPI",
                align: "center",
                width: "10%",
                dataIndex: 'total_kpi',
            },
            {
                title: t("action"),
                align: "center",
                width: "10%",
                render: r => {
                    let values = this.formRef.current.getFieldsValue()
                    values.from_date = dayjs(values?.date[0]).format('YYYY-MM-DD')
                    values.to_date = dayjs(values?.date[1]).format('YYYY-MM-DD')
                    return <Link to={{
                        pathname: `/company/daily-task/history-verify/detail`,
                        search: `?verify_by=${r?.verify_user?.staff?.staff_id}&from_date=${values.from_date}&to_date=${values.to_date}`,
                    }}>
                        <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faEye} />} />
                    </Link>
                },
            },

            
        ]
        return <Table
            loading={this.state.loadingStaff}
            columns={columns}
            dataSource={this.state.datasStaff}
            pagination = {{
                pageSize : 50,
                showSizeChanger:false
            }}
            rowKey={r => r.verify_user.id} />
    }
    render() {
        let { datas } = this.state;
        let {t, baseData: { locations , departments , majors } } = this.props;
        
        return (
            <div>
                <PageHeader title={t('hr:list_report_verify')} />
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
                                    {/* <DatePicker format={dateFormat} className='w-100' /> */}
                                    <Form.Item name='date'>
                                        <DatePicker.RangePicker style={{ width: '100%' }} format={dateFormat} />
                                    </Form.Item>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="department_id" >
                                    <Dropdown datas={departments} defaultOption={t('hr:all_department')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="major_id" >
                                    <Dropdown datas={majors} defaultOption={t('hr:all_major')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name='staff_id'>
                                    <StaffDropdown defaultOption={t('hr:verify_by_staff')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name='verify2_by'>
                                    <StaffDropdown defaultOption={t('hr:verify_2_by_staff')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" className='mr-2'>
                                       {t('search')}
                                    </Button>
                                    {
                                        checkPermission('hr-daily-task-history-verify-export') ? 
                                            <Button type="primary" className='mr-2' icon={<FontAwesomeIcon icon={faFileExport} />} onClick={() => this.exportData()}>
                                                 {t('export_file')}
                                            </Button>
                                        : ''
                                    }
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={24}>
                    <Col span={24} className={window.innerWidth < screenResponsive  ? '':'card p-3'}>
                        <Tabs className={window.innerWidth < screenResponsive  ?'' :'p-3'} defaultActiveKey={optionFilterTask} onChange={value => this.setState({ option: value })}>
                            <Tabs.TabPane tab={t('hr:report_by_task')} key={optionFilterTask}>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab={t('hr:report_by_staff')} key={optionFilterStaff}>
                            </Tabs.TabPane>
                        </Tabs>

                        {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'> 
                                    {this.state.option == optionFilterTask ? this.renderOptionFilterTask()
                                        : this.renderOptionFilterStaff()
                                    }
                                </div>
                            </div>
                            :
                            <div>
                                {this.state.option == optionFilterTask ? this.renderOptionFilterTask()
                                    : this.renderOptionFilterStaff()
                                }
                            </div>
                        }
                    </Col>
                    
                </Row>
                
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    baseData: state.baseData
})

const mapDispatchToProps = {

}
export default connect(mapStateToProps, mapDispatchToProps)(VerifyHistory)