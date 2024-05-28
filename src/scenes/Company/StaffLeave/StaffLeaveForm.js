import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Spin, Form, Col, DatePicker, Input, Divider, Button, Calendar } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Dropdown from '~/components/Base/Dropdown';
import { shiftMains, leaveTypes, leaveReasons, emptyDate, approvedStatus, timeFormat, dateFormat, roleSupperAdmin, dateTimeFormat, keyPermissinAll } from '~/constants/basic';
import BackButton from '~/components/Base/BackButton';
import { detail as apiDetail, create as apiCreate, approve as apiApprove, reject as apiReject, reimburse as apiReimburse } from '~/apis/company/staffLeave';
import { timeFormatStandard, showNotify, checkManager, parseIntegertoTime } from '~/services/helper';
import dayjs from 'dayjs';
import { CheckOutlined , UndoOutlined, CloseOutlined } from '@ant-design/icons';
import { getList as apiGetListStaffSchedule } from '~/apis/company/staffSchedule';
import { getList as apiGetListTimesheet } from '~/apis/company/timesheet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { detail as apiDetailStaff } from '~/apis/company/staff';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { getShifts } from '~/apis/company/timesheet';

import {screenResponsive} from '~/constants/basic';

class StaffLeaveForm extends Component {
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
            leave: null,
            staffSchedule: null,
            timesheet: null,
            shifts: {},
            arrReasons: [],
            staffSchedules: {}
        }
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.sliceLeaveReason(0,2);
        let { id } = this.props.match.params;
        this.getDetailStaffLeave(id); 
        this.getListTimeShifts();
    }

    /**
     * Get list time shifts
     */
    async getListTimeShifts() {
        let response = await getShifts();
        if(response.status) {
            this.setState({shifts: response.data})
        }
    }

    /**
     * Get Detail staff_leave
     * @param {*} id 
     */
    async getDetailStaffLeave(id = 0) {
        let response = await apiDetail(id);
        if(response.status) {
            let { data } = response;

            /** Get list staff from api get leave detail */
            // let listOption = [];
            // if(data.staffs && data.staffs.rows)
            //     data.staffs.rows.map((staff, index) => {
            //         listOption.push({id: staff.staff_id, name: staff.staff_name + ' - ' + staff.code, code: staff.code})
            //     })
            // this.setState({staffList: listOption})

            /** Set value from api */
            if (id) {
                let leave = data.leave;
                if (typeof leave.leave_from !== 'undefined' && leave.leave_from != emptyDate && leave.leave_from != null)
                    leave.leave_date = dayjs(leave.leave_from, dateFormat);

                if(leave.leave_type == 'R') {
                    this.sliceLeaveReason(13, 18);
                }

                leave.leave_reason = String(leave.leave_reason)
                this.setState({leave: leave})
                this.getListStaffSchedule(leave)
                this.getListTimeSheet(leave)
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
            from_date: dayjs(leave.leave_from).set({ 'hour': 0, 'minute': 0, 'second': 0 }).unix(),
            to_date: dayjs(leave.leave_from).set({ 'hour': 23, 'minute': 59, 'second': 59 }).unix()
        }
        let response = await apiGetListStaffSchedule(params);
        if(response.status){
            let { data } = response;
            if(data.rows.length > 0) {
                this.setState({staffSchedule: data.rows[0]})
            }
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
     * @event submit Form
     */
    submitForm = (values) => {
        this.setState({ loading: true })
        let { t } = this.props;
        let { id } = this.props.match.params;
        let data = {
            leave_from: values.leave_date ? timeFormatStandard(values.leave_date, 'YYYY-MM-DD') +  ' 00:00:00' : null,
            leave_to: values.leave_date ? timeFormatStandard(values.leave_date, 'YYYY-MM-DD') +  ' 00:00:00' : null,
        };
        data = { ...values, ...data };
        let xhr = apiCreate(data);
        let message = t('Leave Application created!');
        xhr.then((response) => {
            this.setState({ loading: false })
            if (response.status != 0) {
                showNotify(t('Notification'), message);
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
            && (checkPermission('company-staff-leave-list') || profile.role_id == roleSupperAdmin || ![1,8].includes(staff_info.position_id))) {
            showNotify('Warning', t('Can not approve or reject leave application for yourself!'), 'warning');
            return true;
        }
        return false;
    }

    /**
     * @event handle click btn approved
     */
    async onHandleApprovedReimburseReject(type) {
        let { staff_info } = this.props.auth;
        this.setState({ loading: true })
        if(!checkManager(staff_info.position_id) && this.checkYourself()) {
            return false;
        }

        let { t } = this.props;
        let { id } = this.props.match.params;
        let values = this.formRef.current.getFieldsValue();
        let data = {
            leave_from: values.leave_date ? timeFormatStandard(values.leave_date, 'YYYY-MM-DD') +  ' 00:00:00' : null,
            leave_to: values.leave_date ? timeFormatStandard(values.leave_date, 'YYYY-MM-DD') +  ' 00:00:00' : null,
        };
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
            case 'reimburse':
                response = await apiReimburse(id, data);
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

        this.setState({arrReason: arrReasons})
        return true;
    }

    /**
     * @event on change select type
     * @param {*} value 
     */
     onSelectType = (value) => {
        if(value == 'R') {
            this.sliceLeaveReason(13, 18);
        }
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
        let { staffList, staffSchedule, timesheet, leave, arrReason } = this.state;

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
        }
            

        // Check trường hợp không có role supper admin thì ko cho approved hoặc chỉnh sửa 
        if(leave && leave.leave_approved == 1 && profile.role_id != roleSupperAdmin) {
            isShow = false;
        }

        let permission = checkPermission('company-staff-leave-manager-update');

        let arrSchedule = {...leaveTypes, ...this.state.shifts}
        let valueForms = this.formRef.current?.getFieldsValue();
        return(
            <div className='block_edit_staffleave'>
                <PageHeader 
                    title={t('hr:leave_application_form')}
                />
                <Row>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12} className='card pl-3 pr-3'>
                        <Spin spinning={this.state.loading}>
                            <Form ref={this.formRef}
                                name="staff-leave-form"
                                className="ant-advanced-search-form pt-3"
                                layout="vertical"
                                onFinish={this.submitForm.bind(this)}
                            >
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item label={t('hr:staff')} name='leave_staff_id' hasFeedback rules={[{ required: true, message: t('hr:please_select_staff') }]}>
                                            {/* <Dropdown datas={staffList} defaultOption={'-- All Staffs --'} /> */}
                                            <StaffDropdown defaultOption={t("hr:all_staff")} disabled={id ? true : false} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item label={t('hr:type')} 
                                            name='leave_type' 
                                            hasFeedback 
                                            rules={[{ required: true, message: t('hr:please_select_type') }]}>
                                            <Dropdown datas={leaveTypes} defaultOption={t("hr:all_type")} onChange={ (e) => this.onSelectType(e)} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Form.Item label={t('hr:date')} name='leave_date'
                                            hasFeedback 
                                            rules={[{ required: true, message: t('hr:select_date') }]}>
                                            <DatePicker style={{width: '100%'}}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={t('hr:shift')} name='leave_shift'>
                                            <Dropdown datas={shiftMains} defaultOption={t("all_shift")}  />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                {id ?
                                    <Row gutter={24}>
                                        <Col span={24}>
                                            <Form.Item label={t('hr:status')}
                                                name='leave_approved'>
                                                <Dropdown datas={approvedStatus} disabled/>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                : []}
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item label={t('hr:reason')} 
                                            name='leave_reason'
                                            hasFeedback 
                                            rules={[{ required: true, message: t('hr:please_select_type') }]}>
                                            <Dropdown takeZero={false} datas={arrReason} defaultOption={t("hr:reason")} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item label={t('hr:note')} name='leave_note'>
                                            <Input.TextArea rows={4} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Divider className="m-0" />
                                <Row gutter={24} className="pt-3 pb-3">
                                    <Col xs={17} sm={7} md={7} lg={12} xl={12} key='bnt-approve' >
                                        { !leave ? 
                                            <Button type="primary" icon={<FontAwesomeIcon icon={faSave} />} htmlType="submit" >
                                                &nbsp;{t('hr:save')}
                                            </Button>
                                        : 
                                            <>
                                                {/* {checkManager(staff_info.position_id) || checkPermission('company-staff-leave-list') ?
                                                    <>
                                                        {isShow ?
                                                            <Button
                                                                onClick={() => this.onHandleApprovedReimburseReject('approved')}
                                                                type="primary"
                                                                icon={<CheckOutlined />}
                                                                className='mr-1'
                                                            >
                                                                &nbsp;{t('Approve')}
                                                            </Button>
                                                            : []}
                                                        {leave && !leave.leave_approved ?
                                                            <Button icon={<CloseOutlined />}
                                                                onClick={() => this.onHandleApprovedReimburseReject('reject')}
                                                                type="primary"
                                                                danger
                                                                className='mr-1'>
                                                                &nbsp;{t('Reject')}
                                                            </Button>
                                                            : []}
                                                        {isShow && leave && leave.leave_approved == 1 && permission ?
                                                            <Button icon={<UndoOutlined />}
                                                                onClick={() => this.onHandleApprovedReimburseReject('reimburse')}
                                                                danger>
                                                                &nbsp;{t('Reimburse')}
                                                            </Button>
                                                            : []}
                                                    </>
                                                    : []} */}
                                                {checkManager(staff_info.position_id) || checkPermission('hr-staff-leave-approve') ?
                                                    <>
                                                        {isShow ?
                                                            <Button
                                                                onClick={() => this.onHandleApprovedReimburseReject('approved')}
                                                                type="primary"
                                                                icon={<CheckOutlined />}
                                                                className='mr-1'
                                                            >
                                                                &nbsp;{t('hr:approve')}
                                                            </Button>
                                                            : []}
                                                        {leave && !leave.leave_approved ? 
                                                            <Button icon={<CloseOutlined />}
                                                                onClick={() => this.onHandleApprovedReimburseReject('reject')}
                                                                type="primary"
                                                                danger
                                                                className='mr-1'>
                                                                &nbsp;{t('hr:reject')}
                                                            </Button>
                                                            : []}
                                                        {isShow && leave && leave.leave_approved == 1 && permission ?
                                                            <Button icon={<UndoOutlined />}
                                                                onClick={() => this.onHandleApprovedReimburseReject('reimburse')}
                                                                danger>
                                                                &nbsp;{t('hr:reimburse')}
                                                            </Button>
                                                            : []}
                                                    </>
                                                    : []}
                                            </>
                                        }
                                        
                                    </Col>
                                    <Col xs={7} sm={7} md={7} lg={12} xl={12} key='btn-back' style={{ textAlign: "right" }}>
                                        <BackButton url={`/company/staff-leave`} />
                                    </Col>
                                </Row>
                            </Form>
                        </Spin>
                    </Col>
                    { id ? <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                        <div className= {window.innerWidth < screenResponsive  ?'card mt-3 pl-3 pr-3 pb-3' :'card ml-3 pl-3 pr-3 pb-3'}>
                            <h4 className='pt-3 title_block'>{t('hr:information')}</h4>
                            <Divider />
                            <div>
                                <Row>
                                    <Col span={6}><strong>Date:</strong></Col>
                                    <Col span={18}>{ leave && leave.leave_from ? timeFormatStandard(leave.leave_from, dateFormat) : 'N/A'}</Col>
                                </Row>
                                <Row>
                                    <Col span={6}><strong>Schedule:</strong></Col>
                                    <Col span={18}>{ staffSchedule ? 
                                        staffSchedule.staffsche_shift + ' ( ' + arrSchedule[staffSchedule.staffsche_shift] + ' ) ' : 'N/A'}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}><strong>Check In:</strong></Col>
                                    <Col span={18}>{ timesheet ? timeFormatStandard(timesheet.check_in, timeFormat, true) : 'N/A' }</Col>
                                </Row>
                                <Row>
                                    <Col span={6}><strong>Check Out:</strong></Col>
                                    <Col span={18}>{ timesheet ? timeFormatStandard(timesheet.check_out, timeFormat, true) : 'N/A' }</Col>
                                </Row>
                                <Row>
                                    <Col span={6}><strong>Created:</strong></Col>
                                    <Col span={18}>{leave && leave.created_at}</Col>
                                </Row>
                                <Row>
                                    <Col span={8}><strong>Remaining off:</strong></Col>
                                    <Col span={12}>{leave?.annual_remaining}</Col>
                                </Row>
                            </div>
                        </div>
                        <div className={window.innerWidth < screenResponsive ?'card mt-3 pl-3 pr-3 pb-3' :'card mt-3 ml-3 pl-3 pr-3 pb-3' }>
                            <Spin spinning={this.state.loading}>
                                    <Calendar
                                        fullscreen={true}
                                        dateCellRender={value => this.dateCellRender(value)}
                                        value={valueForms?.leave_date}
                                    />                                     
                                </Spin>
                        </div>
                    </Col> 
                    : []}
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
export default connect(mapStateToProps)(withTranslation()(StaffLeaveForm));