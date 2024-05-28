import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Form, Input, Progress } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import { getList as apiGetList, destroy as apiDelete,  getJobStatus as apiGetJobStatus } from '~/apis/company/job';
import { Link } from 'react-router-dom';
import Tab from '~/components/Base/Tab';
import Dropdown from '~/components/Base/Dropdown';
import { dateTimeFormat, skillStatus, screenResponsive } from '~/constants/basic';
import DeleteButton from '~/components/Base/DeleteButton';
import { showNotify, parseIntegertoTime, checkPermission, historyParams, historyReplace } from '~/services/helper';
import tabList from '~/scenes/Company/Job/config/jobTabList';
import CandidateForm from '~/scenes/Company/Job/Candidate/CandidateForm';
import CreateUpdateDate from '~/components/Base/CreateUpdateDate';

const FormItem = Form.Item;
const FormatDate = 'HH:mm DD/MM/YY ';

class Job extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        let params = historyParams();
        this.state = {
            loading: false,
            jobs: [],
            visiblePopup: false,
            jobIdPopup: 0,
            arrStatus: [],
            total: 0,
            limit: params.limit ? Number(params.limit) : 20,
            page: params.page ? Number(params.page) : 1,
        };
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        let { profile } = this.props.auth;
        if(!profile) {
            this.props.history.push('/')
        }
        let params = historyParams();
        this.formRef.current.setFieldsValue(params);
        let values = this.formRef.current.getFieldsValue();

        this.getJobStatus();
        this.getJobs(values);
    }

    /**
     * Get list job
     * @param {} params 
     */
    getJobs = (params = {}) => {
        this.setState({ loading: true });
        params.page = this.state.page;
        params.limit = this.state.limit;
        historyReplace(params);
        let xhr = apiGetList(params);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({ 
                    loading: false,
                    jobs: data.rows,
                    total: data.total_jobs
                });
            }
        });
    }

    /**
     * onChange page
     * @param {*} page 
     */
    onChangePage = page => {
        this.setState({ page }, () => this.getJobs())
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = (values) => {
        this.getJobs(values);
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

    /**
     * Delete job
     * @param {*} e 
     * @param {*} id 
     */
    onDeleteJob = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = apiDelete(id);
        xhr.then((response) => {
            if (response.status) {
                let values = this.formRef.current.getFieldsValue();
                this.getJobs(values);
                showNotify(t('hr:notification'), t('Job has been removed!'));
            } else {
                showNotify(t('hr:notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('hr:notification'), t('server_error'));
        });
    }

    /**
     * Show popup and set value job_id
     * @param {*} jobID 
     */
    togglePopup = ( visible, jobID ) => {
        this.setState({
            visiblePopup: visible,
            jobIdPopup: jobID
        });
    }

    /**
     * @render
     */
    render() {
        let { t, baseData: { departments, divisions, majors } } = this.props;
        let { jobs, arrStatus } = this.state;
        const columns = [
            {
                title: t('No.'),
                render: r => this.state.jobs.indexOf(r) + 1 
            },
            {
                title: t('hr:title'),
                render: r => {
                    let deparment = departments.find(d => r.staff_dept_id == d.id);
                    let deptName = deparment ? deparment.name : 'NA';
                    let division = divisions.find(d => r.division_id == d.id)
                    let divName = division ? division.name : 'NA';
                    let major = majors.find(m => r.major_id == m.id)
                    let majorName = major ? major.name : 'NA'; 
                    return (
                        <>
                            <Link to={`/company/job/${r.id}/edit`}>{r.title}</Link>
                            { r.code ? <small> - {r.code} </small> : '' }
                            <br></br><small> {deptName} / {divName} / {majorName} </small>
                        </>
                    )
                }
            },
            {
                title: t('hr:status'),
                render: r => arrStatus.map( item => item.id == r.status && item.name)
            },
            {
                title: t('hr:date'),
                render: r => <CreateUpdateDate record={r} />
            },
            {
                title :t('hr:point'),
                dataIndex: 'point',
            },
            {
                title: t('hr:candidate'),
                render: r => {
                    return (
                        <>
                            <Link to={`/company/job/${r.id}/apply`}><h5 className='text-primary'>{r.members_count}</h5></Link>
                            {checkPermission('hr-job-candidate-create') ?
                                <Button type="primary" shape="round" onClick={() => this.togglePopup(true, r.id)} >{t('hr:add_candidate')}</Button> : ""
                        }
                        </>
                    )
                },
                align: 'center'
            },
            {
                title: t('hr:action'),
                render: r => {
                    return (<>
                        {checkPermission('hr-job-update') ? 
                            <Link to={`/company/job/${r.id}/edit`} style={{ marginRight: 8 }} >
                                <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />} />
                            </Link> : ""
                        }
                        {checkPermission('hr-job-delete') ?
                            <DeleteButton onConfirm={(e) => this.onDeleteJob(e, r.id)} /> : ""
                        }
                            
                        </>)
                },
                align: 'center',
                width: '10%'
            }
        ]

        return (
            <>
                <PageHeader
                    title={t('hr:job')}
                    tags={<Link to="/company/job/create">
                        {checkPermission('hr-job-create') ? 
                            <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                &nbsp;{t('hr:add_new')}
                            </Button> : ""   
                    }
                    </Link>}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabList(this.props)}></Tab>
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="code">
                                    <Input placeholder={t('hr:code') + "," + t('hr:title')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="department_id" >
                                    <Dropdown datas={departments} defaultOption= {t('hr:all_department')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="division_id" >
                                    <Dropdown datas={divisions} defaultOption= {t('hr:all_division')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="major_id" >
                                    <Dropdown datas={majors} defaultOption={t('hr:all_major')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="status" >
                                    <Dropdown datas={arrStatus} defaultOption={t('hr:all_status')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='submit'>
                                <FormItem>
                                    <Button type="primary" htmlType="submit">
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
                                           dataSource={jobs}
                                           columns={columns}
                                           loading={this.state.loading}
                                           rowKey={(job) => job.id}
                                           pagination={{
                                               total: this.state.total,
                                               pageSize: this.state.limit,
                                               hideOnSinglePage: true,
                                               showSizeChanger: false,
                                               current: this.state.page,
                                               onChange: page => this.onChangePage(page)
                                           }}
                                        />
                                    </div>
                                </div>
                                :
                            <Table
                                dataSource={jobs}
                                columns={columns}
                                loading={this.state.loading}
                                rowKey={(job) => job.id}
                                pagination={{
                                    total: this.state.total,
                                    pageSize: this.state.limit,
                                    hideOnSinglePage: true,
                                    showSizeChanger: false,
                                    current: this.state.page,
                                    onChange: page => this.onChangePage(page)
                                }}
                            />
                        }
                    </Col>
                </Row>

                {
                    this.state.visiblePopup ?
                    <CandidateForm 
                        visible={this.state.visiblePopup}
                        hidePopup={ () => this.togglePopup( false, 0 ) }
                        jobID = { this.state.jobIdPopup }
                    /> 
                    : []
                }
            </>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Job));
