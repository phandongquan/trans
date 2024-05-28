import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col, Form, DatePicker, Button, Divider, Spin, Card, Calendar, Badge, Input } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Dropdown from '~/components/Base/Dropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { dateFormat, dateTimeFormat, leaveTypes,leaveTypesStaffChedule } from '~/constants/basic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import BackButton from '~/components/Base/BackButton';
import { create as apiCreate, detail as apiDetail, update as apiUpdate, getList as apiGetListStaffSchedule } from '~/apis/company/staffSchedule';
import { showNotify, timeFormatStandard, parseIntegertoTime, checkManager } from '~/services/helper';
import dayjs from 'dayjs';
import { getList as apiGetListStaffLeave } from '~/apis/company/staffLeave'
import { getShifts } from '~/apis/company/timesheet'
import { findUser } from '~/apis/company/staffSearchDropDown'
import {screenResponsive} from '~/constants/basic';

class StaffScheduleForm extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            breakTimes: {},
            schedule: null,
            userCreated: null,
            staffSchedules: {},
            shifts: []
        }

        this.onSelectStaff = this.onSelectStaff.bind(this);
        this.onChangeDate = this.onChangeDate.bind(this);
    }

    /**
     * @lifecycle
     */
    async componentDidMount() {
        await this.getArrayShifts();
        this.renderBreakTime();
        let { id } = this.props.match.params;
        if (id) this.getStaffSchedule(id);
    }

    componentDidUpdate(prevProps, prevState) {
        let { id } = this.props.match.params;
        if(prevProps.match.params.id != id) {
            if (id) this.getStaffSchedule(id);
        }
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
     * Get detail staff_schedule
     */
    async getStaffSchedule(id) {
        this.setState({ loading: true })
        let response = await apiDetail(id);
        if (response.status) {
            let { schedule } = response.data;
            this.formRef.current.setFieldsValue({
                location_id: schedule.staffsche_location_id,
                staff_id: schedule.staffsche_staff_id,
                date: dayjs.unix(schedule.staffsche_time_in),
                shift_code: schedule.staffsche_shift,
                note: schedule.note
            })

            if (schedule.staffsche_user_id) {
                let responseFindUser = await findUser({ user_ids: schedule.staffsche_user_id })
                if (responseFindUser.status) {
                    this.setState({ userCreated: typeof responseFindUser.data[0] != 'undefined' ? responseFindUser.data[0] : null })
                }
            }
            this.setState({ schedule, loading: false })
            this.getScheduleByStaffId({
                ...this.formatScheduleTime(schedule.staffsche_time_in, true),
                staff_id: schedule.staffsche_staff_id
            });
        }
    }

    /**
     * Format schedule time
     * @param {*} scheduleTime 
     * @param {*} isUnix 
     * @returns 
     */
    formatScheduleTime = (scheduleTime, isUnix = false) => {
        let fromDate = isUnix ? dayjs.unix(scheduleTime) : dayjs(scheduleTime);
        let toDate = isUnix ? dayjs.unix(scheduleTime) : dayjs(scheduleTime);
        return {
            from_date: fromDate.startOf('month').unix(),
            to_date: toDate.endOf('month').unix(),
        }
    }

    /**
     * On select staff
     * @param {*} value 
     */
    onSelectStaff = (value) => {
        let values = this.formRef.current.getFieldsValue();
        this.getScheduleByStaffId({
            ...this.formatScheduleTime(values.date),
            staff_id : value
        });
    }

    /**
     * On chage date
     * @param {*} value 
     * @returns 
     */
    onChangeDate = (value) => {
        let values = this.formRef.current.getFieldsValue();
        this.getScheduleByStaffId({
            ...this.formatScheduleTime(value.format(dateFormat)),
            staff_id: values.staff_id
        });
        return;
    }

    /**
     * Get schedule by staff
     * @param {*} staff_id 
     */
    getScheduleByStaffId = async (params = {}) => {
        this.setState({ loading: true })
        let response = await apiGetListStaffSchedule(params)
        this.setState({ loading: false })
      
        if (response.status) {
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
     * render break time from shift to dropdown
     */
    async renderBreakTime() {
        let { shifts } = this.state;
        let arrShifts = [];
        Object.keys(shifts).map((i, index) => {
            arrShifts[i] = `${i} (${shifts[i]})`;
        })
        this.setState({ breakTimes: { ...arrShifts, ...leaveTypesStaffChedule } })
        return false;
    }

    /**
     * @event submit form 
     */
    submitForm(values) {
        this.setState({loading: true})
        let { t, staffInfo } = this.props;
        let { id } = this.props.match.params;
        let xhr;

        values = {
            ...values,
            title: 'Hasaki',
            department_id: staffInfo ? staffInfo.staff_dept_id : 0
        }
        
        let intFrmHour = '00:00:00';
        let intToHour = '00:00:00';

        if(typeof values.shift_code != 'undefined' && this.state.breakTimes[values.shift_code]) {
            let length = this.state.breakTimes[values.shift_code].length;
            let timeShift = this.state.breakTimes[values.shift_code].substring(length - 19);
            let timeShiftArr = timeShift.split("-");

            if(timeShiftArr.length == 2) {
                intFrmHour = timeShiftArr[0].slice(1, timeShiftArr[0].length)
                intToHour = timeShiftArr[1].slice(0, timeShiftArr[0].length-1)
            }
        }
        
        values.time_in = timeFormatStandard(values.date, dateFormat) + ' ' + intFrmHour;
        values.time_out = timeFormatStandard(values.date, dateFormat) + ' ' + intToHour;

        // Check condition
        if(['PM 24','PM 25'].includes(values.shift_code)){
            values.time_out = dayjs(values.date).add(1, 'days').format(dateFormat) + ' ' + intToHour;
        }

        // if(values.shift_code == 'HC 13' && ![6,0].includes(dayjs(values.time_in).format('e'))){
        //     this.setState({loading: false})
        //     let message  = t('This schedule ' + values.shift_code +' can only apply for saturday or sunday. Please check again!')
        //     showNotify('Notification', message, 'error')
        //     return false;
        // }

        if(!this.checkLeave({
            staff_id: values.staff_id,
            leave_date: values.date
        })) {
            this.setState({loading: false})
            let message  = t('This staff already has a leave on this day. Please check again!')
            showNotify('Notification', message, 'error')
            return false;
        }

        // Call api
        if (id) {
            xhr = apiUpdate(id, values);
        }
        else
            xhr = apiCreate(values);

        xhr.then(response => {
            this.setState({ loading: false })
            if (response.status) {
                let message = t('Created Staff Schedule!')
                showNotify('Notification', message)
            } else {
                let message = response.message
                showNotify('Notification', message, 'error')
            }
        })
    }

    /**
     * Call api get list staff leave for check leave
     * @param {*} params 
     */
    checkLeave = (params) => {
        if (typeof params.staff_id == 'undefined' && typeof params.leave_date == 'undefined')
            return false;

        let conditions = {
            'staff_id': params.staff_id,
            'is_manager': true,
            'main_type': 1,
            'from_date': timeFormatStandard(params.leave_date, dateFormat) + ' 00:00:00',
            'to_date': timeFormatStandard(params.leave_date, dateFormat) + ' 23:59:59',
            'is_approve': '0,1',
        }

        let xhr = apiGetListStaffLeave(conditions);
        xhr.then(response => {
            if (response.status) {
                if (typeof response.data.rows != 'undefined' && response.data.rows)
                    return false;
            }
        })

        return true;
    }

    /**
     * Data cell render
     * @param {*} value 
     * @returns 
     */
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

    /**
     * Check disable button save
     * @returns 
     */
    checkDisabledBtnSave = () => {
        let { id } = this.props.match.params;
        let { auth: { staff_info }} = this.props;
        if(!id || checkManager(staff_info.position_id)) {
            return false;
        }
        let valueForms = this.formRef.current?.getFieldsValue();
        return (typeof valueForms != 'undefined' && typeof valueForms.date != 'undefined' && dayjs().utc(0).isAfter(dayjs(valueForms.date).endOf('day')));
    }

    render() {
        let { t, baseData: { locations } } = this.props;
        let { schedule } = this.state;
        let { id } = this.props.match.params;
        let subtitle = id ? t('hr:edit') : t('hr:add_new');

        let valueForms = this.formRef.current?.getFieldsValue();
        let visibleScheduleStaff = typeof valueForms != 'undefined' && (typeof valueForms.date != 'undefined' && typeof valueForms?.staff_id != 'undefined')
      
        return (
            <>
                <PageHeader title={subtitle} />
                <Row>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12} className='mb-3'>
                        <Spin spinning={this.state.loading}>
                            <Form ref={this.formRef}
                                name="staff-leave-form"
                                className="card ant-advanced-search-form p-3"
                                layout="vertical"
                                onFinish={this.submitForm.bind(this)}
                            >
                                <Row gutter={24}>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item name='location_id' label={t('location')} rules={[{ required: true, message:t("hr:select_location") }]}>
                                            <Dropdown datas={locations} defaultOption={t("hr:all_location")}/>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item name='staff_id' label={t('hr:staff')} rules={[{ required: true, message: t("hr:please_select_staff") }]}>
                                            <StaffDropdown initial defaultOption={t("hr:all_staff")} onSelect={this.onSelectStaff} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                                        <Form.Item name='date' label={t('hr:date')} rules={[{ required: true, message: t("hr:select_date") }]}>
                                            <DatePicker allowClear={false} format={dateFormat} style={{ width: '100%' }} placeholder={t('hr:date')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name='shift_code' label={t('hr:time')} rules={[{ required: true, message: t("hr:select_date") }]}>
                                            <Dropdown datas={this.state.breakTimes} defaultOption={t("hr:all_time")} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item name='note' label={t('hr:note')}>
                                            <Input.TextArea rows={4} placeholder={t('hr:note')}/>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Divider className="m-0" />
                                <Row gutter={24} className="pt-3 pb-3">
                                    <Col span={12} key='bnt-approve'>
                                        <Button type="primary" icon={<FontAwesomeIcon icon={faSave} />} htmlType="submit" disabled={this.checkDisabledBtnSave()} >
                                            &nbsp;{t('hr:save')}
                                        </Button>
                                    </Col>
                                    <Col span={12} key='btn-back' style={{ textAlign: "right" }}>
                                        <BackButton url={`/company/staff-schedule`} />
                                    </Col>
                                </Row>
                            </Form>
                        </Spin>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                        <Card
                            className='ml-1'
                            title={<strong>{t('hr:information')}</strong>}
                            loading={this.state.loading}
                            style={{ height: 180 }}
                        >
                            <table>
                                <tbody>
                                    <tr>
                                        <th width='100px' style={{ border: 'none' }}>{t('hr:created_date')}: </th>
                                        {/* <td>{schedule?.created_at || 'N/A'}</td> */}
                                        {
                                            <td>{dayjs.unix(schedule?.staffsche_ctime).format('YYYY-MM-DD HH:mm')}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <th width='100px' style={{ border: 'none' }}>{t('hr:modified_by')}: </th>
                                        <td>{this.state.userCreated?.staff_name}</td>
                                    </tr>
                                    <tr>
                                        <th width='100px' style={{ border: 'none' }}>{t('hr:update_date')}: </th>
                                        <td>{schedule?.updated_at || 'N/A'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card>
                        {window.innerWidth < screenResponsive  ?  
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'>
                                    <div className={`calendar-staff-schedule card p-2 ml-1 mt-1 ${!visibleScheduleStaff ? 'd-none' : ''}`}>
                                    <Spin spinning={this.state.loading}>
                                        <Calendar
                                            fullscreen={true}
                                            dateCellRender={value => this.dateCellRender(value)}
                                            value={valueForms?.date}
                                            
                                        />
                                       
                                    </Spin>
                                   
                                    </div>
                                </div>
                            </div>
                            :
                            <div className={`calendar-staff-schedule card p-2 ml-1 mt-1 ${!visibleScheduleStaff ? 'd-none' : ''}`}>
                                <Spin spinning={this.state.loading}>
                                    <Calendar
                                        fullscreen={true}
                                        dateCellRender={value => this.dateCellRender(value)}
                                        value={valueForms?.date}
                                       
                                    />
                                    
                                </Spin>
                            </div>
                        }
                    </Col>
                </Row>
            </>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffScheduleForm))