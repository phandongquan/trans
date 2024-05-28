import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Form, Row, Col, Button, Divider, Image, Avatar } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import StaffInformation from '~/scenes/Company/Staff/StaffInformation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { faSave, faBackspace } from '@fortawesome/free-solid-svg-icons';
import { getByParam as apiGetByParam, update as updateStaff } from '~/apis/company/staff';
import dayjs from 'dayjs';
import { checkPermission, showNotify } from '~/services/helper';
import { UserOutlined } from '@ant-design/icons';
import { getDistrictByCity as apiGetDistrictByCity, getWardByDistrict as apiGetWardByDistrict } from '~/apis/company/mobile';
import { MEDIA_URL_HR } from '~/constants';

import {screenResponsive} from '~/constants/basic';
class StaffNeedApproveForm extends Component {
    constructor(props) {
        super(props)
        this.formCurrent = React.createRef();
        this.formUpdate = React.createRef();
        this.state = {
            loading: false,
            filedUpdate: [],
            srcAvatar: '',
            districts: [],
            wards: []
        }
    }

    /**
     * @lifeCycle
     */
    componentDidMount() {
        let { id } = this.props.match.params;
        this.getDetailStaff(id)
    }

    /**
     * Get staff detail current
     * @param {*} id 
     */
    async getDetailStaff (id) {
        let response = await apiGetByParam({ staff_id: id })
        if(response.status) {
            let staff = response.data.rows;

            this.formCurrent.current.setFieldsValue(this.formatDataResponse(staff));
            this.getDetailStaffUpdate(id, staff);
            this.setState({ srcAvatar: typeof staff.user != 'undefined' ? staff.user?.avatar : '' })

            /**
            * Get districts by city_id
            */
            if(staff.city_id) {
                this.getDistrictByCity(staff.city_id)
            }

            /**
            * Get ward by district_id
            */
             if(staff.district_id) {
                this.getWardByDistrict(staff.district_id)
            }
        } 
    }

    /**
    * Get district by city
    * @param {*} city_id
    */
    async getDistrictByCity(city_id) {
        let response = await apiGetDistrictByCity({ city_id });
        if(response.status) {
            this.setState({ districts: response.data })
        }
    }

    /**
    * Get ward by district
    * @param {*} district_id
    */
     async getWardByDistrict(district_id) {
        let response = await apiGetWardByDistrict({ district_id });
        if(response.status) {
            this.setState({ wards: response.data })
        }
    }

    /**
     * Get staff detail update
     * @param {*} id 
     */
    async getDetailStaffUpdate ( id, currentStaff ) {
        let response = await apiGetByParam({ staff_id: id,'need-approve' : true })
        if(response.status) {
            let staff = response.data.rows;
            let result = [];
            let json = JSON.parse(staff.update_temp_log);
            
            if(json) {
                Object.keys(json).map( key => {
                    if(staff[key] != currentStaff[key])
                        result.push(key)
                })
            }

            this.setState({filedUpdate: result})
            this.formUpdate.current.setFieldsValue(this.formatDataResponse(staff));

            /**
            * Get districts by city_id
            */
             if(staff.city_id) {
                this.getDistrictByCity(staff.city_id)
            }

            /**
            * Get ward by district_id
            */
             if(staff.district_id) {
                this.getWardByDistrict(staff.district_id)
            }
        }
    }

    /**
     * Format data response 
     * @param {*} staff 
     */
    formatDataResponse = (staff) =>{
        let formData = {};
        Object.keys(staff).map(key => {
            if (['staff_hire_date', 'date_issue_card', 'date_issue_tax', 'date_out_company', 'staff_dob', 'date_issue_card_2'].includes(key)) {
                formData[key] = staff[key] ? dayjs(staff[key] * 1000) : null;
            } else {
                formData[key] = staff[key] ? staff[key] : null;
            }
        });
        return formData;
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
     * Convert DateTime to Unix Timestamp
     * @param {*} val 
     */
    convertUnixTimestamp(val) {
        return val ? val.unix() : 0;
    }

    /**
     * @event Submit Form
     * @param {*} values 
     */
    submitForm = (values) => {
        let { t } = this.props;
        let data = {
            // Format datetime before submit
            date_issue_card: this.convertUnixTimestamp(values.date_issue_card),
            staff_dob: this.convertUnixTimestamp(values.staff_dob),
            date_issue_card_2: this.convertUnixTimestamp(values.date_issue_card_2),
            is_waiting_update_approve: 1
        };

        data = { ...values, ...data };

        let { id } = this.props.match.params;
        let xhr = updateStaff(id, data);
        let message = t('hr:staff') + t('hr:approved') + '!';
        
        xhr.then((response) => {
            if (response.status) {
                showNotify(t('hr:notification'), message);
                this.props.history.push("/company/staff/need-approve")
            } else {
                showNotify(t('hr:notification'), response.message, 'error');
            }
        });
    }
    /**
     * @event before submit form
     * Validate before submit
     */
     handleFormSubmit() {
        this.formUpdate.current.validateFields()
            .then((values) => {
                this.submitForm(values)
            }
             )
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }
    render() {
        let { t } = this.props;
        return (<>
            <PageHeader 
                title={t('hr:staff_need_approve')}
            />
            <Row className='pl-1 pr-1'>
                <Col xs={24} sm={24} md={24} lg={11} xl={11} className='card p-2'>
                    <PageHeader 
                        title={t('hr:current')}
                    />
                    <Divider className="m-0 mb-2" />
                    {
                        this.state.srcAvatar ? 
                        <Image className='staff_image' width={64} height={64} preview={true} src={ MEDIA_URL_HR + '/'  + this.state.srcAvatar } />
                        : <Avatar size={64} icon={<UserOutlined />} />
                    }
                    <Form 
                        className="ant-advanced-search-form mt-2"
                        layout="vertical" 
                        ref={this.formCurrent}>
                        <StaffInformation districts={this.state.districts} wards={this.state.wards} />
                        <Row gutter={24} className="pt-3 pb-3">
                            <Col span={12} key='btn-back'>
                                <Link to={`/company/staff/need-approve`}>
                                    <Button type="default"
                                        icon={<FontAwesomeIcon icon={faBackspace} />}
                                    >&nbsp;{t('hr:back')}</Button>
                                </Link>
                            </Col>
                        </Row>
                    </Form>
                </Col>
                <Col xs={24} sm={24} md={24} lg={11} xl={11} className={window.innerWidth < screenResponsive  ? 'card mt-3 p-2' : 'card ml-3'}>
                    <PageHeader 
                        title={t('hr:update')}
                    />
                    <Divider className="m-0 mb-2" />
                    {
                        this.state.srcAvatar ? 
                        <Image className='staff_image' width={64} height={64} preview={true} src={ MEDIA_URL_HR + '/' + this.state.srcAvatar } />
                        : <Avatar size={64} icon={<UserOutlined />} />
                    }
                    <Form 
                        className="ant-advanced-search-form mt-2"
                        layout="vertical" 
                        ref={this.formUpdate}
                        onFinish={this.handleFormSubmit.bind(this)}>
                        <StaffInformation 
                            filedUpdate={this.state.filedUpdate} 
                            districts={this.state.districts}
                            wards={this.state.wards}
                            onChangeCity={(city_id) => {
                                this.formUpdate.current.setFieldsValue({ district_id: null, ward_id: null })
                                this.getDistrictByCity(city_id)
                            }}
                            onChangeDistrict={district_id => {
                                this.formUpdate.current.setFieldsValue({ ward_id: null })
                                this.getWardByDistrict(district_id)
                            }}
                        />
                        <Row gutter={24} className="pt-3 pb-3">
                            <Col span={12} key='bnt-submit' >
                                {
                                    checkPermission('hr-staff-need-approve-update') ?
                                        <Button type="primary" icon={<FontAwesomeIcon icon={faSave} />} htmlType="submit"
                                            loading={this.state.loading}
                                        >
                                            &nbsp;{t('hr:save')}
                                        </Button>
                                    : ''
                                }
                            </Col>
                        </Row>
                    </Form>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffNeedApproveForm));