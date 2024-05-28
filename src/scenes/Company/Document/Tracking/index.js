import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Button, Space, Table, Tooltip } from 'antd'
import { getIconFile, showNotify, timeFormatStandard } from '~/services/helper';
import { dateFormat, dateTimeFormat } from '~/constants/basic';
import { getListTrackingByDocumentId, pushNotifyCommunication, updateCommunication, deleteCommunication } from '~/apis/company/document/tracking';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faPlus, faEdit, faTrash, faBell } from '@fortawesome/free-solid-svg-icons';
import { URL_HR } from '~/constants';
import { uniqueId } from 'lodash';
import DeleteButton from '~/components/Base/DeleteButton';
import UpdateTrackingModal from './components/update-tracking';
import { resizeText } from '~/utils';

const STATUS_TRACKING = {
    0: "Inactive",
    1: "Active",
    2: "Pending",
    3: "Expired"
}

const DOCUMENT_STATUS_DRAFT = 1;
const DOCUMENT_STATUS_PUBLISHED = 3;

class Tracking extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            trackingList: [],
            visibleUpdateTracking: false,
            trackingDetail: {}
        }
    }

    componentDidMount() {
        const { documentId } = this.props
        if (documentId) {
            this.getListTrackingByDocumentId(documentId)
        }
    }

    getListTrackingByDocumentId = (documentId) => {
        this.setState({ loading: true })
        getListTrackingByDocumentId(documentId).then(res => {
            if (res.status) {
                this.setState({ trackingList: res.data, loading: false })
            }
        })
    }

    insertTracking = (tracking) => {
        const { trackingList = [] } = this.state
        let newTrackingList = []
        if (!Array.isArray(trackingList)) {
            newTrackingList = [tracking]
        } else {
            newTrackingList = [tracking, ...trackingList]
        }
        this.setState({ trackingList: newTrackingList })
    }

    findTrackingByIdAndUpdate = (tracking) => {
        const { auth } = this.props;
        const { staff_info, profile } = auth;
        const updatedBy = {
            id: staff_info.staff_id,
            name: staff_info.staff_name,
            email: staff_info.staff_email,
            role_id: profile.role_id,
        }

        const { trackingList = [] } = this.state
        const newTrackingList = trackingList.map(item => {
            if (item.times === tracking.times) {
                return tracking
            }
            return item
        })
        this.setState({ trackingList: newTrackingList })
    }

    findAndUpdateTrackings = (status) => {
        const { trackingList = [] } = this.state
        const newTrackingList = trackingList.map(item => {
            return {
                ...item,
                status
            }
        })
        this.setState({ trackingList: newTrackingList })
    }

    onCreateNotifyCommunication = (tracking) => {
        const { document_id } = tracking
        const newTracking = {
            ...tracking,
            is_notify: 1
        }
        pushNotifyCommunication(document_id).then(res => {
            if (res.status) {
                this.findTrackingByIdAndUpdate(newTracking)
                showNotify("success", "Create communication success")
            }
        })
    }

    render() {
        const { trackingList, loading } = this.state
        const columns = [
            {
                title: 'Summary',
                render: r => resizeText(r.summary, 20)
            },
            {
                title: 'Attachment',
                render: r => {
                    const { attachment } = r
                    const url = attachment ? URL_HR + "/production/training/" + attachment : "";
                    if (!url) return null
                    return <div
                        className='tracking-file'
                        onClick={() => window.open(url, "_blank")}
                    >
                        {getIconFile(url)}
                    </div>
                }
            },
            {
                title: 'Version',
                render: r => r.times
            },
            {
                title: 'Status',
                render: r => {
                    const { status } = r
                    return STATUS_TRACKING[status]
                }
            },
            {
                title: 'Notify',
                render: r => {
                    const { is_notify } = r
                    return is_notify ? "Yes" : "No"
                }
            },
            {
                title: 'Comment',
                render: r => {
                    const { is_comment } = r
                    return is_comment ? "Yes" : "No"
                }
            },
            {
                title: "From date",
                render: r => r.from_date ? timeFormatStandard(r.from_date, dateFormat) : "Chưa có ngày bắt đầu",
            },
            {
                title: "To date",
                render: r => r.to_date ? timeFormatStandard(r.to_date, dateFormat) : "Chưa có ngày kết thúc",
            },
            {
                title: 'Created by',
                render: r => {
                    return r?.created_by_user?.id ? r.created_by_user.name : "Chưa có thông tin"
                }
            },
            {
                title: 'Updated by',
                render: r => {
                    return r?.updated_by_user?.id ? r.updated_by_user.name : "Chưa có thông tin"
                }
            },
            {
                title: 'Created at',
                render: r => timeFormatStandard(r.created_at, dateTimeFormat),
            },
            {
                title: 'Updated at',
                render: r => timeFormatStandard(r.updated_at, dateTimeFormat),
            },
            {
                title: 'Action',
                key: 'operation',
                fixed: 'right',
                render: r => {
                    const { document } = this.props;
                    const isFirstTracking = trackingList.indexOf(r) === 0
                    const { status, is_notify } = r
                    const { status: statusDocument } = document
                    return isFirstTracking && (<Space size={5}>
                        {
                            statusDocument === DOCUMENT_STATUS_PUBLISHED && (
                                <Button Button
                                    type="primary"
                                    size="small"
                                    icon={<FontAwesomeIcon icon={(status === 1 || (r.from_date && r.to_date)) ? faEdit : faPlus} />}
                                    onClick={() => {
                                        this.setState({ visibleUpdateTracking: true, trackingDetail: r })
                                    }}
                                ></Button>
                            )
                        }
                        {
                            status === 1 ? (
                                <>
                                    <Tooltip title="Open Link">
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<FontAwesomeIcon icon={faLink} />}
                                            onClick={() => this.props.history.push(`/company/document/communication?keywords=${document.title}&limit=20&page=1&status=1`)}
                                        ></Button>
                                    </Tooltip>
                                    <DeleteButton
                                        onConfirm={() => {
                                            const { document_id, times } = r;
                                            const param = { document_id, times }
                                            deleteCommunication(param).then(res => {
                                                const { data } = res;
                                                this.findTrackingByIdAndUpdate(data)
                                            })
                                        }}
                                    />
                                    {
                                        !is_notify && (
                                            <Tooltip title="Push Notification">
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    onClick={() => this.onCreateNotifyCommunication(r)}
                                                    icon={<FontAwesomeIcon icon={faBell} />}
                                                >
                                                </Button>
                                            </Tooltip>
                                        )
                                    }
                                </>
                            ) : null
                        }
                    </Space >)
                },
                align: 'center'
            }
        ]
        return (
            <>
                <Table
                    dataSource={trackingList}
                    loading={loading}
                    columns={columns}
                    scroll={{ x: 1500 }}
                    rowKey={(item) => uniqueId("tracking_")}
                    pagination={{ pageSize: 20, showSizeChanger: false }}
                />
                <UpdateTrackingModal
                    trackingDetail={this.state.trackingDetail}
                    visible={this.state.visibleUpdateTracking}
                    onCancel={() => this.setState({ visibleUpdateTracking: false })}
                    onOk={(values) => {
                        updateCommunication(values).then(res => {
                            const { data } = res;
                            this.findAndUpdateTrackings(0)
                            this.findTrackingByIdAndUpdate(data)
                            this.setState({ visibleUpdateTracking: false })
                            showNotify("success", "Update communication success")
                        })
                    }}
                />
            </>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData,
    };
};

export default connect(mapStateToProps, null)(withTranslation()(Tracking));
