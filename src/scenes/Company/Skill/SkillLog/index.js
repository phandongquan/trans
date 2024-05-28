import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Table, Button, Row, Col, Form, DatePicker, Card, Modal } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import tabList from '~/scenes/Company/config/tabListSkill';
import Tab from '~/components/Base/Tab';
import { getList as apiGetList, statistical as apiStatistical } from '~/apis/company/staff/skill-log';
import { dateFormat, levels, skillLogSourceType } from '~/constants/basic'
import StaffDropdown from '~/components/Base/StaffDropdown';
import SkillDropdown from '~/components/Base/SkillDropdown';
import {  historyReplace, historyParams, timeFormatStandard, formatVND, exportToXLS, checkPermission, showNotify } from '~/services/helper';
import '../config/skillLog.css';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { formatHeader, formatData } from './config/exportExcel'
import { Link } from 'react-router-dom';
import Dropdown from '~/components/Base/Dropdown';
import TrainingExamResult from './TrainingExamResult';

import {screenResponsive} from '~/constants/basic';

const { RangePicker } = DatePicker;
const FormItem = Form.Item;
class StaffLog extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        let params = historyParams();
        this.state = {
            loading: false,
            datas: [],
            limit: 30,
            total: 0,
            page: params.page ? Number(params.page) : 1,
            statistical: {},
            visible: false,
            skillLog: null
        }
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        let params = historyParams();
        params.date = [
            params.from_date ? dayjs(params.from_date, dateFormat) : dayjs().startOf('months'),
            params.to_date ? dayjs(params.to_date, dateFormat) : dayjs()
        ];
        this.formRef.current.setFieldsValue(params)
        this.getListSkillLog(params);
        this.getStatistical(params);
    }

    /**
     * Get list skill log
     * @param {*} params 
     */
     getListSkillLog = async (params = {}) => {
        params = {
            ...params,
            offset: (this.state.page - 1) * this.state.limit,
            limit: this.state.limit,
        }

        if (params.date) {
            params.from_date = typeof params.date !== undefined && params.date ? timeFormatStandard(params.date[0], dateFormat) : undefined;
            params.to_date = typeof params.date !== undefined && params.date ? timeFormatStandard(params.date[1], dateFormat) : undefined;
            delete (params.date);
        }

        historyReplace(params);
        let response = await apiGetList(params)
        if(response.status) {
            this.setState({ datas: response.data.rows, total: response.data.total })
        }
    }

    /**
     * Get statistical staff skill logs
     * @param {*} params 
     */
    getStatistical = async (params = {}) => {
        if (params.date) {
            params.from_date = typeof params.date !== undefined && params.date ? timeFormatStandard(params.date[0], dateFormat) : undefined;
            params.to_date = typeof params.date !== undefined && params.date ? timeFormatStandard(params.date[1], dateFormat) : undefined;
            delete (params.date);
        }
        let response = await apiStatistical(params)
        if(response.status) {
            this.setState({ statistical: response.data[0] })
        }
    }

    /**
     * @event search report
     */
    submitForm = (e) => {
        this.setState({page: 1}, () => {
            let values = this.formRef.current.getFieldsValue();
            this.getListSkillLog({ ...values});
            this.getStatistical({ ...values});
        })
    }

    /**
     * @event change page
     * 
     * @param {*} page 
     */
     onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListSkillLog({ ...values }));
    }

    /**
     * Handle click export excel
     */
    exportSkillLog = async () => {
        this.setState({ loading: true })
        let params = this.formRef.current.getFieldsValue();
        params = {
            ...params,
            offset: 0,
            limit: 200000,
        }

        if (params.date) {
            params.from_date = typeof params.date !== undefined && params.date ? timeFormatStandard(params.date[0], dateFormat) : undefined;
            params.to_date = typeof params.date !== undefined && params.date ? timeFormatStandard(params.date[1], dateFormat) : undefined;
            delete (params.date);
        }

        let response = await apiGetList(params)
        this.setState({ loading: false })
        if(response.status) {
            let headerFormat = formatHeader();
            let dataFormat = formatData(response.data.rows)

            let datas = [...headerFormat, ...dataFormat];
            let fileName = `Skill-logs-${dayjs().format('YYYY-MM-DD')}`;

            exportToXLS(fileName, datas, [null, {width: 40}, null, {width: 20}])
        }
    }

    render() {
        let { datas, statistical, visible, skillLog } = this.state;
        let { t, baseData: { positions, majors ,departments, locations , divisions } } = this.props;
        const columns = [
            {
                title: 'No.',
                render: r => datas.indexOf(r) + 1
            },
            {
                title: t('hr:skill'),
                render: r => {
                    if(!r.skill) return '';
                    return <Link to={`/company/skill/${r.skill.id}/edit`}>{r.skill.name}</Link>
                } 
            },
            {
                title: t('hr:staff'),
                render: r => {
                    if(!r.staff) return '';
                    let positionFound = positions.find(p => p.id == r.staff.position_id)
                    let majorFound = majors.find(m => m.id == r.staff.major_id)
                    let deparmentFound = departments.find(d => d.id == r.staff.staff_dept_id)
                    let locFound = locations.find(l => l.id == r.staff.staff_loc_id)
                    return <span>
                        <Link to={`/company/staff/${r.staff.staff_id}/edit`}>{r.staff.staff_name}</Link>  
                    <small> <strong>#{r.staff.code}</strong> ({deparmentFound?.name} / {positionFound?.name} / {majorFound?.name} / {locFound?.name})</small></span>
                } 
            },
            {
                title: t('old_skill'),
                align: 'center',
                dataIndex: 'old_level'
            },
            {
                title: t('hr:new_skill'),
                align: 'center',
                dataIndex: 'new_level'
            },
            {
                title: t('hr:source'),
                render: r => skillLogSourceType[r.source_type]
            },
            {
                title: t('hr:date'),
                dataIndex: 'created_at'
            },
            {
                title: t('hr:approved_by'),
                render: r => r.user?.name
            },
            {
                title: t('hr:bonus_change'),
                render: r => {
                    let result = 0;

                    if(!r.skill) {
                        return result;
                    }

                    // Down skill
                    if(r.old_level == 1 && r.new_level == 0) result = -r.skill.cost
                    if(r.old_level == 2 && r.new_level == 0) result = -(r.skill.cost + r.skill.cost*0.1)
                    if(r.old_level == 2 && r.new_level == 1) result = - Number(r.skill.cost)*0.1

                    // Up skill
                    if(r.old_level == 0 && r.new_level == 1) result = r.skill.cost
                    if(r.old_level == 0 && r.new_level == 2) result = r.skill.cost + r.skill.cost*0.1
                    if(r.old_level == 1 && r.new_level == 2) result = r.skill.cost*0.1

                    return result && result != 0.000 && result != 0.00 ? formatVND(Math.round(result)) : ''
                }
            },
            {
                title: t('hr:action'),
                className:'misstext',
                render: r => {
                    return checkPermission('hr-skill-log-preview') ?
                        <Button
                            size='small'
                            type='primary'
                            icon={<FontAwesomeIcon icon={faEye} />}
                            onClick={() => this.setState({ visible: true, skillLog: r })}
                        /> : ''
                } 
            }
        ]
        return (
            <div id='page_staff_skill_list'>
                <PageHeader 
                    title={t('hr:skill') }
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabList(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchSkillForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Form.Item name='date'>
                                    <RangePicker style={{ width: '100%' }} format={dateFormat} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <FormItem name='staff_id'>
                                    <StaffDropdown defaultOption={t("hr:all_staff")} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <FormItem name="location_id" >
                                    <Dropdown datas={locations} defaultOption={t("hr:all_location")} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <FormItem name="major_id" >
                                    <Dropdown datas={majors} defaultOption={t("hr:all_major")} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <FormItem name="division_id" >
                                    <Dropdown datas={divisions} defaultOption={t("hr:all_division")} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6} >
                                <FormItem name="department_id" >
                                    <Dropdown datas={departments} defaultOption={t("hr:all_department")} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <FormItem name="level" >
                                    <Dropdown datas={levels} defaultOption={t("hr:all_level")}/>
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <FormItem name='skill_id'>
                                    <SkillDropdown defaultOption={t("hr:all_skill")} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={12} xl={8} className='mb-3'>
                                <Button type="primary" htmlType="submit">
                                    {t('hr:search')}
                                </Button>
                                {
                                    checkPermission('hr-skill-log-export') ?
                                        <Button onClick={() => this.exportSkillLog()} type="primary" style={{ marginLeft: 8 }} icon={<FontAwesomeIcon icon={faFileExport} />}>
                                            &nbsp;{t('hr:export')}
                                        </Button> : ''
                                }
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[12,12]} justify="center" className='mb-2'>
                    <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                        <Card className='card-staff-skill-log' title={t('hr:total_change')}>
                            <div className='statistical'>{statistical.total_change || 0}</div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                        <Card className='card-staff-skill-log' title={t('hr:total_staff')}>
                            <div className='statistical'>{statistical.total_staff || 0}</div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                        <Card className='card-staff-skill-log' title={t('hr:total_skill')}>
                            <div className='statistical'>{statistical.total_skill || 0}</div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                        <Card className='card-staff-skill-log' title={t('hr:up_skill')}>
                            <div className='statistical'>{statistical.up_skill || 0}</div>
                            <Row gutter={12}>
                                <Col span={8} className='card-child'>
                                    <div className='card-child-title'>0 - 1</div>
                                    <div className='card-child-result'>{statistical.up_skill_0_1 || 0}</div>
                                </Col>
                                <Col span={8} className='card-child'>
                                    <div className='card-child-title'>1 - 2</div>
                                    <div className='card-child-result'>{statistical.up_skill_1_2 || 0}</div>
                                </Col>
                                <Col span={8} className='card-child'>
                                    <div className='card-child-title'>0 - 2</div>
                                    <div className='card-child-result'>{statistical.up_skill_0_2 || 0}</div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                        <Card className='card-staff-skill-log' title={t('hr:down_skill')}>
                            <div className='statistical'>{statistical.down_skill || 0}</div>
                            <Row gutter={12}>
                                <Col span={8} className='card-child'>
                                    <div className='card-child-title'>1 - 0</div>
                                    <div className='card-child-result'>{statistical.down_skill_1_0 || 0}</div>
                                </Col>
                                <Col span={8} className='card-child'>
                                    <div className='card-child-title'>2 - 1</div>
                                    <div className='card-child-result'>{statistical.down_skill_2_1 || 0}</div>
                                </Col>
                                <Col span={8} className='card-child'>
                                    <div className='card-child-title'>2 - 0</div>
                                    <div className='card-child-result'>{statistical.down_skill_2_0 || 0}</div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                        <Card className='card-staff-skill-log' title={t('hr:skill_bonus')}>
                            <div className='statistical'>{statistical.deviant_cost_skill ? formatVND(Math.round(statistical.deviant_cost_skill)) : ''}</div>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                    {window.innerWidth < screenResponsive  ? 
                        <div className='block_scroll_data_table'>
                            <div className='main_scroll_table'> 
                                <Table
                                    dataSource={datas}
                                    columns={columns}
                                    loading={this.state.loading}
                                    rowKey={(staff) => staff.id}
                                    pagination={{
                                        total: this.state.total,
                                        pageSize: this.state.limit,
                                        hideOnSinglePage: true,
                                        showSizeChanger: false,
                                        current: this.state.page,
                                        onChange: page => this.onChangePage(page)
                                    }}
                                >
                                </Table>
                            </div>
                        </div>
                        :
                        <Table
                            dataSource={datas}
                            columns={columns}
                            loading={this.state.loading}
                            rowKey={(staff) => staff.id}
                            pagination={{
                                total: this.state.total,
                                pageSize: this.state.limit,
                                hideOnSinglePage: true,
                                showSizeChanger: false,
                                current: this.state.page,
                                onChange: page => this.onChangePage(page)
                            }}
                        >
                        </Table>
                        }
                    </Col>
                </Row>
                <TrainingExamResult 
                    visible={visible}
                    hidePopup={() => this.setState({ visible: false, skillLog: null })}
                    skillLog={skillLog}
                />
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffLog));