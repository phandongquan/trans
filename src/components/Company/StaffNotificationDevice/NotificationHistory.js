import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Modal, Table } from 'antd';

class NotificationHistory extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        let { t } = this.props;
        const columns = [
            {
                title: 'No.',
                render: r => this.props.datas.indexOf(r) + 1
            },
            {
                title: t('title'),
                render: r => r.data?.title
            },
            {
                title: t('content'),
                render: r => {
                    let content = r.data?.content.replace(/\r?\n|\\r\\n/g, '<br />');
                    return (
                        <div
                            className="m-3"
                            dangerouslySetInnerHTML={{
                                __html: content
                            }}
                        >
                        </div>
                    )
                }
            },
            {
                title: t('type'),
                render: r => {
                    let result = '';
                    if(r.data?.data?.notify) {
                        Object.keys(r.data?.data?.notify).map(key => {
                            if(key == 'document_id') {
                                result = t('Document')
                            } else if(key == 'exam_id') {
                                result = t('Training Examination')
                            }
                        })
                    }
                    return (
                        <>
                            {result}
                            <small> (<strong>{r.data?.data?.notify?.document_id}{r.data?.data?.notify?.exam_id}</strong>) </small>
                        </>
                    )
                }
            },
            {
                title: t('hr:send_at'),
                render: r => r.created_at
            },
            {
                title: t('hr:read_at'),
                render: r => r.read_at
            }
        ]
        return (
            <>
                <Modal
                    title={t('hr:notification') + (' ') + t('hr:history')}
                    forceRender
                    open={this.props.visible}
                    onCancel={() => this.props.togglePopup()}
                    width='70%'
                    onOk={() => this.props.togglePopup()}
                >
                    <Table 
                        columns={columns}
                        dataSource={this.props.datas}
                        rowKey={ r => r.id}
                        pagination={false}
                    />
                </Modal>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(NotificationHistory));