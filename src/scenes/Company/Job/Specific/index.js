import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Col, Row, Table, Button, Space, Popconfirm, Input, Form , Dropdown as DropdownAntd, Menu, Upload } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { jobSpectific } from '~/constants/basic';
import Tab from '~/components/Base/Tab';
import TabList from '~/scenes/Company/Job/config/jobTabList'
import { checkPermission, exportToXLS, showNotify } from '~/services/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrash, faDownload, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { getListQuestion, deleteQuestion, activeMultipleQuestions, importQuestion as importQuestionAPI, exportQuestion } from '~/apis/company/job/spectific';
import Dropdown from '~/components/Base/Dropdown';
import { formatData, formatHeader } from './config';
import dayjs from 'dayjs';
import { uniqueId } from 'lodash';
import Specific_Question from '~/assets/files/Specific_Question.xlsx';
import { saveAs } from 'file-saver';
class Specific extends Component {

    /**
     * @lifecycle
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef()
        this.state = {
            loading: false,
            candidates: [],
            jobs: [],
            candidateIDPopup: 0,
            workflows: {},
            rows: [],
            page: 1,
            limit: 20,
            total: 0,
            selectedRowKeys: []
        }
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getListQuestion();
    }

    async getListQuestion(params = {}) {
        let res = await getListQuestion(params);
        if (res.status) {
            this.setState({ rows: res.data.rows, selectedRowKeys: [] })
        }
    }

    exportQuestion() {
        const { t, baseData: { majors } } = this.props;
        exportQuestion()
            .then(res => {
                const { data } = res;
                let header = formatHeader();
                let rows = formatData(data, majors);
                let fileName = `Specific-${dayjs().format('YYYY-MM-DD')}`;
                let datas = [...header, ...rows];
                exportToXLS(fileName, datas);
            })
            .catch(err => console.log(err))
    }

    importQuestion(e) {
        let file = e.target.files[0]
        let formData = new FormData();
        formData.append('Upload[excel_file]', file);
        importQuestionAPI(formData)
            .then(res => {
                if (res.status) {
                    showNotify('Notification', 'Success!')
                    this.getListQuestion();
                } else {
                    showNotify('Notification', res.message, 'error')
                }
            })
            .catch(err => console.log(err))
    }


    /**
     * Submit form search get list
     * @param {*} values 
     */
    submitForm = (values) => {
        this.getListQuestion(values);
    }

    onDeleteQuestion = async (id) => {
        let res = await deleteQuestion(id);
        if (res.status) {
            let rows = this.state.rows.filter(r => r.id != id);
            this.setState({ rows })
        }
    }
    onSelectChange = (newSelectedRowKeys) => {
        this.setState({ selectedRowKeys: newSelectedRowKeys });
    };
    async activeMultiple() {
        let params = {
            status: 1,// active
            question_id: this.state.selectedRowKeys.toString()
        }
        let response = await activeMultipleQuestions(params);
        if (response.status) {
            showNotify('Notification', 'Success !')
            let values = this.formRef.current.getFieldsValue()
            this.getListQuestion(values)
        } else {
            showNotify('Notification', response.message, 'error')
        }
    }
    downloadImportTemplate(){
        saveAs(Specific_Question, 'Specific-Question-TEMPLATE.xlsx');
    }
    render() {
        let { t } = this.props;
        let { selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: (key) => this.onSelectChange(key)
        };
        const hasSelected = selectedRowKeys.length > 0;

        const columns = [
            {
                title: 'No.',
                render: r => this.state.rows.indexOf(r) + 1,
                width: 50,
            },
            {
                title: t('hr:title'),
                render: r => {
                    return <div dangerouslySetInnerHTML={{ __html: r.content }}></div>
                },
                width: '40%'
            },
            {
                title: t('hr:answer'),
                render: r => {
                    if (!r.answers.length) return "";
                    const lastAnswer = r.answers[r.answers.length - 1];
                    return lastAnswer?.content
                }
            },
            {
                title: t('hr:type'),
                render: r => {
                    return jobSpectific['type'][r.type]
                }
            },
            {
                title: t('hr:status'),
                render: r => jobSpectific['status'][r.status]

            },
            {
                title: t('hr:major'),
                render: r => {
                    let { baseData: { majors = [] } } = this.props;
                    let arr = r.major_id?.map(m => majors.find(ma => ma.id == m)?.name);
                    return arr.join(', ')
                }
            },
            {
                title: t('hr:date'),
                render: r => {
                    return r.updated_at
                }
            },
            {
                title: t('hr:action'),
                render: r => {
                    return <Space size={10}>
                        {
                            checkPermission('hr-job-specific-questions-update') ?
                                <Button
                                    type="primary"
                                    size='small'
                                    icon={<FontAwesomeIcon icon={faPen} />}
                                    onClick={() => this.props.history.push(`/company/job/specific/${r.id}/edit`)}
                                />
                                : []
                        }
                        {
                            checkPermission('hr-job-specific-questions-delete') ?
                                <Popconfirm
                                    title="Delete the task"
                                    description="Are you sure delete this question?"
                                    onConfirm={() => this.onDeleteQuestion(r.id)}
                                    onCancel={() => { }}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button
                                        type="danger"
                                        size='small'
                                        icon={<FontAwesomeIcon icon={faTrash} />}
                                    />
                                </Popconfirm>
                                : []
                        }
                    </Space>
                },
                align: 'center'
            }
        ]
        const items = [
            {
                key: '1',
                label: 
                <Menu.Item key={uniqueId('_dropdown')} icon={<FontAwesomeIcon icon={faDownload} />} onClick={this.downloadImportTemplate.bind(this)}>
                    &nbsp;&nbsp;&nbsp;{t('hr:download_template')}
                </Menu.Item>
            }
        ];
        return (
            <>
                <PageHeader
                    title={t('hr:specific_question')}
                    tags={
                        checkPermission('hr-job-specific-questions-create') ?
                            <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => {
                                this.props.history.push('/company/job/specific/create')
                            }}>
                                &nbsp;{t('hr:add_new')}
                            </Button> : ""
                    }
                    extra={[
                        <div style={{ textAlign: 'right', display: 'inline' }} key="import-training-question">
                            <DropdownAntd key={uniqueId('_dropdown')} menu={{ items }} type="primary" placement="bottomLeft" icon={<FontAwesomeIcon icon={faPlus} />}>
                                <Button key={uniqueId('_dropdown_btn')} className="mr-1"
                                    icon={<FontAwesomeIcon icon={faCaretDown} />}
                                />
                            </DropdownAntd>
                        </div>
                    ]}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={TabList(this.props)}></Tab>
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={(e) => this.submitForm(e)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Form.Item name="keyword">
                                    <Input placeholder={t('Keyword')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="major_id" >
                                    <Dropdown datas={this.props.baseData.majors} defaultOption="-- All Majors --" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="type" >
                                    <Dropdown datas={jobSpectific['type']} defaultOption="-- All Type --" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='submit'>
                                <Form.Item>
                                    <Space size={10}>
                                        <Button type="primary" htmlType="submit">
                                            {t('hr:search')}
                                        </Button>
                                        <Button type="primary" onClick={() => document.getElementById('file').click()}>
                                            {t('hr:import')}
                                        </Button>
                                        <Button type="primary" onClick={() => this.exportQuestion()}>
                                            {t('hr:export')}
                                        </Button>
                                    </Space>
                                    <input type="file" id="file" style={{ display: 'none' }} onChange={(e) => this.importQuestion(e)} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <div className='ml-2'>
                        <Popconfirm
                            title="Active multiple questions"
                            description="Are you sure to active multiple questions?"
                            onConfirm={() => this.activeMultiple()}
                            onCancel={() => { }}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="primary" onClick={() => { }} disabled={!hasSelected} loading={this.state.loading}>
                                {t('hr:approve')}
                            </Button>
                        </Popconfirm>
                        {/* <Button className='ml-2'  onClick={() => {}} disabled={!hasSelected} loading={this.state.loading}>
                            Inactive
                        </Button> */}
                    </div>
                    <Col span={24}>
                        <Table
                            loading={this.state.loading}
                            dataSource={this.state.rows}
                            columns={columns}
                            rowKey={r => r.id}
                            rowSelection={rowSelection}
                        />
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Specific));