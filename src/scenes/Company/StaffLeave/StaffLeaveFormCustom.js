import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Spin, Form, Col, DatePicker, Input, Divider, Button, Calendar } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Dropdown from '~/components/Base/Dropdown';
import { leaveTypes, leaveTypeCustoms, leaveReasons, emptyDate, dateFormat, approvedStatus, 
        timeFormat, roleSupperAdmin, STAFF_LEAVE_UNPAID_LEAVE, STAFF_LEAVE_WEEK_LEAVE, STAFF_LEAVE_OVERTIME_TYPE,
        STAFF_LEAVE_SHIFT_CHANGE_TYPE, STAFF_LEAVE_FORGOT_CHECK_IN_OUT_TYPE, dateTimeFormat, 
        keyPermissinAll} from '~/constants/basic';
import BackButton from '~/components/Base/BackButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { detail as apiDetail, createCustomType as apiCreateCustomType, approve as apiApprove, reject as apiReject, reimburse as apiReimburse } from '~/apis/company/staffLeave';
import { timeFormatStandard, showNotify, checkManager, parseIntegertoTime, timeStartOfDay, timeEndOfDay } from '~/services/helper';
import { getList as apiGetListStaffSchedule } from '~/apis/company/staffSchedule';
import { getList as apiGetListTimesheet } from '~/apis/company/timesheet';
import { detail as apiDetailStaff } from '~/apis/company/staff';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { getShifts } from '~/apis/company/timesheet'

const { RangePicker } = DatePicker;
const FormatDate = 'YYYY-MM-DD';
class StaffLeaveFormCustom extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            staffList: [],
            arrReason: [],
            overtime: false,
            shiftChange: false,
            requiredReason: true,
            leave: null,
            timesheet: null,
            staffSchedule: null,
            shifts: [],

            dateStaffLeave : null,
            staffSchedules: {},
        }
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getArrayShifts();
        let { id } = this.props.match.params;
        this.getDetailStaffLeave(id);
    }

    /**
     * get array shift
     */
     getArrayShifts = async () => {
        let response = await getShifts();
        if (response.status) {
            this.setState({ shifts: response.data })
        }
    }

    /**
     * Get detail Staff Leave
     * @param {*} id 
     */
    async getDetailStaffLeave(id = 0) {
        let response = await apiDetail(id);
        if(response.status) {
            let { data } = response;

            /** Get list staff from api get leave detail */
            // let listOption = [];
            // if(data.staffs && data.staffs.rows)
            //     data.staffs.rows.map(staff => {
            //         listOption.push({id: staff.staff_id, name: staff.staff_name + ' - ' + staff.code})
            //     })
            // this.setState({staffList: listOption})

            /** Set value from api */
            if (id) {
                let leave = data.leave;
                if (typeof leave.leave_from !== 'undefined' && leave.leave_from != emptyDate && leave.leave_from != null) {
                    leave.leave_date = dayjs(leave.leave_from, dateFormat);
                }
                    
                this.setState({leave: leave , dateStaffLeave : dayjs(leave?.leave_from)})
                this.getListStaffSchedule(leave)
                this.getListTimeSheet(leave)
                this.onSelectType(leave.leave_type)
                if(this.state.overtime 
                    && typeof leave.leave_from !== 'undefined' && leave.leave_from != emptyDate && leave.leave_from != null
                    && typeof leave.leave_to !== 'undefined' && leave.leave_to != emptyDate && leave.leave_to != null) {
                    leave['leave_date_from_to'] = [dayjs(leave.leave_from, dateTimeFormat), dayjs(leave.leave_to, dateTimeFormat)]
                }
                if(leave.leave_reason) {
                    leave.leave_reason = String(leave.leave_reason)
                }
                this.formRef.current.setFieldsValue(leave);
            }
        }
    }

    /**
     * Get staff_schedule
     * @param {*} leave 
     */
    async getListStaffSchedule(leave) {
        let params = {
            staff_id: leave.leave_staff_id,
            from_date: timeStartOfDay(leave.leave_from, true),
            to_date: timeEndOfDay(leave.leave_from, true)
        }
        let response = await apiGetListStaffSchedule(params);
        if(response.status){
            let { data } = response;
            if(data.rows.length > 0) {
                this.setState({staffSchedule: data.rows[0]})
            }

            let arrStaffSchedules = response.data.rows;
            let result = {};
            arrStaffSchedules.map(item => {
                if (typeof result[item.staffsche_staff_id] == 'undefined') {
                    result[item.staffsche_staff_id] = {};
                }
                result[parseIntegertoTime(item.staffsche_time_in, 'YYYY-MM-DD')] = item;
            })
          
            this.setState({ staffSchedules: result })
        }
    }

    /**
     * Get timesheet
     * @param {*} leave 
     */
    async getListTimeSheet(leave) {
        let staffCode = null;
        if(leave.leave_staff_id) {
            let responseStaffDetail = await apiDetailStaff(leave.leave_staff_id);
            if(responseStaffDetail.status) {
                let { staff } = responseStaffDetail.data;
                staffCode = staff.code
            }
        }

        let params = {
            staff_code: staffCode,
            from_date: timeFormatStandard(leave.leave_from, dateFormat),
            to_date: timeFormatStandard(leave.leave_from, dateFormat)
        }
        let response = await apiGetListTimesheet(params);
        if(response.status){
            let { data } = response;
            if(data.rows.length > 0) {
                this.setState({timesheet: data.rows[0]})
            }
        }
    }

    /**
     * @event on change select type
     * @param {*} value 
     */
    onSelectType = (value) => {
        this.formRef.current && this.formRef.current.setFieldsValue({ leave_reason: null})
        switch (value) {
            case 'LC': 
                this.sliceLeaveReason( 0, 3 );
                this.resetFieldSelectType();
                break;
            case 'EL': 
                this.sliceLeaveReason( 0, 4 );
                this.resetFieldSelectType();
                break;
            case 'F':
                this.sliceLeaveReason( 6, 9 );
                this.resetFieldSelectType();
                break;
            case 'OT':
                this.sliceLeaveReason( 9, 13 );
                this.setState({ overtime: true , shiftChange: false, requiredReason: true })
                this.formRef.current.setFieldsValue({leave_shift: null})
                break;
            case 'BT':
                this.sliceLeaveReason( 4, 6 );
                this.resetFieldSelectType();
                break;
            case 'L':
                this.sliceLeaveReason( 6, 9 );
                this.resetFieldSelectType();
                break;
            case 'SC':
                this.setState({ arrReason: [], overtime: false, shiftChange: true, requiredReason: false })
                break;
            case 'WFH':
                this.setState({ arrReason: [], overtime: false, requiredReason: false })
                break;
            default: 
                this.resetFieldSelectType();
                break;
        }
    }

    /**
     * Reset state overtime, shiftChange 
     */
    resetFieldSelectType() {
        this.setState({ overtime: false , shiftChange: false, requiredReason: true })
        this.formRef.current.setFieldsValue({leave_shift: null})
    }

    /**
     * Slice leave_reasons object
     * @param {*} start 
     * @param {*} end 
     */
    sliceLeaveReason = ( start, end ) => {
        let arrReasons = [];
        Object.entries(leaveReasons).slice(start,end).map(reason => {
            arrReasons.push({ id:  reason[0], name: reason[1]})
        })
        if(start==9) {
            Object.entries(leaveReasons).slice(18,19).map(reason => {
                arrReasons.push({ id:  reason[0], name: reason[1]})
            })
        }


        this.setState({arrReason: arrReasons})
        return true;
    }

    /**
     * @event submit Form
     */
    submitForm = (values) => {
        this.setState({ loading: true })
        let { t } = this.props;
        let { id } = this.props.match.params;
        let data = {};
        if(values.leave_type !== 'OT'){
            data = {
                leave_from: values.leave_date ? timeFormatStandard(values.leave_date, FormatDate) +  ' 00:00:00' : null,
                leave_to: values.leave_date ? timeFormatStandard(values.leave_date, FormatDate) +  ' 00:00:00' : null,
            };
        } else {
            data = {
                leave_from: typeof values.leave_date_from_to !== undefined && values.leave_date_from_to ? timeFormatStandard(values.leave_date_from_to[0],FormatDate + ' HH:mm:ss') : undefined,
                leave_to: typeof values.leave_date_from_to !== undefined && values.leave_date_from_to ? timeFormatStandard(values.leave_date_from_to[1],FormatDate + ' HH:mm:ss') : undefined
            };
            delete values.leave_date_from_to;
        }
        values.leave_reason = values.leave_reason ? values.leave_reason : 0;
        data = { ...values, ...data };
        let xhr;
        let message;

        if (id) {
            xhr = apiCreateCustomType(id, data);
            message = t('Leave updated!');
        } else {
            xhr = apiCreateCustomType(data);
            message = t('Leave created!');
        }
        xhr.then((response) => {
            this.setState({ loading: false })
            if (response.status != 0) {
                showNotify(t('Notification'), message);
                if(!id)
                    this.props.history.push("/company/staff-leave")
            } else {
                showNotify(t('Notification'), response.message, 'error');
            }
        });
    }

    /**
     * Check staff_leave yourself
     */
    checkYourself = () => {
        let { t, checkPermission } = this.props;
        let { staff_info, profile } = this.props.auth;
        let leave_staff_id = this.formRef.current.getFieldValue('leave_staff_id');
        if(leave_staff_id != undefined && leave_staff_id == staff_info.staff_id 
            && (profile.role_id == roleSupperAdmin || ![1,8].includes(staff_info.position_id) || checkPermission('company-staff-leave-list'))) {
            showNotify('Warning', t('Can not approve or reject leave application for yourself!'), 'warning');
            return true;
        }
        return false
    }


    /**
     * @event handle click btn approved
     */
    async onHandleApprovedReimburseReject(type) {
        const { staff_info } = this.props.auth;
        this.setState({ loading: true })
        if(!checkManager(staff_info.position_id) && this.checkYourself()) {
            return false;
        }

        let { shifts } = this.state;
        let { t } = this.props;
        let { id } = this.props.match.params;
        let values = this.formRef.current.getFieldsValue();
        let data = {};
        if(values.leave_type == 'OT' || values.leave_type == 'SC'){
            if(values.leave_shift ){
                if(shifts[values.leave_shift]){
                    let workingTime = shifts[values.leave_shift].split("-");
                    data = {
                        leave_from: values.leave_date ? timeFormatStandard(values.leave_date, FormatDate) + ' ' + workingTime[0] : null,
                        leave_to: values.leave_date ? timeFormatStandard(values.leave_date, FormatDate) + ' ' + workingTime[1] : null
                    };
                } else 
                    data = {
                        leave_from: values.leave_date ? timeFormatStandard(values.leave_date, FormatDate) + ' 00:00:00' : null,
                        leave_to: values.leave_date ? timeFormatStandard(values.leave_date, FormatDate) + ' 00:00:00' : null
                    };
            } else {
                data = {
                    leave_from: typeof values.leave_date_from_to !== undefined && values.leave_date_from_to ? timeFormatStandard(values.leave_date_from_to[0],FormatDate + ' HH:mm:ss') : undefined,
                    leave_to: typeof values.leave_date_from_to !== undefined && values.leave_date_from_to ? timeFormatStandard(values.leave_date_from_to[1],FormatDate + ' HH:mm:ss') : undefined
                };
                delete values.leave_date_from_to;
            }
        } else {
            data = {
                leave_from: values.leave_date ? timeFormatStandard(values.leave_date, FormatDate) +  ' 00:00:00' : null,
                leave_to: values.leave_date ? timeFormatStandard(values.leave_date, FormatDate) +  ' 00:00:00' : null
            };
        }

        if(values.leave_type == 'WFH') {
            data.leave_reason = 0;
        }

        data = { ...values, ...data };
        let response;

        switch (type){
            case 'approved':
                data = { ...data, ...{ leave_is_valid: 1 }}
                response = await apiApprove(id, data);
                break;
            case 'reject': 
                response = await apiReject(id, data);
                break;
            default:
        }
        
        if(response.status) {
            this.setState({ loading: false })
            showNotify(t('Notification'), t('Staff Leave Approved '));
            this.props.history.push("/company/staff-leave")
        } else 
            showNotify(t('Notification'), response.message, 'error');
    }
    /*calenda */
    dateCellRender(value) {
        let { staffSchedules, shifts } = this.state;
        let { baseData: { locations } } = this.props;
        let date = timeFormatStandard(value, dateFormat)
      
        
        if (typeof staffSchedules[date] != 'undefined') {
            let locFound = locations.find(l => l.id == staffSchedules[date]['staffsche_location_id']);
            
            return <div style={{ textAlign: 'center', lineHeight: 1.2 }} onClick={() => this.props.history.push(`/company/staff-schedule/${staffSchedules[date]['staffsche_id']}/edit`)}>
                <strong>{staffSchedules[date]['staffsche_shift']}</strong>
                {!['W', 'A', 'H', 'C', 'S', 'R'].includes(staffSchedules[date]['staffsche_shift']) ?
                    <div><small>({shifts[staffSchedules[date]['staffsche_shift']]})</small></div>
                    : ''}
                <div><small>{locFound?.name || ''}</small></div>
            </div>
        }
       
    }
    render() {        
        let { t, match, checkPermission } = this.props;
        let { profile, staff_info } = this.props.auth;
        let { id } = match.params;
        let { shifts } = this.state;
        let { staffList, overtime, shiftChange, timesheet, staffSchedule, leave, arrReason, requiredReason } = this.state;
        let arrShifts = { ...shifts, ...leaveTypes }
        Object.keys(arrShifts).map(i => arrShifts[i] = i + ' ( ' + arrShifts[i] + ' ) ');

        let today = dayjs().date();
        let from = null;
        let isShow = false;
        if(today <= 5 || profile.role_id == roleSupperAdmin || checkPermission('company-staff-leave-list') || checkPermission(keyPermissinAll)) {
            from = dayjs().subtract(1, 'month').set('date', 1).set('hour', 0).set('minute', 0).set('second',' 0');
        } else {
            from = dayjs().set('date', 1).set('hour', 0).set('minute', 0).set('second',' 0')
        }

        if(leave) {
            isShow = from.unix() <= dayjs(leave.leave_from).unix() ? true : false;
            isShow = true;
        }

        let disabled = false;
        let messageWarning = '';
        
        if(!staffSchedule) {
            disabled = true;
            messageWarning = t('* Staff does not has schedule for this day. Please update schedule before approve!')
        }

        // if(leave && leave.leave_type && leave.leave_type == STAFF_LEAVE_FORGOT_CHECK_IN_OUT_TYPE && leave.leave_reason == 7 && profile.role_id != roleSupperAdmin
        //     && !checkPermission('company-staff-leave-list'))
        //     disabled = true;

        let arrSchedule = {...leaveTypes, ...shifts}

        // Case No schedule, leave type == 'SC' and has shift
        const isNoScheduleHasShift = (
            !staffSchedule 
            && leave 
            && leave.leave_type == STAFF_LEAVE_SHIFT_CHANGE_TYPE 
            && leave.leave_shift
            && (dayjs().startOf('day') >= this.state.dateStaffLeave.startOf('day')));

        let valueForms = this.formRef.current?.getFieldsValue();
        return(
            <div id='page_edit_staff_leave'>
                <PageHeader 
                    title={t('application_form')}
                />
                <Row>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                        <div className='card mr-1 pl-3 pr-3'>
                            <Spin spinning={this.state.loading}>
                                <Form ref={this.formRef}
                                    name="staff-leave-form"
                                    className="ant-advanced-search-form pt-3"
                                    layout="vertical"
                                    onFinish={this.submitForm.bind(this)}
                                >
                                    <Row gutter={24}>
                                        <Col span={24}>
                                            <Form.Item label={t('staff')} name='leave_staff_id'>
                                                {/* <Dropdown datas={staffList} defaultOption={'-- All Staffs --'} /> */}
                                                <StaffDropdown defaultOption={t("hr:all_staff")} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={24}>
                                        <Col span={12} hidden={overtime}>
                                            <Form.Item label={t('date')} name='leave_date'
                                                hasFeedback 
                                                rules={[{required: !overtime, message: t('hr:date') }]}>
                                                <DatePicker style={{width: '100%'}} onChange={date=> this.setState({dateStaffLeave : date})}/>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12} hidden={!overtime}>
                                            <Form.Item label={t('date')} name='leave_date_from_to'
                                                hasFeedback 
                                                rules={[{required: overtime, message: t('hr:select_date') }]}>
                                                <RangePicker 
                                                    showTime={{ format: 'HH:mm' }}
                                                    format="YYYY-MM-DD HH:mm"
                                                    style={{ width: '100%' }}
                                                    onChange={(date) => {
                                                        if (date?.length) {
                                                            const newDate0 = dayjs.utc(date[0])
                                                            const newDate1 = dayjs.utc(date[1])
                                                            const oldDate0 = dayjs.utc(date[0])
                                                            const oldDate1 = dayjs.utc(date[1])
                                                            if (overtime && (newDate0.add(24, 'hours') < newDate1)) {
                                                                this.formRef.current.setFieldsValue({ leave_date_from_to: null })
                                                                showNotify('Thông báo', 'Yêu cầu chọn thời gian không quá 24 giờ !', 'error')
                                                            } 
                                                            else {
                                                                this.setState({ dateStaffLeave: oldDate0 })
                                                            }
                                                        }
                                                    }}
                                                    />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={24}>
                                        <Col span={24}>
                                            <Form.Item label={t('type')} 
                                                name='leave_type' 
                                                hasFeedback 
                                                rules={[{required: true, message:  t('hr:please_choose_type')}]}>
                                                <Dropdown datas={leaveTypeCustoms} 
                                                    onChange={ (e) => this.onSelectType(e)}
                                                    defaultOption={t("hr:all_type")} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    {id ?
                                        <Row gutter={24}>
                                            <Col span={24}>
                                                <Form.Item label={t('status')}
                                                    name='leave_approved'>
                                                    <Dropdown datas={approvedStatus} disabled/>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    : []}
                                    <Row gutter={24}>
                                        <Col span={24} hidden={!shiftChange}>
                                            <Form.Item label={t('shift')}
                                                name='leave_shift'
                                                hasFeedback 
                                                rules={[{required: shiftChange, message: t('hr:select_date') }]}>
                                                <Dropdown datas={arrShifts} defaultOption={t("hr:all_shitfs")} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={24}>
                                        <Col span={24}>
                                            <Form.Item label={t('reason')}
                                                name='leave_reason'
                                                hasFeedback
                                                rules={[{ required: requiredReason, message:t('hr:select_reason') }]}
                                            >
                                                <Dropdown takeZero={false} datas={arrReason} defaultOption={t("hr:reason")} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={24}>
                                        <Col span={24}>
                                            <Form.Item label={t('note')} name='leave_note'>
                                                <Input.TextArea rows={4} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    { id ? 
                                        <Row gutter={24}>
                                            <Col span={24}>
                                                <Form.Item label={t('verify')} name='leave_is_valid'>
                                                    <Dropdown datas={{ 0: 'In-valid', 1: 'Valid' }} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    : []}

                                    <Divider className="m-0 mb-2" />
                                    { disabled && leave ? <p className='p-3 text-danger'> {messageWarning} </p> : []}
                                    <Row gutter={24} className="pb-3">
                                        <Col span={12} key='bnt-submit' >
                                        { !leave ? 
                                            <Button type="primary" icon={<FontAwesomeIcon icon={faSave} />} htmlType="submit" >
                                                &nbsp;{t('save')}
                                            </Button>    
                                        :
                                        <>
                                            { checkManager(staff_info.position_id) || checkPermission('hr-staff-leave-approve') ? 
                                                <>
                                                    { isShow && !disabled ?
                                                        <Button 
                                                            disabled={disabled}
                                                            onClick={() => this.onHandleApprovedReimburseReject('approved')}
                                                            type="primary" 
                                                            icon={<CheckOutlined />} 
                                                            className='mr-3'
                                                        >
                                                            &nbsp;{t('approve')}
                                                        </Button>
                                                    : []}
                                                    { isShow && isNoScheduleHasShift  ?
                                                        <Button
                                                            onClick={() => this.onHandleApprovedReimburseReject('approved')}
                                                            type="primary"
                                                            icon={<CheckOutlined />}
                                                            className='mr-3'
                                                        >
                                                            &nbsp;{t('Create Schedule And Approved')}
                                                        </Button>
                                                     : '' }

                                                    {leave && leave.leave_approved != 2 ? 
                                                        <Button icon={<CloseOutlined />} 
                                                            onClick={() => this.onHandleApprovedReimburseReject('reject')}
                                                            type="primary" 
                                                            danger 
                                                            className='mr-3'>
                                                            &nbsp;{t('reject')}
                                                        </Button>
                                                    : []}
                                                </>
                                            : []}
                                        </>
                                        }
                                        </Col>
                                        <Col xs={24} sm={24} md={24} lg={12} xl={12} key='btn-back' style={{ textAlign: "right" }}>
                                            <BackButton url={`/company/staff-leave`} />
                                        </Col>
                                    </Row>
                                </Form>
                            </Spin>
                        </div>
                    </Col>
                    { id ? <Col span={12}>
                        <div className='card ml-3 pl-3 pr-3 pb-3'>
                            <h3 className='pt-3 title_block'>{t('information')}</h3>
                            <Divider />
                            <div>
                                <Row>
                                    <Col span={6}><strong>{t('date')}:</strong></Col>
                                    <Col span={18}>{leave && leave.leave_from ? timeFormatStandard(leave.leave_from, dateFormat) : 'N/A'}</Col>
                                </Row>
                                <Row>
                                    <Col span={6}><strong>{t('schedule')}</strong></Col>
                                    <Col span={18}>{staffSchedule ?
                                        staffSchedule.staffsche_shift + ' ( ' + arrSchedule[staffSchedule.staffsche_shift] + ' ) ' : 'N/A'}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}><strong>{t('check_in')}:</strong></Col>
                                    <Col span={18}>{timesheet ? timeFormatStandard(timesheet.check_in, timeFormat, true) : 'N/A'}</Col>
                                </Row>
                                <Row>
                                    <Col span={6}><strong>{t('check_out')}:</strong></Col>
                                    <Col span={18}>{timesheet ? timeFormatStandard(timesheet.check_out, timeFormat, true) : 'N/A'}</Col>
                                </Row>
                                <Row>
                                    <Col span={6}><strong>{t('hr:created')}:</strong></Col>
                                    <Col span={18}>{leave && leave.created_at}</Col>
                                </Row>
                                <Row>
                                    <Col span={8}><strong>{t('remaining_off')}:</strong></Col>
                                    <Col span={12}>{leave?.annual_remaining}</Col>
                                </Row>
                            </div>
                        </div>
                        <div className='card mt-3 ml-3 pl-3 pr-3 pb-3'>
                            <Spin spinning={this.state.loading}>
                                    <Calendar
                                        fullscreen={true}
                                        dateCellRender={value => this.dateCellRender(value)}
                                        //value={timeFormatStandard(valueForms?.leave_date)}
                                        value={valueForms?.leave_date}
                                    /> 
                                    
                                </Spin>
                        </div>
                    </Col>
                    : [] }
                </Row>
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
export default connect(mapStateToProps)(withTranslation()(StaffLeaveFormCustom));