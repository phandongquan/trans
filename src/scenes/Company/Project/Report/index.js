import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col, Form, DatePicker, Button, Progress } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab';
import tabListProject from '~/scenes/Company/config/tabListProject';
import { dateFormat, projectTaskStatus, projectTaskPriority } from '~/constants/basic';
import Dropdown from '~/components/Base/Dropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { getReport as apiGetReport} from '~/apis/company/project';
import { Link } from 'react-router-dom';
import { UserOutlined, CaretLeftOutlined } from '@ant-design/icons';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { timeFormatStandard } from '~/services/helper';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ExportXLSButton from '~/components/Base/ExportXLSButton';
import { getHeader, formatData } from '~/scenes/Company/Project/config/ProjectReportExcel';

const { RangePicker } = DatePicker;
class Report extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            tasksData: [],
            kpiCount: 0,
            kpiTotal: 0,
            bodyTable: null,
        }
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        let { params } = this.props.location;
        if(params != undefined){
            params.staff_id = params.staff_id ? [params.staff_id] : [];
            this.formRef.current.setFieldsValue(params)
            params.status = typeof params.status == 'undefined' ? -1 : params.status;
        } else {
            params = { status: -1 }
        } 
        this.getListReport(params);
    }

    /**
     * Get List reportProject
     * @param {*} params 
     */
    async getListReport (params = {}) {
        let response = await apiGetReport(params);
        if(response.status){
            this.setState({tasksData: response.data.rows});
            if(params.staff_id || params.position_id)
                this.setState({bodyTable: this.renderSummaryTask(response.data.rows)})
            else
                this.setState({bodyTable: this.renderSummaryProject(response.data.rows)})
        }
    } 

    /**
     * @event sumbmit form
     * @param {*} values 
     */
    submitForm(values) {
        values.status = typeof values.status == 'undefined' ? -1 : values.status;
        this.getListReport(values);
    }

    /**
     * Format data to excel
     */
    formatExportCell() {
        let header = getHeader();
        let data = formatData(this.state.tasksData);
        return [...header, ...data];
    }

    renderSummaryTask(tasks) {
        let result = [];
        let arrColor = {
            0: '',
            1: '',
            2: 'bg-success text-white',
            3: 'bg-danger text-white',
            4: ''
        }
        this.setState({
            kpiCount: 0,
            kpiTotal: 0
        })

        tasks.map(task => {
            /** Get list staff */
            let listStaff = [];
            task.staff.map(staff => listStaff.push(<p key={staff.id} className='mb-0'><UserOutlined /> {staff.info ? staff.info.code + ' - ' + staff.info.staff_name : ''}</p>))
            
            let taskKpi = 0;
            if(task.status == 2 || task.status == 3){
                taskKpi = task.kpi * (task.piority + 1);
                this.setState({
                    kpiCount: this.state.kpiCount + (task.piority + 1),
                    kpiTotal: this.state.kpiTotal + taskKpi
                })
            }

            result.push(
                <tr className={arrColor[task.status]} key={task.id}>
                    <td>
                        {task.name}
                        {task.parent ? <small><CaretLeftOutlined />{task.parent.name}</small> : ''}
                        { task.project ? 
                            <small>
                                <CaretLeftOutlined />
                                <Link to={`/company/projects/${task.project.id}/edit`}> {task.project.name}</Link>
                            </small> 
                        : ''}
                    </td>
                    <td>{task.piority_text}</td>
                    <td>{listStaff}</td>
                    <td>{task.duration}</td>
                    <td>{task.date_start ? timeFormatStandard(task.date_start, dateFormat) : ''}</td>
                    <td>{task.date_end ? timeFormatStandard(task.date_end, dateFormat) : ''}</td>
                    <td>{projectTaskStatus[task.status]}</td>
                    <td>{task.kpi}</td>
                    <td className='text-right'>{taskKpi > 0 && taskKpi}</td>
                </tr>
            )
        })

        return result;
    }

    /**
     * @param {*} task 
     * @param {*} tasks 
     * @param {*} taskKpi 
     */
    renderTask(task, tasks, taskKpi) {
        let result = [];
        /** Get list staff */
        let listStaff = [];
        task.staff.map(staff => listStaff.push(<p key={staff.id} className='mb-0'><UserOutlined /> {staff.info ? staff.info.code + ' - ' + staff.info.staff_name : ''}</p>))
        
        result.push(
            <tr key={task.id}>
                <td className={task.parent_id ? 'subtask' : ''}>{task.name}</td>
                <td>{projectTaskPriority[task.piority]}</td>
                <td>{listStaff}</td>
                <td>{task.duration}</td>
                <td>{task.date_start ? timeFormatStandard(task.date_start, dateFormat) : ''}</td>
                <td>{task.date_end ? timeFormatStandard(task.date_end, dateFormat) : ''}</td>
                <td>{projectTaskStatus[task.status]}</td>
                <td>{task.kpi}</td>
                <td className='text-right'>{taskKpi > 0 && taskKpi}</td>
            </tr>
        )

        tasks.map(subTask => {
            if(subTask.parent_id == task.id){
                let subTaskKpi = 0;
                if(task.status == 2 || task.status == 3){
                    subTaskKpi = task.kpi * (task.piority + 1);
                    this.setState({
                        kpiCount: this.state.kpiCount ++,
                        kpiTotal: this.state.kpiTotal + subTaskKpi
                    })
                }
                result.push(this.renderTask(subTask, tasks, subTaskKpi))
            }
        })

        return result;
    }

    /**
     * 
     * @param {*} tasks 
     */
    renderSummaryProjectTask = (tasks) => {
        let result = [];
        this.setState({test: 2})
        tasks.map(task => {
            /** Count Kpi */
            if(!task.parent_id){
                let taskKpi = 0;
                if(task.status == 2 || task.status == 3){
                    taskKpi = task.kpi * (task.piority + 1);
                    this.setState({
                        kpiCount: this.state.kpiCount + (task.piority + 1),
                        kpiTotal: this.state.kpiTotal + taskKpi
                    })
                }
                result.push(this.renderTask(task, tasks, taskKpi));
            }
        });

        return result;
    }

    /**
     * 
     * @param {*} projects 
     */
    renderSummaryProject = (projects) => {
        let { t, baseData:{ departments } } = this.props
        /** Declare  kpiTotal kpiCount */
        this.setState({
            kpiCount: 0,
            kpiTotal: 0
        })
        
        let result = [];
        if(projects) 
            projects.map(project => {

                /** Get department name for column Project/Task */
                let departmentName = '';
                departments.map(d => d.id == project.department_id ? departmentName = d.name : '');

                /** Get list Staff for column Assign  */
                let arrStaffAssign = [];
                project.main_assign.map((value, key) => {
                    if(key < 3) arrStaffAssign.push(<p key={value.staff_id}><UserOutlined /> {value.info ? value.info.staff_name : ''}</p>) 
                })

                /** Case list staff more than 3 staffs  */
                if(project.main_assign.length > 3)
                    arrStaffAssign.push(<div > + <Button type='primary' shape="round" size='small'> {Number(project.main_assign.length - 3)} {t('Other')}</Button></div>)

                
                if(project.tasks.length){
                    result.push(
                        <tr style={{ backgroundColor: '#e6f7ff' }} key={project.id}>
                            <td><strong>{departmentName ? departmentName : 'N/A'}</strong> - <Link to={`/company/projects/${project.id}/edit`}>{project.name}</Link></td>
                            <td></td>
                            <td style={{ lineHeight: 0.1 }}>{arrStaffAssign}</td>
                            <td colSpan={6}>
                                {project.data ?
                                    <div>
                                        <p>
                                            <b>{project.data.task_finished}/{project.data.task_total}</b> {t('finished')}
                                            {project.data.task_lated > 0 ? <> &nbsp;-&nbsp;<b>{project.data.task_finished}/{project.data.task_total}</b> {t('lated')}</> : []}
                                        </p>
                                        <Progress
                                            percent={project.data.task_finished_per + project.data.task_lated}
                                            strokeColor='#ff4d4f'
                                            success={{ percent: project.data.task_finished_per, strokeColor: '#108ee9' }}
                                        />
                                    </div>
                                    : []}
                            </td>
                        </tr>
                    )
                    result.push( this.renderSummaryProjectTask(project.tasks) )
                }
            })
        return result;
    }
    
    render() {
        let { t, baseData: { departments, divisions, positions } } = this.props;
        return (
            <div id='page_report'>
                <PageHeader title={t('Report')} />
                <Row className='card pl-3 pr-3 mb-3'>
                    <Tab tabs={tabListProject} />
                    <Form ref={this.formRef} className="pt-3" name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col span={6}>
                                <Form.Item name='date'>
                                    <RangePicker format={dateFormat} style={{width: '100%'}}/>
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name='department_id'>
                                    <Dropdown datas={departments} defaultOption={t('-- All Departments --')} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name='division_id'>
                                    <Dropdown datas={divisions} defaultOption={t('-- All Sections --')} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col span={6}>
                                <Form.Item name="staff_id">
                                    <StaffDropdown mode="multiple" defaultOption={t('-- All Staffs --')}/>
                                </Form.Item>
                            </Col>
                            
                            <Col span={4}>
                                <Form.Item name='position_id'>
                                    <Dropdown datas={positions} defaultOption={t('-- All Positions --')} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name="status">
                                    <Dropdown datas={projectTaskStatus} defaultOption={t('-- All Status --')}/>
                                </Form.Item>
                            </Col>                         
                            <Col span={4} key='submit'>
                                <div className='block_height_button'>
                                    <Button type="primary" htmlType="submit" className='mr-2'>
                                        {t('Search')}
                                    </Button>
                                    <ExportXLSButton key="export-project-report" 
                                        dataPrepare={() => this.formatExportCell()} 
                                        fileName={`Project-Report-${dayjs().format('YYYY-MM-DD')}`}
                                        type="primary"
                                        icon={<FontAwesomeIcon icon={faFileExport} />}
                                        >
                                            &nbsp;{t('Export')}
                                    </ExportXLSButton>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row className='card'>
                    <table className="table table-striped project-task mt-3">
                        <thead>
                            <tr>
                                <th scope="col" key="task">{t('Project/Task')}</th>
                                <th scope="col" key="piority" style={{ textAlign: 'center' }} width='5%'>{t('Piority')}</th>
                                <th scope="col" key="assign" style={{ textAlign: 'center' }} width='15%'>{t('Assign')}</th>
                                <th scope="col" key="duration" style={{ textAlign: 'center' }} width='5%'>{t('Duration')}</th>
                                <th scope="col" key="start" style={{ textAlign: 'center' }} width='10%'>{t('Start')}</th>
                                <th scope="col" key="end" style={{ textAlign: 'center' }} width='10%'>{t('End')}</th>
                                <th scope="col" key="status" style={{ textAlign: 'center' }} width='5%'>{t('Status')}</th>
                                <th scope="col" key="score" style={{ textAlign: 'center' }} width='5%'>{t('Score')}</th>
                                <th scope="col" key="total_score" style={{ textAlign: 'right' }} width='5%'>{t('Total Score')}</th>
                            </tr>
                        </thead>
                        <tbody>{this.state.bodyTable ? this.state.bodyTable : [] }</tbody>
                        <tfoot key='footer'>
                            <tr>
                                <td colSpan={7}></td>
                                <td><b>{t('Kpi')}</b></td>
                                <td className='text-right'><b>{this.state.kpiTotal ? Math.round(this.state.kpiTotal / Math.max(this.state.kpiCount, 1), 2) : ''}</b></td>
                            </tr>
                        </tfoot>
                    </table>
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

export default connect(mapStateToProps)(withTranslation()(Report))