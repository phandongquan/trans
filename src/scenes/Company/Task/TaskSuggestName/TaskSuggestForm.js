import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Row, Col, Input, Form, Spin, Radio, Texa, InputNumber } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBackspace } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { showNotify, checkValueToDropdown, convertToFormData, cleanObject, checkPermission } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import { taskStatus, taskRequireOptions } from '~/constants/basic'
import { createTaskSuggest as apiCreate, updateTaskSuggest as apiUpdate, detailTaskSuggest as apiDetail } from '~/apis/company/project';
import { list as apiListSubMajors } from '~/apis/major'

const { TextArea } = Input;
class TaskSuggestForm extends Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            require_media: '0',
            idMarjor : '',
            datasSubMajor : []
        };
    }
    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getDetailTask();
        this.getListSubMajor()
        this.formRef.current.setFieldsValue({ status: 1 });
    }
    /**
     * @get detail task suggest
     */
    getDetailTask = () => {
        let { id } = this.props.match.params;
        let xhr;
        if (id) {
            xhr = apiDetail(id);
        } else {
            xhr = apiDetail(0);
        }
        xhr.then((response) => {
            if (response.status) {
                let datas = response.data;
                if (datas && datas.data && datas.data.require_media) {
                    this.setState({ require_media: datas.data.require_media});
                }
                this.formRef.current.setFieldsValue(datas);
            }
        })
    }

    /**
     * @event submitForm
     */
    submitForm(values = {}) {
        this.setState({ loading: true });
        let { require_media } = this.state;
        let { t } = this.props;
        let { id } = this.props.match.params;
        let xhr;
        let message = '';

        let formData = convertToFormData(cleanObject(values));
        formData.append('data[require_media]', require_media)
        if (id) {
            formData.append('_method', 'PUT');
            xhr = apiUpdate(id, formData);
            message = t('Task suggest updated!');
        } else {
            xhr = apiCreate(formData);
            message = t('Task suggest Created!');
        }
        xhr.then((response) => {
            this.setState({ loading: false })
            if (response.status != 0) {
                showNotify(t('Notification'), message);
                // this.props.history.push("/company/tasks/suggest")
            } else {
                showNotify(t('Notification'), response.message, 'error');
            }
        });
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

    render() {
        let { t, match, baseData: { departments, majors }, } = this.props;
        let { note, require_media } = this.state;
        let id = match.params.id;
        let subTitle = id ? t('Update') : t('Add new');
        return (
            <div>
                <PageHeader
                    title={t('hr:task_suggest')}
                    subTitle={subTitle}
                />
                <Row>
                    <Col span={24} className='card mr-1 pl-3 pr-3'>
                        <Spin spinning={this.state.loading}>
                            <Form
                                ref={this.formRef}
                                name="upsertStaffForm"
                                className="ant-advanced-search-form pt-3"
                                initialValues={{ data: this.state.data }}
                                layout="vertical"
                                onFinish={this.submitForm.bind(this)}
                            >
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                                        <Form.Item name="name" label={t('name')} hasFeedback rules={[{ required: true, message: t('hr:input_task_name') }]}>
                                            <Input placeholder={t("hr:task_name")} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name="code" label={t('code')} hasFeedback rules={[{ required: true, message: t('hr:input_task_code') }]}>
                                            <Input placeholder={t("hr:task_code")} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                                        <Form.Item name="group_name" label={t('hr:task_group_name')} hasFeedback  >
                                            <Input placeholder={t('hr:task_group_name')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name="planned_hours" label={t('hr:planned_hours')} hasFeedback rules={[{ required: true, message: t('hr:request') },
                                        ({getFieldValue}) => ({
                                            validator(_, value) {
                                                if(!value) {
                                                    return Promise.reject('hr:require_better_0');
                                                }
                                                return Promise.resolve();
                                            },
                                        })]} >
                                           	<InputNumber min={0} className="w-100" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name="department_id" label={t('hr:department')}>
                                            <Dropdown datas={departments} defaultOption={t('hr:all_department')} ></Dropdown>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name="status" label={t('status')}>
                                            <Dropdown datas={taskStatus} defaultOption={t('all_status')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6} key='major'>
                                        <Form.Item name="major_id" label={t('hr:major')}>
                                            <Dropdown datas={majors} 
                                            defaultOption="-- All Major --" 
                                            onChange={v => this.setState({idMarjor : v} , () => {
                                                this.formRef.current.resetFields(['sub_major_id'])
                                                this.getListSubMajor()
                                            })} 
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6} key='sub_major'>
                                        <Form.Item name="sub_major_id" label={t('hr:sub_major')}>
                                            <Dropdown  datas={this.state.datasSubMajor} defaultOption="-- All sub majors --"/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name="cost" label={t('hr:cost')} hasFeedback >
                                            <Input placeholder={t("hr:cost")} />
                                        </Form.Item>
                                    </Col>

                                </Row>
                                <Row gutter={12} style={{ marginLeft: '0.25rem' }}>                                    
                                    <Form.Item>
                                        <div className='mb-2'>{t('hr:require_work_result')}</div>
                                        <Radio.Group options={taskRequireOptions} value={require_media}
                                            onChange={e => {
                                                let require_media = e.target.value;
                                                this.setState({ require_media });
                                            }} />
                                    </Form.Item>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item name={'note'} label={t('note')}>
                                            <TextArea rows={5} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24} className="pt-3 pb-3">
                                    <Col span={12} key='bnt-submit' >
                                        <Form.Item>
                                            {
                                                checkPermission('hr-task-suggest-update') ?
                                                    <Button type="primary"
                                                        icon={<FontAwesomeIcon icon={faSave} />}
                                                        htmlType="submit"
                                                        loading={this.state.loading}
                                                    // onClick={}
                                                    >
                                                        {t('save')}
                                                    </Button>
                                                    : ''
                                            }
                                        </Form.Item> 
                                    </Col>
                                    <Col span={12} key='btn-back' style={{ textAlign: "right" }}>
                                        <Form.Item>
                                            <Link to={`/company/tasks/suggest`}>
                                                <Button type="default"
                                                    icon={<FontAwesomeIcon icon={faBackspace} />}
                                                >{t('back')}</Button>
                                            </Link>
                                        </Form.Item> 
                                    </Col>
                                </Row>
                            </Form>
                        </Spin>
                    </Col>
                </Row>

            </div>
        )
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
export default connect(mapStateToProps)(withTranslation()(TaskSuggestForm));
