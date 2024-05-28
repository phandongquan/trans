import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { DatePicker, Table, Row, Col, Form, Button, Divider} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '~/components/Base/Dropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import './config/detail.css';
import Tab from '~/components/Base/Tab';
import tabList from './config/tabList';
import { dateFormat } from '~/constants/basic';
import { getList as apiGetList, deleteStaffSchedule as apiDeleteStaffSchedule } from '~/apis/company/staffSchedule';
import dayjs from 'dayjs';
import { checkPermission, parseIntegertoTime, showNotify } from '~/services/helper';
import DeleteButton from '~/components/Base/DeleteButton';
import { getList as apiGetListStaff } from '~/apis/company/staff';
import { WarningOutlined } from '@ant-design/icons';
import {screenResponsive} from '~/constants/basic';
class Daily extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            staffSchedules: [],
            staffs: [],
            stores: []
        }
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.formRef.current.setFieldsValue({
            date: dayjs(dayjs(), dateFormat)
        })
        let values = this.formRef.current.getFieldsValue();
        this.getListStaffSchedule(values);
        this.getListStaff(values);
        
    }

    /**
     * Get list staff
     */
    async getListStaff(params) {
        let conditions = {
            status: 1,
            data_stores: 1,
            location_id: params.location_id,
            position_id: params.position_id,
            major_id: params.position_id,
            limit: 500
        }
        let response = await apiGetListStaff(conditions);
        if(response.status)
            this.setState({ 
                staffs: response.data.rows,
                stores: response.data.stores
            })
    }

    /**
     * Get List staff_schedule
     * @param {*} params 
     */
    async getListStaffSchedule(params) {
        params = {
            ...params,
            is_manager: true
        }
        if(params.date != null){
            params.from_date = dayjs(params.date).startOf('day').unix()
            params.to_date = dayjs(params.date).endOf('day').unix()
            delete params.date
        }
        let response = await apiGetList(params);
        if(response.status) this.setState({ staffSchedules: response.data.rows})
    }

    /**
     * @event submit Form
     * @param {*} values 
     */
    submitForm(values) {
        this.getListStaffSchedule(values)
    }

    /**
     * @event delete skill
     * @param {} e 
     */
    onDeleteStaffSchedule = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = apiDeleteStaffSchedule(id);
        xhr.then((response) => {
            if (response.status) {
                let values = this.formRef.current.getFieldsValue();
                this.getListStaffSchedule(values);
                showNotify(t('Notification'), t('Staff schedule has been removed!'));
            } else {
                showNotify(t('Notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('Notification'), t('Server has error!'));
        });;
    }


    render() {
        let { t, baseData: {departments, locations, divisions, positions, majors, brands = []} } = this.props;
        let brandsFormat = []
        brands.map(b => {
            brandsFormat.push({ id: b.brand_id, name: b.brand_name })
        })
        const columns = [
            {
                title: t('No.'),
                render: r => this.state.staffSchedules.indexOf(r) + 1,
            },
            {
                title: t('hr:date'),
                render: r => parseIntegertoTime(r.staffsche_time_in, dateFormat)
            },
            {
                title: t('hr:location'),
                render: r => locations.map( l => l.id == r.staffsche_location_id && l.name)
            },
            {
                title: t('hr:shift'),
                render: r => r.staffsche_shift ? r.staffsche_shift : 'N/A'
            },
            {
                title: t('hr:time'),
                render: r => parseIntegertoTime(r.staffsche_time_in, 'HH:ss') + ' - ' + parseIntegertoTime(r.staffsche_time_out, 'HH:ss')
            },
            {
                title: t('hr:staff'),
                render: r => r.code + ' - ' + r.staff_name + ' (ID:' + r.staffsche_staff_id + ')' + (r.major_id == 61 ? '- '+ r.brand_name : '' )
            },
            {
                title: t('hr:store_permission'),
                render: r => {
                    let result = [];
                    this.state.staffs.map(staff => {
                        if(staff.staff_id == r.staffsche_staff_id){
                            if(staff.user && staff.user.stores){
                                if(typeof staff.user.stores != 'undefined'){
                                   staff.user.stores.map(store => {
                                       this.state.stores.map(obj => {
                                           if(store.store_id == obj.store_id) {
                                                result.push(<span key={obj.store_id}>{obj.store_name}</span>);
                                                if(obj.location_id != r.staffsche_location_id){
                                                    result.push( <WarningOutlined key={r.staffsche_staff_id} style={{color: '#f39c12'}} />)
                                                }
                                           }
                                       })
                                   })
                                }
                            }
                        }
                    })
                    return result;
                },
                width: '30%'
            },
            {
                title: t('hr:action'),
                render: r => {
                    let today = dayjs().get('date'); 
                    let from = today <= 7 ? dayjs().startOf('month').subtract(1, 'months').unix() : dayjs().startOf('month').unix();
                    if( from <= r.staffsche_time_in){
                        return (
                            <>
                            {
                                checkPermission('hr-staff-schedule-daily-update') ?
                                <Link to={`/company/staff-schedule/` + r.staffsche_id + `/edit`} style={{ marginRight: 8 }}>
                                    <Button type="primary" size='small'
                                        icon={<FontAwesomeIcon icon={faPen} />}>
                                    </Button>
                                </Link>
                            : ''
                            }
                            {
                                checkPermission('hr-staff-schedule-daily-delete') ?
                                    <DeleteButton onConfirm={(e) => this.onDeleteStaffSchedule(e, r.staffsche_id)} />
                                : ''
                            }
                            </>
                        )
                    }
                },
                align: 'center',
                width: '10%'
            },
        ]

        return (
            <>
                <PageHeader 
                    title={t('hr:staff_schedule')}
                    tags={
                        <Link to={`/company/staff-schedule/create`} key="create-staff-schedule">
                            <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                &nbsp;{t('hr:add_new')}
                            </Button>
                        </Link>
                    }
                />

                <Row className='card pl-3 pr-3 mb-4'>
                <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name='date'>
                                    <DatePicker format={dateFormat} style={{width: '100%'}} />
                                </Form.Item>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                <Form.Item name='staff_id'>
                                    <StaffDropdown defaultOption={t("hr:all_staff")} />
                                </Form.Item>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                <Form.Item name="position_id" >
                                    <Dropdown datas={positions} defaultOption={t("hr:all_position")}/>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                <Form.Item name="location_id" >
                                    <Dropdown datas={locations} defaultOption={t("hr:all_location")} />
                                </Form.Item>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                <Form.Item name="department_id" >
                                    <Dropdown datas={departments} defaultOption={t("hr:all_department")} />
                                </Form.Item>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                <Form.Item name="division_id" >
                                    <Dropdown datas={divisions} defaultOption={t("hr:all_division")}/>
                                </Form.Item>
                            </Col>
                           
                            <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                <Form.Item name="major_id" >
                                    <Dropdown datas={majors} defaultOption={t("hr:all_major")} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                <Form.Item name="brand" >
                                    <Dropdown datas={brandsFormat} defaultOption={t("hr:all_brands")} />
                                </Form.Item>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={4} xl={4} key='submit'>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        {t('hr:search')}
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>

                <Row className='block_table_staff_schedule_daily table_in_block card pl-3 pr-3 mb-3'>
                    <Col span={24}>
                        <Tab tabs={tabList(this.props)} />
                        <Divider className='mt-0' />
                        {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'>
                                    <Table 
                                        dataSource={this.state.staffSchedules}
                                        columns={columns}
                                        rowKey={schedule => schedule.staffsche_id}
                                        pagination={{
                                            pageSize: 50,
                                            showSizeChanger: false
                                        }}
                                        scroll={{scrollToFirstRowOnChange: true}}
                                    />
                                </div>

                            </div>
                        : 
                        
                        <Table 
                            dataSource={this.state.staffSchedules}
                            columns={columns}
                            rowKey={schedule => schedule.staffsche_id}
                            pagination={{
                                pageSize: 50,
                                showSizeChanger: false
                            }}
                            scroll={{scrollToFirstRowOnChange: true}}
                        />}
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
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Daily));