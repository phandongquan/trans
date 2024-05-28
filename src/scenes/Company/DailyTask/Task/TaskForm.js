import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Row, Col, DatePicker, Input, Form, Divider, TimePicker, Checkbox, Spin, Table, Tooltip, Collapse } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { detail as detailTask, update as updateTask, create as createTask } from '~/apis/company/task';
import { getList as getListWorkflow } from '~/apis/company/dailyTask/workflow';
import { checkPermission, showNotify } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import BackButton from '~/components/Base/BackButton';
import { scheduleList, reminds, checkBoxDayOfWeeks, dateFormat, emptyDate, emptyTime, dailyChecklistType, screenResponsive } from '~/constants/basic';
import { timeFormatStandard } from '~/services/helper';
import { getList as apiGetList } from '~/apis/company/dailyTask/workflowStep';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { getDayOptions, getMonthOptions, getValuesFromArrayObj } from '../../Task/TaskSchedule/config/TaskScheduleConfig';

const timeFormat = 'HH:mm';
const { TextArea } = Input;

const arrStatus = {
    1: "Pending", 
    2: "Approved",
    3: "Finished"
}
const monthOptions = getMonthOptions();
const allValueMonthOptions = getValuesFromArrayObj(monthOptions);
const dayOptions = getDayOptions();
const allValueDayOptions = getValuesFromArrayObj(dayOptions);
class TaskForm extends Component {

    /**
     *
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            workflows: [],
            hideDateInput: false,
            hideTimeInput: true,
            hideDayOfWeek: true,

            hideAllOfMonth : true ,
            workflowSteps: [],
            visibleChecklist: true , 
            monthList: allValueMonthOptions,
            dayInMonthList: [],
        };
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.formRef.current.setFieldsValue({
            remind: 15,
            status: 1
        });

        let { id } = this.props.match.params;
        if (id) this.getDetailTask(id);

        this.listWorkflow();
    }

    /**
     * Call api get detail task
     * @param {*} id 
     */
    async getDetailTask(id) {
        let response = await detailTask(id);
        if (response.status) {
            let { task } = response.data;
            if(task.type == 2) {
                this.setState({ visibleChecklist: false })
            }
            let formData = {};

            Object.keys(task).map(key => {
                if (['date_start', 'date_end',].includes(key)) {
                    formData[key] = (typeof task[key] !== 'undefined' && task[key] != emptyDate && task[key] != null) ? dayjs(task[key], dateFormat) : null;
                } else if (['time_start', 'time_end',].includes(key)) {
                    formData[key] = (typeof task[key] !== 'undefined' && task[key] != emptyTime && task[key] != null) ? dayjs(task[key], timeFormat) : null;
                } else if(['major_id', 'location_id',].includes(key)) {
                    if(!task[key] || (typeof task[key][0] != undefined && (task[key][0] == null || task[key][0] == '' || task[key][0] == '0'))) {
                        formData[key] = null;
                    } else {
                        formData[key] = task[key] ? task[key] : null;
                    }
                } else {
                    formData[key] = task[key] ? task[key] : null;
                }
            });
            if(task.schedule == 3){// monthly
                this.setState({monthList : task.month.map(i => parseInt(i)) , dayInMonthList : [parseInt(task.days)] } )
            } 

            this.formRef.current.setFieldsValue(formData);
            this.handleSelectSchedule(String(task.schedule));
            this.getChildrenWorkflow(task.workflow);
        }
    }

    /**
     * List work flow
     */
    async listWorkflow() {
        let response = await getListWorkflow({
            limit: 1000,
            type: 2
        });

        if (response.status) {
            let { data } = response;
            let listData = [];
            if (data.rows) {
                data.rows.map((item) => {
                    listData.push({ 'id': item.id, 'name': item.name });
                })
            }
            this.setState({ workflows: listData });
        }
    }

    /**
     * Get children workflow
     * @param {*} task 
     */
    async getChildrenWorkflow(wfid) {
        if(wfid) {
            let response = await apiGetList({ wfid })
            if(response) {
                let { data } = response;
                this.setState({ workflowSteps: data.rows })
            }
        }
    }

    /**
     * Handle when selected schedule
     * @param {*} e 
     */
    handleSelectSchedule = (e) => {
        switch (e) {
            case '0':
                return this.setState({ hideTimeInput: true, hideDateInput: false, hideDayOfWeek: true , hideAllOfMonth: true  });
            case '1':
                return this.setState({ hideTimeInput: false, hideDateInput: true, hideDayOfWeek: true , hideAllOfMonth: true });
            case '2':
                return this.setState({ hideTimeInput: true, hideDateInput: true, hideDayOfWeek: false , hideAllOfMonth: true });
            case '3' : 
                return this.setState({ hideTimeInput: true, hideDateInput:true , hideDayOfWeek : true , hideAllOfMonth: false })
            default:
                return this.setState({ hideTimeInput: true, hideDateInput: true, hideDayOfWeek: true  , hideAllOfMonth: true });
        }
    }

    /**
     * Loading Button
     */
    enterLoading = () => {
        this.setState({ loading: true });
        setTimeout(() => {
            this.setState({ loading: false });
        }, 1000);
    }

    /**
     * @event submitForm
     */
    submitForm(values) {
        this.setState({ loading: true })
        let { t } = this.props;
        let { id } = this.props.match.params;
        let data = {
            // Format datetime before submit
            date_start: values.date_start ? timeFormatStandard(values.date_start, 'YYYY-MM-DD') : null,
            date_end: values.date_end ? timeFormatStandard(values.date_end, 'YYYY-MM-DD') : null,
            time_start: values.time_start ? values.time_start.format('HH:mm') : null,
            time_end: values.time_end ? values.time_end.format('HH:mm') : null,
        };

        let arrKeyFormat = ['major_id', 'division_id', 'department_id','position_id', 'location_id', 'report_to', 'staff_id'];

        Object.keys(values).map(key => {
            if(arrKeyFormat.indexOf(key) >= 0) {
                values[key] = values[key] == null || typeof values[key] == 'undefined' ? 0 : values[key];
            }
        })
        
        values['work_all'] = values['work_all'] ? 1 : 0
        values['major_id'] = (values['major_id'] && values['major_id'].length) ? values['major_id'] : ["0"]
        values['location_id'] = (values['location_id'] && values['location_id'].length) ? values['location_id'] : ["0"]
        if(!this.state.hideAllOfMonth){
            if(this.state.monthList.length){
                let arrMonths = []
                this.state.monthList.map(d => arrMonths.push(d))
                values['month'] = arrMonths
            }
            if(this.state.dayInMonthList.length){
                let arrDays = []
                this.state.dayInMonthList.map(d => arrDays.push(d))
                // values['month'] = arrDays
                values['days'] = arrDays
            }
        }
        data = {...values, ...data};
        let xhr;
        let message;

        if (id) {
            xhr = updateTask(id, data);
            message = t('task_update');
        } else {
            xhr = createTask(data);
            message = t('task_create');
        }
        xhr.then((response) => {
            if (response.status != 0) {
                this.setState({ loading: false })
                showNotify(t('Notification'), message);
                if(!id) this.props.history.push('/company/daily-task/task')
            } else {
                this.setState({ loading: false })
                showNotify(t('Notification'), response.message, ('error'));
            }
        });
    }
    ChangeMonth(MonthValue){
        let arrMonth = this.state.monthList.slice()
        if(!arrMonth.includes(MonthValue)){
            arrMonth.push(MonthValue)
        }else{
            arrMonth = arrMonth.filter(item => item !== MonthValue)
        }
        this.setState({monthList : arrMonth})
    }
    ChangeDay(dayValue){
        let arrDays = this.state.dayInMonthList.slice()
        // if(arrDays.length > 0){
            if(!arrDays.includes(dayValue)){
                // arrDays = [dayValue]
                arrDays.push(dayValue)
            }else{
                // arrDays=[]
                arrDays = arrDays.filter(item => item !== dayValue)
            }
        // }else{
        //     arrDays.push(dayValue)
        // }
        this.setState({dayInMonthList : arrDays})
    }
    /**
     * @render
     */
    render() {
        let { t, match, baseData: { departments, divisions, majors, positions, locations } } = this.props;
        let { workflows, hideDateInput, hideTimeInput, hideDayOfWeek, visibleChecklist } = this.state;
        let id = match.params.id;
        let subTitle = '';
        if (id) {
            subTitle = t('hr:task_update');
        } else {
            subTitle = t('hr:add_new_task');
        }

        const columnWorkflowSteps = [
            {
                title: t('No.'),
                render: r => this.state.workflowSteps.indexOf(r) + 1
            },
            {
                title: t('name'),
                dataIndex: 'name'
            },
            {
                title: t('priority'),
                dataIndex: 'priority',
            },
            {
                title: t('time'),
                dataIndex: 'duration',
                align: 'center',
            },
            {
                title: t('start'),
                dataIndex: 'begintime',
                render: (begintime) => {
                    return begintime ? dayjs(begintime, "HH:mm:ss").format('HH:mm') : ''
                }
            }
        ]

        return (
            <div id='page_edit_task'>
                <PageHeader title={t('task')} subTitle={subTitle} />
                <Row>
                    <Col xs={24} sm={24} md={24} lg={14} xl={14} className='card pl-3 pr-3'>
                        <Spin spinning={this.state.loading}>
                            <Form ref={this.formRef}
                                name="upsertStaffForm"
                                className="ant-advanced-search-form pt-3"
                                layout="vertical"
                                onFinish={this.submitForm.bind(this)}
                            >
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                                        <Form.Item name="name" label={t('task_name')} hasFeedback rules={[{ required: true, message: t('hr:input_task_name') }]}>
                                            <Input placeholder={t('task_name')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name="code" label={t('hr:task_code')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('hr:input_task_code') }]}
                                            >
                                            <Input placeholder={t('hr:task_code')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} key='department'>
                                        <Form.Item name="department_id" label={t('dept')}>
                                            <Dropdown datas={departments}
                                                defaultOption={t('hr:all_department')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} key='division'>
                                        <Form.Item name="division_id" label={t('div')}>
                                            <Dropdown datas={divisions} defaultOption={t('hr:all_division')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} key='major'>
                                        <Form.Item name="major_id" label={t('major')}>
                                            <Dropdown datas={majors} defaultOption={t('hr:all_major')} mode='multiple' />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item
                                            name="position_id"
                                            label={t('position')}>
                                            <Dropdown datas={positions} defaultOption={t('hr:all_position')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={5} xl={5}>
                                        <Form.Item name="location_id" label={t('hr:work_location')}>
                                            <Dropdown datas={locations} defaultOption={t('hr:all_location')} mode='multiple' />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={3} xl={3} >
                                        <Form.Item valuePropName="checked" name="work_all" label={<Tooltip title={t("hr:work_all")}>{t("hr:work_all")} <QuestionCircleOutlined style={{ color: 'red' }}/></Tooltip>}>
                                            <Checkbox className='ml-3'/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="status" label={t('status')}>
                                            <Dropdown  datas={arrStatus} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                        <Form.Item name="schedule" label={t('schedule')}>
                                            <Dropdown datas={scheduleList} defaultOption="-- None --"
                                                onSelect={(e) => this.handleSelectSchedule(e)}
                                                onClear={() => this.setState({ hideTimeInput: true, hideDateInput: false, hideDayOfWeek: true , hideAllOfMonth : true })}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6} hidden={hideDateInput}>
                                        <Form.Item name="date_start" label={t('hr:start_date')} >
                                            <DatePicker format={dateFormat} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6} hidden={hideDateInput}>
                                        <Form.Item name="date_end" label={t('hr:end_date')}>
                                            <DatePicker format={dateFormat} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6} hidden={hideTimeInput}>
                                        <Form.Item name="time_start" label={t('time_start')}>
                                            <TimePicker format={timeFormat} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6} hidden={hideTimeInput}>
                                        <Form.Item name="time_end" label={t('time_end')}>
                                            <TimePicker format={timeFormat} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12} hidden={hideDayOfWeek}>
                                        <Form.Item name="days" label={t('hr:day_of_week')}>
                                            <Checkbox.Group options={checkBoxDayOfWeeks} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={24} hidden={this.state.hideAllOfMonth}>
                                        <Collapse expandIcon={() => <></>} style={{ marginBottom: 3 }} collapsible='disabled' defaultActiveKey='month' key={'schedule-month'}>
                                            <Collapse.Panel  key="month" >
                                                <Row>
                                                    {monthOptions.map((monthObj, monIndex) => {
                                                        return (
                                                            <Col span={6} key={`month-${monIndex}`}>
                                                                <Checkbox onChange={(e) => this.ChangeMonth(monthObj.value)} checked={this.state.monthList.includes(monthObj.value)}  >
                                                                    {monthObj.label}
                                                                </Checkbox>
                                                            </Col>
                                                        );
                                                    })}
                                                </Row>
                                            </Collapse.Panel>
                                        </Collapse>
                                        {/* Days */}
                                        <Collapse expandIcon={() => <></>} style={{ marginBottom: 3 }} collapsible='disabled' defaultActiveKey='day' key={'schedule-day'}>
                                            <Collapse.Panel  key="day" >
                                                <Row>
                                                    {dayOptions.map((dayObj, dayIndex) => {
                                                        return (
                                                            <Col span={6} key={`day-${dayIndex}`}>
                                                                <Checkbox onChange={(e) => this.ChangeDay(dayObj.value)} checked={this.state.dayInMonthList.includes(dayObj.value)} >
                                                                    {dayObj.label}
                                                                </Checkbox>
                                                            </Col>
                                                        );
                                                    })}
                                                </Row>
                                            </Collapse.Panel>
                                        </Collapse>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name="remind" label={t('hr:remind_before')}>
                                            <Dropdown datas={reminds} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                        <Form.Item name="type" label={t('hr:type')}> 
                                            <Dropdown 
                                                datas={dailyChecklistType} 
                                                defaultValue={0} 
                                                onChange={value => this.setState({ visibleChecklist: value == 2 ? false : true })} 
                                            />
                                        </Form.Item>
                                    </Col>
                                    { visibleChecklist ?
                                        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                            <Form.Item name="workflow" label={t('checklist')}>
                                                <Dropdown 
                                                    datas={workflows} 
                                                    defaultOption={t('checklist')}
                                                    onSelect={(wfid) => this.getChildrenWorkflow(wfid)}
                                                />
                                            </Form.Item>
                                        </Col> : ''}
                                </Row>
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item name="staff_id" label={t('hr:assign_staff')}>
                                            <StaffDropdown defaultOption={t('hr:assign_staff')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item name="report_to" label={t('hr:report_to')}>
                                            <StaffDropdown defaultOption={t('hr:report_to_staff')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col span={24}>
                                        <Form.Item name="note" label={t('note')}>
                                            <TextArea rows={2} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Divider className="m-0" />
                                <Row gutter={24} className="pt-3 pb-3">
                                    <Col span={12} key='bnt-submit' >
                                        {
                                        checkPermission('hr-daily-task-update') ?
                                            <Button type="primary" icon={<FontAwesomeIcon icon={faSave} />} htmlType="submit"
                                                loading={this.state.loading}
                                            >
                                                {t('save')}
                                            </Button>
                                        : ''
                                        }
                                    </Col>
                                    <Col span={12} key='btn-back' style={{ textAlign: "right" }}>
                                        <BackButton url={`/company/daily-task/task?limit=20&offset=0`} />
                                    </Col>
                                </Row>
                            </Form>
                        </Spin>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={10} xl={10} className= {window.innerWidth < screenResponsive  ? 'mt-2' : 'pl-3'}>
                        <Row id='block_work_flow_page_task'>
                            <PageHeader title={t('checklist')} />
                            <Col span={24} className=''>
                                {window.innerWidth < screenResponsive  ? 
                                    <div className='block_scroll_data_table'>
                                        <div className='main_scroll_table'> 
                                            <Table
                                                dataSource={this.state.workflowSteps}
                                                columns={columnWorkflowSteps}
                                                pagination={false}
                                                rowKey={r => r.id}
                                            />
                                        </div>
                                    </div>
                                    :
                                     <Table
                                        dataSource={this.state.workflowSteps}
                                        columns={columnWorkflowSteps}
                                        pagination={false}
                                        rowKey={r => r.id}
                                    />
                                }
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        );
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
export default connect(mapStateToProps)(withTranslation()(TaskForm));