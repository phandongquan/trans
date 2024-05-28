import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Switch } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import { getList as apiGetList, destroy as apiDelete, update as apiUpdate,} from '~/apis/company/jobQuestion';
import DeleteButton from '~/components/Base/DeleteButton';
import { convertToFormData, showNotify } from '~/services/helper';
import JobQuestionForm from '~/scenes/Company/JobQuestion/JobQuestionForm';

class New extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            jobQuestions: [],
            visible: false,
            jobQuestion: {}
        };
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getJobQuestions();
    }

    /**
     * Get list job question
     * @param {} params 
     */
    getJobQuestions = (params = {}) => {
        this.setState({ loading: true });
        let xhr = apiGetList(params);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({ 
                    loading: false,
                    jobQuestions: data.rows,
                });
            }
        });
    }

    /**
     * Delete job question
     * @param {*} e 
     * @param {*} id 
     */
    onDeleteJobQuestion = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = apiDelete(id);
        xhr.then((response) => {
            if (response.status) {
                this.getJobQuestions();
                showNotify(t('hr:notification'), t('hr:has_been_remove'));
            } else {
                showNotify(t('hr:notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('hr:notification'), t('server_error'));
        });
    }

    /**
     * Toggle popup
     * @param {*} visible 
     */
    togglePopup(visible = true, jobQuestion = {}) {
        this.setState({ visible, jobQuestion })
    }

    /**
     * Change status
     * @param {*} id 
     */
    changeStatus = (event, id) => {
        const { t } = this.props;
        this.setState({ loading: true })
        let xhr = apiUpdate(id, convertToFormData({ status: event ? 1 : 0 }))

        xhr.then(response => {
            this.setState({ loading: false })
            if(response.status) {
                showNotify(t('hr:notification'),t('hr:update_susscess'));
                this.getJobQuestions();
            }
        })
    }

    /**
     * @render
     */
    render() {
        let { t } = this.props;
        const columns = [
            {
                title: t('No.'),
                render: r => this.state.jobQuestions.indexOf(r) + 1 
            },
            {
                title: t('hr:title'),
                dataIndex: 'title'
            },
            {
                title: t('hr:answer'),
                dataIndex: 'answer'
            },
            {
                title: t('hr:status'),
                render: r => <Switch checked={r.status == 1 ? true : false} onChange={(e) => this.changeStatus(e, r.id)} />
            },
            {
                title: t('hr:priority'),
                render: r => r.priority
            },
            {
                title: t('hr:created_at'),
                render: r => r.created_at
            },
            {
                title: t('hr:modified_at'),
                render: r => r.updated_at
            },
            {
                title: t('hr:action'),
                render: r => {
                    return (<>
                            <Button onClick={() => this.togglePopup(true, r)} type="primary" size='small' icon={<FontAwesomeIcon icon={faPen}/>} className='mr-1' />
                            <DeleteButton onConfirm={(e) => this.onDeleteJobQuestion(e, r.id)}/>
                        </>)
                },
                align: 'center',
                width: '10%'
            }
        ]

        return (
            <div>
                <PageHeader
                    title={t('hr:question')}
                    tags={
                        <Button onClick={() => this.togglePopup(true, {})} key="create-job-question" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                            &nbsp;{t('hr:add_new')}
                        </Button>}
                />
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table
                            dataSource={this.state.jobQuestions}
                            columns={columns}
                            loading={this.state.loading}
                            pagination={{ pageSize: 15 }}
                            rowKey={r => r.id}
                        />
                    </Col>
                </Row>

                <JobQuestionForm 
                    visible={this.state.visible}
                    hiddenPopup={() => this.togglePopup(false)}
                    data={this.state.jobQuestion}
                    getList={() => this.getJobQuestions()}
                />
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
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(New));
