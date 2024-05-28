import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import {getListFeedbacks , approve} from '~/apis/company/TrainningQuestion/trainingquestionfeedbacks';
import { Button, Table, Row, Col, Input, Form, Modal } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab';
import tabListTraining from '../config/tabListTraining';
import StaffDropdown from '~/components/Base/StaffDropdown';
import Dropdown from '~/components/Base/Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { CommentOutlined ,CheckOutlined ,CloseOutlined } from '@ant-design/icons';
import { showNotify } from '~/services/helper';

import {screenResponsive} from '~/constants/basic';


const is_confirm = {
    0 : 'Pending' , 1 :'Confirm' , 2 : 'Reject'
}
class TrainingQuestionFeedbacks extends Component {
    /**
    * 
    * @param {*} props 
    */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            datas : [],
            visible : false,
            reply : '' ,
            typeComfirm : '',
            id_Questions : ''
        };
    }
    componentDidMount(){
        this.getListQuestionFeedbacks()
    }
    getListQuestionFeedbacks = async (params = {}) => {
        this.setState({loading : true})
        let response = await getListFeedbacks(params)
        if(response.status){
            this.setState({datas : response.data.feedbacksQuestion , loading : false})
        }
    }
    /**
     * Handle click show popup
     */
    togglePopup(visible, r) {
        this.setState({
            visible: visible,
            reply: r.reply ? r.reply : '',
            typeComfirm : r.is_confirm,
            id_Questions : r.id
        })
    }
    /**
     * @event submit form
     * @param {*} e 
     */
    submitForm = (e) => {
        let values = this.formRef.current.getFieldsValue();
        this.getListQuestionFeedbacks(values);
    }
    /**
     * @event handle click btn approved
     */
    onHandleApprovedReimburseReject(type) {
        const { t } = this.props;
        // 1 :'Confirm' , 2 : 'Reject'
        let params = {
            is_confirm : type ,
            _method : 'PUT',
            reply : this.state.reply
        }
        let xhr = approve(this.state.id_Questions , params)
        xhr.then(res =>{
            if(res.status){
                this.setState({visible : false})
                showNotify(t('hr:notification') , t('hr:success'))
                this.getListQuestionFeedbacks()
            }
        }).catch(error => {
            console.log(error.response);
        });
    }
    render() {
        let { t } = this.props;
        const columns = [ 
            {
                title: 'No.',
                align: 'center',
                render: r => this.state.datas.indexOf(r) + 1
            },
            {
                title: t('hr:name'),
                render: r => <span>{r.staff.staff_name}</span>
            },
            {
                title: t('hr:question_title'),
                render: r => (
                    <span>
                        {r.questions ? (
                            <span>
                                {r.questions.title ? (
                                    <span>
                                        {r.questions.title}
                                        <small>
                                            (<strong>{r.questions.code}</strong>)
                                        </small>
                                    </span>
                                ) : null}
                            </span>
                        ) : null}
                    </span>
                )
            },
            {
                title: t('hr:question_content'),
                width: '30%',
                render: r => <div dangerouslySetInnerHTML={{ __html: r.questions?.content}} />
            },

            {
                title: t('hr:feedback'),
                render: r => <span>{r.content}</span>
            },
            {
                title: t('hr:status'),
                render: r => <span>{is_confirm[r.is_confirm]}</span>
            },
            {
                title: t('hr:created_at'),
                width : '6%',
                render: r => <span>{dayjs(r.created_at).format('DD-MM-YYYY')}</span>
            },
            {
                title: t('hr:confirm_by'),
                render: r => <span>{r.confirm_by ? r.confirm_by_staff.staff_name : 'N/A'}</span>
            },
            {
                key: t('action'),
                title: t('hr:action'),
                className:'misstext',
                width: 50,
                render: r => {
                    return (
                        <>
                            <Button type='primary' size='small' onClick={() => this.togglePopup(true, r)} icon={<CommentOutlined />} className='mr-2'></Button>
                        </>
                    )
                } 
            }
        ]
        return (
            <div id='page_training_question_feedbacks'>
                <PageHeader title={t('hr:training_question_feedbacks')} />
                <Row className="card pl-3 pr-3 mb-3" >
                    <Tab tabs={tabListTraining(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchTrainingQuestionFeedbacksForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                                <Form.Item name='staff_id'>
                                    <StaffDropdown defaultOption= {t('hr:search')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                                <Form.Item name='is_confirm'>
                                    <Dropdown datas={is_confirm}  defaultOption= {t('hr:status')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='submit'>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" className='mr-2 mb-1'>
                                        {t('hr:search')}
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'> 
                                    <Table
                                        dataSource={this.state.datas}
                                        columns={columns}
                                        rowKey={r=> r.id}
                                        loading={this.state.loading}
                                        pagination = {{pageSize: 40}}
                                    />
                                </div>
                            </div>
                            :
                            <Table 
                                dataSource={this.state.datas}
                                columns={columns}
                                rowKey={r=> r.id}
                                loading={this.state.loading}
                                pagination = {{pageSize: 40}}
                            />
                        }
                    </Col>
                </Row>
                <Modal 
                    forceRender
                    title= {t('hr:reply')}
                    open={this.state.visible}
                    // onOk={this.handleSubmitPopup}
                    footer={false}
                    onCancel={() => this.setState({visible : false})}
                    width=  {window.innerWidth < screenResponsive  ? '100%' : '50%'}
                >
                    <Form layout='vertical'>
                        <Form.Item label={t('hr:reply')}>
                            <Input.TextArea disabled={this.state.typeComfirm != 0} value={this.state.reply} rows={3} onChange={e => this.setState({ reply: e.target.value })} />
                        </Form.Item>
                    </Form>
                    {
                        this.state.typeComfirm == 0 ?
                            <>
                                <Button
                                    onClick={() => this.onHandleApprovedReimburseReject(1)}
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    className='mr-3'
                                >
                                    &nbsp;{t('hr:approve')}
                                </Button>
                                <Button icon={<CloseOutlined />}
                                    onClick={() => this.onHandleApprovedReimburseReject(2)}
                                    type='danger'
                                    danger
                                    className='mr-3'>
                                    &nbsp;{t('hr:reject')}
                                </Button>
                            </>
                            : []
                    }
                    
                </Modal>

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

const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TrainingQuestionFeedbacks));