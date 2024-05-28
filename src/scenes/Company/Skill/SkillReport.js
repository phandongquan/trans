import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col, Form, Button, Tooltip, Menu, Upload, Modal, Dropdown as DropdownAnt, Table } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import { uniqueId } from 'lodash';
import dayjs from 'dayjs';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faPrint, faPen, faPlus, faPaperclip, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import Tab from '~/components/Base/Tab';
import tabList from '~/scenes/Company/config/tabListSkill';
import Dropdown from '~/components/Base/Dropdown';
import { getReportSkill } from '~/apis/company/skill';

import { CaretDownOutlined } from '@ant-design/icons';

import { checkAssistantManagerHigher, checkPermission, historyReplace, randomColorByMajorId } from '~/services/helper';

import './config/skillReport.css';
import { formatData, formatHeader } from './config/exportSkillReport';
import StaffDropdown from '~/components/Base/StaffDropdown';
import ExcelService from '~/services/ExcelService';

const hireDates = [
    {
        id: 1,
        name: '1 tháng',
        value: {
            hire_date: 1,
            operator: '<='
        }
    },
    {
        id: 2,
        name: '3 tháng',
        value: {
            hire_date: 3,
            operator: '<='
        }
    },
    {
        id: 3,
        name: '1 năm',
        value: {
            hire_date: 12,
            operator: '<='
        }
    },
    {
        id: 4,
        name: '2 năm',
        value: {
            hire_date: 24,
            operator: '<='
        }
    },
    {
        id: 5,
        name: 'Lớn hơn 2 năm',
        value: {
            hire_date: 24,
            operator: '>='
        }
    }
]
class SkillReport extends Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.tableRef = React.createRef();
        this.state = {
            loading: false,
            columns: [],
            skillReports: [],
            skillGroups: [],
            arrSkillId: [],
            fileList: [],
            file: null,
            showNestedColumns: true,
            columnState: {},
            dataHeader: [],
            dataBody: [],
            showChildren: {},
            total: 0,
            limit: 20,
            offset: 0,
            page: 1,
        }
    }

    componentDidMount() {
        let { auth: { staff_info } } = this.props
        this.formRef.current.setFieldsValue({
            department_id: 121,
            location_id: staff_info.staff_loc_id
        })
        let values = this.formRef.current.getFieldsValue();
        this.getReportSkill(values);
    }

    // call api getReportSkill
    async getReportSkill(params = {}) {
        params = {
            ...params,
            limit: this.state.limit,
            offset: this.state.offset || (this.state.page - 1) * this.state.limit
        }
        historyReplace(params);
        this.setState({ loading: true });
        let response = await getReportSkill(params);
        if (response.status) {
            let dataHeader = response.data.skills;
            let dataBody = response.data.rows;
            this.setState({ dataHeader, dataBody, loading: false, total: response.data.total });
        }
    }
    /**
     * @event change page
     * 
     * @param {*} page 
     */
    onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getReportSkill({ ...values }));
    }

    /**
     * @event Submit Form search
     */
    submitForm = (values) => {
        this.setState({
            columns: [],
            skillReports: [],
            skillGroups: [],
            arrSkillId: [],
            fileList: [],
            file: null,
            page: 1,
            offset: 0,
        })
        this.getReportSkill(values);
    }

    /**
     * Export staff skill
     */
    handleExport = () => {
        this.setState({ loading: true })
        let params = this.formRef.current.getFieldsValue();
        if (params.hire_date) {
            let hireDateFoundIndex = hireDates.findIndex(h => h.id == params.hire_date);
            if (~hireDateFoundIndex) {
                params = {
                    ...params,
                    ...hireDates[hireDateFoundIndex]['value']
                }
            }
        }
        params['limit'] = -1;
        let xhr = getReportSkill(params);
        xhr.then(res => {
            this.setState({ loading: false })
            if (res.status && res.data) {
                let { rows, skills } = res.data;
                let { header, merges } = formatHeader(skills);
                let { datas, styles } = formatData(rows, skills);
                let dataFormat = [...header, ...datas];
                let fileName = `Staff-skills-${dayjs().format('YYYY-MM-DD')}`;
                let excelService = new ExcelService(['Main Sheet']);
                excelService.addWorksheetDatas(dataFormat)
                    .addWorksheetStyles(styles)
                    .mergeCells(merges)
                    .forceDownload(fileName);
            }
        })
    }

    toggleChildren = (skill) => {
        this.setState((prevState) => {
            const updatedShowChildren = { ...prevState.showChildren };
            updatedShowChildren[skill.id] = !prevState.showChildren[skill.id];
            return { showChildren: updatedShowChildren };
        });
    };

    getColumnIcon = (skill) => {
        if (skill.children && skill.children.length > 0) {
            return <CaretDownOutlined style={{ cursor: 'pointer' }} onClick={() => this.toggleChildren(skill)} />
        }
    };

    render() {

        let { dataHeader, dataBody, limit, page, total, showChildren } = this.state;
        let { t, baseData: { departments, locations, positions, majors, divisions }, auth: { staff_info } } = this.props;

        const dataSource = dataBody.map((item) => {
            let childrenData = item.children ? item.children.map(child => ({
                title: child.name,
                dataIndex: child.id,
                key: child.id,
                width: 100,
            })) : [];

            return {
                ...item,
                children: showChildren[item.id] ? childrenData : null,
            };
        });

        const columns = dataHeader.map(skill => {
            return {
                title: (
                    <span>
                        <div>{skill.name}</div>
                        <div>{this.getColumnIcon(skill)}</div>
                    </span>
                ),
                width: 100,
                // render: r => r[`parent_${skill.id}`] || 0,
                render(text, r) {
                    return {
                        props: {
                            className: (() => {
                                const parentValue = r && r[`parent_${skill.id}`]; // Check if r is defined

                                if (
                                    parentValue === undefined ||
                                    (typeof parentValue === 'string' && parentValue.split('/')[0] === '0')
                                ) {
                                    return 'header-text-parent-0';
                                } else {
                                    return 'header-text-parent-1';
                                }
                            })()
                        },
                        children: <div>
                            {r[`parent_${skill.id}`] || 0}
                        </div>
                    };
                },
                children: showChildren[skill.id] ? skill.children.map(child => {
                    return {
                        title: (
                            <div className='children-title' >
                                <Tooltip placement="topLeft" title={child.name} >
                                    {child.name}
                                </Tooltip>
                            </div>
                        ),
                        render(text, r) {
                            return {
                                props: {
                                    className: r[`skill_${child.id}`] ? 'header-text-child-1' : 'header-text-child-0'
                                },
                                children:
                                    <div>
                                        {r[`skill_${child.id}`] || 0}
                                    </div>
                            };
                        },
                        width: 100,
                    };
                }) : null,
            };
        });
        // Adding a fixed column to the parent columns
        columns.unshift({
            title: (
                <div style={{ fontSize: '13px' }}>
                    Tỷ lệ hoàn thành kỹ năng bắt buộc
                </div>
            ),
            render: r => {
                return {
                    props: {
                        style: { backgroundColor: randomColorByMajorId(r.major_id) }
                    },
                    children:
                        <div style={{ fontSize: 13, textAlign: 'center' }}>
                            {r.quantity_skill}/{r.total_skill}
                        </div>
                }
            },
            width: 70,
            fixed: 'left',
        });
        columns.unshift({
            title: (
                <div style={{ fontSize: '13px' }}>
                   Tỷ lệ hoàn thành kỹ năng liên quan 
                </div>
            ),
            render: r => {
                return {
                    props: {
                        style: { backgroundColor: randomColorByMajorId(r.major_id) }
                    },
                    children:
                        <div style={{ fontSize: 13, textAlign: 'center' }}>
                            {r.quantity_skill_extra}/{r.total_skill_extra}
                        </div>
                }
            },
            width: 70,
            fixed: 'left',
        });
        columns.unshift({
            title: (
                <div style={{ fontSize: '13px' }}>
                    {t('hr:staff')}
                </div>
            ),
            render: r => {
                let deparment = departments.find(d => r.staff_dept_id == d.id);
                let deptName = deparment ? deparment.name : 'NA';
                let major = majors.find(d => r.major_id == d.id)
                let majorName = major ? major.name : 'NA';
                let location = locations.find(l => r.staff_loc_id == l.id)
                let locName = location ? location.name : 'NA';
                return {
                    props: {
                        style: { backgroundColor: randomColorByMajorId(r.major_id) }
                    },
                    children:
                        <div style={{ lineHeight: '1.0' }}>
                            <strong style={{ fontSize: '12px' }}>{r.code} - {r.staff_name} </strong> <small>(wm: {r.staff_hire_date ? dayjs().diff(dayjs(r.staff_hire_date * 1000), 'months', true).toFixed(1) : ''})</small> <br></br>
                            <span style={{ fontSize: 9 }}>
                                {deptName} / {majorName} / {locName}
                            </span>
                        </div>
                }
            },
            width: 270,
            fixed: 'left',
        });
        columns.unshift({
            title: 'No.',
            render: r => {
                return {
                    props: {
                        style: { backgroundColor: randomColorByMajorId(r.major_id) }
                    },
                    children:
                        <div style={{ fontSize: 13, textAlign: 'center' }}>
                            {dataSource.indexOf(r) + 1 + ((page - 1) * limit)}
                        </div>
                }
            },
            width: 50,
            fixed: 'left',
        });

        const items = [
            {
                key: '1',
                label: checkPermission('hr-skill-report-export') ?
                    <div style={{ textAlign: 'center' }}>
                        <FontAwesomeIcon icon={faFileExport} style={{ border: 'none' }} /> &nbsp;{t('hr:export')}
                    </div>
                    : ""
            }
        ]
        return (
            <>
                <PageHeader
                    title={t("hr:skill_report")}
                    extra={[
                        checkPermission("hr-skill-report-import") ||
                            checkPermission("hr-skill-report-export") ? (
                            <DropdownAnt
                                trigger={["click"]}
                                key={uniqueId("_dropdown")}
                                menu={{ items, onClick: () => this.handleExport() }}
                                type="primary"
                                placement="bottomLeft"
                            >
                                <Button
                                    key={uniqueId("_dropdown_btn")}
                                    type="primary"
                                    icon={<FontAwesomeIcon icon={faEllipsisV} />}
                                />
                            </DropdownAnt>
                        ) : (
                            ""
                        ),
                    ]}
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
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="staff_ids">
                                    <StaffDropdown defaultOption={t("hr:all_staff")} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="department_id">
                                    <Dropdown
                                        datas={departments}
                                        defaultOption={t("hr:all_department")}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="location_id">
                                    <Dropdown
                                        datas={locations}
                                        defaultOption={t("hr:all_location")}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="position_id">
                                    <Dropdown
                                        datas={positions}
                                        defaultOption={t("hr:all_position")}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="major_id">
                                    <Dropdown
                                        datas={majors}
                                        defaultOption={t("hr:all_major")}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="hire_date">
                                    <Dropdown
                                        datas={hireDates}
                                        defaultOption={t("hr:working_months")}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Button type="primary" htmlType="submit" className="mb-3">
                                    {t("hr:search")}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>

                <Row className="card">
                    <div className="m-2">
                        <strong>
                            Total: {page * limit > total ? total : page * limit} / {total}
                        </strong>
                    </div>
                    <Table rowKey={(r) => r.staff_id}
                        ref={this.tableRef}
                        columns={columns}
                        dataSource={dataSource}
                        loading={this.state.loading}
                        className="table-skill"
                        scroll={{ x: 200 }}
                        bordered
                        pagination={{
                            total: this.state.total,
                            pageSize: this.state.limit,
                            hideOnSinglePage: true,
                            showSizeChanger: false,
                            current: this.state.page,
                            onChange: (page) => this.onChangePage(page),
                        }}
                    />
                </Row>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SkillReport));