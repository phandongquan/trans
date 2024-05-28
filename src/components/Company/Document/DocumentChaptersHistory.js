import React, { Component } from "react";
import DocumentChaptersHistoryModal from "./DocumentChaptersHistoryModal";
import { HistoryOutlined } from "@ant-design/icons";
import { Tooltip, Button, Modal,Form,Row,Col ,Table} from "antd";
import { getDocumentDraft } from '~/apis/company/document/draft';
import {
    showNotify,
} from "~/services/helper";
import { EyeOutlined } from "@ant-design/icons";
class DocumentChaptersHistory extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            visibleChaptersHistory: false,
            datas:[],
            newContent:{},
            oldContent:{},
            documentChapterDraftId:null
        }

    }
    componentDidUpdate(prevProps) {
        if (prevProps.visible !== this.props.visible  && this.props.visible) {
            this.getDocumentDraft();

        }

    }
   
    /**
     * get document draft Form
     */
    getDocumentDraft = () => {
        let { documentId, chapterId} = this.props;
        let data = {
            document_id: documentId,
            chapter_id: chapterId,
        };
        let xhr = getDocumentDraft(data);
        xhr.then((response) => {
            if (response.status !== 0) {
                // showNotify('Notification', 'Get the document draft successfully');
                this.setState({ datas: response.data.rows });
            } else {
                showNotify('Notification', response.message, 'error');
            }
        });

    }
    render() {
        let { visible } = this.props;
   
        return (
            <>
            <Modal title =" History Modal" visible={visible}
            onCancel={() => this.props.hiddenModal()}
            width="80%"
            >
                <Table
                 className="table_in_block"
                 columns={[
                     {
                         title: "Staff",
                         width:"60%",
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
                         title: "Revised At",
                         width:"30%",
                         dataIndex: "updated_at",
                     },

                     {
                         title: "",
                         width:"5%",
                         render: (r) => {
                             if (!r.old_content) return false;
                             return (
                                 <>
                                     <Button
                                         icon={<EyeOutlined />}
                                         type="primary"
                                         style={{backgroundColor:"#306e51", color: "#fff"}}
                                         onClick={() =>
                                            this.setState({
                                                visibleChaptersHistory: true,
                                                newContent: r.new_content,
                                                oldContent: r.old_content,
                                                documentChapterDraftId:r.id,
                                               
                                            })
                                        }
                                     />
                                 </>
                             );

                         }
                     },
                 ]}
                 dataSource={this.state.datas}
                 rowKey="id"
                 size="small"
                 tableLayout="fixed"
                 pagination={false}
                

                />

            </Modal>
            <DocumentChaptersHistoryModal
             visible={this.state. visibleChaptersHistory}
             hiddenModal={() => this.setState({  visibleChaptersHistory: false})}
             documentId={this.props.documentId}
             newContent={this.state.newContent}
             oldContent={this.state.oldContent}
             documentChapterDraftId={this.state.documentChapterDraftId}
            />
            </>  
        )
    }
}
export default (DocumentChaptersHistory)
