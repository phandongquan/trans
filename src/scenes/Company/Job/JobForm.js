import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Form, Row, Col, Input, InputNumber, Spin, DatePicker, Divider, Button, Table } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import Dropdown from '~/components/Base/Dropdown';
import { educations, emptyDate, genders, dateFormat, jobUnit, screenResponsive } from '~/constants/basic';
import BackButton from '~/components/Base/BackButton';
import { create as apiCreate, update as apiUpdate, detail as apiDetail, getJobStatus as apiGetJobStatus } from '~/apis/company/job';
import { getList } from '~/apis/company/job/basic';
import { convertToFormData, showNotify, timeFormatStandard } from '~/services/helper';
import Tab from '~/components/Base/Tab';
import tabList from '~/scenes/Company/Job/config/tab';
import Editor from '~/components/Base/Editor';

class JobFrom extends Component {

    /**
     *
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            candidates: [],
            requirement: '',
            description: '',
            benefit: '',
            arrStatus: [],
            cities: [],
            types: []
        }
    }
    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getJobStatus();
        this.getBasics();
        let { id } = this.props.match.params;
        this.formRef.current.setFieldsValue({
            unit: 'vnd',
            gender: 0,
            status: 0,
            education: 1,
        })

        if (id) {
            this.getDetailJob(id)
        }
    }

    async getJobStatus() {
        let res = await apiGetJobStatus();
        if(res.status) {
            let { data } = res;
            let result = [];
            data.map( (item, key) => {
                result.push({ id: key, name: item })
            })
            this.setState({ arrStatus: result})            
        }
    }

    async getBasics() {
        let response = await getList();
        if(response.status) {
            let { locations, types } = response.data;
            let result = [];
            Object.keys(locations).sort((key1, key2) =>{
                return key2 - key1 ? -1 : 1;
            }).map(key => result.push({ id: key, name: locations[key] }));

            this.setState({ cities: result, types })            
        }
    }

    /**
     * Get detail job
     * @param {*} id 
     */
    async getDetailJob(id) {
        let response = await apiDetail(id);
        if (response.status) {
            let { job } = response.data;

            Object.keys(job).map(key => {
                if (['date_start', 'date_end'].includes(key))
                    job[key] = (typeof job[key] !== 'undefined' && job[key] != emptyDate && job[key] != null) ? dayjs(job[key], dateFormat) : null;
                else if((key == 'locations' || key == 'work_locations') && job[key]){
                    job[key] = String(job[key]).split(',').map((item) => {
                        return item !== '0' ? Number(item) : item
                    })
                } else {
                    if(key != 'status')
                        job[key] = job[key] ? job[key] : null;
                }
            })

            this.setState({
                requirement: job.requirement,
                description: job.description,
            })
            this.formRef.current.setFieldsValue(job);
        }
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
     * @event submit Form
     * @param {*} values 
     */
    submitForm = (values) => {
        this.setState({ loading: true })
        let { t, userInfo } = this.props;
        let { id } = this.props.match.params;
        let xhr;
        let message;
        let data = {
            date_start: values.date_start ? timeFormatStandard(values.date_start, dateFormat) : null,
            date_end: values.date_end ? timeFormatStandard(values.date_end, dateFormat) : null,
        };
        data = { 
            ...values, 
            ...data,
            requirement: this.state.requirement,
            description: this.state.description,
        };  

        Object.keys(data).map( key => {
            if(data[key] === undefined || data[key] === null) {
                delete data[key]
            }
        })
        delete data.point 
        if (id) {
            let formData = convertToFormData(data);
            formData.append('_method', 'PUT');
            formData.append('updated_by', userInfo.id);
            xhr = apiUpdate(id, formData);
            message = t('Job updated!');
        } else {
            let formData = convertToFormData(data);
            formData.append('created_by', userInfo.id);
            xhr = apiCreate(formData);
            message = t('Job created!');
        }
        xhr.then((response) => {
            this.setState({ loading: false })
            if (response.status) {
                showNotify(t('Notification'), message, 'success', 2, () => {
                    if (!id) this.props.history.push("/company/job")
                });
            } else {
                showNotify(t('Notification'), response.message, 'error');
            }
        });
    }

    /**
     * @render
     */
    render() {
        let { t, match, baseData: { departments, divisions, majors , locations } } = this.props;
        let { id } = match.params;
        let subTitle;

        if (id) {
            subTitle = t('Edit job')
        } else {
            subTitle = t('Add job')
        }
        let locationsFormatName = []
        locations.map(loc => locationsFormatName.push({
            id: loc.id,
            name : loc.address
        }))
        return (
            <div id='page_job_edit'>
                <PageHeader 
                    title={t('hr:job')} 
                    subTitle={subTitle} 
                />
                <Row className={window.innerWidth < screenResponsive  ? "card pl-3 pr-3 mb-3 pb-3" : "card pl-3 pr-3 mb-3"}>
                    <Tab tabs={tabList(id)}></Tab>
                </Row>
                
                <Row className='card pl-3 pr-3'>
                    <Col span={24} className=''>
                        <Spin spinning={this.state.loading}>
                            <Form ref={this.formRef}
                                name="upsertStaffForm"
                                className="ant-advanced-search-form pt-3"
                                layout="vertical"
                                onFinish={this.submitForm.bind(this)}
                            >
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={16} xl={16} >
                                        <Form.Item
                                            name="title"
                                            label={t('hr:job_title')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('input_job_title') }]}>
                                            <Input placeholder={t('hr:job_title')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                                        <Form.Item name="code" label={t('hr:code_job')} hasFeedback
                                            rules={[
                                                {
                                                    required: true,
                                                    message: t('input_job_code')
                                                },
                                                {
                                                    pattern: new RegExp("^[a-zA-Z0-9_]*$"),
                                                    message: t('Invalid code!')
                                                }
                                            ]}>
                                            <Input placeholder={t('hr:code_job')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item label={t('hr:location')} name='locations'>
                                            <Dropdown datas={this.state.cities} defaultOption={t('hr:all_location')} mode='multiple' />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item label={t('hr:branch')} name='work_locations'>
                                            <Dropdown datas={locationsFormatName} defaultOption= {t('hr:all_branch')} mode='multiple' />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item label={t('hr:department')} name='department_id'>
                                            <Dropdown datas={departments} defaultOption= {t('hr:all_department')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item label={t('hr:sec')} name='division_id'>
                                            <Dropdown datas={divisions} defaultOption={t('hr:all_section')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item label={t('hr:major')} name='major_id'>
                                            <Dropdown datas={majors} defaultOption={t('hr:all_major')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item label={t('eduacation')} name='education'>
                                            <Dropdown datas={educations} defaultOption={t('all_education')} defaultZero />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item label={t('hr:status')} name='status' hasFeedback rules={[{ required: true, message: t('hr:please_select_status') }]}>
                                            <Dropdown datas={this.state.arrStatus} defaultOption={t('hr:all_status')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item label={t('start_date')} name='date_start'>
                                            <DatePicker style={{ width: '100%' }} format={dateFormat} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item label={t('end_date')} name='date_end'>
                                            <DatePicker style={{ width: '100%' }} format={dateFormat} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item label={t('hr:salary_unit')} name='unit' hasFeedback rules={[{ required: true }]}>
                                            <Dropdown datas={jobUnit} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item label={t('hr:salary_from')} name='salary_from' rules={[
                                            {
                                                pattern: /^(?:\d*)$/,
                                                message: t('just_number'),
                                            },
                                            {
                                                pattern: /^[\d]{0,9}$/,
                                                message: t('9_character'),
                                            },
                                        ]}>
                                            <InputNumber
                                                formatter={(value) => `VND ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                parser={(value) => value.replace(/\VND\s?|(,*)/g, "")}
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item label={t('hr:salary_to')} name='salary_to' rules={[
                                            {
                                                pattern: /^(?:\d*)$/,
                                                message: t('just_number'),
                                            },
                                            {
                                                pattern: /^[\d]{0,9}$/,
                                                message: t('9_character'),
                                            },
                                        ]}>
                                            <InputNumber
                                                formatter={(value) => `VND ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                parser={(value) => value.replace(/\VND\s?|(,*)/g, "")}
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item label={t('gender')} name='gender_id'>
                                            <Dropdown datas={genders} defaultOption={t('hr:all_gender')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item label={t('work_type')} name='working_type'>
                                            <Dropdown datas={this.state.types} defaultOption={t('hr:all_work_type')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={4}>
                                        <Form.Item label={t('hr:experience_years')}>
                                            <Input.Group compact>
                                                <Form.Item name='experience_from'>
                                                    <Input style={{ width: 100, textAlign: 'center' }} placeholder={t('hr:from')} />
                                                </Form.Item>
                                                <Input
                                                    className="site-input-split"
                                                    style={{
                                                        width: 30,
                                                        borderLeft: 0,
                                                        borderRight: 0,
                                                        pointerEvents: 'none',
                                                    }}
                                                    placeholder="-"
                                                    disabled
                                                />
                                                <Form.Item name='experience_to'>
                                                    <Input
                                                        className="site-input-right"
                                                        style={{
                                                            width: 100,
                                                            textAlign: 'center',
                                                        }}
                                                        placeholder={t('hr:to')}
                                                    />
                                                </Form.Item>
                                            </Input.Group>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={4}>
                                        <Form.Item label={t('point')} name={'point'}>
                                            <InputNumber placeholder={t('point')} max={99} min={0} disabled />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col span={24}>
                                        <Form.Item label={t('hr:requirement')} >
                                            <Editor
                                                style={{ height: 300}}
                                                value={this.state.requirement}
                                                onChange={(value) => this.setState({ requirement: value })}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col span={24}>
                                        <Form.Item label={t('hr:description')}>
                                            <Editor
                                                value={this.state.description}
                                                onChange={(value) => this.setState({ description: value })}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col span={12}>
                                        <Form.Item label={t('hr:contact')} name='contact'>
                                            <Input placeholder={t('hr:contact')} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={t('hr:contact_email')} name='contact_email' hasFeedback rules={[{ type: 'email', message: t('hr:no_val_email') }]}>
                                            <Input placeholder={t('hr:contact_email')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Divider className="m-0" />
                                <Row gutter={12} className="pt-3 pb-3">
                                    <Col span={12} key='bnt-submit' >
                                        <Form.Item>
                                            <Button type="primary" icon={<FontAwesomeIcon icon={faSave} />} htmlType="submit"
                                                loading={this.state.loading}
                                            >
                                                &nbsp;{t('hr:save')}
                                            </Button>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12} key='btn-back' style={{ textAlign: "right" }}>
                                        <Form.Item>
                                            <BackButton url={`/company/job`} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </Spin>
                    </Col>
                </Row>
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
export default connect(mapStateToProps)(withTranslation()(JobFrom));