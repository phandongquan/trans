import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Form, Row, Col, Input, DatePicker, } from 'antd';
import Dropdown from '~/components/Base/Dropdown';
import { staffStatus, religions, certificates, genders, banks } from '~/constants/basic';
import './config/staffInfo.css';

class StaffInformation extends Component {

    render() {
        let { t, filedUpdate, baseData: { cities } } = this.props;
        let disabled = false;
        if (typeof filedUpdate == 'undefined') {
            filedUpdate = [];
            disabled = true;
        } 
        let styleSheet = { borderColor: '#d55d5d' }
        return (
            <>
                <Row gutter={[12, 0]}>
                    <Col xs={24} sm={24} md={24} lg={16} xl={16}>
                        <Form.Item name="staff_name" label={t('Staff Name')} >
                            <Input disabled={disabled} style={filedUpdate.includes('staff_name') ? styleSheet : {}} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="contract_number" label={t('Contract No.')}>
                            <Input disabled={disabled} style={filedUpdate.includes('contract_number') ? styleSheet : {}} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[12, 0]}>
                    <Col  xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="staff_phone" label={t('Staff Phone')} hasFeedback rules={[
                                            {
                                                required: true,
                                                message: t('Please input ID number!')
                                            },
                                            {
                                                pattern: new RegExp(/(0[1-9]{1})+([0-9]{8})\b/g),
                                                message: t('Invalid ID number!')
                                            }
                                        ]}>
                            <Input disabled={disabled} style={filedUpdate.includes('staff_phone') ? styleSheet : {}} />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="staff_email" label={t('Staff Email')}>
                            <Input disabled={true} style={filedUpdate.includes('staff_email') ? styleSheet : {}} />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="persional_email" label={t('Staff Persional Email')}
                            rules={[{ required: true, message: t('Please input staff email!') },
                            {
                                pattern: new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
                                message: t('Invalid Email!')
                            }
                            ]}
                        >
                            <Input disabled={disabled} style={filedUpdate.includes('persional_email') ? styleSheet : {}} />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="code" label={t('Staff Code')}>
                            <Input disabled={true} style={filedUpdate.includes('code') ? styleSheet : {}} />
                        </Form.Item>
                    </Col>

                    <Col  xs={24} sm={24} md={24} lg={8} xl={16}>
                        <Form.Item name="staff_title" label={t('Title')}>
                            <Input disabled={disabled} style={filedUpdate.includes('staff_title') ? styleSheet : {}} />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="cmnd" label={t('ID Number')} hasFeedback rules={[
                                            {
                                                required: true,
                                                message: t('Please input ID number!')
                                            },
                                            {
                                                pattern: new RegExp(/^[0-9]{9,12}$/),
                                                message: t('Invalid ID number!')
                                            }
                                        ]}>
                            <Input disabled={disabled} style={filedUpdate.includes('cmnd') ? styleSheet : {}} />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="date_issue_card" label={t('Date Issue Card')}>
                            <DatePicker
                                disabled={disabled}
                                style={filedUpdate.includes('date_issue_card') ? { borderColor: '#d55d5d' ,width: '100%' } : {width: '100%'} } />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="place_card" label={t('Place Card')}>
                            <Dropdown
                                datas={cities}
                                defaultOption="-- All Place --"
                                disabled={disabled}
                                className={filedUpdate.includes('place_card') ? 'field_need_update' : ''}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="cmnd2" label={t('ID Number 2')} hasFeedback rules={[
                                            {
                                                required: true,
                                                message: t('Please input ID number!')
                                            },
                                            {
                                                pattern: new RegExp(/^[0-9]{9,12}$/),
                                                message: t('Invalid ID number!')
                                            }
                                        ]}>
                            <Input disabled={disabled} style={filedUpdate.includes('cmnd2') ? { borderColor: '#d55d5d' } : {}} />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="date_issue_card_2" label={t('Date Issue Card 2')}>
                            <DatePicker
                                disabled={disabled}
                                style={filedUpdate.includes('date_issue_card_2') ? { borderColor: '#d55d5d',width: '100%'  } : { width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="place_card_2" label={t('Place Card 2')}>
                            <Dropdown
                                datas={cities}
                                defaultOption="-- All Place --"
                                disabled={disabled}
                                className={filedUpdate.includes('place_card_2') ? { borderColor: '#d55d5d' } : ''}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="staff_address" label={t('Adress')}>
                            <Input disabled={disabled} style={filedUpdate.includes('staff_address') ? styleSheet : {}} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="temporary_residence_address" label={t('Temporary Address')}>
                            <Input disabled={disabled} style={filedUpdate.includes('temporary_residence_address') ? styleSheet : {}} />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="city_id" label={t('Temporary City')}>
                            <Dropdown
                                datas={cities}
                                defaultOption="-- All Temporary City --"
                                disabled={disabled}
                                className={filedUpdate.includes('city_id') ? 'field_need_update' : ''}
                                onChange={city_id => this.props.onChangeCity(city_id)}
                            />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="district_id" label={t('Temporary District')} >
                            <Dropdown 
                                disabled={disabled}
                                className={filedUpdate.includes('district_id') ? 'field_need_update' : ''}
                                datas={this.props.districts} 
                                defaultOption="-- All Temporary District --"
                                onChange={district_id => this.props.onChangeDistrict(district_id)}
                            />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="ward_id" label={t('Temporary Ward')} >
                            <Dropdown 
                                disabled={disabled}
                                className={filedUpdate.includes('ward_id') ? 'field_need_update' : ''}
                                datas={this.props.wards} 
                                defaultOption="-- All Temporary Ward --" 
                            />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={12} xl={12}>
                        <Form.Item name="bank_account" label={t('Bank Account')}>
                            <Input disabled={disabled} style={filedUpdate.includes('bank_account') ? styleSheet : {}} />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={12} xl={12}>
                        <Form.Item name="bank_name" label={t('Bank Name')}>
                            <Dropdown  disabled={disabled}  datas={banks} style={filedUpdate.includes('bank_name') ? styleSheet : {}}  defaultOption="-- All Bank --" />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={12} xl={12}>
                        <Form.Item name="staff_dob" label={t('Date Birth')}>
                            <DatePicker placeholder={t('Date Birth')}
                                disabled={disabled}
                                style={filedUpdate.includes('staff_dob') ? { borderColor: '#d55d5d', width: '100%' } : { width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={12} xl={12}>
                        <Form.Item name="birth_place" label={t('Place Birth')} style={{ borderColor: 'red' }}>
                            <Dropdown
                                datas={cities}
                                defaultOption="--- All Place ---"
                                disabled={disabled}
                                className={filedUpdate.includes('birth_place') ? 'field_need_update' : ''}
                            />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="nation" label={t('Nation')}>
                            <Input disabled={disabled} style={filedUpdate.includes('nation') ? styleSheet : {}} />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="religion" label={t('Religion')}>
                            <Dropdown
                                datas={religions}
                                defaultOption="-- All Religion --"
                                disabled={disabled}
                                className={filedUpdate.includes('religion') ? 'field_need_update' : ''}
                            />
                        </Form.Item>
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="degree_certificate" label={t('Degree Certificate')}>
                            <Dropdown
                                takeZero={false}
                                datas={certificates}
                                defaultOption="-- All Certificate --"
                                disabled={disabled}
                                className={filedUpdate.includes('degree_certificate') ? 'field_need_update' : ''}
                            />
                        </Form.Item>
                    </Col>
                    <Col  xs={12} sm={12} md={12} lg={8} xl={8}>
                        <Form.Item name="gender" label={t('Gender')}>
                            <Dropdown
                                datas={genders}
                                defaultOption="-- All Gender --"
                                disabled={disabled}
                                className={filedUpdate.includes('gender') ? 'field_need_update' : ''}
                            />
                        </Form.Item>
                    </Col>
                    <Col  xs={12} sm={12} md={12} lg={8} xl={8}>
                        <Form.Item name="staff_status" label={t('Status')}>
                            <Dropdown
                                datas={staffStatus}
                                defaultOption="-- All Status --"
                                disabled={disabled}
                                className={filedUpdate.includes('staff_status') ? 'field_need_update' : ''}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item name="note" label={t('Note')}>
                            <Input disabled={disabled} style={filedUpdate.includes('note') ? styleSheet : {}} />
                        </Form.Item>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffInformation));