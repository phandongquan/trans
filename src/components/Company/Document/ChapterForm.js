import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { Modal, Row, Col, Form, Input, Tabs, Button } from "antd";
import FormItem from "antd/lib/form/FormItem";
import { getDocument as getListDocument } from "~/apis/company/document/";
import {
  getChapterDetail,
  createChapter,
  updateChapter,
  getChapters,
  updateChapterDraft
} from "~/apis/company/document/chapter";
import './configs/chapterForm.css'
import Dropdown from "~/components/Base/Dropdown";
import { showNotify, convertToFormData } from "~/services/helper";
import Upload from "~/components/Base/Upload";
import { MEDIA_URL } from "~/constants";
import { arrMimeType, typeFileExcel, typeFileImagePng, typeFileMp4, typeFilePdf , typeFileWord} from "~/constants/basic";


const { TabPane } = Tabs;

class ChapterForm extends Component {
  constructor(props) {
    super(props);
    this.modalForm = React.createRef();
    this.state = {
      documents: [],
      chapters: [],
      type: "pdf",
      link: "",
      file: null,
      fileSource: null,
      defaultFile: null,
      defaultFileSource: null,
    };
  }

  componentDidMount() {
    this.getDocuments();
    this.getChapter();
  }

  /**
   * get list document
   */
  getDocuments() {
    let xhr = getListDocument({ limit: 0, offset: 0 });
    xhr.then((response) => {
      if (response.status) {
        let { data } = response;
        this.setState({
          documents: data.rows,
        });
      }
    });
  }

  /**
   * Get list chapters
   * @param {} document_id
   */
  async getChapters(document_id = null) {
    if (!document_id) return false;
    let response = await getChapters({
      document_id: document_id,
      limit: -1,
      offset: 0,
    });
    if (response.status) {
      let data = response;
      this.setState({
        chapters: data.rows,
      });
    }
  }

  /**
   * @event change dropdown document
   * @param {*} e
   */
  handleChangeDocument(e) {
    this.getChapters(e);
  }

  /**
   * get detail chapter
   */
  getChapter() {
    let { chapter_id, chapter, isDraft } = this.props;
    if (isDraft) {
      this.setFieldToModal(chapter);
    } else if (chapter_id) {
      let xhr = getChapterDetail(chapter_id);
      xhr.then((response) => {
        let { data } = response;
        this.setFieldToModal(data);
      });
    }
  }

  /**
   *
   * @param {*} data
   */
  setFieldToModal = (data) => {
    if (!data) {
      return;
    }
    this.setState({
      type: data.type == "video" ? "pdf" : data.type,
    });
    let defaultValue = {
      title: data.title,
      piority: data.piority,
      main_type: data.main_type == undefined ? 0 : data.main_type,
    };
    if (data.source_file) {
      this.setState({
        defaultFileSource: [
          {
            uid: data.id + 1,
            name: data.source_file,
            status: "done",
            url: typeof data.full_link_source_file != 'undefined' ? data.full_link_source_file : data.source_file,
          },
        ],
      });
    }
    if (data.link) {
      switch (data.type) {
        case "pdf":
        case "video":
          this.setState({
            defaultFile: [
              {
                uid: data.id,
                name: data.link,
                status: "done",
                url: data.full_link,
              },
            ],
          });
          break;
        case "youtube":
          defaultValue.youtube_link = data.link;
          break;
        case "link":
          let arrIDDocChap = data.link.split(":");
          if (arrIDDocChap[0]) this.getChapters(arrIDDocChap[0]);
          defaultValue.document_id = arrIDDocChap[0];
          defaultValue.chapter_id = arrIDDocChap[1];
          break;
        default:
          break;
      }
    }

    this.modalForm.current.setFieldsValue(defaultValue);
  };

  /**
   * @event before submit form
   * Validate before submit
   */
  handleFormSubmit() {
    this.modalForm.current
      .validateFields()
      .then((values) => {
        this.submitForm(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }

  /**
   * handle submit form
   */
  submitForm = (datas) => {
    let { t, chapter_id, document_id, isDraft, submitDraft } = this.props;

    if (isDraft) {
      this.submitUpdateDraftChapter(datas);
      return false;
    }

    let values = {
      title: datas.title,
      piority: datas.piority,
      type: this.state.type,
      document_id: document_id,
      is_draft: submitDraft == true ? 1 : 0,
      main_type: datas.main_type  == undefined ? 0 : datas.main_type,
    };
    switch (this.state.type) {
      case "pdf":
        if (this.state.file) {
          values.link = this.state.file[0];
          if (this.state.file[0].type == "video/mp4") values.type = "video";
        }
        if (this.state.fileSource) {
          values.source = this.state.fileSource[0];
        }
        break;
      case "youtube":
        values.link = datas.youtube_link;
        break;
      case "link":
        let link = datas.document_id != undefined ? datas.document_id : "";
        link += datas.chapter_id != undefined ? ":" + datas.chapter_id : "";
        values.link = link;
        break;
      default:
        values.link = "";
        break;
    }

    let xhr;
    let message = "";
    let formData;
    if (chapter_id) {
      formData = convertToFormData(values);
      formData.append("_method", "PUT");
      xhr = updateChapter(chapter_id, formData);
      message = t("Chapter updated!");
    } else {
      formData = convertToFormData(values);
      xhr = createChapter(formData);
      message = t("Chapter created!");
    }

    xhr.then((response) => {
      showNotify(t("Notification"), message);
      this.props.hidePopup();
      this.props.resetTableChapters();
    });
  };

  /**
   * Handle submit update draft chapter.
   */
  submitUpdateDraftChapter = (datas) => {
    let { document_id, index } = this.props;
    let values = {
      title: datas.title,
      piority: datas.piority,
      type: this.state.type,
      document_id: document_id,
      index,
      main_type: datas.main_type  !== undefined ?  datas.main_type : 0,
    };

    switch (this.state.type) {
      case "pdf":
        if (this.state.file) {
          values.link = this.state.file[0];
          if (this.state.file[0].type == "video/mp4") values.type = "video";
        }
        if (this.state.fileSource) {
          values.source = this.state.fileSource[0];
        }
        break;
      case "youtube":
        values.link = datas.youtube_link;
        break;
      case "link":
        let link = datas.document_id != undefined ? datas.document_id : "";
        link += datas.chapter_id != undefined ? ":" + datas.chapter_id : "";
        values.link = link;
        break;
      default:
        values.link = "";
        break;
    }

    let formData = convertToFormData(values);
    formData.append("_method", "PUT");
    let xhr = updateChapterDraft(formData);
    xhr.then((res) => {
      if (res.status) {
        this.props.hidePopup();
        this.props.resetTableChapters();
      } else {
        showNotify("Notify", res.message, "error");
      }
    });
  };

  render() {
    let { t, visible, hidePopup, types } = this.props;
    let {
      documents,
      chapters,
      type,
      defaultFile,
      defaultFileSource,
    } = this.state;
    if (!visible) return [];
    return (
      <Modal
        forceRender
        title={t("Chapter")}
        open={visible}
        onCancel={hidePopup}
        onOk={this.handleFormSubmit.bind(this)}
        width={600}
        footer={
          <>
            <Button onClick={() => hidePopup()}>Cancel</Button>
            <Button type="primary" onClick={this.handleFormSubmit.bind(this)}>
              OK
            </Button>
          </>
        }
      >
        <Form
          className="form-chapter"
          preserve={false}
          ref={this.modalForm}
          layout="vertical"
        >
          <Row gutter={24}>
            <Col span={12}>
              <FormItem
                label={t("Title")}
                name="title"
                hasFeedback
                rules={[{ required: true, message: t("Please input title") }]}
              >
                <Input placeholder={t("Title")} />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={t("Type Chapter")} name="main_type" hasFeedback>
                <Dropdown
                  datas={types}
                  defaultOption="-- All Type --"
                />
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem
                label={t("Priority")}
                name="piority"
                hasFeedback
                rules={[
                  { required: true, message: t("Please input priority") },
                ]}
                initialValue={1}
              >
                <Input type="number" min="0" />
              </FormItem>
            </Col>
          </Row>
          <Tabs activeKey={type} onChange={(e) => this.setState({ type: e })}>
            <TabPane tab="Upload file" key="pdf" className="pt-3">
              <Row gutter={24}>
                <Col span={24}>
                  <FormItem extra="Max file size 50MB!" label="Source">
                    <Upload
                      defaultFileList={defaultFileSource}
                      onChange={(value) => this.setState({ fileSource: value })}
                      onRemove={(value) => this.setState({ fileSource: value })}
                      // type={arrMimeType}
                      size={80}
                      checkAllFiles={true}
                    />
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem
                    extra="Allow pdf/mp4. Max file size 50MB!"
                    label="File"
                  >
                    <Upload
                      defaultFileList={defaultFile}
                      onChange={(value) => this.setState({ file: value })}
                      onRemove={(value) => this.setState({ file: value })}
                      type={[typeFilePdf, typeFileMp4, typeFileImagePng, typeFileExcel, typeFileWord]}
                      accept=".pdf, video/*, image/*, .xlsx, .xls, .docx, .doc"
                      size={80}
                    />
                  </FormItem>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="Youtube" key="youtube" className="pt-3">
              <Row gutter={24}>
                <Col span={24}>
                  <FormItem name="youtube_link">
                    <Input placeholder={t("Youtube")} />
                  </FormItem>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="Link document" key="link" className="pt-3">
              <Row gutter={24}>
                <Col span={14}>
                  <FormItem label={t("Document")} name="document_id">
                    <Dropdown
                      datas={documents}
                      defaultOption="-- All Documents --"
                      onChange={(e) => this.handleChangeDocument(e)}
                      allowClear={() => this.setState({ chapters: [] })}
                    />
                  </FormItem>
                </Col>
                <Col span={10}>
                  <FormItem label={t("Chapter")} name="chapter_id">
                    <Dropdown
                      datas={chapters}
                      defaultOption="-- All Chapters --"
                    />
                  </FormItem>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    );
  }
}

export default withTranslation()(ChapterForm);
