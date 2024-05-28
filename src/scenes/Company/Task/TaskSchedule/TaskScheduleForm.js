import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Row, Col, Form, Input, Modal, InputNumber, Radio, Checkbox, Collapse, TimePicker, Tooltip } from 'antd';
import { update as apiUpdate  , create as apiCreate} from '~/apis/company/task/taskSchedule'
import { showNotify, isShowDropdownSuggestTask } from '~/services/helper';
import dayjs from 'dayjs';
// import TaskStaffDropdown from '~/components/Project/StaffDropdown';
import Dropdown from '~/components/Base/Dropdown';
// import MdEditorTask from '~/components/MdEditor/MdEditorTask';
import ProjectDropDown from '~/components/Company/Project/ProjectDropDown';
import { taskRequireOptions, TYPE_PROJECT_TASK_INPUT } from '~/constants/basic'
import { SEQUENCES_MONTHLY, SEQUENCES_WEEKLY, optionsSequences, getMonthOptions, getDateOptions, getDayOptions, getValuesFromArrayObj } from './config/TaskScheduleConfig';
import StaffDropdown from '~/components/Base/StaffDropdown';
import TextArea from 'antd/lib/input/TextArea';
import StaffDropdownConfig from '../../Staff/config/StaffDropdownConfig';
// import { MdEditorFile } from '~/components/MdEditor/MdEditorFile';
import MdEditor from '~/components/MdEditor/MdEditor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { scheduleStatus, screenResponsive } from '~/constants/basic';
import SkillDropdown from '~/components/Base/SkillDropdown';
const { Panel } = Collapse;

const monthOptions = getMonthOptions();
const allValueMonthOptions = getValuesFromArrayObj(monthOptions);
const dayOptions = getDayOptions();
const allValueDayOptions = getValuesFromArrayObj(dayOptions);
const dateOptions = getDateOptions(); // date in week
const allValueDateOptions = getValuesFromArrayObj(dateOptions);

let mdEditorRef;

class TaskScheduleForm extends Component {
    /**
     *
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.editorNoteRef = React.createRef();
        this.state = {
            content: null,
            loading: false,
            multipleStaffMode: false,
            sequences: null,
            time: dayjs('08:00:00', 'HH:mm:ss'),
            checkAllMonth: true,
            monthList: allValueMonthOptions,
            checkAllDayInMonth: true,
            dayInMonthList: allValueDayOptions,
            checkAllDateInWeek: true,
            dateInWeekList: allValueDateOptions , 

            require_virtual_configs: true,
            require_media : 0
        }
        this.onSequencesSelected = this.onSequencesSelected.bind(this);
        this.onCheckAllMonth = this.onCheckAllMonth.bind(this);
        this.onMonthSelected = this.onMonthSelected.bind(this);
        this.onCheckAllDayInMonth = this.onCheckAllDayInMonth.bind(this);
    }

    componentDidMount() {
        let { dataTask } = this.props;
        if(dataTask?.id){
            if (!Object.keys(dataTask.data).includes('assign_staff') || !(dataTask.data.assign_staff).length) {
                this.props.dataTask.data.assign_staff = []
            }
            if (typeof dataTask.data.assign_staff != 'undefined' && !Array.isArray(dataTask.data.assign_staff)) {
                dataTask.data.assign_staff = dataTask.data.assign_staff.split(',')
            }
            this.formRef.current.setFieldsValue(
                {...dataTask.data , 
                    major_approve_ids : dataTask?.major_approve_ids ,
                    staff_approve: dataTask?.staff_approve,
                    code : dataTask?.code , 
                    status : dataTask?.status,
                    time_deadline : dataTask?.time_deadline ?  dayjs(dataTask?.time_deadline, 'HH:mm:ss') : null , 
                    skill_id : dataTask?.data.skill_id ,
                    report_to : dataTask?.data.report_to,
                    // position_ids : dataTask?.data.position_ids
                }
                );
            this.setState({
                multipleStaffMode: (!dataTask.data && !dataTask.data['workflow_id']) ? null : 'multiple',
                sequences: dataTask.sequences,
                time: dayjs(dataTask.time, 'HH:mm:ss'),
                checkAllMonth: dataTask.sequences == SEQUENCES_MONTHLY ? false : true,
                monthList: (dataTask.sequences == SEQUENCES_MONTHLY && Array.isArray(dataTask.month)) ? dataTask.month.map(i => parseInt(i)) : allValueMonthOptions,
                checkAllDayInMonth: dataTask.sequences == SEQUENCES_MONTHLY ? false : true,
                dayInMonthList: (dataTask.sequences == SEQUENCES_MONTHLY && Array.isArray(dataTask.day)) ? dataTask.day.map(i => parseInt(i)) : allValueDayOptions,
                checkAllDateInWeek: dataTask.sequences == SEQUENCES_WEEKLY ? false : true,
                dateInWeekList: (dataTask.sequences == SEQUENCES_WEEKLY && Array.isArray(dataTask.date)) ? dataTask.date.map(i => parseInt(i)) : allValueDateOptions,
                content: dataTask.data?.note || ''
            });
            if (dataTask.data && dataTask.data.require_media) {
                this.setState({ require_virtual_configs: false, require_media: dataTask.data.require_media });
            }
        }else{
            this.formRef.current.resetFields();
            this.setState({
                content: null,
                loading: false,
                multipleStaffMode: 'multiple',
                sequences: null,
                time: dayjs('08:00:00', 'HH:mm:ss'),
                checkAllMonth: true,
                monthList: allValueMonthOptions,
                checkAllDayInMonth: true,
                dayInMonthList: allValueDayOptions,
                checkAllDateInWeek: true,
                dateInWeekList: allValueDateOptions,
                require_virtual_configs: true,
                require_media: 0
            })
        }
    }
    /**
     * @event before submit form
     * Validate before submit
     */
    handleFormSubmit() {
        let { sequences, monthList, dayInMonthList, dateInWeekList, time } = this.state;
        this.formRef.current.validateFields()
            .then((values) => {
                let dataSubmit = {
                    status: values.status ,
                    sequences,
                    date: sequences == SEQUENCES_WEEKLY ? dateInWeekList : [],
                    month: sequences == SEQUENCES_MONTHLY ? monthList : [],
                    day: sequences == SEQUENCES_MONTHLY ? dayInMonthList : [],
                    time: dayjs(time).format("HH:mm:ss"),
                    data: {
                        deadline_cal_num: values?.deadline_cal_num,
                        name: values?.name,
                        note: mdEditorRef.getContent(),
                        planned_hours: values?.planned_hours,
                        reality_hours: values?.reality_hours,
                        assign_staff: values?.assign_staff,
                        major_ids: values?.major_ids,
                        sub_type: values?.sub_type,
                        prid: typeof values.prid != 'undefined' ? values.prid : null ,
                        dept_ids :values?.dept_ids,
                        locations_ids : values?.locations_ids ,
                        isExcluded : values?.isExcluded,
                        skill_id : values?.skill_id || 0 ,
                        report_to : values?.report_to ,
                        position_ids : values?.position_ids
                    },
                    major_approve_ids : values?.major_approve_ids ,
                    staff_approve : values?.staff_approve ,
                    code : values?.code  ,
                    time_deadline : values?.time_deadline ? dayjs(values?.time_deadline).format('HH:mm:ss') : null
                }
                if (this.state.require_virtual_configs) {
                    dataSubmit = {
                        ...dataSubmit ,
                        data : {
                            ...dataSubmit.data,
                            require_virtual_configs : this.state.require_virtual_configs
                        }
                    }
                } else {
                    if (this.state.require_media) {
                        dataSubmit = {
                            ...dataSubmit ,
                            data : {
                                ...dataSubmit.data,
                                require_media : this.state.require_media
                            }
                        }
                    }
                }
                this.submitForm(dataSubmit);
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }

    /**
     * @event sequences seleted
     */
    onSequencesSelected(e) {
        let sequences = e.target.value;
        this.setState({ sequences });
    }

    /**
     * Show sequences
     * @returns 
     */
    showSequences() {
        let { sequences } = this.state;
        if (!sequences) {
            return;
        }
        switch (sequences) {
            case SEQUENCES_MONTHLY:
                return this.renderSequencesMonthly();
            case SEQUENCES_WEEKLY:
                return this.renderSequencesWeekly();
            default: // SEQUENCES_DAILY
                return this.renderTime();
        }
    }

    /**
     * Event check all month
     * 
     * @param {Object} e 
     */
    onCheckAllMonth(e) {
        let checkAllMonth = e.target.checked;
        let monthList = checkAllMonth ? allValueMonthOptions : [];
        this.setState({ monthList, checkAllMonth });
    }

    /**
     * Event check single month
     * @param {*} e 
     */
    onMonthSelected(e, monthObj) {
        let monthList = this.state.monthList.slice();
        let checked = e.target.checked;
        if (checked) {
            monthList.push(monthObj.value)
        } else {
            monthList = monthList.filter(e => e != monthObj.value);
        }
        this.setState({ checkAllMonth: false, monthList });
    }

    /**
     * Event check all day in month
     * 
     * @param {Object} e 
     */
    onCheckAllDayInMonth(e) {
        let checkAllDayInMonth = e.target.checked;
        let dayInMonthList = checkAllDayInMonth ? allValueDayOptions : [];
        this.setState({ dayInMonthList, checkAllDayInMonth });
    }

    /**
     * Event check single day in month
     * @param {*} e 
     */
    onDayInMonthSeleted(e, dayObj) {
        let dayInMonthList = this.state.dayInMonthList.slice();
        let checked = e.target.checked;
        if (checked) {
            dayInMonthList.push(dayObj.value)
        } else {
            dayInMonthList = dayInMonthList.filter(e => e != dayObj.value);
        }
        this.setState({ checkAllDayInMonth: false, dayInMonthList });
    }

    /**
     * Event check all day in month
     * 
     * @param {Object} e 
     */
    onCheckAllDateInWeek(e) {
        let checkAllDateInWeek = e.target.checked;
        let dateInWeekList = checkAllDateInWeek ? allValueDateOptions : [];
        this.setState({ dateInWeekList, checkAllDateInWeek });
    }

    /**
     * Event check single date in week
     * @param {*} e 
     */
    onDateInWeekSeleted(e, dateObj) {
        let dateInWeekList = this.state.dateInWeekList.slice();
        let checked = e.target.checked;
        if (checked) {
            dateInWeekList.push(dateObj.value)
        } else {
            dateInWeekList = dateInWeekList.filter(e => e != dateObj.value);
        }
        this.setState({ checkAllDateInWeek: false, dateInWeekList });
    }

    /**
     * 
     * @returns 
     */
    renderSequencesMonthly() {
        let { monthList, checkAllMonth, dayInMonthList, checkAllDayInMonth } = this.state;

        return (<>
            {/* Months */}
            <Collapse expandIcon={() => <></>} style={{ marginBottom: 3 }} collapsible='disabled' defaultActiveKey='month' key={'schedule-month'}>
                <Panel header={
                    <Row style={{ cursor: 'auto' }} >
                        <Checkbox onChange={(e) => this.onCheckAllMonth(e, monthOptions)} checked={checkAllMonth}>
                            <strong>Tất cả các tháng</strong>
                        </Checkbox>
                    </Row>
                } key="month" >
                    <Row>
                        {monthOptions.map((monthObj, monIndex) => {
                            return (
                                <Col span={4} key={`month-${monIndex}`}>
                                    <Checkbox onChange={(e) => this.onMonthSelected(e, monthObj)} checked={monthList.includes(monthObj.value)}>
                                        {monthObj.label}
                                    </Checkbox>
                                </Col>
                            );
                        })}
                    </Row>
                </Panel>
            </Collapse>
            {/* Days */}
            <Collapse expandIcon={() => <></>} style={{ marginBottom: 3 }} collapsible='disabled' defaultActiveKey='day' key={'schedule-day'}>
                <Panel header={
                    <Row style={{ cursor: 'auto' }}>
                        <Checkbox onChange={(e) => this.onCheckAllDayInMonth(e, dayOptions)} checked={checkAllDayInMonth}>
                            <strong>Tất cả ngày trong tháng</strong>
                        </Checkbox>
                    </Row>
                } key="day" >
                    <Row>
                        {dayOptions.map((dayObj, dayIndex) => {
                            return (
                                <Col span={4} key={`day-${dayIndex}`}>
                                    <Checkbox onChange={(e) => this.onDayInMonthSeleted(e, dayObj)} checked={dayInMonthList.includes(dayObj.value)}>
                                        {dayObj.label}
                                    </Checkbox>
                                </Col>
                            );
                        })}
                    </Row>
                </Panel>
            </Collapse>
            {this.renderTime()}
        </>)
    }

    /**
     * 
     * @returns 
     */
    renderSequencesWeekly() {
        let { checkAllDateInWeek, dateInWeekList } = this.state;

        return (<>
            <Collapse expandIcon={() => <></>} style={{ marginBottom: 3 }} collapsible='disabled' defaultActiveKey='week' key={'schedule-week'}>
                <Panel header={
                    <Row>
                        <Checkbox onChange={(e) => this.onCheckAllDateInWeek(e, dateOptions)} checked={checkAllDateInWeek}>
                            <strong>Tất cả ngày trong tuần</strong>
                        </Checkbox>
                    </Row>
                } key="week" >
                    <Row style={{ cursor: 'auto' }}>
                        {dateOptions.map((dateObj, dateIndex) => {
                            return (
                                <Col span={2} key={`date-${dateIndex}`}>
                                    <Checkbox onChange={(e) => this.onDateInWeekSeleted(e, dateObj)} checked={dateInWeekList.includes(dateObj.value)}>
                                        {dateObj.label}
                                    </Checkbox>
                                </Col>
                            );
                        })}
                    </Row>
                </Panel>
            </Collapse>
            {this.renderTime()}
        </>)
    }

    /**
     * Render time to excute job schedule
     * @returns 
     */
    renderTime() {
        let { time } = this.state;
        return (<Row style={{ paddingTop: 10 }}>
            <Col span={4}>
                <strong>Giờ tạo task:</strong>
                <TimePicker value={time} style={{ marginLeft: 8 }} size="small"
                    onChange={time => this.setState({ time: time })}
                />
            </Col>
            <Col span={4}>
                <strong>Time Deadline:</strong>
                <Form.Item name='time_deadline'>
                    <TimePicker size="small" />
                </Form.Item>
            </Col>
        </Row>);
    }
    /**
     * handle submit form
     */
    async submitForm(values) {
        let { dataTask } = this.props
        let response;
        let message = '';
        if(dataTask?.id){
            response = await apiUpdate(dataTask['id'], values);
            message = 'Đã cập nhật thành công!';
            if (response.status == 1) {
                showNotify('Notification', message);
                this.props.hidePopup();
                this.props.getListTask();
            }else{
                showNotify('Notification' , response.message , 'error')
            }
        }else{
            values = { 
                ...values,
                type : 1 ,
                task_id : 0
            }
            response = await apiCreate(values);
            message = 'Đã tạo thành công!';
            if (response.status == 1) {
                showNotify('Notification', message);
                this.props.hidePopup();
                this.props.getListTask();
            }else{
                showNotify('Notification' , response.message , 'error')
            }
        }
       
    }

    render() {
        const {t} = this.props.translang
        let { sequences, multipleStaffMode } = this.state;
        let { dataTask, baseData: { majors , locations, departments , positions}, auth: { staff_info } } = this.props;
        let title = dataTask?.id ? t('hr:update_task_schedule') : t('hr:create_task_schedule');
        return (
            <Modal open={this.props.visible}
                title={title}
                forceRender
                width={window.innerWidth < screenResponsive  ? '100%' :'60%'}
                onCancel={() => this.props.hidePopup()}
                onOk={this.handleFormSubmit.bind(this)}
                wrapClassName='task_schedule'
                afterClose={() => this.props.resetData()}
                >
                {
                    dataTask ?
                        <Form
                            preserve={false}
                            ref={this.formRef}
                            layout='vertical'
                        >
                            <Row gutter={24} className='p-2'>
                                <Col span={24}>
                                    <Row gutter={24} >
                                        <Col xs={24} sm={24} md={24} lg={6} xl={6}  className="mb-2">
                                            <Form.Item label={<strong className='title_lieu_finish'>{t('task_code')}</strong>} name='code'>
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={24} md={24} lg={18} xl={18}  className="mb-2">
                                            <Form.Item label={<strong className='title_lieu_finish'>{t('task_name')}</strong>} name='name'>
                                                <Input />
                                            </Form.Item>
                                        </Col>

                                    </Row>
                                </Col>
                                <Col span={24} className='mb-2'>
                                    <Checkbox onChange={e => this.setState({ require_virtual_configs: !e.target.checked })} checked={!this.state.require_virtual_configs} >
                                        Tùy chọn kết quả công việc
                                    </Checkbox>
                                    {
                                        !this.state.require_virtual_configs ?
                                            (<Row gutter={12} style={{ marginLeft: '0.25rem' }}>
                                                <Form.Item>
                                                    <Radio.Group options={taskRequireOptions} value={this.state.require_media}
                                                        onChange={e => {
                                                            let require_media = e.target.value;
                                                            this.setState({ require_media });
                                                        }} />
                                                </Form.Item>
                                            </Row>)
                                            : ''
                                    }
                                </Col>
                                <Col span={24} className="mb-2">
                                    <strong className='title_lieu_finish'>{t('hr:sequence')}</strong>
                                    <div style={{ paddingBottom: 3 }}>
                                        <Radio.Group options={optionsSequences} value={sequences} style={{ marginLeft: 10 }}
                                            onChange={this.onSequencesSelected} />
                                        {sequences ? this.showSequences() : null}
                                    </div>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={5} xl={5} >
                                    <Form.Item name={'status'} label={<strong className='title_lieu_finish'>{t('status:')}</strong>}>
                                        <Dropdown datas={scheduleStatus} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={3} xl={3} >
                                    <Form.Item name='planned_hours'
                                     label={<strong className='title_lieu_finish'>{t('hr:planned_hours')}</strong>}
                                     hasFeedback rules={[{ required: true, message: t("hr:please_input ")+ t('time') },]}
                                     >
                                        <InputNumber disabled={dataTask.data?.type == TYPE_PROJECT_TASK_INPUT} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={6} xl={6} >
                                    <Form.Item name="sub_type" label={<strong className='title_lieu_finish'>{t('hr:team_work')}</strong>} initialValue={0} tooltip={'Làm việc nhóm: tất cả thành viên sẽ làm chung 1 task. Mỗi thành viên: hệ thống sẽ giao cho mỗi thành viên là 1 task riêng'}>
                                        <Dropdown datas={{ 0: t("hr:team_work"), 1: t("hr:every_member") }} takeZero />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={5} xl={5} >
                                    <Form.Item name="prid" label={<strong className='title_lieu_finish'>{t('hr:work_group')}</strong>}>
                                        <ProjectDropDown defaultOption={t('hr:work_group')} />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                    <Form.Item name='deadline_cal_num' label={<strong className='title_lieu_finish'>{t('hr:num_of_day_late')}</strong>}>
                                        <InputNumber defaultValue={0} min={0} max={10} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name='note' label={<strong className='title_lieu_finish'>{t('note')}</strong>}>
                                        {/* <TextArea /> */}
                                        <MdEditor
                                            onRef={ref => mdEditorRef = ref}
                                            className="mentions_sub"
                                            placeholder='Mô tả'
                                            value={this.state.content}
                                            onChangeUpload={() => { }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name='assign_staff' label={<strong className='title_lieu_finish'>{t('assign_to')}</strong>}>
                                        <StaffDropdownConfig defaultOption='Giao cho' mode={multipleStaffMode} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name='report_to' label={<strong className='title_lieu_finish'>{'CC:'}</strong>}>
                                        <StaffDropdownConfig defaultOption='CC' mode={multipleStaffMode} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                <Form.Item name='skill_id' label={<strong className='title_lieu_finish'>{t('skill:')}</strong>}>
                                        <SkillDropdown defaultOption={t('skill:')}/>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                                    <Form.Item name="dept_ids" label={<strong className='title_lieu_finish'>{t('hr:assign_staff_by_department ')}</strong>}
                                        tooltip={'Vui lòng không chọn Nhân viên khi giao theo Department!'}>
                                        <Dropdown datas={departments} takeZero mode={'multiple'} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                    <Form.Item name="major_ids" label={<strong className='title_lieu_finish'>{t('hr:assign_staff_by_major')}</strong>}
                                        tooltip={'Vui lòng không chọn Nhân viên khi giao theo Major!'}>
                                        <Dropdown datas={majors} takeZero mode={'multiple'} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                    <Form.Item name="position_ids" label={<strong className='title_lieu_finish'>{t('hr:assign_staff_by_position')}</strong>}
                                        tooltip={'Vui lòng không chọn Nhân viên khi giao theo Position!'}>
                                        <Dropdown datas={positions} takeZero mode={'multiple'} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <div className='d-flex'>
                                        <strong className='title_lieu_finish' style={{marginTop:5}}>
                                            {t('hr:assign_staff_by_location')}
                                            <Tooltip title={t('hr:donot_assign_by_location')} >
                                                {/* <FontAwesomeIcon className='cursor-pointer' icon={faQuestionCircle} />  */}
                                                <QuestionCircleOutlined className='ml-2' />
                                            </Tooltip>
                                        </strong>
                                        <Form.Item className='ml-2' valuePropName="checked" name={'isExcluded'}>
                                            <Checkbox > {t('hr:exclude_selected_branch')} </Checkbox>
                                        </Form.Item>
                                    </div>
                                    <Form.Item name="locations_ids">
                                        <Dropdown datas={locations} takeZero mode={'multiple'} />
                                    </Form.Item>

                                </Col>
                                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                    <Form.Item name="major_approve_ids" label={<strong className='title_lieu_finish'>{t('hr:task_approve_according_major')}</strong>}>
                                        <Dropdown datas={majors} takeZero mode={'multiple'} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                    <Form.Item name="staff_approve" label={<strong>{t('hr:task_approver')}</strong>}>
                                        <StaffDropdownConfig defaultOption={t('hr:assign_to')}/>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                        : []
                }
            </Modal>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        baseData: state.baseData,
        auth: state.auth.info,
    };
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(TaskScheduleForm);

