import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import { Row, Table, Modal, Button, Form, Col, Input, Avatar, DatePicker, Badge, Dropdown as DropdownAntd, Tag } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab';
import tabConfig from './config/tab';
import { apiListSkillsUpraise, apiDetailSkillsUpraise, apiUpdateStatusSkillsUpraise, apiUpdateDetails, apiExportSkillsUpraiseReportStaff } from '~/apis/company/skill';
import { convertToFormData, exportToXLS, historyParams, showNotify, showInfoStaff, timeFormatStandard, historyReplace, checkPermission, getThumbnailHR } from '~/services/helper';
import dayjs from 'dayjs';
import { dateFormat, statusSkillRequest, subTypeRangeUsers, typeRangeUsers, EXCEL_IO_TYPE_OUTPUT_SKILL_REQUEST_UPRAISE } from '~/constants/basic';
import tabList from '~/scenes/Company/config/tabListSkill';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faFileExport, faLink, faSearch } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '~/components/Base/Dropdown';
import { formatData, formatDataReportStaff, formatHeader, formatHeaderStaff } from './config/exportSkillUpraise';
import { Chart, Interval, Axis, Tooltip, Coordinate, Interaction, getTheme } from "bizcharts";
import SkillDropdown from '~/components/Base/SkillDropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { formatData as formatDataDetail, formatHeader as formatHeaderDetail } from './config/exportModalDetailSkillRequest';
import { exportBackground } from '~/apis/excelIOLogs/index.js';
import UserDropdown from '~/components/Base/UserDropdown';
import './config/upraiseskill.css'

const colorStatus = { 1: '#a5e9a5', 2: '#ec8d8a', 3: '#948c8c', 4: 'rgb(56 216 255)' }
export class UpraiseSkill extends Component {
    /**
     *
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.formModalRef = React.createRef();

        this.state = {
            loading: false,
            datas: [],
            visible: false,
            data: {},
            loadingModal: false,
            page: 1,
            limit: 20,
            total: 1000,
            selectedRowKeysModal: [],
            valueSubtypeModal: null,
            datasPieChart: []
        };
    }
    /**
     * @lifecycle
     */
    componentDidMount() {
        // let hisParmas = historyParams();
        let { match } = this.props
        if (match?.params?.id) {
            this.getListSkillsUpraise({ skill_id: match?.params?.id })
        } else {
            let params = {
                date: [dayjs().subtract(2, 'weeks'), dayjs()]
            }
            this.formRef.current.setFieldsValue(params);
            let values = this.formRef.current.getFieldsValue();
            this.getListSkillsUpraise(values)
            this.getDataPieChart()
        }
    }

    async getDataPieChart() {
        const params = {
            limit: 5000,
            offset: 0
        }
        let response = await apiListSkillsUpraise(params)
        if (response.status) {
            let datas = response.data.rows
            let arrayDatasPieChart = []
            const newData = [];
            let datasPieChart = {
                1: {
                    statusName: "Active",
                    count: 0
                },
                2: {
                    statusName: "Expired",
                    count: 0
                },
                3: {
                    statusName: "Inactive",
                    count: 0
                },
                4: {
                    statusName: "Completed",
                    count: 0
                }
            }
            if (datas.length > 0) {
                datas.map(d => {
                    let checkExpirated = d.status != 3 && (dayjs(d.deadline).unix() < dayjs().unix()) && (Number(d.total_staff) > Number(d.total_updated))
                    const newStatus = checkExpirated ? 2 : d.status
                    if (datasPieChart[newStatus]) {
                        datasPieChart[newStatus].count += 1
                    }
                })
                arrayDatasPieChart = Object.keys(datasPieChart).map(key => {
                    const percent = datasPieChart[key].count / datas.length
                    return {
                        item: datasPieChart[key].statusName,
                        count: datasPieChart[key].count,
                        percent: percent
                    }
                })
                arrayDatasPieChart.map(item => {
                    if (item.count > 0) {
                        let roundedNumber = Math.round(item.percent * 100) / 100;
                        newData.push({ ...item, percent: roundedNumber })
                    }
                })
            }
            this.setState({ datasPieChart: newData })
        }
    }

    /**
     * Get list
     * @param {*} params 
     */
    async getListSkillsUpraise(params = {}) {
        this.setState({ loading: true })
        if (params.date) {
            params.from_date = timeFormatStandard(params.date[0], dateFormat);
            params.to_date = timeFormatStandard(params.date[1], dateFormat);
            delete params.date;
        }
        if (params.deadline_date) {
            params.deadline_from_date = timeFormatStandard(params.deadline_date[0], dateFormat);
            params.deadline_to_date = timeFormatStandard(params.deadline_date[1], dateFormat);
            delete params.deadline_date;
        }
        params = {
            ...params,
            limit: this.state.limit,
            offset: (this.state.page - 1) * this.state.limit,
        }
        historyReplace(params)
        let response = await apiListSkillsUpraise(params)
        if (response.status) {
            let datas = response.data.rows
            this.setState({ loading: false, datas, total: response.data.total })
        } else {
            showNotify('Notification', response.message, 'error')
        }
    }
    /**
     * Get api detail skill upraise
     * @param {*} data 
     * @param {*} params 
     */
    async openModalView(data) {
        this.setState({ visible: true, loadingModal: true })
        this.getDetail(data)
    }
    async getDetail(data, params = {}) {
        let response = await apiDetailSkillsUpraise(data.id, params)
        if (response.status) {
            this.setState({ data: response.data, loadingModal: false })
        } else {
            showNotify('Notification', response.message, 'error')
        }
    }
    async exportDatasModal() {
        let values = this.formModalRef.current.getFieldsValue()
        let params = {
            ...values
        }
        this.setState({ loadingModal: true })
        let response = await apiDetailSkillsUpraise(this.state.data.id, params)
        if (response.status) {
            let datas = response.data.details
            let header = formatHeaderDetail();
            let data = formatDataDetail(datas);
            let fileName = `Skill-Upraise-Detail-${dayjs().format('YYYY-MM-DD')}`;
            let dataFormat = [...header, ...data]
            exportToXLS(fileName, dataFormat,
                [
                    { width: 20 },
                    { width: 10 },
                    { width: 15 },
                    { width: 10 },
                    { width: 20 },
                    { width: 10 },
                    { width: 10 },
                    { width: 15 },
                    { width: 15 },
                    { width: 15 },
                    { width: 20 },
                    { width: 10 },
                    { width: 30 },
                    { width: 20 }
                ]
            )
            this.setState({ loadingModal: false })
        } else {
            showNotify('Notification', response.message, 'error')
            this.setState({ loadingModal: false })
        }
    }
    /**
     * Export data in background
     */
    async exportExcelBackground() {
        let { t } = this.props;

        this.setState({ loading: true });

        let values = this.formRef.current.getFieldsValue()

        let formData = convertToFormData({ type: EXCEL_IO_TYPE_OUTPUT_SKILL_REQUEST_UPRAISE });
        if (values.date) {
            formData.append('param[from_date]', timeFormatStandard(values.date[0], dateFormat))
            formData.append('param[to_date]', timeFormatStandard(values.date[1], dateFormat))
        }
        let response = await exportBackground(formData);

        if (response.status) {
            this.setState({ loading: false });
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

        this.setState({ loading: false })
    }

    /**
     * Export data advance
     */
    async exportDataAdvance() {
        let response = await apiExportSkillsUpraiseReportStaff({})
        if (response.status) {
            let header = formatHeaderStaff();
            let data = formatDataReportStaff(response.data);
            let fileName = `Skill-Upraise-Report-Staff${dayjs().format('YYYY-MM-DD')}`;
            let dataFormat = [...header, ...data]
            exportToXLS(fileName, dataFormat)
        }
    }

    /**
     * @event search report
     */
    submitForm = (e) => {
        this.setState({ page: 1 }, () => {
            let values = this.formRef.current.getFieldsValue();
            this.getListSkillsUpraise(values);
        })
    }
    onChangeStatus(e, value, id) {
        e.stopPropagation()
        let values = {
            status: value
        }
        let xhr = apiUpdateStatusSkillsUpraise(id, values)
        xhr.then(res => {
            {
                if (res.status) {
                    showNotify('Notification', 'Success!')
                    let valuesSearch = this.formRef.current.getFieldsValue();
                    this.getListSkillsUpraise(valuesSearch);
                }
            }
        })
        xhr.catch(err => showNotify('Notification', err, 'error'))
    }
    onSelectChangeModal = (newSelectedRowKeys) => {
        this.setState({ selectedRowKeysModal: newSelectedRowKeys });
    };
    submitMultipleDetail(keySubmit) {
        this.setState({ loadingModal: true })
        let params = {
            skill_upraise_id: this.state.data.id,
            staff_id: this.state.selectedRowKeysModal,
        }
        if (keySubmit == 'update') {
            if (this.state.valueSubtypeModal) {
                params.action = keySubmit
                params.value = this.state.valueSubtypeModal

            } else {
                showNotify('Notification', 'Choose Subtype !', 'error')
                this.setState({ loadingModal: false })
                return false;
            }

        } else {
            params.action = keySubmit
        }
        let xhr = apiUpdateDetails(params)
        xhr.then(res => {
            if (res.status) {
                let valuesFormSearchModal = this.formModalRef.current.getFieldsValue()
                this.getDetail(this.state.data, valuesFormSearchModal)
                showNotify('Notification', res.message)
            } else {
                showNotify('Notification', res.message, 'error')
            }
        })
    }
    searchModal(data, params = {}) {
        if (!params.keywords) {
            delete params.keywords
        }
        this.getDetail(data, params)
    }
    /**
 * @event change page
 * 
 * @param {*} page 
 */
    onChangePage(page) {
        window.scrollTo(0, 0)
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListSkillsUpraise({ ...values }));
    }
    render() {
        let { t, match, baseData: { departments, positions, majors, locations } } = this.props;
        let hisParmas = historyParams();
        let { selectedRowKeysModal } = this.state
        const columns = [
            {
                title: 'NO.',
                render: r => this.state.datas.indexOf(r) + 1
            },
            {
                title: t('hr:time_request'),
                render: r => <span>{dayjs(r.created_at).format('YYYY-MM-DD')}</span>
            },
            {
                title: t('hr:deadline'),
                render: r => <span>{dayjs(r.deadline).format('YYYY-MM-DD')}</span>
            },
            {
                title: t('hr:skill') + t('hr:name'),
                render: r => <a style={{ color: '#009aff' }} onClick={() => this.props.history.push(`/company/skill/${r.skill_id}/edit`)}>{r?.skill?.name}</a>
            },
            {
                title: t('hr:range_users'),
                render: r => typeRangeUsers[r.type]
            },
            {
                title: t('hr:content'),
                render: r => r?.data?.notification?.content
            },
            {
                title: t('created_date'),
                render: r => <>
                    {r.created_by_user ? <><span>{r.created_by_user.staff_name}({r.created_by_user.code})</span><br /></> : <span>System<br /></span>}
                    <small>{r.created_at}</small>
                </>
            },
            {
                title: t('hr:status'),
                render: r => {
                    let checkExpirated = r.status != 3 && (dayjs(r.deadline).unix() < dayjs().unix()) && (Number(r.total_staff) > Number(r.total_updated))
                    let items = []
                    Object.keys(statusSkillRequest).map((key, i) => {
                        if ((key != 2 && key != 4) && !checkExpirated) {
                            let color = colorStatus[key];
                            items.push(
                                {
                                    key: (i + 1).toString(),
                                    label:
                                        <a className='badge-dropdown-status' onClick={(e) => this.onChangeStatus(e, key, r.id)}>
                                            <Badge color={color} text={statusSkillRequest[key]} />
                                        </a>

                                }
                            );
                        }
                        if (key == 1 && checkExpirated) { // status active and Expirated chỉ cho inactive
                            let color = colorStatus[3];
                            items.push(
                                {
                                    key: 3,
                                    label:
                                        <a className='badge-dropdown-status' onClick={(e) => this.onChangeStatus(e, 3, r.id)}>
                                            <Badge color={color} text={statusSkillRequest[3]} />
                                        </a>

                                }
                            );
                        }
                    });
                    return (
                        <DropdownAntd menu={{ items }} className="pl-2" disabled={checkPermission('hr-request-skill-update') ? false : true}>
                            <Tag className='text-center' color={colorStatus[checkExpirated ? 2 : r.status]} style={{ cursor: 'pointer' }}>
                                {statusSkillRequest[checkExpirated ? 2 : r.status]}
                            </Tag>
                        </DropdownAntd>)
                }
            },
            {
                title: t('hr:total'),
                render: r => r.total_staff
            },
            {
                title: t('hr:views'),
                render: r => r.views
            },
            {
                title: t('hr:update_skill'),
                dataIndex: 'total_updated'
            },
            {
                title: t('hr:ratio_of_finished'),
                render: r => <span>{Number(r.total_updated) > 0 ? ((Number(r.total_updated) / r?.total_staff) * 100).toFixed(2) : 0}%</span>
            },
            {
                title: t('hr:action'),
                render: r => {
                    return checkPermission('hr-request-skill-preview') ?
                        <Button type='primary' size='small' icon={<FontAwesomeIcon icon={faEye} />} onClick={() => this.openModalView(r)} />
                        : ""
                }
            },
        ]
        const columnsModal = [
            {
                title: t('hr:staff'),
                width: 250,
                render: r => {
                    if (!r.staff) {
                        return '';
                    }
                    return <div className='d-flex'>
                        <div>
                            <Avatar src={getThumbnailHR(r.staff.avatar, '40x40')} />
                        </div>
                        <div className='ml-2' style={{ lineHeight: 1.2 }}>
                            <div>
                                <b>{r.staff.staff_name} - {r.staff.code}</b>
                            </div>
                            <div>
                                <small>
                                    {showInfoStaff(r.staff.position_id, r.staff.staff_dept_id, r.staff.major_id, r.staff.staff_loc_id)}
                                </small>
                            </div>
                        </div>
                    </div>
                }
            },
            {
                title: t('hr:skill_level'),
                dataIndex: 'level'
            },
            {
                title: t('hr:skill_level_update'),
                render: r => r.current_level
            },
            {
                title: t('hr:deadline'),
                render: r => r.deadline
            },
            {
                title: t('hr:sub_type'),
                render: r => subTypeRangeUsers[r.sub_type]
            },
            {
                title: t('hr:confirm'),
                dataIndex: 'confirm_at'
            },
            {
                title: t('hr:viewed'),
                dataIndex: 'view_at'
            },
            {
                title: t('hr:examined'),
                render: r => r.exam_id && <Link to={`/company/training-examination/${r?.exam_id}/history`} target='_blank'>
                    <FontAwesomeIcon icon={faLink} style={{ color: '#3da8ee' }} />
                </Link>
            },
            {
                title: t('hr:updated_by'),
                render: r => r?.exam_updated_by_staff?.staff_name
            }

        ]
        const rowSelectionModal = {
            selectedRowKeysModal,
            onChange: (key) => this.onSelectChangeModal(key),
            columnWidth: '50px',
            getCheckboxProps: (record) => ({
                disabled: record.current_level ? true : false,
            })
        };
        const hasSelected = selectedRowKeysModal.length > 0;
        return (
            <div>
                <PageHeader title={t('hr:request_skills')} />
                <Row className="card p-3 mb-3 pt-0">
                    {
                        match?.params?.id ?
                            <Tab tabs={tabConfig(match?.params?.id, this.props)} />
                            :
                            <>
                                <Tab tabs={tabList(this.props)} />
                                <Form
                                    className="pt-3"
                                    ref={this.formRef}
                                    name="searchSkillForm"
                                    onFinish={this.submitForm.bind(this)}
                                    layout="vertical"
                                >
                                    <Row gutter={12}>
                                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                        <Form.Item name="created_by">
                                                <UserDropdown defaultOption={t("hr:all_staff")} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                            <Form.Item name='skill_id'>
                                                {/* <Input placeholder={t('Skill Name')} /> */}
                                                <SkillDropdown defaultOption={t("hr:all_skill")} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                            <Form.Item name='department_id'>
                                                <Dropdown datas={departments} defaultOption={t("hr:all_department")} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                            <Form.Item name='position_id'>
                                                <Dropdown datas={positions} defaultOption={t("hr:all_position")} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                            <Form.Item name='major_id'>
                                                <Dropdown datas={majors} defaultOption={t("hr:all_major")} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                            <Form.Item name='status'>
                                                <Dropdown datas={statusSkillRequest} defaultOption={t("hr:all_status")} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={24} md={24} lg={4} xl={6}>
                                            <Form.Item name="date">
                                                <DatePicker.RangePicker
                                                    className="w-100"
                                                    placeholder={t("hr:s_e_request")}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={24} md={24} lg={4} xl={6}>
                                            <Form.Item name="deadline_date">
                                                <DatePicker.RangePicker
                                                    className="w-100"
                                                    // placeholder={['Deadline start', 'Deadline end']}
                                                    placeholder={t("hr:s_e_deadline")}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                            <Button type="primary" htmlType="submit" className=''>
                                                {t('hr:search')}
                                            </Button>
                                            {
                                                checkPermission('hr-request-skill-export') ?
                                                    <Button loading={this.state.loading} type="primary" className='ml-2' icon={<FontAwesomeIcon icon={faFileExport} />} onClick={() => this.exportExcelBackground()}>
                                                        &nbsp;{t('hr:export_background')}
                                                    </Button> : ""
                                            }
                                            <Button loading={this.state.loading} type="primary" className='ml-2' icon={<FontAwesomeIcon icon={faFileExport} />} onClick={() => this.exportDataAdvance()}>
                                                &nbsp;{t('hr:export_advance')}
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </>
                    }

                </Row>
                {
                    hisParmas?.skill_id ?
                        []
                        :
                        <Row className='mt-2 mb-2'>
                            <Col className='p-2' xs={24} sm={24} md={24}>
                                <div className='charts' >
                                    <div className='left' >
                                        <Chart height={400}
                                            data={this.state.datasPieChart}
                                            scale={{
                                                percent: {
                                                    formatter: val => {
                                                        val = val * 100 + '%';
                                                        return val;
                                                    },
                                                },
                                            }}
                                            autoFit
                                        >
                                            <Coordinate type="theta" radius={0.75} />
                                            <Tooltip showTitle={false} />
                                            <Axis visible={false} />
                                            <Interval
                                                position="percent"
                                                adjust="stack"
                                                color="item"
                                                style={{
                                                    lineWidth: 1,
                                                    stroke: '#fff',
                                                }}
                                                label={['count', {
                                                    // label 太长自动截断
                                                    layout: { type: 'limit-in-plot', cfg: { action: 'ellipsis' } },
                                                    content: (data) => {
                                                        return `${data.item}: ${data.percent * 100}%`;
                                                    },
                                                }]}
                                                state={{
                                                    selected: {
                                                        style: (t) => {
                                                            const res = getTheme().geometries.interval.rect.selected.style(t);
                                                            return { ...res, fill: 'red' }
                                                        }
                                                    }
                                                }}
                                            />
                                            <Interaction type='element-single-selected' />
                                        </Chart>
                                    </div>
                                    {/* <div className='right' >
                                        <Chart
                                            appendPadding={[10, 0, 0, 10]}
                                            autoFit
                                            height={500}
                                            data={[
                                                {
                                                    year: "1991",
                                                    value: 3,
                                                },
                                                {
                                                    year: "1992",
                                                    value: 4,
                                                },
                                                {
                                                    year: "1993",
                                                    value: 3.5,
                                                },
                                                {
                                                    year: "1994",
                                                    value: 5,
                                                },
                                                {
                                                    year: "1995",
                                                    value: 4.9,
                                                },
                                                {
                                                    year: "1996",
                                                    value: 6,
                                                },
                                                {
                                                    year: "1997",
                                                    value: 7,
                                                },
                                                {
                                                    year: "1998",
                                                    value: 9,
                                                },
                                                {
                                                    year: "1999",
                                                    value: 13,
                                                },
                                            ]}
                                            onLineClick={console.log}
                                            scale={{ value: { min: 0, alias: '人均年收入', type: 'linear-strict' }, year: { range: [0, 1] } }}
                                        >

                                            <Line position="year*value" />
                                            <Point position="year*value" />
                                            <Tooltip showCrosshairs follow={false} />
                                        </Chart>
                                    </div> */}
                                </div>
                            </Col>
                        </Row>
                }
                <Table
                    dataSource={this.state.datas}
                    columns={columns}
                    loading={this.state.loading}
                    rowKey={'id'}
                    pagination={{
                        pageSize: this.state.limit,
                        total: this.state.total,
                        showSizeChanger: false,
                        onChange: page => this.onChangePage(page)
                    }}
                    rowClassName={r =>
                        r.status != 3 && (dayjs(r.deadline).unix() < dayjs().unix()) && (Number(r.total_staff) > Number(r.total_updated))
                            ? "bg-warning-request-skill" : ""
                    }
                />

                <Modal
                    width={'80%'}
                    title={`${this.state.data?.skill?.name}`}
                    open={this.state.visible}
                    onCancel={() => {
                        this.formModalRef.current.resetFields()
                        this.setState({ visible: false })
                    }}
                    footer={false}
                    afterClose={() => this.setState({ selectedRowKeysModal: [], valueSubtypeModal: null, data: {} })}
                >
                    <Form
                        ref={this.formModalRef}
                        layout='vertical'
                        onFinish={(values) => this.searchModal(this.state.data, values)}
                    >
                        <Row gutter={12}>
                            <Col span={4}>
                                <Form.Item name='keywords'>
                                    <Input placeholder={t("hr:code")} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name='level'>
                                    <Dropdown datas={{ 0: 0, 1: 1, 2: 2, 3: 3 }} defaultOption={t("hr:all_level")} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name='department_id'>
                                    <Dropdown datas={departments} defaultOption={t("hr:all_department")} />
                                </Form.Item>
                            </Col>

                            <Col span={4}>
                                <Form.Item name='major_id'>
                                    <Dropdown datas={majors} defaultOption={t("hr:all_major")} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name='location_id'>
                                    <Dropdown datas={locations} defaultOption={t("hr:all_location")} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Button type='primary' htmlType='submit' icon={<FontAwesomeIcon icon={faSearch} />}></Button>
                                <Button loading={this.state.loadingModal}
                                    type="primary" className='ml-2'
                                    icon={<FontAwesomeIcon icon={faFileExport} />}
                                    onClick={() => this.exportDatasModal()}>
                                    &nbsp;{t('hr:export')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                    <Table
                        scroll={{ y: 590 }}
                        rowKey='staff_id'
                        rowSelection={rowSelectionModal}
                        loading={this.state.loadingModal}
                        dataSource={this.state.data?.details}
                        columns={columnsModal}
                        pagination={{
                            pageSize: 50,
                            showSizeChanger: false
                        }}
                    />
                    {
                        hasSelected && (
                            <Row style={{ width: "50%", marginTop: -50 }}>
                                <div style={{ width: 200 }}>
                                    <Dropdown
                                        datas={subTypeRangeUsers}
                                        value={this.state.valueSubtypeModal}
                                        onChange={v => this.setState({ valueSubtypeModal: v })} />
                                </div>
                                {
                                    checkPermission('hr-request-skill-detail-update') ?
                                        <Button className='ml-2' type='ghost' danger onClick={() => this.submitMultipleDetail('delete')}>{t('remove')}</Button>
                                        : ""
                                }
                                {
                                    checkPermission('hr-request-skill-detail-update') ?
                                        <Button className='ml-2' type='primary' onClick={() => this.submitMultipleDetail('update')}>{t('update')}</Button>
                                        : ""
                                }
                            </Row>
                        )
                    }
                </Modal>
            </div>
        )
    }
}

/**
 * Map redux state to component props
 * @param {Object} state 
 */
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    }
}
export default connect(mapStateToProps)(withTranslation()(UpraiseSkill));