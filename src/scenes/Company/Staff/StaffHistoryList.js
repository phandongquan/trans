import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col, Form, Input, Button, Table, Switch, Popconfirm, DatePicker } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab';
import tabListStaff from '~/scenes/Company/config/tabListStaff';
import { Link } from 'react-router-dom';
import { dateFormat , screenResponsive, staffHistoryCategories} from '~/constants/basic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faPen, faTrashAlt, faPlus,faFileExport, faLink } from '@fortawesome/free-solid-svg-icons';
import { QuestionCircleOutlined } from '@ant-design/icons';
import StaffHistoryForm from '~/scenes/Company/Staff/StaffHistoryForm';
import dayjs from 'dayjs';
import { showNotify, convertToFormData , historyReplace, historyParams, timeFormatStandard, checkPermission } from '~/services/helper';
import { getList as apiGetList, save as saveHistory, destroy, getByStaff as getHistoryByStaf, getDetailStaffHistory } from '~/apis/company/staff/history';
import Dropdown from '~/components/Base/Dropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { formatHeaderHistory,stylesHistory,formatData } from './config/exportHistory';
import ExcelService from '~/services/ExcelService';
//import { getList as getListStaff } from '~/apis/company/staff';
class StaffHistoryList extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            visible: false,
            staffHistories: [],
            permissions: {},
            history: {},
            histories: [],
            limit: 30,
            offset: 0,
            page: 1
        }
    }

    componentDidMount() {
        let params = historyParams();
        let { staffInfo } = this.props;
        if(params.offset) {
            this.setState({ page: (params.offset/ this.state.limit) + 1})
        }
        params = {
            ...params,
            staff_dept_id: params.department_id?params.department_id: staffInfo.staff_dept_id,
        }
        this.formRef.current.setFieldsValue(params)
        let values = this.formRef.current.getFieldsValue();  
        this.getListHistory(values);
    }

    /**
     * Call api get list staff history
     * @param {*} params 
     */
    async getListHistory(params) {
        params = {
            ...params,
            limit: this.state.limit,
            offset: params.offset || (this.state.page - 1) * this.state.limit
        }
        historyReplace(params)
        this.setState({ loading: true })
        
        if (params.date) {
            params.from_date = timeFormatStandard(params.date[0], dateFormat);
            params.to_date = timeFormatStandard(params.date[1], dateFormat);
            delete (params.date)
        }
        let response = await apiGetList(params);
        if (response.status) {
            this.setState({
                loading: false,
                staffHistories: response.data.rows,
                permissions: response.data.permissions
            });
        }
    }

    /**
     * handle submit form
     * @param {*} values 
     */
    submitForm = (values) => {
        this.getListHistory(values);
    }

    /**
     * @event before show modal edit history
     * @param {*} id 
     */
    onEditHistory(id) {
        this.toggleModal(true);
        let data = {};
        let { staffHistories } = this.state;
        data = staffHistories.find(r => r.id == id);
        this.setState({ history: data })
    }


    /**
     * @event before show modal ađ history
     * @param {*}  
     */
     onAddHistory() {
        this.toggleModal(true);
        this.setState({history: {}})
    }
    /**
     * @event toggle modal
     * @param {*} visible 
     */
    toggleModal(visible) {
        this.setState({ visible });
    }

    refreshTable = () => {
        let values = this.formRef.current.getFieldsValue();
        this.getListHistory(values);
    }

    /**
     * @event verify staff history
     * @param {boolean} checked 
     */
    onVerify = (checked, staffHistoryId) => {
        let { permissions } = this.state;
        let { t } = this.props;
        let canVerify = permissions.can_verify ? true : false
        // if (!canVerify) {
        //     showNotify(t('Notification'), t('You have no permission!'), 'error');
        //     return false;
        // }
        let dataUpdate = {
            id: staffHistoryId
        };
        let loginUserId = this.props.auth.profile.id;
        if (checked) {
            Object.assign(dataUpdate, {
                verified_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                verified_by: loginUserId
            });
        } else {
            showNotify(t('hr:notification'), t('Data have been verifed!'));
            return false;
        }

        this.submitVerifyAndApprove(dataUpdate);
    }

    /**
     * @event approve staff history
     * @param {boolean} checked 
     */
    onApprove = (checked, staffHistoryId) => {
        let { permissions } = this.state;
        let { t } = this.props;
        let canApprove = permissions.can_approve ? true : false
        if (!canApprove) {
            showNotify(t('hr:notification'), t('You have no permission!'), 'error');
            return false;
        }
        let dataUpdate = {
            id: staffHistoryId
        };
        let loginUserId = this.props.auth.profile.id;
        if (checked) {
            Object.assign(dataUpdate, {
                approved_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                approved_by: loginUserId
            });
        } else {
            showNotify(t('hr:notification'), t('Data have been approved!'));
            return false;
        }

        this.submitVerifyAndApprove(dataUpdate);
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
    async submitVerifyAndApprove(values) {
        let { t } = this.props;
        if (values.id) {
            values['_method'] = 'PUT';
        }

        let formData = convertToFormData(values);
        let response = await saveHistory(formData);
        if (response.status == 1) {
            this.toggleModal(false);
            this.refreshTable();
            showNotify(t('hr:notification'), t('Data has been updated!'));
        } else {
            showNotify(t('hr:notification'), response.message, 'error');
        }
    }

    /**
     * @event delete history
     * @param {*} e 
     * @param {*} id 
     */
    async onDeleteHistory(e, id) {
        this.setState({ loading: true });
        let xhr = await destroy(id);
        let result = (xhr.status == 1) ? xhr.data : {};
        if (result) {
            let staffHistories = [...this.state.staffHistories];
            let index = staffHistories.indexOf(staffHistories.find(r => r.id == id));

            /**
             * Update new list
             */
            staffHistories.splice(index, 1);
            this.setState({ staffHistories });

            let { t } = this.props;
            showNotify(t('hr:notification'), t('Data has been deleted!'));
        }
        this.setState({ loading: false });
    }

    /**
     * Export staff
     */
     exportHistory = () => {
        this.setState({ loading: true })
        let staffList = [];

        let params = this.formRef.current.getFieldsValue();
        params.limit = -1;
        params.offset = 0;

        let xhr = apiGetList(params);
        xhr.then(response => {
            this.setState({ loading: false })
            if (response.status) {       
                staffList = response.data.rows;
                 let header = formatHeaderHistory();
                 let data = formatData(staffList);
                 let fileName = `Staff-history-${dayjs().format('YYYY-MM-DD')}`;
                 
                 let datas = [...header.headers, ...data]   
                 let excelService = new ExcelService(['Main Sheet']);
                 excelService.addWorksheetDatas(datas)
                     .addWorksheetStyles(stylesHistory)
                     .mergeCells(header.merges)
                    .forceDownload(fileName);
            }
        })
    }



    render() {
        let { t,match , baseData :{ departments } , staffInfo}  = this.props;
        let { id } = match.params;
        const columns = [
            {
                title: t('No.'),
                render: r => this.state.staffHistories.indexOf(r) + 1
            },
            {
                title: t('hr:name'),
                render: r => r.staff && (
                    <>
                        <Link to={`/company/staff/${r.staff.staff_id}/edit`}>{r.staff.staff_name}</Link>
                        <small> ({r.staff.staff_id}) </small><br />
                        <small> {r.staff.staff_email} - {r.staff.staff_phone} </small>
                    </>
                )
            },
            {
                title: t('hr:title'),
                dataIndex: 'title'
            },
            // {
            //     title: t('Content'),
            //     render: r => <div style={{whiteSpace: 'pre-wrap'}}>{r.content}</div>
            // },
            {
                title: t('hr:type'),
                render: r => r.type && staffHistoryCategories[r.type]
            },
            {
                title: t('hr:verify'),
                render: r => {
                    let isVerified = r.verified_at ? true : false
                    let verifiedUser = r.verified_by_user || {};
                    return (
                        <>
                         {checkPermission("hr-staff-history-verify") ? (
                            <Switch size="small"
                                checkedChildren={<FontAwesomeIcon icon={faCheck} />}
                                unCheckedChildren={<FontAwesomeIcon icon={faTimes} />}
                                checked={isVerified}
                                onChange={checked => this.onVerify(checked, r.id)}
                            />
                          ) : null}
                            <div>{isVerified && `${verifiedUser.name} # ${verifiedUser.id}`}</div>
                            <div>{isVerified && r.verified_at}</div>
                        </>
                    )
                }
            },
            {
                title: t('hr:approve'),
                render: r => {
                    let isApproved = r.approved_at ? true : false;
                    let approvedUser = r.approved_by_user || {};
                    return (
                        <>
                        {checkPermission("hr-staff-history-verify") ? ( 
                            <Switch size="small"
                                checkedChildren={<FontAwesomeIcon icon={faCheck} />}
                                unCheckedChildren={<FontAwesomeIcon icon={faTimes} />}
                                checked={isApproved}
                                onChange={checked => this.onApprove(checked, r.id)}
                            />
                         ) : null}
                            <div>{isApproved && `${approvedUser.name} # ${approvedUser.id}`}</div>
                            <div>{isApproved && r.approved_at}</div>
                        </>
                    )
                }
            },
            {
                title: t('hr:created_by'),
                render: r => {
                    let created_by_user = r.created_by_user;
                    return created_by_user ? `${created_by_user.name} # ${created_by_user.id}` : r.created_by;
                }
            },
            {
                title: t('hr:action'),
                align: 'center',
                width:'10%',
                render: r => {
                    return (
                        <>
                            {
                                checkPermission('hr-staff-history-update') ? 
                                    <Button
                                        type="primary"
                                        size='small'
                                        onClick={() => this.onEditHistory(r.id)}
                                        icon={<FontAwesomeIcon icon={faPen} />}>
                                    </Button>
                                : ''
                            }   
                            <Popconfirm title={t('hr:confirm_delete')}
                                placement="topLeft"
                                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                onConfirm={(e) => this.onDeleteHistory(e, r.id)}
                            >
                                {
                                    checkPermission('hr-staff-history-delete') ? 
                                        <Button
                                            type="primary"
                                            size='small'
                                            style={{ marginLeft: 8 }}
                                            onClick={e => e.stopPropagation()}
                                            icon={<FontAwesomeIcon icon={faTrashAlt} />}>
                                        </Button>
                                    : ''
                                }
                            </Popconfirm>
                            {r.reference_task ? (
                                <a href={r.reference_task} target="_blank" rel="noopener noreferrer">
                                    <Button className='ml-2' type="primary" size='small' icon={<FontAwesomeIcon icon={faLink} />}>
                                    </Button>
                                </a>
                            ) : null} 
                        </>
                    );
                }
            }
        ]
        return (
            <>
                <PageHeader title={t('hr:staff_history')} tags={
                    checkPermission('hr-staff-history-create') ? 
                    <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => this.onAddHistory()}>
                        &nbsp;{t('hr:add_new')}
                    </Button>
                    : ''
                }
                />
                <Row className="card p-3 pt-0 mb-3">
                    <Tab tabs={tabListStaff(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffHistory"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={[12, 0]}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                               
                                    {/* <DatePicker format={dateFormat} className='w-100' /> */}
                                    <Form.Item name='date'>
                                        <DatePicker.RangePicker style={{ width: '100%' }} format={dateFormat} />
                                    </Form.Item>
                                
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="staff_id">
                                    <StaffDropdown defaultOption={t('hr:all_staff')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="keywords">
                                    <Input placeholder={t('hr:title') + t('hr:content')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                                <Form.Item name="type">
                                    <Dropdown datas={staffHistoryCategories} defaultOption={t('hr:all_type')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                                <Form.Item name="staff_dept_id" >
                                    <Dropdown datas={departments} defaultOption={t('hr:all_department')} />
                                </Form.Item>
                            </Col>                
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='submit'>
                                <Button type="primary" htmlType="submit"                            >
                                    {t('hr:search')}
                                </Button>
                                {
                                    checkPermission('hr-staff-history-export') ? 
                                        <Button key="export-staff"
                                            type="primary"
                                            icon={<FontAwesomeIcon icon={faFileExport} />}
                                            className='ml-2'
                                            onClick={() => this.exportHistory()}
                                        >
                                            &nbsp;{t('hr:export')}
                                        </Button>
                                    : ''
                                }
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row>
                    <Col span={24}>
                        {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'> 
                                    <Table
                                     dataSource={this.state.staffHistories}
                                     columns={columns}
                                     loading={this.state.loading}
                                     pagination={{ pageSize: 30, hideOnSinglePage: true }}
                                     rowKey={r => r.id}
                                    />
                                </div>
                            </div>
                            :

                            <Table
                                dataSource={this.state.staffHistories}
                                columns={columns}
                                loading={this.state.loading}
                                pagination={{ pageSize: 30, hideOnSinglePage: true }}
                                rowKey={r => r.id}
                            />
                        }
                    </Col>
                </Row>

                <StaffHistoryForm
                    visible={this.state.visible}
                    data={this.state.history}
                    onCancel={() => this.toggleModal(false)}
                    refreshTable={() => this.refreshTable()}
                />
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffHistoryList));