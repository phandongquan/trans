import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Table, Form, Col, Row, Input, Button } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { getList as apiGetList } from '~/apis/company/staff';
import Dropdown from '~/components/Base/Dropdown';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import Tab from '~/components/Base/Tab';
import tabListStaff from '../config/tabListStaff';
import { checkPermission, timeFormatStandard } from '~/services/helper';

import {screenResponsive} from '~/constants/basic';
const FormItem =  Form.Item;
class StaffNeedApprove extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props)
        this.state = {
            staffList : []
        }
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getListStaffNeedApprove();
    }

    /**
     * Get list staff need approve
     * @param {*} param 
     */
    async getListStaffNeedApprove(params = {}) {
        let datas = { 
            ...params,
            is_waiting_update_approve: 1, 
            sort: 'updated_at',
            limit: 10000
        }
        let response = await apiGetList(datas);
        if(response.status) {
            let { data } = response;
            this.setState({ staffList: data.rows})
        }
    }

    /**
     * @event submit form
     * @param {*} values 
     */
    submitForm = (values) => {
        this.getListStaffNeedApprove(values)
    }

    render() {
        let { t, baseData: { locations, departments, divisions, positions, majors } } = this.props;
        const columns = [
            {
                title: 'No.',
                align: 'center',
                render: r => this.state.staffList.indexOf(r) + 1
            },
            {
                title: t('hr:name'),
                render: r => (
                    <div>
                        <Link to={`/company/staff/${r.staff_id}/need-approve`}>{r.staff_name}</Link> 
                        #<strong>{r.code}</strong> 
                        <small> ({ majors.map(m => m.id == r.major_id && m.name)}) </small><br />
                        <small>{r.staff_phone ? `${r.staff_email} - ${r.staff_phone}` : ''}</small><br />
                        <small>{r.temporary_residence_address ? ` ${r.temporary_residence_address}` : ''}</small>
                    </div>
                )
            },
            {
                title: t('hr:dept') + '/' + t('hr:sec') + '/' + t('hr:location'),
                render: r => {
                    let deparment = departments.find(d => r.staff_dept_id == d.id);
                    let deptName = deparment ? deparment.name : 'NA';
                    let division = divisions.find(d => r.division_id == d.id)
                    let divName = division ? division.name : 'NA';
                    let location = locations.find(l => r.staff_loc_id == l.id)
                    let locName = location ? location.name : 'NA';
                    return `${deptName} / ${divName} / ${locName}`;
                }
            },
            {
                title: t('hr:date'),
                render: r => r.updated_at
            },
            {
                title: t('hr:action'),
                align: 'center',
                render: r => {
                    return checkPermission('hr-staff-need-approve-update') ? 
                        <Link to={`/company/staff/${r.staff_id}/need-approve`}>
                            <Button type="primary" size='small'
                                icon={<FontAwesomeIcon icon={faPen} />}>
                            </Button>
                        </Link>
                    : ''
                }
            },
        ];
        return (<>
            <PageHeader 
                title = {t('hr:staff_need_approve')}
            />

            <Row className="card pl-3 pr-3 mb-3">
                <Tab tabs={tabListStaff(this.props)} />
                <Form
                    className="pt-3"
                    ref={this.formRef}
                    name="searchStaffForm"
                    onFinish={this.submitForm.bind(this)}
                    layout="vertical"
                >
                    <Row gutter={[12, 0]}>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <FormItem name="limit" hidden >
                                <Input />
                            </FormItem>
                            <FormItem name="sort" hidden>
                                <Input />
                            </FormItem>
                            <FormItem name="offset" hidden>
                                <Input />
                            </FormItem>
                            <FormItem name="q">
                                <Input placeholder={t('hr:name') + '/' + t('hr:phone') + '/' + t('hr:code') + t('hr:email')} />
                            </FormItem>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <FormItem name="location_id" >
                                <Dropdown datas={locations} defaultOption={t('hr:all_location')} />
                            </FormItem>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <FormItem name="department_id" >
                                <Dropdown datas={departments} defaultOption={t('hr:all_department')} mode="multiple" />
                            </FormItem>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <FormItem name="division_id" >
                                <Dropdown datas={divisions} defaultOption={t('hr:all_division')} />
                            </FormItem>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <FormItem name="position_id" >
                                <Dropdown datas={positions} defaultOption={t('hr:all_position')}  />
                            </FormItem>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                            <FormItem name="major_id" >
                                <Dropdown datas={majors} defaultOption={t('hr:all_major')} mode="multiple" />
                            </FormItem>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4} key='submit'>
                            <FormItem>
                                <Button type="primary" htmlType="submit"                            >
                                    {t('hr:search')}
                                </Button>
                            </FormItem>
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
                                dataSource={this.state.staffList ? this.state.staffList : []}
                                columns={columns}
                                loading={this.state.loading}
                                pagination={{ pageSize: 15, hideOnSinglePage: true, showSizeChanger: false }}
                                rowKey={staff => staff.staff_id}
                            />
                        </div>
                    </div>
                    :
                    <Table
                        dataSource={this.state.staffList ? this.state.staffList : []}
                        columns={columns}
                        loading={this.state.loading}
                        pagination={{ pageSize: 15, hideOnSinglePage: true, showSizeChanger: false }}
                        rowKey={staff => staff.staff_id}
                    />
                }
                </Col>
            </Row>
        </>)
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffNeedApprove));