import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Table, Row, Col, Form, Input, Button } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab';
import tabList from '~/scenes/Company/StaffNotificationDevice/config/tab';
import Dropdown from '~/components/Base/Dropdown';
import { getList as apiGetList, destroy as apiDelete } from '~/apis/company/staffNotification';
import { Link } from 'react-router-dom';
import DeleteButton from '~/components/Base/DeleteButton';
import { checkPermission, showNotify } from '~/services/helper'

const FormItem = Form.Item;
class StaffNotification extends Component {

    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            notifications: [],
            limit: 30,
            page: 1,
            total: 0,
        }
    }

    /**
     * 
     */
    componentDidMount() {
        let params = this.formRef.current.getFieldsValue();
        this.getListNotification(params);
    }

    /**
     * Get List notifications
     * @param {*} params 
     */
    async getListNotification(params = {}) {
        this.setState({loading: true})

        params = {
            ...params,
            limit: this.state.limit,
            page: this.state.page
        }

        let response = await apiGetList(params);
        if(response.status) {
            let { data } = response;
            this.setState({ loading: false, notifications: data.rows, total: data.total })
        }
    }

    /**
     * Submit form search
     */
    submitForm = (values) => {
        this.setState({ page: 1 }, () => this.getListNotification(values));
    }

    /**
     * Onchange page pagination
     */
    onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListNotification({ ...values }));
    }

    /**
     * Delete record in list
     * @param {*} event 
     * @param {*} id 
     */
    onDeleteNotification = (event, id) => {
        this.setState({loading: true})
        let { t } = this.props;
        event.stopPropagation();
        let xhr = apiDelete(id);
        xhr.then((response) => {
            this.setState({loading: false})
            if (response.status) {
                let values = this.formRef.current.getFieldsValue();
                this.getListNotification(values);
                showNotify(t('Notification'), (t('hr:notification') +t(' ') + t('hr:has_been_remove')));
            } else {
                showNotify(t('Notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('Notification'), t('hr:server_error'));
        });
    }

    render() {
        let { t, baseData: {locations, departments, divisions, majors} } = this.props;
        const columns = [
            {
                title: t('No.'),
                render: r => this.state.notifications.indexOf(r) + 1,
            },
            {
                title: t('staff'),
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
                title: t('title'),
                render: r => r.data?.title
            },
            {
                title: t('content'),
                render: r => r.data?.content
            },
            {
                title: t('hr:send_at'),
                render: r => r.created_at,
                align: 'center'
            },
            {
                title: t('hr:read_at'),
                render: r => r.read_at,
                align: 'center'
            },
            {
                title: t('action'),
                render: r => {
                    return (
                        checkPermission('hr-setting-staff-notification-delete') ?
                            <DeleteButton onConfirm={(e) => this.onDeleteNotification(e, r.id)} />
                            : ''
                    )
                },
                align: 'center'
            }
        ]
        return (
            <>
                <PageHeader
                    title={t('hr:staff_notification')}
                />
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
                                    <Input placeholder={t('hr:input_searh_tool_device')} />
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem name="location_id" >
                                    <Dropdown datas={locations} defaultOption={t('hr:all_location')} />
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem name="department_id" >
                                    <Dropdown datas={departments} defaultOption={t('hr:all_department')} mode="multiple" />
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem name="division_id" >
                                    <Dropdown datas={divisions} defaultOption={t('hr:all_division')}  />
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem name="major_id" >
                                    <Dropdown datas={majors} defaultOption={t('hr:all_major')} mode="multiple" />
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
                            dataSource={this.state.notifications}
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
                            rowKey='id'
                            scroll={{ x: 1200 }}
                        />
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffNotification));