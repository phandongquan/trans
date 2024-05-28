import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Form, Row, Col, Input, Spin, Divider, Button, Rate } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BackButton from '~/components/Base/BackButton';
import { detail as apiDetail, update as apiUpdate } from '~/apis/company/rating';
import { showNotify, convertToFormData } from '~/services/helper';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

class RatingForm extends Component {

    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            content: []
        }
    }
    /**
     * @lifecycle
     */
    componentDidMount() {
        let { id } = this.props.match.params;
        if (id) this.getDetailRating(id);
    }

    /**
     * Call api get detail new
     * @param {*} id 
     */
    async getDetailRating(id) {
        let response = await apiDetail(id);
        if (response.status) {
            let { rating } = response.data;

            // format data used_to_work
            let arrUsedToWork = JSON.parse(rating.used_to_work);
            let usedToWork = [];
            if (Array.isArray(arrUsedToWork)) {
                arrUsedToWork.map((item, index) => usedToWork.push({ name: item, key: index }))
            }
            rating.used_to_work = usedToWork;

            // format data content
            let arrContent = JSON.parse(rating.content);
            this.setState({ content: arrContent })
            rating.content = arrContent;

            this.formRef.current.setFieldsValue(rating);
        }
    }

    changeRating = (value, contentId, criteriaId, field) => {
        let content = this.state.content.slice();
        let curContent = content.find(c => c.id == contentId);

        if(typeof curContent != 'undefined' && curContent.rating_criteria) {
            let curCriteria = curContent.rating_criteria.find(c => c.id == criteriaId);
            if(curCriteria != 'underfined') {
                if(field == 'rating') {
                    curCriteria.rating = value;
                }
                if(field == 'note') {
                    curCriteria.note = value.target.value;
                }
            }
        }

        this.setState({content})
    }

    /**
     * @event submit Form
     * @param {*} values 
     */
    submitForm = (values) => {
        this.setState({loading: true})
        let { t } = this.props;
        let { id } = this.props.match.params;

        let curUsedToWork = [];
        if(Array.isArray(values.used_to_work)) {
            values.used_to_work.map(u => curUsedToWork.push(u.name))
        }
        values.used_to_work = curUsedToWork;

        let xhr = apiUpdate( id, { ...values, content: this.state.content })
        xhr.then(response => {
            this.setState({loading: false})
            if(response.status) {
                showNotify('Notification', t('Updated rating!'));
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
            subTitle = t('Edit rating')
        } else {
            subTitle = t('Add rating')
        }

        return (
            <>
                <PageHeader
                    title={t('Rating')}
                    subTitle={subTitle}
                />

                <Row gutter={24} className='pl-3 pr-3'>
                    <Col span={24} className='card'>
                        <Spin spinning={this.state.loading}>
                            <Form ref={this.formRef}
                                className="ant-advanced-search-form pt-3"
                                layout="vertical"
                                onFinish={this.submitForm.bind(this)}
                            >
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <Form.Item
                                            name="name"
                                            label={t('Candidate Name')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Please input candidate name') }]}>
                                            <Input placeholder="Candidate Name" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item
                                            name="phone"
                                            label={t('Phone')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Please input phone') }]}>
                                            <Input placeholder="Phone" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item
                                            name="email"
                                            label={t('Email')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Please input email') }]}>
                                            <Input placeholder="Email" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={16}>
                                        <Form.Item label="Used to work">
                                            <Form.List name="used_to_work">
                                                {(fields, { add, remove }) => (
                                                    <>
                                                        {fields.map(field => (
                                                            <Row gutter={24} key={[field.key, 'name']}>
                                                                <Col span={20}>
                                                                    <Form.Item {...field} name={[field.name, 'name']} key={[field.key, 'key']}>
                                                                        <Input style={{ width: '100%' }} />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={1}>
                                                                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                                                                </Col>
                                                            </Row>
                                                        ))}
                                                        <Form.Item>
                                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                                Add
                                                            </Button>
                                                        </Form.Item>
                                                    </>
                                                )}
                                            </Form.List>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <Form.Item
                                            name="supervisor"
                                            label={t('Supervisor Name')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Please input supervisor') }]}>
                                            <Input placeholder="Supervisor" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item
                                            name="position_supervisor"
                                            label={t('Position')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Please input position') }]}>
                                            <Input placeholder="Position" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Divider className="m-2" />
                                <Row gutter={24}>
                                    <Col span={24}>
                                        {
                                            this.state.content.map(r => (
                                                <div key={r.id}>
                                                    <strong>{r.rating_title_parent}</strong><br />
                                                    {
                                                        r.rating_criteria && Array.isArray(r.rating_criteria) ?
                                                            r.rating_criteria.map(children => (
                                                                <div key={children.id} className='ml-3'>
                                                                    <span>{children.rating_title}</span><br />
                                                                    <Row gutter={24}>
                                                                        <Col span={5}>
                                                                            <Form.Item >
                                                                                <Rate defaultValue={children.rating} onChange={value => this.changeRating(value, r.id, children.id, 'rating')} />
                                                                            </Form.Item>
                                                                        </Col>
                                                                        <Col span={8}>
                                                                            <Form.Item >
                                                                                <Input defaultValue={children.note} onChange={value => this.changeRating(value, r.id, children.id, 'note')} />
                                                                            </Form.Item>
                                                                        </Col>
                                                                    </Row>
                                                                </div>
                                                            ))
                                                            : []
                                                    }
                                                </div>
                                            ))
                                        }
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item label='Note' name='note'>
                                            <Input.TextArea />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Divider className="m-0" />
                                <Row gutter={24} className="pt-3 pb-3">
                                    <Col span={12} key='bnt-submit' >
                                        <Button type="primary" icon={<FontAwesomeIcon icon={faSave} />} htmlType="submit"
                                            loading={this.state.loading}
                                        >
                                            &nbsp;{t('Save')}
                                        </Button>
                                    </Col>
                                    <Col span={12} key='btn-back' style={{ textAlign: "right" }}>
                                        <BackButton url={`/company/news`} />
                                    </Col>
                                </Row>
                            </Form>
                        </Spin>
                    </Col>
                </Row>
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
export default connect(mapStateToProps)(withTranslation()(RatingForm));