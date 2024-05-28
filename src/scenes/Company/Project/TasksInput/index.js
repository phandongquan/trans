import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Form, DatePicker, Tag, Tooltip, Avatar } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { uniqueId } from 'lodash';
import Tab from '~/components/Base/Tab';
import Dropdown from '~/components/Base/Dropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { colorProjectTaskStatus, projectTaskStatus, dateFormat, projectTaskPriority, colorProjectTaskPriority, screenResponsive } from '~/constants/basic';
import tabList from '~/scenes/Company/config/tabListTask';
import { timeFormatStandard, getFirstCharacter ,historyParams, checkManager, checkPermission} from '~/services/helper';
import { getListTasksInputAdmin } from '~/apis/company/project/tasks-input';
import dayjs from 'dayjs';
import { getDivisionByDept } from '~/apis/setting/division';
import { getHeader, formatData,stylesHistory } from './config/TaskInputExcel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport} from '@fortawesome/free-solid-svg-icons';

import ExcelService from '~/services/ExcelService';
class TaskInput extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);

        let params = historyParams();
        let page = 1;
        let limit = params.limit ? params.limit : 25;
        if (params.offset) {
            page = params.offset / limit + 1;
        }
        this.state = {
            loading: false,
            divisions: [],
            datas: [],
            limit,
            total: 0,
            page
        };

        this.formRef = React.createRef();
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        const { staff_info } = this.props.auth

        if(staff_info.staff_dept_id) {
            this.getListDivision(staff_info.staff_dept_id);
        }

        this.formRef.current.setFieldsValue({
            date: [dayjs().startOf('month'), dayjs()],
            department_id: staff_info.staff_dept_id,
        })

        let values = this.formRef.current.getFieldsValue();
        this.getListTasksInput(values);
    }

    /**
     * Get list division
     * @param {*} deptId 
     */
     getListDivision = async (deptId) => {
        if(!deptId) {
            return false;
        }
        this.formRef.current.setFieldsValue({
            division_id: null
        })
        let response = await getDivisionByDept(deptId);
        if(response.status) {
            this.setState({ divisions: response.data })
        }
    }

    /**
     * Get list tasks input
     */
    getListTasksInput = async (params = {}) => {
        this.setState({ loading: true })
        if(typeof params.date !== undefined && params.date) {
            params.from_date = timeFormatStandard(params.date[0], dateFormat);
            params.to_date = timeFormatStandard(params.date[1], dateFormat);
            delete(params.date);
        }
        params = {
            ...params,
            limit: this.state.limit,
            offset: (this.state.page - 1) * this.state.limit
        }
        // historyReplace(params);
        let response = await getListTasksInputAdmin(params)
        if(response.status) {
            this.setState({ loading: false , datas: response.data.rows ,total: response.data.total})
        }
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = (values) => {
        this.getListTasksInput(values);
    }

    /**
     * On filter by staff
     * @param {*} staffId 
     */
    onFilterByStaff = (staffId) => {
        this.formRef.current.setFieldsValue({
            staff_id: staffId
        })

        let values = this.formRef.current.getFieldsValue();
        this.getListTasksInput(values);
    }
    /**
     * @event change page
     * 
     * @param {*} page 
     */
     onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListTasksInput({ ...values }));
    }

    /**
     * Export task input
     */
    exportTaskInput = () => {
        this.setState({ loading: true })
        let params = this.formRef.current.getFieldsValue();
        if(typeof params.date !== undefined && params.date) {
            params.from_date = timeFormatStandard(params.date[0], dateFormat);
            params.to_date = timeFormatStandard(params.date[1], dateFormat);
            delete(params.date);
        }
        params.limit = 2000;
        params.offset = 0;
        let xhr = getListTasksInputAdmin(params)

        xhr.then(response => {
            this.setState({ loading: false })
            if(response.status) {
                let header = getHeader();
                let headerFormat = [
                    ['Project Task', 'Date:', dayjs().format('YYYY-MM-DD')],
                    ...header
                ]
        
                let dataFormat = formatData(response.data.rows);
                let datas = [...headerFormat, ...dataFormat];
                let fileName = `Task-input-${dayjs().format('YYYY-MM-DD')}`;

                //exportToXLS(fileName, datas, autofitColumnXLS(header))

                let excelService = new ExcelService(['Main Sheet']);
                excelService.addWorksheetDatas(datas)
                    .addWorksheetStyles(stylesHistory)
                    //.mergeCells(header.merges)
                  .forceDownload(fileName);

            }
        })
    }

    /**
     * @render
     */
    render() {
        const MEDIA_AVATAR_URL = 'https://wshr.hasaki.vn/production/hr/'
        let { t, baseData: { departments, majors } ,auth :{staff_info} } = this.props;
        let { datas } = this.state;         
        const columns = [
            {
                title: t('No.'),
                render: r => datas.indexOf(r) + 1,
                width: '3%',
                fixed: window.innerWidth < screenResponsive  ? '' : 'left'
            },
            {
                title: t('hr:status'),
                render: r => <Tag color={colorProjectTaskStatus[r.status]}>{projectTaskStatus[r.status]}</Tag>,
                sorter: (a, b) => a.status - b.status,
                width: '6%',
                fixed: window.innerWidth < screenResponsive  ? '' : 'left'
            },
            {
                title: t('hr:deadline'), align: 'center',
                sorter: (a, b) => dayjs(a.date_end).unix() - dayjs(b.date_end).unix(),
                render: r => r.date_end ? timeFormatStandard(r.date_end, dateFormat) : '',
                width: '8%',
                fixed: window.innerWidth < screenResponsive  ? '' : 'left'
            },
            {
                title: t('hr:task_name'),
                sorter: (a, b) => a.name.localeCompare(b.name),
                render: r => r.name
            },
            {
                title: t('hr:work_group'),
                sorter: (a, b) => a.name.localeCompare(b.name),
                render: r => r.project ? r.project.name : '',
                width: '10%'
            },           
            {
                title: t('hr:workload'),
                sorter: (a, b) => a.amount_of_work - b.amount_of_work,
                render: r => r.amount_of_work,
                align: 'right',
                width: '4%'
            },
            {
                title: t('hr:planned_hours'),
                sorter: (a, b) => a.planned_hours - b.planned_hours,
                render: r => r.planned_hours,
                align: 'right',
                width: '5%'
            },
            {
                title: t('hr:actual_hours'),
                sorter: (a, b) => a.reality_hours - b.reality_hours,
                render: r => r.reality_hours,
                align: 'right',
                width: '5%'
            },
            {
                title: t('hr:confirmed_hour'),
                sorter: (a, b) => a.confirm_hours - b.confirm_hours,
                render: r => r.confirm_hours,
                align: 'right',
                width: '5%'
            },
            {
                title: t('hr:assign_to'),
                sorter: (a, b) => {
                    let aAssignStaff = a.staff;
                    let bAssignStaff = b.staff;
                    let aName = '';
                    let bName = ''
                    aAssignStaff.map(s => {
                        aName += s.info.staff_name;
                    })
                    bAssignStaff.map(s => {
                        bName += s.info.staff_name;
                    })
                    return aName.localeCompare(bName);
                },
                render: r => {
                    let result = [];
                    let assignStaff = r.staff;
                   
                    if(assignStaff.length == 1){
                        assignStaff.map(s => {                        
                            result.push(
                                <Tooltip className='cursor-pointer' title={<>{s.info.staff_name}  - {s.info.code}</>} placement="top"
                                    key={uniqueId('__members')} onClick={() => this.onFilterByStaff(s.info.staff_id)}>
                                    {s.info.avatar ?
                                        <Avatar src={MEDIA_AVATAR_URL + s.info.avatar} />
                                        : <Avatar style={{ backgroundColor: 'rgb(245, 106, 0)' }}>{getFirstCharacter(s.info.staff_name)}</Avatar>
                                    }
                                    <span>&nbsp;&nbsp;{s.info.staff_name}</span>
                                </Tooltip>
                            )
                        })
                    }
                    else{
                        return(
                           <div>
                                 <Avatar.Group maxCount={5} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }} >
                                 {assignStaff.map(s => {
                                        return (
                                            <Tooltip className='cursor-pointer' title={<>{s.info?.staff_name}  - {s.info?.code}</>} placement="top"
                                            key={uniqueId('__members')} onClick={() => this.onFilterByStaff(s.info.staff_id)}>
                                            {s.info?.avatar ?
                                                <Avatar src={MEDIA_AVATAR_URL + s.info?.avatar} />
                                                : <Avatar style={{ backgroundColor: 'rgb(245, 106, 0)' }}>{getFirstCharacter(s.info?.staff_name)}</Avatar>
                                            }
                                            {/* <span>&nbsp;&nbsp;{s.info.staff_name}</span> */}
                                        </Tooltip>
                                    )})
                                 }                                
                                </Avatar.Group>
                           </div>
                        )              
                    }
                  
                    return result
                },
                width: '13%'
            },
            // {
            //     title: t('Người giao'),
            //     render: r => r.confirm_hours,
            //     align: 'center',
            //     width: '5%'
            // },

            {
                title: t('hr:assignment_date'), align: 'center',
                sorter: (a, b) => dayjs(a.date_start).unix() - dayjs(b.date_start).unix(),
                render: r => r.date_start ? timeFormatStandard(r.date_start, dateFormat) : '',
                width: '10%'
            },
            {
                title: t('hr:approval_date'), align: 'center',
                sorter: (a, b) => dayjs(a.updated_at).unix() - dayjs(b.updated_at).unix(),
                render: r => r.updated_at ? timeFormatStandard(r.updated_at, 'YYYY-MM-DD HH:mm') : '',
                width: '10%'
            },
            {
                title: t('hr:priority'), align: 'center',
                sorter: (a, b) => a.piority - b.piority,
                render: r => <Tag color={colorProjectTaskPriority[r.piority]}>{projectTaskPriority[r.piority]}</Tag>,
                width: '6%'
            },
        ]

        return (
            <div id='page_task_input'>
                <PageHeader title={t('hr:task_input')} />
                <Row className="card pl-3 pr-3 mb-3">
                    {/* <Tab tabs={tabList(staff_info?.major_id,checkManager(staff_info?.position_id))}></Tab> */}
                    <div id="tab_responsive">
                        <div className='tab_content_mantenance_device'>
                            <Tab tabs={tabList(this.props)}></Tab>
                        </div>
                    </div>
                    <Form ref={this.formRef} className="pt-3" name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Form.Item name='date'>
                                    <DatePicker.RangePicker className='w-100' />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                                <Form.Item name='department_id'>
                                    <Dropdown datas={departments} defaultOption={t('all_department')} onChange={value => this.getListDivision(value)} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={3}>
                                <Form.Item name='division_id'>
                                    <Dropdown datas={this.state.divisions} defaultOption={t('all_section')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                                <Form.Item name='major_id'>
                                    <Dropdown datas={majors} defaultOption={t('all_major')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                                <Form.Item name='staff_id'>
                                    <StaffDropdown defaultOption={t('all_staff')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>                               
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        {t('hr:search')}
                                    </Button>
                                    {
                                        checkPermission('hr-task-input-export') ? 
                                            <Button className='ml-2' type='primary' key="export-staff"
                                                onClick={() => this.exportTaskInput()}
                                            >
                                                 {t('hr:export_file')}
                                            </Button>
                                        : ''
                                    }
                                </Form.Item>                                 
                            </Col>
                        </Row>                        
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>                       
                            {window.innerWidth < screenResponsive  ? 
                                <div className='block_scroll_data_table'>
                                        <div className='main_scroll_table'> 
                                            <Table
                                                dataSource={this.state.datas}
                                                columns={columns}
                                                loading={this.state.loading}
                                                pagination={{
                                                    total: this.state.total,
                                                    pageSize: this.state.limit,
                                                    hideOnSinglePage: true,
                                                    showSizeChanger: false,
                                                    current: this.state.page,
                                                    onChange: page => this.onChangePage(page)
                                                }}
                                                rowKey={(project) => project.id}
                                            />
                                        </div>
                                    </div>
                                    :
                                    <Table
                                        dataSource={this.state.datas}
                                        columns={columns}
                                        loading={this.state.loading}
                                        pagination={{
                                            total: this.state.total,
                                            pageSize: this.state.limit,
                                            hideOnSinglePage: true,
                                            showSizeChanger: false,
                                            current: this.state.page,
                                            onChange: page => this.onChangePage(page)
                                        }}
                                        rowKey={(project) => project.id}
                                    />
                            }
                    </Col>
                </Row>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}

export default connect(mapStateToProps)(withTranslation()(TaskInput));
