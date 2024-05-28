import Upload from "~/components/Base/Upload";
import Dropdown from "~/components/Base/Dropdown";
import React, { Component } from 'react';
import { Modal, Input, Form, Col, Tabs, Row } from 'antd';
import { connect } from "react-redux";
import { showNotify } from '~/services/helper';
import { getDocumentDraft } from '~/apis/company/document/draft';
import { push } from "connected-react-router";
const { TabPane } = Tabs;
class DocumentChaptersHistoryModal extends Component {
    constructor(props) {
        super(props)
        this.formRefChapterCurrent = React.createRef();
        this.formRefChapterUpdate = React.createRef();
        this.state = {
            fieldChapterDifferent: [],
        };
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.newContent !== this.props.newContent) {
            this.formRefChapterUpdate.current.setFieldsValue(this.props.newContent)
        }
        if (prevProps.oldContent !== this.props.oldContent) {
            let { oldContent }=this.props;
            oldContent.document_id=String(oldContent.document_id)
            this.formRefChapterCurrent.current.setFieldsValue(this.props.oldContent)
        }
        if (prevProps.documentChapterDraftId !== this.props.documentChapterDraftId) {
            let { oldContent, newContent } = this.props;
            let {documentChapterDraftId}= this.props;
            let tempFieldChapterDiff = [];
            Object.keys(newContent).map(keyNewContent => {
                // if(keyNewContent == 'document_id'){
                //     console.log(newContent[keyNewContent])
                //     console.log(oldContent[keyNewContent])
                // } 
                if (Array.isArray(newContent[keyNewContent])) {
                    if (newContent[keyNewContent].join("") != oldContent[keyNewContent].join("")) {
                        tempFieldChapterDiff = push(keyNewContent)
                    }
                } else {
                    if (newContent[keyNewContent] != oldContent[keyNewContent]) {
                        tempFieldChapterDiff.push(keyNewContent);
                    }
                }
            });
            this.setState({fieldChapterDifferent: tempFieldChapterDiff});
        }
    }

    /**
    * get document chapter draft Form
    */
    getDocumentDraft = () => {
        let { documentId, chapterId } = this.props;
        let data = {
            document_id: documentId,
            chapter_id: chapterId,
        };
    
        let xhr = getDocumentDraft(data);
        xhr.then((response) => {
            if (response.status !== 0) {
                showNotify('Notification', 'Get the document chapter draft successfully');
                this.props.hiddenModal()
            } else {
                showNotify('Notification', response.message, 'error');
            }
        });
    
    }
    renderForm = (data = {}, typeCurrent = "curent") => {
        const {
            baseData: { documents, chapters },
        } = this.props;
        const { fieldChapterDifferent } = this.state;
        let {
            type,
            defaultFile,
            defaultFileSource,
        } = this.state
        return (
          <>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label={"Title"}
                  name="title"
                  hasFeedback
                  rules={[{ required: true, message: "Please input title" }]}
                >
                  <Input
                    disabled={true}
                    style={
                      fieldChapterDifferent.includes("title")
                        ? { border: "1px solid #ff6666" }
                        : {}
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label={"Priority"}
                  name="piority"
                  hasFeedback
                  rules={[{ required: true, message: "Please input priority" }]}
                  initialValue={1}
                >
                  <Input
                    type="number"
                    min="0"
                    style={
                      fieldChapterDifferent.includes("piority")
                        ? { border: "1px solid #ff6666" }
                        : {}
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Tabs activeKey={type} onChange={(e) => this.setState({ type: e })}>
              <TabPane tab="Upload file" key="pdf" className="pt-3">
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item extra="Max file size 50MB!" label="Source">
                      <Upload
                        defaultFileList={defaultFileSource}
                        onChange={(value) =>
                          this.setState({ fileSource: value })
                        }
                        onRemove={(value) =>
                          this.setState({ fileSource: value })
                        }
                        // type={arrMimeType}
                        size={80}
                        checkAllFiles={true}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      extra="Allow pdf/mp4. Max file size 50MB!"
                      label="File"
                    >
                      <Upload
                        defaultFileList={defaultFile}
                        onChange={(value) => this.setState({ file: value })}
                        onRemove={(value) => this.setState({ file: value })}
                        typeCurrent={["video/mp4", "application/pdf"]}
                        accept="video/*, application/pdf"
                        size={80}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab="Youtube" key="youtube" className="pt-3">
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item name="youtube_link">
                      <Input
                        placeholder={"Youtube"}
                        style={
                          fieldChapterDifferent.includes("youtube_link")
                            ? { border: "1px solid #ff6666" }
                            : {}
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab="Link document" key="link" className="pt-3">
                <Row gutter={24}>
                  <Col span={14}>
                    <Form.Item label={"Document"} name="document_id">
                      <Dropdown
                        datas={documents}
                        defaultOption="-- All Documents --"
                        onChange={(e) => this.handleChangeDocument(e)}
                        // allowClear={() => this.setState({ chapters: [] })}
                        style={
                          fieldChapterDifferent.includes("document_id")
                            ? { border: "1px solid #ff6666" }
                            : {}
                        }
                      />
                      {/* {console.log(fieldChapterDifferent.includes("document_id") )} */}
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item label={"Chapter"} name="chapter_id">
                      <Dropdown
                        datas={chapters}
                        defaultOption="-- All Chapters --"
                        style={
                          fieldChapterDifferent.includes("chapter_id")
                            ? { border: "1px solid #ff6666" }
                            : {}
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </>
        );
    
    }
    render() {
    
        let { visible } = this.props;
        let dataChapterCurrent = this.props.newContent;
        let dataChapterUpdate = this.props.oldContent;
        return (
            <Modal
                title="History  Chapter Document Modal" visible={visible}
                onCancel={() => this.props.hiddenModal()}
                width="80%"
            >
                <Row gutter={24}>
                    <Col span={12} style={{ borderRight: '1px solid #d1d5db' }}>
                        <Form layout='vertical'
                            ref={this.formRefChapterCurrent}
                        >
                            {this.renderForm(dataChapterCurrent, "current")}
                        </Form>
                    </Col>
                    <Col span={12}>
                        <Form layout='vertical'
                            ref={this.formRefChapterUpdate}
                        >
                            {this.renderForm(dataChapterUpdate, "update")}
                        </Form>
                    </Col>
                </Row>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth.info,
    baseData: state.baseData,
});
const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(DocumentChaptersHistoryModal)