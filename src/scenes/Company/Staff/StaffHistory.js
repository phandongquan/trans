import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Button, Table, Row, Col, Popconfirm, Switch } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faPen, faPlus, faTrashAlt, faLink } from '@fortawesome/free-solid-svg-icons';
import { getByStaff as getHistoryByStaff, save as saveHistory, destroy } from '~/apis/company/staff/history';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { staffHistoryTypes,staffHistoryGoodat } from '~/constants/basic';
import Tab from '~/components/Base/Tab';
import tabConfig from './config/tab';
import { showNotify, convertToFormData, checkPermission } from '~/services/helper';
import StaffHistoryForm from '~/scenes/Company/Staff/StaffHistoryForm';

import {screenResponsive} from '~/constants/basic';
class StaffHistory extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: false,
            histories: [],
            permissions: {},
            history: {}
        };
        this.formRef = React.createRef();
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getData();
    }

    /**
     * Get list history for staff
     * @param {} params 
     */
    async getData(params = {}) {
        this.setState({ loading: true });
        let { match } = this.props;
        let { id } = match.params;
        /**
         * @fetch API
         */
        let historyXhr = await getHistoryByStaff(id);
        let histories = (historyXhr.status == 1) ? historyXhr.data.rows : [];        
        let permissions = (historyXhr.status == 1) ? historyXhr.data.permissions : {};
        this.setState({ histories, permissions }, () => this.setState({ loading: false }));
    }
   
    /**
     * @event toggle modal
     * @param {*} visible 
     */
    toggleModal(visible) {
        this.setState({ visible });
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
            let histories = [...this.state.histories];
            let index = histories.indexOf(histories.find(r => r.id == id));

            /**
             * Update new list
             */
            histories.splice(index, 1);
            this.setState({ histories });
            let { t } = this.props;
            showNotify(t('hr:notification'), t('Data has been deleted!'));
        }
        this.setState({ loading: false });
    }

    /**
     * @event before show modal edit history
     * @param {*} id 
     */
    onEditHistory(id) {
        this.toggleModal(true);
        let data = {};
        if(id) {
            let { histories } = this.state;
            data = histories.find(r => r.id == id);
        } 
        this.setState({ history: data })
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

        this.submitForm(dataUpdate);
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

        this.submitForm(dataUpdate);
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
    async submitForm(values) {
        let { t } = this.props;
        if (values.id) {
            values['_method'] = 'PUT';
        }

        let formData = convertToFormData(values);
        let response = await saveHistory(formData);
        if (response.status == 1) {
            this.toggleModal(false);
            this.getData();
            showNotify(t('hr:notification'), t('Data has been updated!'));
        } else {
            showNotify(t('hr:notification'), response.message, 'error');
        }
    }

    /**
     * @render
     */
    render() {
        let { t, match } = this.props;
        let { id } = match.params;

        const constTablist = tabConfig(id,this.props);

        const columns = [
            {
                title: t('No.'),
                render: r => this.state.histories.indexOf(r) + 1
            },
            {
                title: t('hr:title'),
                dataIndex: 'title',
            },
            {
                title: t('hr:note'),
                render: r => <div style={{whiteSpace: 'pre-wrap'}}>{r.note}</div>
            },
            {
                title: t('hr:type'),
                render: r => staffHistoryTypes[r.type]
            },
            {
                title: t('hr:verify'),
                render: r => {
                    let isVerified = r.verified_at ? true : false
                    let verifiedUser = r.verified_by_user || {};
                    return (
                        <>
                            <Switch size="small"
                                checkedChildren={<FontAwesomeIcon icon={faCheck} />}
                                unCheckedChildren={<FontAwesomeIcon icon={faTimes} />}
                                checked={isVerified}
                                onChange={checked => this.onVerify(checked, r.id)}
                            />
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
                            <Switch size="small"
                                checkedChildren={<FontAwesomeIcon icon={faCheck} />}
                                unCheckedChildren={<FontAwesomeIcon icon={faTimes} />}
                                checked={isApproved}
                                onChange={checked => this.onApprove(checked, r.id)}
                            />
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
                width : '10%',
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
                            {
                                checkPermission('hr-staff-history-delete') ?
                                    <Popconfirm title={t('Confirm delete selected item?')}
                                        placement="topLeft"
                                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                        onConfirm={(e) => this.onDeleteHistory(e, r.id)}
                                    >
                                        <Button
                                            type="primary"
                                            size='small'
                                            style={{ marginLeft: 8 }}
                                            onClick={e => e.stopPropagation()}
                                            icon={<FontAwesomeIcon icon={faTrashAlt} />}>
                                        </Button>
                                    </Popconfirm>
                                    : ''
                            }
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
        ];

        return (
            <>
                <PageHeader title={t('hr:add_history_for_staff')} tags={
                    checkPermission('hr-staff-history-create') ?
                    <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => this.onEditHistory()}>
                        &nbsp;{t('hr:add_new')}
                    </Button>
                    : ''
                    }
                />
                <Row className="card p-3 pt-0 mb-3">
                    <Tab tabs={constTablist} />
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'> 
                                    <Table
                                        dataSource={this.state.histories.length ? this.state.histories : []}
                                        columns={columns}
                                        loading={this.state.loading}
                                        pagination={{ pageSize: 1000, hideOnSinglePage: true }}
                                        rowKey={(h) => h.id}
                                    />
                                </div>
                            </div>
                            :
                            <Table
                                dataSource={this.state.histories.length ? this.state.histories : []}
                                columns={columns}
                                loading={this.state.loading}
                                pagination={{ pageSize: 1000, hideOnSinglePage: true }}
                                rowKey={(h) => h.id}
                            />
                        }
                    </Col>
                </Row>
                
                <StaffHistoryForm 
                    visible={this.state.visible}
                    data={this.state.history}
                    onCancel={() => this.toggleModal(false)}
                    refreshTable={() => this.getData()}
                    staffId={id}
                />
            </>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info
    };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffHistory));
