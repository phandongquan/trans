import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Table, Row, Col, Divider, Button, Form, Input, Modal } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import documentFeedbackApi, { updateFeedbacks, deleteFeedback as apiDelete } from '~/apis/company/document/feedback';
import { CommentOutlined } from '@ant-design/icons';
import Tab from '~/components/Base/Tab';
import { checkPermission, timeFormatStandard } from '~/services/helper'
import constTablist from '~/scenes/Company/config/tabListDocument';
import FormItem from 'antd/lib/form/FormItem';
import Dropdown from '~/components/Base/Dropdown';
import ReplyModal from '~/components/Company/Document/DocumentModal';
import { showNotify } from '~/services/helper';
import { Link } from 'react-router-dom';
import { dateFormat, modeDocumentFeedback } from '~/constants/basic';
import DeleteButton from '~/components/Base/DeleteButton';

import {screenResponsive} from '~/constants/basic';
class DocumentCategory extends Component {

    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            feedbacks: [],
            document_categories: {},
            visiblePopup: false,
            idFeedback: '',
            feedback: '',
            reply: '',
        };
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getFeedbacks()
    }

    /**
     * Get list feedbacks
     * @param {*} values 
     */
    getFeedbacks = (values) => {
        let xhr = documentFeedbackApi.getFeedbacks(values);
        xhr.then((response) => {
            if (response.status) {
                this.setState({
                    feedbacks: response.data.document_feedbacks,
                    document_categories: response.data.categories
                })
            } 
        });
    }

    /**
     * Handle click button search
     */
    handleSeach = (e) => {
        this.getFeedbacks(e)
    }

    /**
     * Handle sumbit popup
     * @param {*} value 
     */
    handleSubmitPopup = () => {
        let { t } = this.props;
        let { idFeedback, reply, feedback } = this.state;

        let xhr = updateFeedbacks(idFeedback, { 'feedback' : feedback, 'reply' : reply});
        xhr.then((response) => {
            if (response.status != 0) {
                this.setState({ visiblePopup: false, reply: '', feedback: ''})
                this.getFeedbacks();
                showNotify(t('hr:notification'), t('Reply successfully!'));
            } else {
                showNotify(t('hr:notification'), response.message, 'error');
            }
        });
    }

    /**
     * Handle click show popup
     */
    togglePopup( visible, feedback ) {
        this.setState({ 
            visiblePopup: visible,
            feedback: feedback ? feedback.feedback : '',
            reply: feedback ? feedback.reply : '',
            idFeedback: feedback? feedback.id : '',
        })
    }

    /**
     * Delete record
     * @param {*} e 
     * @param {*} id 
     */
    onDeleteFeedback = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = apiDelete(id);
        xhr.then((response) => {
            if (response.status) {
                let values = this.formRef.current.getFieldsValue();
                this.getFeedbacks(values);
                showNotify(t('hr:notification'), t('Feedback has been removed!'));
            } else {
                showNotify(t('hr:notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('hr:notification'), t('hr:server_error'));
        });
    }

    /**
     * @render
     */
    render() {
        const { t , baseData: { departments } } = this.props;
        const { feedbacks, document_categories } =  this.state;
        const columns = [
        {
            key: 'id',
            title: 'ID',
            dataIndex: 'id',
        }, {
            key: 'document',
            title: t('hr:document'),
            render: r => {
                return (
                <div>   
                        {
                            checkPermission('hr-document-feedback-update') ?
                                <Link to={`/company/document/${r.document_id}/edit`}>{r.document_title}</Link>
                                : <span>{r.document_title}</span>
                        }
                        <small>#{r.document_code}</small><br />
                        {r.document_category_id ?
                            <span><small>
                                Category: {Object.keys(document_categories).map(key => r.document_category_id == key && document_categories[key])}
                            </small></span>
                            : ''}
                    </div>)
            },
            width: '15%'
        }, {
            key: 'department_id',
            title: t('hr:dept'),
            dataIndex: 'department_id',
            render:  (department_id) =>{
                let departmentName = '';
                departments.map((item) => {
                    if(department_id == item.id)
                        departmentName = item.name
                })
                return departmentName;
            }
        },
        {
            key: 'feedback',
            title: t('feedback'),
            dataIndex: 'feedback',
            render:  (feedback, record) =>{
                return (
                    <div>
                        <small>
                            Created: <strong>{ record.created_at != undefined ?  timeFormatStandard(record.created_at, dateFormat) : ''}</strong>&nbsp;
                            By: <strong>{ record.username }</strong>
                        </small>
                        <p>{ record.feedback }</p>
                    </div>
                )
            },
            width: '30%'
        },
        {
            key: 'reply',
            title: t('hr:reply'),
            render: r => <>
                { r.reply ? 
                    <>
                        <small>
                            Created: <strong>{r.updated_at != undefined ? timeFormatStandard(r.updated_at, dateFormat) : ''}</strong>&nbsp;
                            By: <strong>{r.userreply != null ? r.userreply.name : ''}</strong>
                        </small>
                        <p>{r.reply}</p>
                    </>
                : []}
            </>,
            width: '30%'
        },
        {
            title: t('hr:mode'),
            render: r => typeof r.mode != 'undefined' && modeDocumentFeedback[r.mode]
        },
        {
            key: 'action',
            title: t('hr:action'),
            width: '10%',
            render: r => {
                return (
                    <>
                        <Button type='primary' size='small' onClick={() => this.togglePopup(true, r)} icon={<CommentOutlined/>} className='mr-2'></Button>
                        {checkPermission('hr-document-feedback-delete') ? 
                            <DeleteButton onConfirm={(e) => this.onDeleteFeedback(e, r.id)} />
                        : ''
                        }
                    </>
                )
            } 
        }];
        return (
            <div>
                <PageHeader 
                        className="site-page-header" 
                        title={t('feedback')} 
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={constTablist(this.props)} />
                    <Form ref={this.formRef} onFinish={(e) => { this.handleSeach(e) }} layout="vertical" className="pt-3">
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='q'>
                                <FormItem name='q'>
                                    <Input placeholder={t('hr:name') + "," + t('hr:code')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='department_id'>
                                <FormItem name="department_id" >
                                    <Dropdown datas={departments} defaultOption={t('hr:all_department')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='category_id'>
                                <FormItem name="category_id" >
                                    <Dropdown datas={document_categories} defaultOption={t('hr:all_category')}  />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='mode'>
                                <FormItem name="mode" >
                                    <Dropdown datas={modeDocumentFeedback} defaultOption={t('hr:all_mode')} />
                                </FormItem>
                            </Col>
                            <FormItem>
                                <Button type="primary"
                                    htmlType="submit"
                                    style={{ marginLeft: 8 }}
                                >
                                    {t('search')}
                                </Button>
                            </FormItem>
                        </Row>
                    </Form>
                </Row>

                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'> 
                                    <Table className='table_feedback'
                                        dataSource={feedbacks}
                                        columns={columns}
                                        loading={false}
                                        rowKey={(feedbacks) => feedbacks.id}
                                        pagination={false}>
                                    </Table>
                                </div>
                            </div>
                            :
                            <Table className='table_feedback'
                                dataSource={feedbacks}
                                columns={columns}
                                loading={false}
                                rowKey={(feedbacks) => feedbacks.id}
                                pagination={false}>
                            </Table>
                        }
                    </Col>
                </Row>

                <Modal
                    forceRender
                    title={t('hr:reply')}
                    open={this.state.visiblePopup}
                    onOk={this.handleSubmitPopup}
                    onCancel={() => this.togglePopup(false, null)}
                    okText={t("submit")}
                    cancelText={t("cancel")}
                    width=   {window.innerWidth < screenResponsive  ? '100%' :'50%'}
                >
                    <Form layout='vertical'>
                        <Form.Item label={t('hr:feedback')}>
                            <Input.TextArea value={this.state.feedback} rows={3} onChange={ e => this.setState({ feedback: e.target.value})} />
                        </Form.Item>
                        <Form.Item label={t('hr:reply')}>
                            <Input.TextArea value={this.state.reply} rows={3} onChange={ e => this.setState({ reply: e.target.value})} />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}

export default connect(mapStateToProps, null)(withTranslation()(DocumentCategory));
