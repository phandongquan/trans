import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Input, Form, Badge } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { getListDevices as apiGetListDevices } from '~/apis/company/staffNotification';
import { Link } from 'react-router-dom';
import Dropdown from '~/components/Base/Dropdown';
import NotificationHistory from '~/components/Company/StaffNotificationDevice/NotificationHistory';
import Tab from '~/components/Base/Tab';
import tabList from '~/scenes/Company/StaffNotificationDevice/config/tab';

const FormItem = Form.Item;
class StaffNotificationDevice extends Component {

    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            staffListDevices: [],
            limit: 30,
            page: 1,
            total: 0,

            visibleNotificationHistory: false,
            dataPopupNotificationHistory: [],
        };
        this.formRef = React.createRef();
    }
    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.formRef.current.setFieldsValue({
            last_active: 1
        })
        let values = this.formRef.current.getFieldsValue();
        this.getListDevices(values);
    }

    /**
     * Get list staff devices receive notification
     * @param {} params 
     */
    async getListDevices(params) {
        this.setState({ loading: true });
        params = {
            ...params,
            page: this.state.page,
            limit: this.state.limit,
            // last_active: true
        }
        let response = await apiGetListDevices(params);

        if (response.status) {
            let { data } = response;
            // Format rows to array object
            let listData = [];
            if (data.rows) {
                Object.keys(data.rows).map(id => {
                    listData.push(data.rows[id]);
                })
            }
            this.setState({
                staffListDevices: listData,
                loading: false,
                total: data.total
            });
        }
    }

    /**
     * @event change page
     * 
     * @param {*} page 
     */
    onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListDevices({ ...values }));
    }
    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = (values) => {
        this.setState({ page: 1 }, () => this.getListDevices(values));
    }

    /**
     * Toggle popup notification history modal
     * @param {*} visibleNotificationHistory 
     */
    togglePopupNotificationHistory = ( visibleNotificationHistory = true, dataPopupNotificationHistory = [] ) => {
        this.setState({ visibleNotificationHistory, dataPopupNotificationHistory })
    }

    /**
     * @render
     */
    render() {
        let { t, baseData: { locations, departments, divisions, positions, majors, pendingSkills } } = this.props;

        const columns = [
            {
                title: 'No.',
                align: 'center',
                render: r => this.state.staffListDevices.indexOf(r) + 1
            },
            {
                title: t('staff_name'),
                render: r => {
                    let staff = r.staff;
                    return (
                        <>
                            <Link to={`/company/staff/${staff.staff_id}/edit`}>{staff.staff_name}</Link> #<strong>{staff.code}</strong>
                            <small> ({majors.map(m => m.id == staff.major_id && m.name)}) </small><br />
                            <small>{staff.staff_phone ? `${staff.staff_email} - ${staff.staff_phone}` : ''}</small><br />
                            <small>{staff.temporary_residence_address ? ` ${staff.temporary_residence_address}` : ''}</small>
                        </>
                    )
                }
            },
            {
                title: t('hr:dept_section_location'),
                render: r => {
                    let staff = r.staff;
                    let deparment = departments.find(d => staff.staff_dept_id == d.id);
                    let deptName = deparment ? deparment.name : 'NA';
                    let division = divisions.find(d => staff.division_id == d.id)
                    let divName = division ? division.name : 'NA';
                    let location = locations.find(l => staff.staff_loc_id == l.id)
                    let locName = location ? location.name : 'NA';
                    return `${deptName} / ${divName} / ${locName}`;
                }
            },
            {
                title: t('device_id'),
                render: r => r.device_id
            },
            {
                title: t('hr:last_seen'),
                render: r => r.updated_at
            },
            {
                title: t('active'),
                align: 'center',
                render: r => r.last_active ? <FontAwesomeIcon icon={faCheckCircle} color='#02c857' /> : null
            },
            {
                title: t('hr:platform'),
                render: r => r.platform
            },
            {
                title: t('hr:os_version'),
                render: r => r.os_version
            },
            {
                title: t('send_notify'),
                align: 'center',
                render: r => {
                    if(r.notifications.length){
                        return (
                            <Button type='link' onClick={() => this.togglePopupNotificationHistory(true, r.notifications)}>
                                <Badge showZero className={r.notifications.length ? '' : "site-badge-count-4"}
                                    count={r.notifications.length}
                                    style={r.notifications.length ? { backgroundColor: '#52c41a' } : {}}
                                />
                            </Button>
                        )
                    } else {
                        return (
                            <Badge showZero className={r.notifications.length ? '' : "site-badge-count-4"}
                                count={r.notifications.length}
                                style={r.notifications.length ? { backgroundColor: '#52c41a' } : {}}
                            />
                        )
                    }
                }
            },
        ];


        return (
            <>
                <PageHeader title={t('hr:staff_device')} />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabList(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={[12, 0]}>
                            <Col span={4}>
                                <FormItem name="q">
                                    <Input placeholder={t('input_searh_tool_device')} />
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem name="location_id" >
                                    <Dropdown datas={locations} defaultOption={t('all_location')} />
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem name="department_id" >
                                    <Dropdown datas={departments} defaultOption={t('all_department')} mode="multiple" />
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem name="division_id" >
                                    <Dropdown datas={divisions} defaultOption={t('all_division')} />
                                </FormItem>
                            </Col>
                            <Col span={3}>
                                <FormItem name="major_id" >
                                    <Dropdown datas={majors} defaultOption={t('all_major')} mode="multiple" />
                                </FormItem>
                            </Col>
                            <Col span={3}>
                                <FormItem name="last_active">
                                    <Dropdown datas={{ 1: `Active: YES` }} defaultOption={t('active')} style={{ width: '100%' }} />
                                </FormItem>
                            </Col>
                            <Col span={2} key='submit'>
                                <Button type="primary" htmlType="submit" className='mb-2'>
                                    {t('search')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>

                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table
                            dataSource={this.state.staffListDevices ? this.state.staffListDevices : []}
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
                            rowKey={staff => staff.id}
                            scroll={{ x: 1200 }}
                        />
                    </Col>
                </Row>

                <NotificationHistory 
                    visible={this.state.visibleNotificationHistory}
                    togglePopup={() => this.togglePopupNotificationHistory(false)}
                    datas={this.state.dataPopupNotificationHistory}
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
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffNotificationDevice));