import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { connect } from 'react-redux';
import { Button, Table, Row, Col, Form, Popconfirm, Input, Tooltip } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import TooltipButton from '~/components/Base/TooltipButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faEye, faPen, faPlus, faList } from '@fortawesome/free-solid-svg-icons';
import Icon, { QuestionCircleOutlined } from '@ant-design/icons';
import { getList as getListExam, create as createExam, destroy } from '~/apis/company/trainingExamination';
import { detail as apiDetailSkill } from '~/apis/company/skill';
import { trainingExamTypes, trainingExamStatus, staffStatus, trainingExamFormStatus } from '~/constants/basic';
import { Link } from 'react-router-dom';
import Tab from '~/components/Base/Tab';
import Dropdown from '~/components/Base/Dropdown';
import { parseIntegertoTime, showNotify, timeFormatStandard, historyReplace, historyParams, checkPermission } from '~/services/helper';
import tabListTraining from '../config/tabListTraining';
import tabListSkillExam from '~/scenes/Company/Skill/config/tab';
import CreateUpdateDate from '~/components/Base/CreateUpdateDate';
import DeleteButton from '~/components/Base/DeleteButton';
import {screenResponsive} from '~/constants/basic';
// import css
import './config/TrainingExaminationHistory.css';

const dateFormat = 'YYYY-MM-DD HH:mm';
const FormItem = Form.Item;

class TrainingExamination extends Component {

    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            examList: [],
            skill: null,
            total: 0,
            limit: 30,
            offset: 0,
            page: 1
        }
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        let params = historyParams();

        if(params.offset) {
            this.setState({ page: (params.offset/ this.state.limit) + 1})
        }
        let { skill_id } = this.props.match.params;
        if(skill_id) {
            params.skill_id = skill_id
        }
        this.getTrainingExamination(params);
        if (skill_id) this.getDetailSkill(skill_id);
    }

    /**
     * Get detail Skill
     * @param {} values 
     */
    async getDetailSkill(skill_id) {
        let response = await apiDetailSkill(skill_id)
        if (response.status) {
            let skill = response.data;
            this.setState({ skill: skill })
        }
    }

    /**
     * @event search report
     */
    submitForm = (values) => {
        let { skill_id } = this.props.match.params;
        let params = skill_id ? { skill_id: skill_id } : {}
        let datas = { ...values, ...params }

        this.getTrainingExamination(datas);
    }

    /**
     * Get list TrainingExam
     */
    async getTrainingExamination(params = {}) {
        params = {
            ...params,
            check_permission: true,
            limit: this.state.limit,
            offset: params.offset || (this.state.page - 1) * this.state.limit
        }

        historyReplace(params)
        this.setState({ loading: true });
        let response = await getListExam(params);
        if (response.status) {
            let { data } = response;
            let listData = [];
            if (data.rows) {
                Object.keys(data.rows).map(id => {
                    listData.push(data.rows[id]);
                })
            }
            this.setState({
                examList: listData,
                loading: false,
                total: data.total
            });
        }
    }

    /**
     * @event copy TrainingExamination
     * 
     * @param {} id 
     * @param {} e 
     */
    async onCopyExamination(e, id) {
        e.stopPropagation();
        let { t } = this.props;
        let { examList } = this.state;
        let examCopy = examList.find(r => r.id == id);
        let staffList = examCopy.staff;
        let arrStaff = [];
        let arrStaffStartFrom = [];
        if (staffList.length) {
            staffList.map(s => {
                arrStaff.push(s.staff_id)
                arrStaffStartFrom.push(s.start_from)
            });
        }
        let data = {
            ...examCopy,
            id: null,
            staff: null,
            skill: null,
            title: `Copy - ${examCopy.title}`,
            status: 2,
            start_from: examCopy.start_from && dayjs(examCopy.start_from * 1000).format(dateFormat),
            staff_id: arrStaff,
            staff_start_from: arrStaffStartFrom
        };
        let response = await createExam(data);
        if (response.status) {
            let values = this.formRef.current.getFieldsValue();
            this.getTrainingExamination(values);
            showNotify(t('hr:notification'), t('hr:examination_has_been_copied'));
        } else {
            showNotify(t('hr:notification'), response.message);
        }
    }

    /**
     * @event change page
     * 
     * @param {*} page 
     */
     onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        let { skill_id } = this.props.match.params;
        let params = skill_id ? { skill_id: skill_id } : {}
        this.setState({ page }, () => this.getTrainingExamination({...values, ...params}));
    }

    /**
     * On delete exam
     * @param {*} id 
     */
    onDeleteExam = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = destroy(id);
        xhr.then((response) => {
            if (response.status) {
                let values = this.formRef.current.getFieldsValue();
                this.getTrainingExamination(values);
                showNotify(t('hr:notification'), t('hr:training_exam_has_been_removed'));
            } else {
                showNotify(t('hr:notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('hr:notification'), t('hr:server_error'));
        });;
    }

    /**
     * @render
     */
    render() {
        let { t, match, baseData: { departments, majors, divisions } } = this.props;
        let { skill } = this.state;

        const columns = [
            {
                title: 'No.',
                align: 'center',
                render: r => this.state.examList.indexOf(r) + 1
            },
            {
                title: `${t('hr:title')} - ${t('hr:code')}`,
                render: r => (
                    <>
                        <strong>{r.title}</strong>
                        <br></br>
                        <p>{r.code}</p>
                    </>
                )
            },
            {
                title: t('hr:level'),
                dataIndex: 'level',
                align: 'center'
            },
            {
                title: t('hr:skill'),
                render: r => r.skill ? r.skill.name : 'N/A'
            },
            {
                title: t('hr:start'),
                render: r => r.start_from && parseIntegertoTime(r.start_from, dateFormat)
            },
            {
                title: t('hr:dept') + '/' + t('hr:sec') + '/' + t('hr:major'),
                render: r => {
                    let deparment = departments.find(d => r.staff_dept_id == d.id);
                    let deptName = deparment ? deparment.name : 'NA';
                    let division = divisions.find(d => r.division_id == d.id)
                    let divName = division ? division.name : 'NA';
                    let major = majors.find(m => r.major_id == m.id)
                    let majorName = major ? major.name : 'NA';
                    return `${deptName} / ${divName} / ${majorName}`;
                }
            },
            {
                title: t('hr:date'),
                render: r => <CreateUpdateDate record={r} />
            },
            {
                title: t('hr:status'),
                render: r => r.status && trainingExamFormStatus[r.status]
            },            
            {
                title: t('hr:action'),
                align: 'center',
                width: '18%',
                render: r => (
                    <>
                        <Link to={`/company/training-examination/${r.id}/edit`} key="edit-training-examination">
                            {
                                checkPermission('hr-training-examination-update')   ?
                                    <TooltipButton title={t('hr:edit')} type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />} />
                                : ''
                            }
                        </Link>
                        <Link to={`/company/training-examination/${r.id}/preview`} key="preview-training-examination">
                            {
                                checkPermission('hr-training-examination-preview') ? 
                                    <TooltipButton title={t('hr:preview')} style={{ marginLeft: 5 }} type="primary" size='small' icon={<FontAwesomeIcon icon={faEye} />} />
                                : ''
                             }
                        </Link>
                        <Popconfirm title={t('hr:confirm_copy_selected_item')} placement="topLeft"
                            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                            onConfirm={(e) => this.onCopyExamination(e, r.id)}
                        >
                            <TooltipButton title={t('hr:copy')} style={{ marginLeft: 5, marginRight: 5 }} onClick={(e) => e.stopPropagation()} type="primary" size='small' icon={<FontAwesomeIcon icon={faCopy} />} />
                        </Popconfirm>
                        {
                            checkPermission('hr-training-examination-delete') ?
                                <DeleteButton onConfirm={(e) => this.onDeleteExam(e, r.id)} />
                            : ''
                        }
                    </>
                )
            }
        ];

        let { skill_id } = match.params;
        let title = skill_id ? t('hr:skill') : t('hr:training_exam');
        let subTitle = skill_id ? (skill && skill.name) : '';

        return (
            <div>
                <PageHeader title={title}
                    subTitle={subTitle}
                    tags={[
                        <div key="tags">
                            <Link to={`/company/training-examination/create`} key="create-training-examination">
                                {
                                    checkPermission('hr-training-examination-create')   ?
                                        <Button key="create-training-examination" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                            &nbsp;{t('hr:add_new')}
                                        </Button>
                                    : ''
                                }
                            </Link>
                        </div>
                    ]}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={skill_id ? tabListSkillExam(skill_id,this.props) : tabListTraining(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchExamForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Form.Item name='keywords'>
                                    <Input placeholder={t('hr:title') + '/' + t('hr:code')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <FormItem name='department_id'>
                                    <Dropdown datas={departments} defaultOption={t('hr:all_department')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                                <FormItem name="division_id" >
                                    <Dropdown datas={divisions} defaultOption={t('hr:all_division')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                                <FormItem name='major_id'>
                                    <Dropdown datas={majors} defaultOption={t('hr:all_major')} />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                                <FormItem name='type'>
                                    <Dropdown datas={trainingExamTypes} defaultOption={t('hr:all_type')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                                <FormItem name='status'>
                                    <Dropdown datas={trainingExamFormStatus} defaultOption={t('hr:all_status')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem >
                                    <Button type="primary"
                                        htmlType="submit">
                                        {t('hr:search')}
                                    </Button>
                                </FormItem>
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
                                       dataSource={this.state.examList ? this.state.examList : []}
                                       columns={columns}
                                       loading={this.state.loading}
                                       // pagination={{ pageSize: 30, showSizeChanger: false }}
                                       pagination={{
                                           total: this.state.total,
                                           pageSize: this.state.limit,
                                           hideOnSinglePage: true,
                                           showSizeChanger: false,
                                           current: this.state.page,
                                           onChange: page => this.onChangePage(page)
                                       }}
                                       rowKey={(r) => r.id}
                                    />
                                </div>
                            </div>
                            :
                            <Table
                                dataSource={this.state.examList ? this.state.examList : []}
                                columns={columns}
                                loading={this.state.loading}
                                // pagination={{ pageSize: 30, showSizeChanger: false }}
                                pagination={{
                                    total: this.state.total,
                                    pageSize: this.state.limit,
                                    hideOnSinglePage: true,
                                    showSizeChanger: false,
                                    current: this.state.page,
                                    onChange: page => this.onChangePage(page)
                                }}
                                rowKey={(r) => r.id}
                            >
                            </Table>
                        }
                    </Col>
                </Row>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TrainingExamination));
