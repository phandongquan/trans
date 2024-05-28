import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Form, Col, Row, Input, Button, DatePicker, Table } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import tabList from '~/scenes/Company/config/tabListProject';
import Tab from '~/components/Base/Tab';
import Dropdown from '~/components/Base/Dropdown';
import { dateFormat } from '~/constants/basic';
import { getReportStaff as apiGetReportStaff } from '~/apis/company/project';
import { Link } from 'react-router-dom';
import '../config/ReportStaffIndex.css';
import { timeFormatStandard } from '~/services/helper';

const { RangePicker } = DatePicker;
class ReportStaff extends Component {
    /**
     * Lifecycle
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            reportStaff: [],
        }
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.formRef.current.setFieldsValue({department_id: 121})
        let values = this.formRef.current.getFieldsValue();
        this.getListReportStaff(values);
    }

    /**
     * Get list report-staff
     * @param {*} params 
     */
    async getListReportStaff(params = {}) {
        this.setState({loading: true})
        params = {
            ...params,
            status: -1,
        }
        let response = await apiGetReportStaff(params);
        this.setState({loading: false})
        if(response.status) 
            this.setState({ reportStaff: response.data.rows})
    }

    /**
     * Submit form
     * @param {*} values 
     */
    submitForm(values) {
        values.from_date = typeof values.date !== undefined && values.date ? timeFormatStandard(values.date[0], dateFormat) : undefined;
        values.to_date = typeof values.date !== undefined && values.date ? timeFormatStandard(values.date[1], dateFormat) : undefined;
        delete(values.date)
        this.getListReportStaff(values)
    }

    render() {
        let { t, baseData: { departments, divisions, positions } } = this.props;
        
        const columns = [
            {
                title: 'No',
                width: '3%',
                render: r => this.state.reportStaff.indexOf(r) + 1
            },
            {
                title: t('Code'),
                dataIndex: 'code'
            },
            {
                title: t('Staff'),
                dataIndex: 'staff_name'
            },
            {
                title: t('Projects'),
                width: '5%',
                align: 'center'
            },
            {
                title: t('Main assign'),
                width: '5%',
                align: 'center',
                render: r => r.main_assign_projects && Number(r.main_assign_projects) ? r.main_assign_projects : '',
                
            },
            {
                title: t('Tasks'),
                width: '5%',
                align: 'center',
                render: r => r.tasks && Number(r.tasks) ?
                    <Link to={{
                        pathname: "/company/projects/report",
                        params: {
                            staff_id: r.staff_id
                        }
                    }}>
                        {r.tasks}</Link>
                    : ''
            },
            {
                title: t('Tasks Medium'),
                width: '5%',
                align: 'center',
                render: r => r.task_medium && Number(r.task_medium) ?
                    <Link to={{
                        pathname: "/company/projects/report",
                        params: {
                            staff_id: r.staff_id,
                            piority: 1
                        }
                    }}>
                        {r.task_medium}</Link>
                    : ''
            },
            {
                title: t('Tasks High'),
                width: '5%',
                align: 'center',
                render: r => r.task_high && Number(r.task_high) ?
                    <Link to={{
                        pathname: "/company/projects/report",
                        params: {
                            staff_id: r.staff_id,
                            piority: 1
                        }
                    }}>
                        {r.task_high}</Link>
                    : ''
            },
            {
                title: t('Processing'),
                width: '5%',
                align: 'center',
                className: 'bg-color-blue',
                render: r => r.task_processing && Number(r.task_processing) ?
                    <Link to={{
                        pathname: "/company/projects/report",
                        params: {
                            staff_id: r.staff_id,
                            status: 1
                        }
                    }}>
                        {r.task_processing}</Link>
                    : ''
            },
            {
                title: t('Finished'),
                width: '5%',
                align: 'center',
                className: 'bg-color-success',
                render: r => r.task_finished && Number(r.task_finished) ?
                    <Link to={{
                        pathname: "/company/projects/report",
                        params: {
                            staff_id: r.staff_id,
                            status: 2
                        }
                    }}>
                        {r.task_finished}</Link>
                    : ''
            },
            {
                title: t('Lated'),
                width: '5%',
                align: 'center',
                className: 'bg-color-danger',
                render: r => r.task_lated && Number(r.task_lated) ?
                    <Link to={{
                        pathname: "/company/projects/report",
                        params: {
                            staff_id: r.staff_id,
                            status: 3
                        }
                    }}>
                        {r.task_lated}</Link>
                    : ''
            },
            {
                title: t('Waiting'),
                width: '5%',
                align: 'center',
                render: r => r.task_waiting && Number(r.task_waiting) ?
                    <Link to={{
                        pathname: "/company/projects/report",
                        params: {
                            staff_id: r.staff_id,
                            status: 0
                        }
                    }}>
                        {r.task_waiting}</Link>
                    : ''
            },
            {
                title: t('Score'),
                width: '5%',
                align: 'center',
                render: r => r.tasks && r.total_score ? r.total_score : ''
            },
            {
                title: t('Kpi'),
                width: '5%',
                align: 'center',
                className: 'bg-color-green',
                render: r => r.tasks && r.total_score ? Math.ceil(r.total_score/Math.max(1,r.score_count)) : ''
            },
        ]

        return (
            <>
                <PageHeader 
                    title={t('Projects - Report Staff')}
                />
                <Row className='card pl-3 pr-3 mb-3'>
                    <Tab tabs={tabList}></Tab>
                    <Form ref={this.formRef} className="pt-3" name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={24}>
                            <Col span={6}>
                                <Form.Item name="date">
                                    <RangePicker format={dateFormat} style={{width: '100%'}} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name="department_id" >
                                    <Dropdown datas={departments} defaultOption="-- All Department --" />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name="division_id" >
                                    <Dropdown datas={divisions} defaultOption="-- All Sections --" />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name="position_id" >
                                    <Dropdown datas={positions} defaultOption="-- All Positions --" />
                                </Form.Item>
                            </Col>
                            <Col span={4} key='submit'>
                                <Button type="primary" htmlType="submit">
                                    {t('Search')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>

                <Table 
                    loading={this.state.loading}
                    dataSource={this.state.reportStaff}
                    columns={columns}
                    rowKey="staff_id"
                    pagination={{ pageSize: 50, hideOnSinglePage: true }}
                    className='table-project-report-staff'
                />
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}

export default connect(mapStateToProps)(withTranslation()(ReportStaff));