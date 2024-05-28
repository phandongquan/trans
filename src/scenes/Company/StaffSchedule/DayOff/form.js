import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { Row, Col, Form, DatePicker, Button, Divider, Spin, Card, Calendar, Badge, Input, Select } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Dropdown from '~/components/Base/Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSleigh } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import BackButton from '~/components/Base/BackButton';
import { showNotify } from '~/services/helper';
import { createDayOff, detailDayOff, updateDayOff } from '~/apis/company/staffSchedule/DayOff';
export class DayOffForm extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.selectRef = React.createRef();
        this.state = {
            loading: false,
            data: {},
        }
    }
    async componentDidMount(){
        let { id } = this.props.match.params;
        if (id) {
            this.getDetail(id);
        }
    }
    async getDetail(id) {
        let response = await detailDayOff(id);
        if (response.status) {
            this.setState({ data: response.data })
            let dataForm = response.data 
            dataForm = {
                ...dataForm , 
                end : dayjs(dataForm.end),
                start : dayjs(dataForm.start)
            }
            this.formRef.current.setFieldsValue(dataForm)

        } else {
            showNotify('Notification', response.message, 'error')
        }
    }
    submitForm(){
        this.setState({loading: true})
        let { id } = this.props.match.params;
        let values = this.formRef.current.getFieldsValue()
        let data = {
            ...values,
            start : dayjs(values?.start).format('YYYY-MM-DD'),
            end : dayjs(values?.end).format('YYYY-MM-DD')
        }
        let xhr;
        // let formData = convertToFormData()
        if (id) {
            // formData.append(`_method`, 'PUT')
            data = {
                ...data,
                _method : 'PUT'
            }
            xhr = updateDayOff(id, data);
        }
        else
            xhr = createDayOff(data);

        xhr.then(response => {
            this.setState({ loading: false })
            if (response.status) {
                showNotify('Notification', 'Save Success!')
            } else {
                showNotify('Notification', response.message, 'error')
            }
        })

    }
    render() {
        let { t, baseData: { departments, positions, majors } } = this.props;

        return (
            <div>
                
                <PageHeader title={'Add new day off'} />
                <Col span={16}>
                    <Row className='pl-3 pr-3 mb-3' style={{ boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)', background: '#fff' }}>
                        <Form ref={this.formRef}
                            name="day-off-schedule-form"
                            className="p-3"
                            layout="vertical"
                            style={{ width: "100%" }}
                            onFinish={this.submitForm.bind(this)}
                        >
                            <PageHeader title={<span style={{ color: '#29649b' }}>Day Off</span>} />
                            <Row gutter={[12, 0]}>
                                <Col span={6}>
                                    <Form.Item name="name" label={<strong>Name</strong>}>
                                        <Input placeholder={t('Name')} />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item name="start" label={<strong>Start Date</strong>}>
                                        <DatePicker />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item name="end" label={<strong>End Date</strong>}>
                                        <DatePicker />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Divider className='mt-0' />
                            <PageHeader title={<span style={{ color: '#29649b' }}>Day Off</span>} />
                            <Row gutter={[12, 0]}>
                                <Col span={6}>
                                    <Form.Item name="major_id" label={<strong>Major</strong>}>
                                        <Dropdown  datas={majors} defaultOption="-- All Major --" mode='multiple'/>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item name="department_id" label={<strong>Departments</strong>}>
                                        <Dropdown datas={departments} defaultOption="-- All Department --"mode='multiple' />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item name="position_id" label={<strong>Position</strong>} >
                                        <Dropdown datas={positions} defaultOption="-- All Position --" mode='multiple'/>
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="note" label={<strong>Note</strong>}>
                                        <Input.TextArea autoSize={{ minRows: 5 }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                        </Form>
                        <Divider className='mt-0' />
                        <Row className=' mb-3 w-100'>
                            <Col span={12}>
                                <Button
                                    type="primary"
                                    icon={<FontAwesomeIcon icon={faSave} />}
                                    // htmlType="submit"
                                    loading={this.state.loading}
                                    onClick={() => this.submitForm()}
                                >
                                    &nbsp;{t('Save')}
                                </Button>
                            </Col>

                            <Col span={12} key='btn-back' style={{ textAlign: "right" }}>
                                <BackButton url={`/company/staff-schedule/day-off`} />
                            </Col>
                        </Row>
                    </Row>
                </Col>

            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(DayOffForm)