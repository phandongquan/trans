import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { getList as apiGetList } from '~/apis/company/sheetSummary'
import { getDivisionByDept } from '~/apis/setting/division';
import { Link } from 'react-router-dom';
import { Table, Form, Row, Col, Button,Image } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab';
import tabList from '~/scenes/Company/config/tabListSkill';
import { historyReplace, historyParams, timeFormatStandard, formatVND, exportToXLSMultipleSheet, checkPermission, getThumbnailHR, convertToFormData, showNotify } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown'
import StaffDropdown from '~/components/Base/StaffDropdown';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faFileExport, faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import SkillRevenueModal from './detail.js';
import { getHeader, formatData } from './config/exportExcel'
import { exportBackground } from '~/apis/excelIOLogs/index.js';
import { skillBonusReport, percentDifference, skillBonusReportExport as apiExport } from '~/apis/company/sheetSummary'
import { getHeader as getHeaderSkillBonus, formatData as formatDataSkillBonus } from './config/exportExcelSkillBonusReport';
import { getHeader as header, formatDataSkillBonus as formatSkillReport, getSumHeaders } from './config/SkillBounusReportExcel.js';
import ExcelService from '~/services/ExcelService';
import { styles } from './config/SkillBounusReportExcel.js';
import { dateFormat, screenResponsive, EXCEL_IO_TYPE_OUTPUT_SHEET_SUMMARY_SKILL_BONUS } from '~/constants/basic';
import './config/SkillRevenue.css';

export class SkillRevenue extends Component {

    constructor(props) {
        super(props)
        this.formRef = React.createRef()
        let params = historyParams();
        this.state = {
            loading: false,
            datas: [],
            total: 0,
            limit: 30,
            page: params.page ? Number(params.page) : 1,
            skillRevenueModalVisible: false,
            sheetSummary: {},
            report: [],
            divisions: []
        }
        this.setModalVisible = this.setModalVisible.bind(this);
    }

    componentDidMount() {
        const { staff_info } = this.props.auth

        let params = historyParams();
        let { staffInfo } = this.props;

        if (params.department_id || staff_info.staff_dept_id) {
            this.getListDivision(params.department_id ? params.department_id : staff_info.staff_dept_id);
        }

        params = {
            ...params,
            month: params.month ? dayjs(params.month + '-01') : dayjs(),
            department_id: params.department_id?params.department_id: staffInfo.staff_dept_id,
        }

        this.formRef.current.setFieldsValue(params)
        let values = this.formRef.current.getFieldsValue();
        this.getListSkillRevenuies(values)
        this.getPercentDifference(values)
    }

    /**
     * Get list skill revenue
     */
    async getListSkillRevenuies(params = {}) {
        this.setState({ loading: true })
        params = {
            ...params,
            offset: (this.state.page - 1) * this.state.limit,
            limit: this.state.limit,
            month: dayjs().format('YYYY-MM'),
            is_admin: true,
            is_skill_revenue: true,
        }
        historyReplace(params);
        let response = await apiGetList(params)
        this.setState({ loading: false })
        if (response.status) {
            this.setState({ datas: response.data.rows, total: response.data.total })
        }
    }

    /**
     * 
     * @param {*} params 
     */
    async getPercentDifference(params) {
        params = {
            ...params,
            month: dayjs().format('YYYY-MM'),
            is_admin: true,
            is_skill_revenue: true,
        }

        let response = await percentDifference(params)
        if (response.status) {
            this.setState({ report: response.data })
        }
    }

    /**
     * Get list division
     * @param {*} deptId 
     */
    getListDivision = async (deptId) => {
        if (!deptId) {
            return false;
        }
        this.formRef.current.setFieldsValue({
            division_id: null
        })
        let response = await getDivisionByDept(deptId);
        if (response.status) {
            this.setState({ divisions: response.data })
        }
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = (values) => {
        this.setState({ page: 1 }, () => {
            this.getListSkillRevenuies(values)
            this.getPercentDifference(values)
        });
    }

    /**
     * @event change page
     * 
     * @param {*} page 
     */
    onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListSkillRevenuies({ ...values }));
    }

    /**
     * Set visible modal
     * @param {*} skillRevenueModalVisible 
     */
    setModalVisible(skillRevenueModalVisible = false) {
        this.setState({ skillRevenueModalVisible });
    }

    /**
     * Format data export excel
     */
    formatExportCell = async () => {
        this.setState({ loading: true })
        let params = this.formRef.current.getFieldsValue();
        params = {
            ...params,
            month: dayjs().format('YYYY-MM'),
        }

        let responseSkillBonus = await skillBonusReport(params);
        if (responseSkillBonus.status) {
            let resultSkillBonus = responseSkillBonus.data;

            let headerFormatSkillBonus = getHeader();
            let dataFormatSkillBonus = formatData(resultSkillBonus);

            let headerSkillBonusLogs = getHeaderSkillBonus();


            let dataXls = {
                'List': {
                    datas: [...headerFormatSkillBonus, ...dataFormatSkillBonus],
                    autofit: [null, { width: 25 }, null, { width: 25 }, null, null, { width: 25 }, { width: 25 }]
                }
            }
            const chunkSize = 200;
            let chunkCount = 0;
            for (let i = 0; i < resultSkillBonus.length; i += chunkSize) {
                let chunkSkillBonus = resultSkillBonus.slice(i, i + chunkSize);

                let dataFormatSkillBonusLogs = formatDataSkillBonus(chunkSkillBonus);
                let detailSheetname = chunkCount ? `Detail ${chunkCount}` : 'Detail';
                dataXls[detailSheetname] = {
                    datas: [...headerSkillBonusLogs, ...dataFormatSkillBonusLogs],
                    autofit: [null, { width: 25 }, null, null, { width: 25 }, { width: 25 }, null, null, { width: 40 }]
                };
                chunkCount++;
            }
            // let dataXls = {
            //     'List': {
            //         datas: [...headerFormatSkillBonus, ...dataFormatSkillBonus],
            //         autofit: [null, { width: 25 }, null, { width: 25 }, null, null, { width: 25 }, { width: 25 }]
            //     },
            //     'Detail': {
            //         datas: [...headerSkillBonusLogs, ...dataFormatSkillBonusLogs],
            //         autofit: [null, { width: 25 }, null, null, { width: 25 }, { width: 25 }, null, null, { width: 40 }]
            //     }
            // }
            this.setState({ loading: false })
            let fileName = `Skill-bonus-${dayjs().format('YYYY-MM-DD')}`;
            exportToXLSMultipleSheet(fileName, dataXls);
        }
    }

    /**
     * Export skill bonus
     */
    exportSkillBonus = async () => {
        this.setState({ loading: true })
        let responseSkillBonus = await apiExport();
        if (responseSkillBonus.status) {
            let resultSkillBonus = responseSkillBonus.data;
            let headerFormatSkillBonus = header();
            let dataFormatSkillBonus = formatSkillReport(resultSkillBonus);
            let sumHeaders = getSumHeaders(typeof resultSkillBonus == 'object' ? Object.keys(resultSkillBonus).length : 0);
            let datas = [...sumHeaders, ...headerFormatSkillBonus, ...dataFormatSkillBonus];
            let fileName = `Skill-bonus-${dayjs().format('YYYY-MM-DD')}`;
            this.setState({ loading: false })
            let excelService = new ExcelService(['Main Sheet']);
            excelService.addWorksheetDatas(datas)
                .addWorksheetStyles(styles)
                .addColorRow(3, 'FFFF00', 'FF0000')
                .addColorGreenRow(2, '93C47D', '000000')
                .addAllCellBorders('thin', '000000')
                .addColorCell(7, 'F4C7C3', '000000')
                .forceDownload(fileName);
        }
    }

    /**
     * 
     */
    exportExcelBackground = async () => {
        let { t } = this.props;
        let params = this.formRef.current.getFieldsValue();
        this.setState({ loading: true })
        if (params.date) {
            params.from_date = timeFormatStandard(params.date, dateFormat);
            params.to_date = timeFormatStandard(params.date, dateFormat);
            params.month = timeFormatStandard(params.date, 'YYYY-MM');
            delete (params.date)
        } else {
            params.month = dayjs().format('YYYY-MM');
        }
        let param = {};
        let formData = convertToFormData(param)
        formData.append('type', EXCEL_IO_TYPE_OUTPUT_SHEET_SUMMARY_SKILL_BONUS)
        formData.append('param[month]', params.month)
        let response = await exportBackground(formData)
        if (response.status) {
            this.setState({ loading: false })
            const btn = (
                <a style={{ color: '#009aff' }} href={'/excel-io-logs'} target='_blank'>
                    {t('hr:open')}
                </a>
            );

            showNotify(t('notification'), 'Yêu cầu thành công! Bấm để mở danh sách đợi Export-Import.', "success", 5, btn);
        } else {
            this.setState({ loading: false })
            showNotify(t('notification'), response.message, "error")
        }
    }

    render() {
        let { t, baseData: { positions, majors, departments, locations, divisions } } = this.props;
        let { datas, report } = this.state;

        const columns = [
            {
                title: t('hr:staff'),
                render: r => {
                    if (!r.staff) {
                        return '';
                    }
                    return (
                        <div className='block_info_staff'>
                            <div className='block_avata'>
                                <Image
                                    height={75}
                                    src={getThumbnailHR(r.staff.user.avatar, '320x320')}
                                />
                            </div>
                            <div>
                                <div><Link to={`/company/staff/${r.staff.staff_id}/edit`}>{r.staff.staff_name}</Link> - #<strong>{r.staff.code}</strong></div>
                                <div><small>{r.staff.staff_phone ? `${r.staff.staff_email} - ${r.staff.staff_phone}` : ''}</small></div>
                                <div>{positions.map(m => m.id == r.staff.position_id && m.name)}</div>
                                <div>{majors.map(m => m.id == r.staff.major_id && m.name)}</div>
                            </div>
                        </div>
                    )
                }
            },
            {
                title: t('hr:dept') + '/' + t('hr:sec') + '/' + t('hr:location'),
                render: r => {
                    if (!r.staff) {
                        return '';
                    }

                    let deparment = departments.find(d => r.staff.staff_dept_id == d.id);
                    let deptName = deparment ? deparment.name : 'NA';
                    let division = divisions.find(d => r.staff.division_id == d.id)
                    let divName = division ? division.name : 'NA';
                    let location = locations.find(l => r.staff.staff_loc_id == l.id)
                    let locName = location ? location.name : 'NA';
                    return (
                        <>
                            <strong>{deptName}</strong> / {divName} 
                            <div>{locName}</div> 
                        </>
                    )
                },
                width: '30%'
            },
            {
                title: t('hr:working_months'),
                align: 'center',
                render: r => {
                    if(!r.staff) {
                        return '';
                    }

                    if(r.staff.staff_hire_date) {
                        return <span><strong>{r.staff.staff_hire_date ? dayjs().diff(dayjs(r.staff.staff_hire_date * 1000), 'months', true).toFixed(1) : ''}</strong> months</span>
                    }
                },
                width: '10%'
            },
            {
                title: t('hr:bonus') + ' (VND)',
                render: r => 
                    {
                       
                        let precent = 100;
                        if(r.prev_skill_revenue && r.prev_skill_revenue.skill_revenue > 0) {
                            precent = ((r.skill_revenue - r.prev_skill_revenue.skill_revenue) * 100) / r.prev_skill_revenue.skill_revenue
                        }
                        if(precent != 0) {
                            let icon = <FontAwesomeIcon icon={precent >= 0 ? faAngleUp : faAngleDown} style={{ fontSize: 16 }} />
                            return(
                                <div>
                                    <span>{formatVND(r.skill_revenue, '')}</span>
                                    <span style={{ color: precent >= 0 ? '#24b772' : '#c52b5b' }}>{icon} <span>{Math.trunc(precent)}</span> %</span>
                                </div>
                            ) 
                            
                        }
                    },
                align: 'right',
                width: '10%'
            },
            {
                title: t('hr:view_skill'),
                align: 'center',
                width: '10%',
                render: r => <>
                
                    <div className='text-center'>
                    <Button type="primary" size='small' onClick={() => this.setState({
                        skillRevenueModalVisible: true,
                        sheetSummary: r
                    })} icon={<FontAwesomeIcon icon={faEye} />}>
                    </Button>
                    </div>
                </>
            }
        ]

        return (
            <div>
                <PageHeader title={t('hr:skill_bonus')} />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabList(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={[12, 0]}>

                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Form.Item name='position_id'>
                                    <Dropdown datas={positions} defaultOption={t("hr:all_position")} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Form.Item name='department_id'>
                                    <Dropdown datas={departments} defaultOption={t("hr:all_department")} onChange={value => this.getListDivision(value)} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Form.Item name='division_id'>
                                    <Dropdown datas={this.state.divisions} defaultOption={t("hr:all_section")} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[12, 0]}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Form.Item name='major_id'>
                                    <Dropdown datas={majors} defaultOption={t("hr:all_major")} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Form.Item name='staff_id'>
                                    <StaffDropdown defaultOption={t("hr:all_staff")}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={10} className='pb-2'>
                                <div className='block_height_button'>
                                    <Button type="primary" htmlType="submit">
                                        {t('hr:search')}
                                    </Button>
                                    <Button onClick={() => this.exportExcelBackground()} type="primary" style={{ marginLeft: 8 }} >
                                        &nbsp;{t('hr:export_background')}
                                    </Button>
                                    {
                                        checkPermission('hr-skill-bonus-export') ?
                                            <Button key="export-staff"
                                                type="primary"
                                                icon={<FontAwesomeIcon icon={faFileExport} />}
                                                className='ml-2'
                                                loading={this.state.loading}
                                                onClick={() => this.formatExportCell()}
                                            >
                                                &nbsp;{t('hr:export')}
                                            </Button>
                                            : ''
                                    }
                                    {
                                        checkPermission('hr-skill-bonus-export') ?
                                            <Button key="export-skill-bonus"
                                                type="primary"
                                                icon={<FontAwesomeIcon icon={faFileExport} />}
                                                className='ml-2'
                                                loading={this.state.loading}
                                                onClick={() => this.exportSkillBonus()}
                                            >
                                                &nbsp;{t('hr:export_skill_bonus')}
                                            </Button>
                                            : ''
                                    }

                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={6} className='mb-1'>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                        <div className='card p-3 block-report border-blue mb-3'>
                            <span className='text-muted' style={{ textTransform: 'uppercase', fontWeight: 600 }}>Tổng số tiền Bonus
                                {report.percent_total_revenue != 0 ?
                                    <span className='ml-3' style={{ color: report.percent_total_revenue >= 0 ? '#24b772' : '#c52b5b' }}>
                                        <FontAwesomeIcon icon={report.percent_total_revenue >= 0 ? faAngleUp : faAngleDown} style={{ fontSize: 19, marginRight: 4 }} />
                                        {Math.trunc(report.percent_total_revenue)} %
                                    </span>
                                    : ''}
                            </span>
                            <div className='ml-3 mb-3 d-flex justify-content-between align-items-end'>
                                <div style={{ lineHeight: 1.2, marginTop: 7 }}>
                                    <span style={{ fontSize: 38, fontWeight: '600', marginLeft: 20 }}>
                                        {report.total_revenue ? formatVND(report.total_revenue, 'vnd') : '0 vnd'}
                                    </span>
                                </div>
                                <div>
                                    <small className='text-muted'>Tháng trước: {report.previous_total_revenue ? formatVND(report.previous_total_revenue, 'vnd') : '0 vnd'}</small>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                        <div className='card p-3 block-report border-pink mb-3'>
                            <span className='text-muted' style={{ textTransform: 'uppercase', fontWeight: 600 }}>Tổng số người hưởng Bonus
                                {report.percent_total_staff != 0 ?
                                    <span className='ml-3' style={{ color: report.percent_total_staff >= 0 ? '#24b772' : '#c52b5b' }}>
                                        <FontAwesomeIcon icon={report.percent_total_staff >= 0 ? faAngleUp : faAngleDown} style={{ fontSize: 19, marginRight: 4 }} />
                                        {Math.trunc(report.percent_total_staff)} %
                                    </span>
                                    : ''}
                            </span>
                            <div className='ml-3 d-flex justify-content-between align-items-end'>
                                <div style={{ lineHeight: 1.2, marginTop: 7 }}>
                                    <span style={{ fontSize: 38, fontWeight: '600', marginLeft: 20 }}>
                                        {report.total_staff} người
                                    </span>
                                </div>
                                <div>
                                    <small className='text-muted'>Tháng trước: {report.previous_total_staff} người</small>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                {window.innerWidth < screenResponsive ?
                    <div className='block_scroll_data_table'>
                        <div className='main_scroll_table'>
                            <Table
                                loading={this.state.loading}
                                columns={columns}
                                dataSource={datas}
                                rowKey='id'
                                pagination={{
                                    total: this.state.total,
                                    pageSize: this.state.limit,
                                    hideOnSinglePage: true,
                                    showSizeChanger: false,
                                    current: this.state.page,
                                    onChange: page => this.onChangePage(page)
                                }}>
                            </Table>
                        </div>
                    </div>
                    :
                    <Table
                        loading={this.state.loading}
                        columns={columns}
                        dataSource={datas}
                        rowKey='id'
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
                <SkillRevenueModal sheetSummary={this.state.sheetSummary} visible={this.state.skillRevenueModalVisible} setModalVisible={this.setModalVisible} />
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth.info,
    baseData: state.baseData
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SkillRevenue))