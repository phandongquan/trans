import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Row, Col, Input, Form, Divider, DatePicker, Space , Popconfirm, Image, Checkbox } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBackspace } from '@fortawesome/free-solid-svg-icons';
import { detail as detailStaff, update as updateStaff, create as createStaff, clearUp as apiClearUp , resetPass } from '~/apis/company/staff';
import { Link } from 'react-router-dom';
import { showNotify, parseBitwiseValues, redirect, getURLHR, checkPermission } from '~/services/helper';
import { staffStatus, salaryModes, banks, religions, certificates, genders, reasonInActive, brandPG, typeRelevance } from '~/constants/basic';
import dayjs from 'dayjs';
import Tab from '~/components/Base/Tab';
import Dropdown from '~/components/Base/Dropdown';
import CheckboxGroup from '~/components/Base/CheckboxGroup';
import Avatar from '~/components/Base/Avatar';
import tabConfig from './config/tab';
import * as apiMobile from '~/apis/company/mobile';
import { ClearOutlined, ReloadOutlined } from '@ant-design/icons';
import { WorkType, screenResponsive } from '~/constants/basic';
import { MEDIA_URL_HR } from '~/constants';
import { list as apiListSubMajors } from '~/apis/major'
class StaffFrom extends Component {

    /**
     *
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            salaryModeList: [],
            avatar: '',
            districts: [],
            wards: [],
            staff: null,
            visibleReason : 1,
            imgCCCDs: [],
            idMarjor : '',
            relevanceModeList : [],
            datasSubMajor : []
        };
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        /**
         * @set form default value
         */
        this.formRef.current.setFieldsValue({
            staff_status: 1
        });

        let { id } = this.props.match.params;
        const { t } = this.props;
        if (id) {
            let message = '';
            let xhr = detailStaff(id);

            xhr.then((response) => {
                if (response.status) {
                    let { staff } = response.data;
                    /**
                     * @case update and staff not found
                     * @redirect staff list
                     */                   

                    if (!staff) {
                        message = 'Staff not found!';
                        this.backToStaffList(message);
                        return;
                    }
                  
                    if(staff.specializeds) {
                        let dataCCCDID = staff.specializeds.find(key => key.type == 1)
                        let imgCCCDs = dataCCCDID?.images || [];
                        this.setState({imgCCCDs})
                    }

                    this.setState({ staff })
                    let formData = {};
                    Object.keys(staff).map(key => {
                        if (['staff_hire_date', 'date_issue_card', 'date_issue_tax', 'date_out_company', 'staff_dob', 'date_issue_card_2','date_contract'].includes(key)) {
                            formData[key] = staff[key] ? dayjs(staff[key] * 1000) : null;
                        } 
                        else if(key == 'work_type') {
                            formData[key] = staff[key]
                        }
                        else if( key == 'staff_title'){
                            if(staff[key]) {
                                formData[key] = staff[key].split(',')
                            }
                        }
                        else{
                            formData[key] = staff[key] ? staff[key] : null;
                        }
                        
                    });
                    this.setState({idMarjor : formData.major_id})
                    this.getListSubMajor()
                    this.formRef.current.setFieldsValue(formData);
                    /**
                     * Parse bitwise to array
                     */
                    let salaryModeValues = parseBitwiseValues(salaryModes, staff.salary_mode);
                    let relevanceModeValues = parseBitwiseValues(typeRelevance, staff.relevances);
                    this.setState({
                        visibleReason : (staff.staff_status == 1 || !staff['date_out_company'] ) ? 1 : 2 , // nếu status active hoặc nếu có date leave
                        salaryModeList: salaryModeValues, 
                        avatar: staff.avatar.replace('https://media.inshasaki.com/', 'https://wshr.hasaki.vn/'),
                        relevanceModeList : relevanceModeValues
                     });

                    /**
                     * Get districts by city_id
                     */
                    if(staff.city_id) {
                        this.getDistrictByCity(staff.city_id)
                    }

                    /**
                     * Get wards by district_id
                     */
                     if(staff.district_id) {
                        this.getWardsByDistrict(staff.district_id)
                    }                                                  

                } else {
                    message = t('server_error');
                    // this.backToStaffList(message);
                    return;
                }
            }).catch(e => {
                message = t('server_error');
                this.backToStaffList(message);
                return;
            });
        }

    }
    async getListSubMajor(){
        let params = {
            parent_id : this.state.idMarjor,
            status : 1 // active
        }
        let response = await apiListSubMajors(params)
        if(response.status){
            this.setState({ datasSubMajor : response.data })
        }
    }
    /**
     * Redirect to Staff List
     * @param {*} message 
     */
    backToStaffList(message = '') {
        let { t } = this.props;
        if (message) {
            showNotify(t('hr:notification'), t('message'), 'error');
        }
        redirect('/company/staff');
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
     * @event submitForm
     */
    submitForm(values) {
        let { t } = this.props;
        let data = {
            // Format datetime before submit
            staff_hire_date: this.convertUnixTimestamp(values.staff_hire_date),
            date_issue_tax: this.convertUnixTimestamp(values.date_issue_tax),
            date_issue_card: this.convertUnixTimestamp(values.date_issue_card),
            date_out_company: this.convertUnixTimestamp(values.date_out_company),
            staff_dob: this.convertUnixTimestamp(values.staff_dob),
            date_issue_card_2 : this.convertUnixTimestamp(values.date_issue_card_2),
            salary_mode: this.state.salaryModeList ,
            date_contract : this.convertUnixTimestamp(values.date_contract),
            relevances : this.state.relevanceModeList
        };
        if(Array.isArray(values.staff_title)){
            values.staff_title = (values.staff_title).toString()
        }
        data = { ...values, ...data };
        let { id } = this.props.match.params;
        let xhr;
        let message = '';
        if (id) {
            xhr = updateStaff(id, data);
            message = t('hr:updated');
        } else {
            xhr = createStaff(data);
            message = t('hr:created');
        }
        xhr.then((response) => {
            if (response.status) {
                showNotify(t('hr:notification'), message);
            } else {
                showNotify(t('hr:notification'), response.message, 'error');
            }
        });
    }

    /**
     * 
     * @param {*} e 
     */
    onChangeSalaryMode(values) {
        this.setState({ salaryModeList: values });
    }
    /**
     * 
     * @param {*} e 
     */
    onChangeRelevanceMode(values) {
        console.log(values)
        this.setState({ relevanceModeList: values });
    }

    /**
     * Get district by city
     * @param {*} city_id 
     */
    async getDistrictByCity(city_id) {
        let response = await apiMobile.getDistrictByCity({ city_id });
        if(response.status) {
            this.setState({ districts: response.data })
        }
    }

    /**
     * Get ward by districtId
     * @param {*} district_id 
     */
     async getWardsByDistrict(district_id) {
        let response = await apiMobile.getWardByDistrict({ district_id });
        if(response.status) {
            this.setState({ wards: response.data })
        }
    }

    /**
     * Clear up staff
     * @param {*} staff_id 
     */
    clearUpStaff = async (staff_id) => {
        const { t } = this.props;
        this.setState({ loading: true })
        let response = await apiClearUp(staff_id);
        this.setState({ loading: false });
        if(response.status) {
            showNotify(t('hr:notification'), 'Success');
        } else {
            showNotify(t('hr:notification'), response.message, 'error')
        }
    }
    async resetPassword (){
        const { t } = this.props;
        let params = {
            staff_email : this.state.staff.staff_email , 
            new_password : 'hasaki123@'
        }
        let response = await resetPass(params)
        if(response.status){
            showNotify(t('hr:notification'), 'Bạn đã thay đổi mật khẩu hasaki123@ thành công !')
        }else{
            showNotify(t('hr:notification') , response.message , 'error')
        }
    }
    /**
     * @render
     */
    render() {
        let { t, match, baseData: { departments, divisions, majors, positions, locations, cities , brands = [] } } = this.props;
        let id = match.params.id;

        let brandsFormat = []
        brands.map(b => {
            brandsFormat.push({ id: b.brand_id, name: b.brand_name })
        })
        
        let subTitle = '';
        let disableField = false;
        if (id) {
            subTitle = t(':updated');
            disableField = true;
        } else {
            subTitle = t('hr:add_new');
        }

        const constTablist = tabConfig(id,this.props);       
        return (
            <div>
                <PageHeader
                    title={t('hr:staff')}
                    subTitle={subTitle}
                />
                <Row className="card p-3 mb-3 pt-0 tab_common">
                    <Tab tabs={constTablist} />
                </Row>
                <Form
                    ref={this.formRef}
                    name="upsertStaffForm"
                    className="ant-advanced-search-form"
                    layout="vertical"
                    onFinish={this.submitForm.bind(this)}
                >
                    <Row>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                            <Row className='card mr-1 p-3 pt-0 mb-3'>
                                <PageHeader
                                    title={t('hr:staff_information')}
                                    className="p-0"
                                />
                                <Divider className="m-0 mb-2" />
                                <Row gutter={[12, 0]}>
                                    <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                                        <Form.Item name="staff_name" label={t('hr:staff_name')} hasFeedback
                                            rules={[{ required: true, message: t('hr:input_staff_name') }
                                                ,
                                            {
                                                pattern: new RegExp(/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s\W|_]{5,100}$/),
                                                message: t('hr:invalid') + ' ' + t('hr:name')
                                            }]}>
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name="contract_number" label={t('hr:control_no')}>
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={[12, 0]}>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name="staff_phone" label={t('hr:staff_phone')} hasFeedback
                                            rules={[
                                                { required: true, message: t('hr:input_staff_phone') }
                                                ,
                                                {
                                                    pattern: new RegExp(/(0[1-9]{1})+([0-9]{8})\b/g),
                                                    message: t('hr:invalid_id_number')
                                                }
                                                ]}>
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={9} xl={9}>
                                        <Form.Item name="staff_email" label={t('hr:staff_email')} hasFeedback
                                            rules={[{ required: true, message: t('hr:input_staff_email') },
                                            {
                                                pattern: new RegExp(/^(?=.{1,50}$)(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@hasaki.vn$/),
                                                message: t('Invalid Email!')
                                            }
                                            ]}>
                                            <Input disabled={disableField} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={9} xl={9}>
                                        <Form.Item name="persional_email" label={t('hr:persional_email')}
                                            rules={[
                                            {
                                                pattern: new RegExp(/^(?=.{1,50}$)(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
                                                message: t('Invalid Email!')
                                            }
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name="code" label={t('hr:staff_code')} 
                                        rules={[
                                        {
                                            pattern: new RegExp(/^[0-9]{1,6}$/),
                                            message: t('Invalid code!')
                                        }
                                        ]}
                                        >
                                            <Input disabled={disableField} />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                                        <Form.Item name="staff_title" label={t('hr:title') + '/' + t('hr:brand')} >
                                            {
                                                this.state.idMarjor == 61 ? // nếu staff là PG 
                                                <Dropdown datas={brandsFormat} defaultOption="-- All brand --" mode='multiple'/>
                                                :
                                                <Input />
                                            }
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="cmnd" label={t('id_number')} hasFeedback rules={[
                                            {
                                                required: true,
                                                message: t('hr:input_id_number')
                                            },
                                            {
                                                pattern: new RegExp(/^[0-9]{9,12}$/),
                                                message: t('hr:invalid_id_number')
                                            }
                                        ]}>
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="date_issue_card" label={t('hr:date_issue_card')}>
                                            <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current > dayjs().startOf('day')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="place_card" label={t('hr:place_card')}>
                                            <Dropdown datas={cities} defaultOption={t('hr:all_place')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="cmnd2" label={t('hr:id_number')+ t('2')} hasFeedback rules={[
                                            {
                                                pattern: new RegExp(/^[0-9]{9,12}$/),
                                                message: t('hr:invalid_id_number')
                                            }
                                        ]}>
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="date_issue_card_2" label={t('hr:date_issue_card') + ' 2'}>
                                            <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current > dayjs().startOf('day')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="place_card_2" label={t('hr:place_card') + ' 2'}>
                                            <Dropdown datas={cities} defaultOption={t('hr:all_place')} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item name="staff_address" label={t('hr:address')} hasFeedback rules={[
                                            {
                                                pattern: new RegExp(/^.{1,100}$/),
                                                message: t('Do not more than 100 characters!')
                                            }
                                        ]} >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item name="temporary_residence_address" label={t('hr:temporary_address')} hasFeedback rules={[
                                            {
                                                pattern: new RegExp(/^.{1,100}$/),
                                                message: t('Do not more than 100 characters!')
                                            }
                                        ]}>
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="city_id" label={t('hr:temporary_city')}>
                                            <Dropdown 
                                                datas={cities} 
                                                defaultOption={t('hr:all_temporary_city')}	
                                               
                                                onChange={city_id => {
                                                    this.formRef.current.setFieldsValue({ district_id: null, ward_id: null })
                                                    this.getDistrictByCity(city_id)
                                                }} 
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="district_id" label={t('hr:temporary_district')} >
                                            <Dropdown 
                                                datas={this.state.districts} 
                                                defaultOption={t('hr:all_temporary_district')}
                                                onChange={district_id => {
                                                    this.formRef.current.setFieldsValue({ ward_id: null })
                                                    this.getWardsByDistrict(district_id)
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="ward_id" label={t('hr:temporary_ward')} >
                                            <Dropdown datas={this.state.wards} defaultOption={t('hr:all_temporary_ward')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item name="staff_dob" label={t('hr:date_birth')}>
                                            <DatePicker style={{ width: '100%' }} placeholder={t('hr:date_birth')} disabledDate={(current) => current && current > dayjs().startOf('day')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item name="birth_place" label={t('hr:place_birth')}>
                                            <Dropdown datas={cities} defaultOption={t('hr:all_place')} />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="nation" label={t('hr:nation')} hasFeedback rules={[
                                            {
                                                pattern: new RegExp(/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s\W|_]{1,20}$/),
                                                message: t('Invalid nation!')
                                            }
                                        ]}>
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="religion" label={t('hr:religion')}>
                                            <Dropdown datas={religions} defaultOption={t('hr:all_religion')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="degree_certificate" label={t('hr:degree')}>
                                            <Dropdown datas={certificates} defaultOption={t('hr:all_certificate')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="gender" label={t('hr:gender')}>
                                            <Dropdown datas={genders} defaultOption={t('hr:all_gender')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="staff_status" label={t('hr:status')}>
                                            <Dropdown datas={staffStatus} defaultOption={t('hr:all_status')} 
                                            onChange={v => this.setState({visibleReason : v})}
                                             />
                                        </Form.Item>
                                    </Col>
                                    {
                                        this.state.visibleReason == 2 ?
                                        <Col span={8}>
                                            <Form.Item label={t('hr:reason')}
                                            hasFeedback 
                                            rules={[{required: true, message: t('Please select reason') }]}
                                            name="inactive_reason"
                                            >
                                                <Dropdown datas={reasonInActive} defaultOption="-- All Reasons --" />
                                            </Form.Item>
                                        </Col>
                                        :
                                        []
                                    }

                                    <Col span={24}>
                                        <Form.Item name="note" label={t('hr:note')} hasFeedback rules={[
                                            {
                                                pattern: new RegExp(/^.{1,300}$/),
                                                message: t('Do not more than 300 characters!')
                                            }
                                        ]} >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    
                                </Row>
                            </Row>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                            <Row className='card ml-1 p-3 pt-0 mb-3'>
                                <PageHeader
                                    title={t('hr:working_information')}
                                    className="p-0"
                                />
                                <Divider className="m-0 mb-2" />
                                <Row >
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="position_id" label={t('hr:position')}>
                                            <Dropdown datas={positions} defaultOption={t('hr:all_position')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} key='deparment'>
                                        <Form.Item name="staff_dept_id" label={t('hr:dept')}>
                                            <Dropdown datas={departments}
                                                defaultOption={t('hr:all_department')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="division_id" label={t('hr:division')}>
                                            <Dropdown datas={divisions} defaultOption={t('hr:all_division')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} key='major'>
                                        <Form.Item name="major_id" label={t('hr:major')}>
                                            <Dropdown datas={majors} 
                                            defaultOption={t('hr:all_major')} 
                                            onChange={v => this.setState({idMarjor : v} , () => {
                                                this.formRef.current.resetFields(['sub_major_id'])
                                                this.getListSubMajor()
                                            })} 
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} key='sub_major'>
                                        <Form.Item name="sub_major_id" label={t('hr:sub_major')}>
                                            <Dropdown datas={this.state.datasSubMajor} defaultOption={t('hr:all_sub_major')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="staff_loc_id" label={t('hr:working_location')}>
                                            <Dropdown datas={locations} defaultOption={t('hr:all_location')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name={'work_type'}  label={t('hr:work_type')}>
                                            <Dropdown datas={WorkType} defaultOption={t('hr:all_type')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row >
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item
                                            name="staff_hire_date"
                                            label={t('hr:date_joined')}
                                            rules={[{required: true, message: t('Please select date join!') }]}
                                            >
                                            <DatePicker placeholder={t('hr:date_joined')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="date_contract" label={t('hr:date_contract')}>
                                            <DatePicker placeholder={t('hr:date_contract')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                                        <Form.Item name="date_out_company" label={t('hr:date_leave')}>
                                            <DatePicker placeholder={t('hr:date_leave')} 
                                            onChange={v => this.setState({visibleReason : 2})} // nhập date leave cho nhập reason
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={[12, 0]}>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="avatar" label={t('hr:avatar')}
                                        extra={t('hr:support_file_png_jpg_jpeg') + "." + t('hr:max_2mb')}
                                        >
                                            <Avatar
                                                action='mobile/staff/update-avatar'
                                                staff_id={id}
                                                url={this.state.avatar}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={16} xl={16}>
                                        <Form.Item label={t('hr:cccd')}>
                                            {this.state.imgCCCDs.map(img => <div className='block_list_cccd'>
                                                <Image src={getURLHR(img)} width="100px" height="100px" />
                                            </div>)}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                
                            </Row>
                            <Row className='card ml-1 p-3 mt-1 pt-0  mb-3'>
                                <PageHeader
                                    title={t('hr:info_tax_insurance')}
                                    className="p-0"
                                />
                                <Divider className="m-0 mb-2" />
                                <Row gutter={[12, 0]}>
                                    <Col xs={24} sm={24} md={24} lg={16} xl={16}>
                                        <Form.Item name="tax_code" label={t('hr:tax_code')} hasFeedback rules={[
                                            {
                                                pattern: new RegExp(/^[0-9]{10,11}$/),
                                                message: t('Invalid tax code!')
                                            }
                                        ]}  >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="date_issue_tax" label={t('hr:date_issue_tax')}>
                                            <DatePicker placeholder={t('hr:date_issue_tax')} disabledDate={(current) => current && current > dayjs().startOf('day')}/>
                                        </Form.Item>
                                    </Col>

                                </Row>
                                <Row gutter={[12, 0]}>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item
                                            name="social_insurance_number"
                                            label={t('hr:social_insurance')}  hasFeedback rules={[
                                                {
                                                    pattern: new RegExp(/^[0-9]{10}$/),
                                                    message: t('Invalid social insurance!')
                                                }
                                            ]} >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="people_circumtance_number" label={t('hr:family_circumstance')}>
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                                        <Form.Item name="date_issue_tax" label={t('hr:date_issue_card')}>
                                            <DatePicker placeholder={t('hr:date_issue_card')} disabledDate={(current) => current && current > dayjs().startOf('day')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Row>
                            <Row className='card ml-1 p-3 mt-1 pt-0  mb-3'>
                                <PageHeader
                                    title={t('hr:info_banking')}
                                    className="p-0"
                                />
                                <Divider className="m-0 mb-2" />
                                <Row gutter={12}>
                                    <Col span={24}>
                                        <Form.Item name="bank_account" label={t('hr:bank_account')} hasFeedback rules={[
                                                {
                                                    pattern: new RegExp(/^[0-9]{1,20}$/),
                                                message: t('hr:invalid_bank_account')
                                                }
                                            ]} >
                                            <Input />
                                        </Form.Item>
                                    </Col>

                                </Row>
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={10} xl={10}>
                                        <Form.Item name="bank_name" label={t('hr:bank_name')}>
                                            <Dropdown datas={banks} defaultOption={t('hr:all_bank')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={14} xl={14}>
                                        <Form.Item name="bank_branch" label={t('hr:bank_branch')} hasFeedback rules={[
                                                {
                                                    pattern: new RegExp(/^.{1,50}$/),
                                                    message: t('Do not more than 50 characters!')
                                                }
                                            ]} >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Row>
                            {/* <Row className='card ml-1 p-3 mt-1'>
                                <PageHeader
                                    title={t('Level')}
                                    className="pt-0"
                                />
                                <Row gutter={12}>
                                    <Col span={12}>
                                        <Form.Item name="level" label={t('Level')}>
                                            <Dropdown datas={positions} defaultOption="-- All Position --" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="is_approved" label={t('Is Approved?')}>
                                            <Dropdown datas={positions} defaultOption="-- All Position --" />
                                        </Form.Item>
                                    </Col>

                                </Row>
                            </Row> */}
                        </Col>
                    </Row>
                    <Row  >
                        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} className='card p-3'>
                            <PageHeader
                                title={t('hr:relevance_profile')}
                                className="p-0"
                            />
                            <Divider className="m-0 mb-2" />
                            <Row gutter={[12, 0]}>
                                {/* <Form.Item name={'abc'} > */}
                                    <Checkbox.Group style={{ width: '100%' }}>
                                        <Row gutter={[12, 0]}>
                                            <CheckboxGroup options={typeRelevance} value={this.state.relevanceModeList} onChange={this.onChangeRelevanceMode.bind(this)} />
                                        </Row>
                                    </Checkbox.Group>
                                {/* </Form.Item> */}
                            </Row>
                        </Col>
                    </Row>
                    <Row className='card mt-1 p-3 pt-1  mb-4' style={{ flexDirection: 'row' }}>
                        <Col span={24}>
                            <CheckboxGroup options={salaryModes} value={this.state.salaryModeList} onChange={this.onChangeSalaryMode.bind(this)} />
                        </Col>
                        <Divider className="mt-2 mb-2" />
                        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                            {
                                checkPermission('hr-staff-update') ?
                                    <Button type="primary"
                                        icon={<FontAwesomeIcon icon={faSave} />}
                                        htmlType="submit"
                                        loading={this.state.loading}
                                        onClick={this.enterLoading.bind(this)}
                                        className='mr-2 mb-2'
                                    >
                                        &nbsp;{t('hr:save')}
                                    </Button>
                                    : ""
                            }
                            {
                                checkPermission('hr-staff-update') ?
                                    <Button
                                        icon={<ClearOutlined />}
                                        loading={this.state.loading}
                                        onClick={() => this.clearUpStaff(id)}
                                        danger
                                        className='mr-2 mb-2'
                                    >
                                        &nbsp;{t('hr:clear_up')}
                                    </Button>
                                    : ""
                            }
                            {
                                checkPermission('hr-staff-update') ?
                                    <Popconfirm
                                        title={t('hr:are_reset_password')}
                                        onConfirm={() => this.resetPassword()}
                                        // onCancel={cancel}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button
                                            icon={<ReloadOutlined />}
                                            loading={this.state.loading}
                                            // onClick={() => this.resetPassword()}
                                            danger
                                        >
                                            &nbsp;{t('hr:reset_password')}
                                        </Button>
                                    </Popconfirm>
                                    : ""
                            }
                                </Col>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} key='btn-back' style={{ textAlign: "right" }}>
                            <Link to={`/company/staff/list`}>
                                <Button type="default"
                                    icon={<FontAwesomeIcon icon={faBackspace} />}
                                >&nbsp;{t('hr:back')}</Button>
                            </Link>
                        </Col>
                    </Row>
                </Form>
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
export default connect(mapStateToProps)(withTranslation()(StaffFrom));