import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Form, Row, Col, Input, InputNumber, Spin, DatePicker, Divider, Button, Switch } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { staffStatus as arrStatus, screenResponsive} from '~/constants/basic';
import BackButton from '~/components/Base/BackButton';
import Dropdown from '~/components/Base/Dropdown';
import Tab from '~/components/Base/Tab';
import tabList from '~/scenes/Company/New/config/tab';
import Avatar from '~/components/Base/Avatar';
import { create as apiCreate, detail as apiDetail, update as apiUpdate } from '~/apis/company/new';
import { getList as apiGetListCategory } from '~/apis/company/new/categories';
import { showNotify, convertToFormData } from '~/services/helper';
import Editor from '~/components/Base/Editor';


class NewForm extends Component {

    /**
     * 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            content: '',
            image: [],
            url_image: '',
            categories: []
        }
    }
    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getCategories();
        this.formRef.current.setFieldsValue({
            status: 1
        })

        let { id } = this.props.match.params;
        if(id) this.getDetailNew(id);
    }

    /**
     * Call api get detail new
     * @param {*} id 
     */
    async getDetailNew(id) {
        let response = await apiDetail(id);
        if(response.status) {
            this.setState({ content: response.data.new.content, url_image: response.data.new.image })
            this.formRef.current.setFieldsValue(response.data.new);
        }
    }

    /**
     * Call api get list categories
     */
    async getCategories()
    {
        let response = await apiGetListCategory();
        if(response.status) {
            this.setState({ categories: response.data.rows })
        }
    }

    /**
     * @event submit Form
     * @param {*} values 
     */
    submitForm = (values) => {
        let { t } = this.props;
        let { id } = this.props.match.params;
        let xhr, message;
        
        // convert data to formData
        values.is_top = values.is_top == true ? 1 : 0;
        Object.keys(values).map( key => {
            if(values[key] === undefined || values[key] === null) {
                delete values[key]
            }
        })

        let formData = convertToFormData(values);
        formData.append('content', this.state.content);
        formData.append('Upload[imageFile]', this.state.image);

        if(id) {
            xhr = apiUpdate( id, formData)
            message = t('Updated new');
        } else {
            xhr = apiCreate(formData)
            message = t('Created new');
        }
        
        xhr.then(response => {
            if(response.status) {
                showNotify('Notification', message);
                this.props.history.push('/company/news')
            }
        })
    }

    /**
     * @render
     */
    render() {
        let { t } = this.props;
        let { id } = this.props.match.params;
        let subTitle;

        if (id) {
            subTitle = t('hr:edit')
        } else {
            subTitle = t('hr:add_new')
        }

        return (
            <>
                <PageHeader 
                    title={t('hr:news')} 
                    subTitle={subTitle} 
                />
                <Row className={window.innerWidth < screenResponsive  ? "card pl-3 pr-3 mb-3 pb-3" : "card pl-3 pr-3 mb-3"}>
                    <Tab tabs={tabList(this.props)}></Tab>
                </Row>
                
                <div className='card pl-3 pr-3'>
                    
                        <Spin spinning={this.state.loading}>
                            <Form ref={this.formRef}
                                className="ant-advanced-search-form pt-3"
                                layout="vertical"
                                onFinish={this.submitForm.bind(this)}
                            >
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item
                                            name="title"
                                            label={t('hr:title')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Please input title') }]}>
                                            <Input placeholder="Title" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item
                                            name='catid'
                                            label={t('hr:category')}
                                            >
                                            <Dropdown datas={this.state.categories} defaultOption={t('--- All Category ---')} mode='multiple' />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item
                                            name="intro"
                                            label={t('hr:description')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Please input intro') }]}>
                                            <Input.TextArea rows={3} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item
                                            label={t('hr:content')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Please input content') }]}>
                                            <Editor 
                                                value={this.state.content}
                                                onChange={(value) => this.setState({ content: value })}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                        <Form.Item
                                            name='status'
                                            label={t('hr:status')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Select status') }]}>
                                            <Dropdown datas={arrStatus} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item
                                            name='source'
                                            label={t('hr:source')}
                                            >
                                            <Input placeholder={t('Source')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item
                                            name='is_top'
                                            label={t('Is top')}
                                            valuePropName="checked"
                                        >
                                            <Switch />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item 
                                            label={t('hr:image')}
                                            extra="Support file PNG/JPG/JPEG. Maximum file size 2MB!"
                                        >
                                            <Avatar
                                                onChange={(e) => this.setState({ image: e })}
                                                url={this.state.url_image}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Divider className="m-0" />
                                <Row gutter={24} className="pt-3 pb-3">
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
                                            <BackButton url={`/company/news`} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </Spin>
                   
                </div>
            </>
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
export default connect(mapStateToProps)(withTranslation()(NewForm));