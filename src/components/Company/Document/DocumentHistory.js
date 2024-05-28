import React, { Component } from "react";
import {
    Input,
    Form,
    Row,
    Col,
    Divider,
    Button,
    Tabs,
    Spin,
    Table,
} from "antd";
import {
    showMessage,
    timeFormatStandard,
    parseIntegertoTime,
    showNotify,
    getURLHR,
    checkPermission,
} from "~/services/helper";
import { EyeOutlined } from "@ant-design/icons";
import { getDocumentDraft } from '~/apis/company/document/draft';
import { withTranslation } from 'react-i18next';
import DocumentHistoryModal from "./DocumentHistoryModal";
import { MAIN_TYPE_DOCUMENT } from '~/scenes/Company/Document/config'

const dateFormat = "HH:mm DD/MM/YY";
class DocumentHistory extends Component {
    constructor(props) {
        super(props)
        this.state = {
            datas: [],
            visibleHistory: false,
            newContent:{},
            oldContent:{},
            documentDraftId:null,
        }
    }
    componentDidMount() {
         this.getDocumentDraft();
    }
    /**
     * get document draft Form
     */
    getDocumentDraft = () => {
        let { document,t } = this.props;
        let data = {
            document_id: document.id,
        };
        let xhr = getDocumentDraft(data);
        xhr.then((response) => {
            if (response.status !== 0) {
                // showNotify('Notification', 'Get the document draft successfully');
                this.setState({ datas: response.data.rows });
            } else {
                showNotify(t('hr:notification'), response.message, 'error');
            }
        });

    }

    render() {
        let { document, t } = this.props;
        return (
            <div>
                {document.created_at ? (
                    <p>
                        {t('hr:created_date')}:{" "}
                        <strong>
                            {timeFormatStandard(document.created_at, dateFormat)}
                        </strong>
                    </p>
                ) : ''}
                {document.updated_at ? (
                    <p>
                        {t('hr:modified_at')}:{" "}
                        <strong>
                            {timeFormatStandard(document.updated_at, dateFormat)}
                        </strong>
                    </p>
                ) : ''}
                {document.published_at ? (
                    <p className="txt_color_1">
                        {t('hr:published_at')}:{" "}
                        <strong>
                            {parseIntegertoTime(document.published_at, dateFormat)}
                        </strong>
                    </p>
                ) : ''}
                {document.main_type == MAIN_TYPE_DOCUMENT ?
                    <p className="txt_color_1">
                        {t('hr:version')}: &nbsp;
                        <strong>
                            {document.version}
                        </strong>
                    </p>
                    : ''}
                <p className="txt_color_1">
                    <strong>{t('hr:revisions')}</strong> {t('hr:total')} (
                    {this.state.datas.length})
                </p> 
                {
                    <Table
                        className="table_in_block"
                        columns={[
                            {
                                title: t("hr:staff"),
                                render: (r) => {
                                    if (r.created_by_user) {
                                        return (
                                            <span>
                                                {r.created_by_user.staff_name}{" "}
                                                <strong>#{r.created_by_user.code}</strong>
                                            </span>
                                        );
                                    }
                                },
                            },
                            {
                                title: t("hr:revised_at"),
                                dataIndex: "updated_at",
                            },
                            {
                                title: " ",
                                render: (r) => {
                                    if (!r.old_content) return false;
                                    return (
                                        <>
                                            {
                                                checkPermission('hr-document-detail-history-preview') ?
                                                    <Button
                                                        icon={<EyeOutlined />}
                                                        type="primary"
                                                        onClick={() =>
                                                            this.setState({
                                                                visibleHistory: true,
                                                                newContent: r.new_content,
                                                                oldContent: r.old_content,
                                                                documentDraftId: r.id
                                                            })
                                                        }
                                                    />
                                                    : ''
                                            }
                                        </>
                                    );

                                },
                                width: "10%",
                            },
                        ]}
                        dataSource={this.state.datas}
                        rowKey="id"
                        size="small"
                        tableLayout="fixed"
                        pagination={false}
                    />
                }
          <DocumentHistoryModal
            visible={this.state.visibleHistory}
            hiddenModal={() => this.setState({ visibleHistory: false})}
            documentId={document.id}
            newContent={this.state.newContent}
            oldContent={this.state.oldContent}
            documentDraftId={this.state.documentDraftId}
            categories={this.props.categories}
            types={this.props.types} 
            listSkill={this.props.listSkill}
          />
            </div>
        )
    }

}

export default withTranslation()(DocumentHistory)