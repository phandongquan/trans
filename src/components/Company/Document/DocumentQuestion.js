import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { getList as apiListTrainingQuestions, massUpdate} from '~/apis/company/TrainningQuestion';
import { Col, Row, Radio, Button , Tabs, Table} from 'antd';
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import { staffStatus, trainingExamTypes, trainingQuestionInputTypes, screenResponsive  } from '~/constants/basic';
import {  checkPermission, showNotify } from '~/services/helper';
const { TabPane } = Tabs;
class DocumentQuestion extends Component {
    
    /**
     * @lifecycle
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            questions: [],
            questionDraft: [],
            selectedRowKeys: [],
        }
    }
    

    /**
     * @lifecycle
     */
    componentDidMount () {
        let { id } = this.props;    
        this.getListTrainQuestions();
        this.getListTrainQuestionsDraft();
    }

    async getListTrainQuestions() {
        let {id} = this.props;
        let params = { 
            document_id: id, 
            status: 1,
            is_admin: 1,
            limit : 100
        }
        let response = await apiListTrainingQuestions(params)
        if(response.status)
            this.setState({ questions: response.data.rows })
    }
    getListTrainQuestionsDraft = () => {
        let { id } = this.props;
        let params = {
            document_id: id,
            status: 3,
            is_admin: 1,
            limit : 100
        }
        let xhr = apiListTrainingQuestions(params);
        xhr.then((response) => {
            if (response.status)
                this.setState({ questionDraft: response.data.rows })
        });
    }

    /**
     * 
     * @param {*} newSelectedRowKeys 
     */
    onSelectChange = (newSelectedRowKeys) => {
        this.setState({ selectedRowKeys: newSelectedRowKeys })
    };

    /**
     * 
     * @param {*} action 
     */
    handleMassUpdate = (action='Approve') => {

        let data = {
            ids: this.state.selectedRowKeys,
            field: "status",
            value: action == "Approve" ? 1 : 2,
        };

        let xhr = massUpdate(data);
        xhr.then ((response) => {
            if (response.status !== 0) {
                this.setState({selectedRowKeys: []})
                this.getListTrainQuestions();
        this.getListTrainQuestionsDraft();
            } else {
                showNotify('Notification', response.message, 'error');
            }
        });
    }

    /**
     * @lifecycle
     */
    render() {
        let { questions , questionDraft} = this.state;
        let { t, baseData: { departments, majors, divisions }} = this.props;
        const { selectedRowKeys, setSelectedRowKeys, loading } = this.state;

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = selectedRowKeys;
        let result = [];
        if(questions.length > 0) {
            questions.map((question, index) => {
                let details = question.detail;
                let arrAns = [];
                details.map(item => {
                    arrAns.push(
                        <Col span={24} key={item.id}>
                            <Radio disabled
                                checked={item.is_correct ? 'checked' : ''}
                                className={item.is_correct ? 'correct' : ''}
                                style={{ whiteSpace: 'break-spaces'}}
                            >
                                {item.content}
                            </Radio>
                        </Col>
                    );
                })
                result.push(
                    <div className="mb-3" key={question.id}>
                        <strong>{`${t('hr:question')} ${index + 1}: `}</strong>
                        {/* <span>{question.title}</span> */}
                        <div dangerouslySetInnerHTML={{__html: question.content}}/>
                        <Row gutter={24}>
                            {arrAns}
                        </Row>
                    </div>
                );
            }); 
        }

        const columns = [
            {
                title: t('hr:content'),
                render: (text, r, index) => {
                    let details = r.detail;
                    let arrAns = [];
                    details.map(item => {
                        arrAns.push(
                            <Col span={24} key={item.id}>
                                <Radio disabled
                                    checked={item.is_correct ? 'checked' : ''}
                                    className={item.is_correct ? 'correct' : ''}
                                    style={{ whiteSpace: 'break-spaces' }}
                                >
                                    {item.content}
                                </Radio>
                            </Col>
                        );
                    })
                    return (
                        <>
                            <div className="mb-3" key={r.id}>
                                <strong>{`${t('hr:question')} ${index + 1}: `}</strong>
                                {/* <span>{r.title}</span> */}
                                <div dangerouslySetInnerHTML={{ __html: r.content }} />

                                <Row gutter={24}>
                                    {arrAns}
                                </Row>
                            </div>
                        </>
                    );

                }
            }
        ]

        return (
            <>
                <Tabs defaultActiveKey="1" type="card" >
                    <TabPane className="tab_content" tab={t("hr:approved")} key="1">

                        <div style={{ overflow: 'scroll', maxHeight: 600 }}>
                            {result}

                        </div>
                    </TabPane>
                    <TabPane className="tab_content p-0" tab={t("waiting_approval")} key="2" >
                        <div >

                            <div className='m-2' >
                                {
                                    checkPermission('hr-document-detail-question-approve') ?
                                        <Button type="primary" disabled={!hasSelected} loading={loading}
                                            onClick={() => this.handleMassUpdate("Approve")}
                                        >
                                            {t('hr:approve')}
                                        </Button>
                                        : ''
                                }
                                {
                                    checkPermission('hr-document-detail-question-approve') ?
                                        <Button type="default" disabled={!hasSelected} loading={loading} style={{ marginLeft: 8 }}
                                            onClick={() => this.handleMassUpdate("Reject")}
                                        >
                                            {t('hr:reject')}
                                        </Button>
                                        : ''
                                }
                                <span
                                    style={{
                                        marginLeft: 8,
                                    }}
                                >
                                    {hasSelected ? 'Select ' + selectedRowKeys.length + ' items' : ''}
                                </span>

                            </div>
                        </div>
                        <Table
                            rowSelection={rowSelection}
                            dataSource={this.state.questionDraft ? this.state.questionDraft : []}
                            columns={columns}
                            loading={this.state.loading}
                            pagination={false}
                            rowKey={(skill) => skill.id}
                            bordered={false}
                            scroll={{ y: 400 }}
                        />
                    </TabPane>
                </Tabs>
                <Link
                    to={{
                        pathname: `/company/trainning-question`,
                        search: `?document_id=${this.props.id}`
                    }}
                    target="_blank"
                >
                    <Button
                        className='mt-1'
                        type='primary'
                        size='small'
                    >Link training question</Button>
                </Link>
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

export default connect(mapStateToProps, null)(withTranslation()(DocumentQuestion));