import React, { Component } from "react";
import { connect } from "react-redux";
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
  Space,
  Dropdown as DropdownAntd
} from "antd";

import { PageHeader } from '@ant-design/pro-layout';
import { withTranslation } from "react-i18next";
import { RollbackOutlined, EyeOutlined, DownOutlined, LinkOutlined } from "@ant-design/icons";
import {
  createDocument,
  updateDocument,
  getDocumentDetail,
} from "~/apis/company/document";
import {
  getChapters as getListChapter,
  deleteChapter,
} from "~/apis/company/document/chapter";
import {
  showMessage,
  timeFormatStandard,
  parseIntegertoTime,
  showNotify,
  getURLHR,
  checkPermission,
} from "~/services/helper";
import DocumentOption from "~/components/Company/Document/DocumentOptions";
import DocumentFeedback from "~/components/Company/Document/DocumentFeedback";
import Dropdown from "~/components/Base/Dropdown";
import debounce from "lodash/debounce";
import { searchForDropdown as getSkillList } from "~/apis/company/skill";
import ChapterComponent from "~/components/Company/Document/Chapters";
import QRCode from "qrcode.react";
import Avatar from "~/components/Base/Avatar";
import DocumentQuestion from "~/components/Company/Document/DocumentQuestion";
import Editor from "~/components/Base/Editor";
import CounterView from "~/scenes/Company/Document/CounterView";
import Upload from "~/components/Base/Upload";
import { arrMimeType, typeFileExcel, typeFileImagePng, typeFileMp4, typeFilePdf , typeFileWord} from "~/constants/basic";
import { mainTypeDocument, MAIN_TYPE_DOCUMENT } from "./config";
import { URL_HR } from "~/constants";
import RevisedModal from "~/components/Company/Document/RevisedModal";
import AssetDropdown from "~/scenes/AssetDevice/config/AssetDropdown";
import SkuDeviceDropdown from "~/scenes/AssetDevice/config/SkuDeviceDropdown";
import SkillDropdown from "~/components/Base/SkillDropdown";
import DocumentHistoryModal from "~/components/Company/Document/DocumentHistoryModal";
import DocumentHistory from "~/components/Company/Document/DocumentHistory";
import Tracking from "./Tracking";
import './Tracking/configs/style.scss';

const { TextArea } = Input;
const { TabPane } = Tabs;
const dateFormat = "HH:mm DD/MM/YY";


class DocumentForm extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.cpnTrackingRef = React.createRef();
    this.state = {
      loading: false,
      document: {},
      categories: {},
      types: {},
      status: {},
      feedback: [],
      listSkill: [],
      disableField: false,
      content: "",
      file: "",
      chapters: [],
      chapterDrafts: [],
      visibleRevised: false,
      visibleHistory: false,
      revised: null,
      majorSkills: []
    };
    this.getListSkill = debounce(this.getListSkill, 500);
  }

  componentDidMount() {
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({
        major_id: [
          21, // Đào tạo
          64, // ISO
          29, // BOM
          80, // BOD
          59, // Vận hành Clinic
          67, // Vận hành Cosmetic
          96, // Vận hành Logistic
          95 // Vận hành
        ]
      })
    }
    this.getDocument();
  }

  /**
   * Get document detail and set fields value for Form
   */
  getDocument = () => {
    let { id } = this.props.match.params;
    let xhr;
    if (id) {
      xhr = getDocumentDetail(id);
    } else {
      xhr = getDocumentDetail(0);
    }

    xhr.then((response) => {
      if (response.status) {
        let {
          data: {
            document,
            categories,
            document_type,
            document_status,
            document_feedback,
            document_content,
            document_links,
          },
        } = response;
        this.setState({
          categories: categories,
          types: document_type,
          status: document_status,
          feedback: document_feedback,
          chapterDrafts: document?.chapter_draft,
        });

        if (id) {
          this.setState(
            {
              document: document,
              content: document_content ? document_content.content : "",
              disableField: document.status != 1 ? true : false,
              majorSkills: document?.skill?.major_id || []
            },
            () => {
              // this.getListSkill({ id: document.skill_id });
              // if(Array.isArray(document_links)) {
              //     if(document_links.length) {
              //         this.getListSkill({ id: document_links[0].object_id })
              //     }
              // }
            }
          );
          Object.keys(document).map((key) => {
            if (["department_id", "major_id", "skill_id", "asset_id"].includes(key)) {
              document[key] = document[key] == 0 ? null : document[key];
            }

            if (key == "distributed" && document[key]) {
              document[key] = String(document[key])
                .split(",")
                .map((item) => {
                  return item !== "0" ? Number(item) : item;
                });
            }

            if (key == "category_id") {
              document[key] = String(document[key]);
            }

            if (
              key == "skill_id" &&
              Array.isArray(document_links) &&
              document_links.length
            ) {
              document[key] = document_links[0].object_id;
            }
          });
          this.formRef.current.setFieldsValue(document);
          this.getListChapters();
        }
      }
    });
  };

  /**
   *
   */
  getListChapters = () => {
    let { id } = this.props.match.params;
    let xhr = getListChapter({
      document_id: id,
      limit: -1,
      offset: 0,
    });
    xhr.then((response) => {
      if (response.status) {
        this.setState({ chapters: response.data });
      }
    });
  };

  /**
   * List skill for dropdown
   */
  async getListSkill(params = {}) {
    let { department_id, major_id, asset_id } = this.formRef?.current.getFieldsValue();
    if (!params.id) {
      params = {
        ...params,
        department_id: department_id !== undefined ? department_id : 0,
        // major_id: major_id !== undefined ? major_id : 0,
        // asset_id: asset_id !== undefined ? asset_id : 0,
      };
    }

    let skillResponse = await getSkillList(params);
    if (skillResponse && skillResponse.data) {
      let listSkill = skillResponse.data.results;
      this.setState({ listSkill });
    }
  }

  /**
   * @event Search skill
   * @param {*} value
   */
  onSearchSkill(value) {
    if (!value) {
      return;
    }
    this.getListSkill({ value });
  }

  /**
   * Event submit form
   * @param {*} value
   */
  handleSubmitForm = async (value) => {
    this.setState({ loading: true });
    let {
      match: {
        params: { id },
      },
      t,
    } = this.props;
    let xhr, message;
    let formData = new FormData();

    // format data before submit form
    let arrNameSelect = [
      "category_id",
      "type",
      "department_id",
      "major_id",
      "skill_id",
    ];
    value.content = this.state.content;
    value.remove_pdf_file = this.state.remove_pdf_file;
    value.remove_source_file = this.state.remove_source_file;
    Object.keys(value).map((key) => {
      if (arrNameSelect.includes(key) && value[key] == undefined) {
        formData.append(key, 0);
      } else if (key == "source_file" || key == "pdf_file") {
        if (Array.isArray(value[key])) {
          formData.append(
            key,
            typeof value[key][0] != "undefined" ? value[key][0] : undefined
          );
        }
      } else if (key == 'major_id' || key == 'asset_id') {
        if (Array.isArray(value[key]) && key == 'major_id') {
          if (value[key].length) {
            value[key].map(v => formData.append('major_id[]', v))
          } else {
            formData.append('major_id[]', 0)
          }
        }
        if (Array.isArray(value[key]) && key == 'asset_id') {
          value[key].map(v => {
            if (v) {
              formData.append('asset_id[]', v)
            }
          })
        }
      } else {
        if (typeof value[key] != "undefined") {
          formData.append(key, value[key]);
        }
      }
    });
    if (id) {
      formData.append("_method", "PUT");
      xhr = await updateDocument(id, formData);
      message = t("hr:document") + ' ' + t("hr:updated");
    } else {
      formData.append("status", 0);
      xhr = await createDocument(formData);
      message = t("hr:document") + ' ' + t('hr:created');
    }

    this.setState({ loading: false });
    if (xhr.status) {
      const { data } = xhr;
      if (!id) this.props.history.push(`/company/document/${data.document.id}/edit`);
      showMessage(message);
    } else {
      showNotify(t("hr:notification"), xhr.message, "error");
    }
  };

  /**
   * Download QR code
   */
  downloadQR = () => {
    const canvas = document.getElementById("qrDocument");

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `qr_code_document.png`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  render() {
    const {
      t,
      match,
      auth: { staff_info, profile },
    } = this.props;
    let id = match.params.id;
    let {
      visibleHistory,
      document,
      content,
      status,
      feedback,
      categories,
      types,
      disableField,
    } = this.state;
    let { departments, majors } = this.props.baseData;
    let title = id
      ? t("Update (Code #" + document.document_code + ")")
      : t("hr:add_new");
    let majorsALl = [{ id: 'all', name: 'All majors' }, { id: 999999999, name: 'None' }, ...majors]
    const items = [];
    // if (id && document.communication_id) {
    //   items.push({
    //     key: "2",
    //     label: (
    //       <a
    //         key="company.communication.edit"
    //         style={{ color: "rgb(0, 153, 153)" }}
    //         href={`${window.location.origin}/company/communication/${document.communication_id}/edit`}
    //         target="_blank"
    //       >
    //         Link communication
    //       </a>
    //     ),
    //   });
    // }

    items.push({
      key: "1",
      label: (
        <a
          key="link_work.hasaki.vn"
          style={{ color: "rgb(0, 153, 153)" }}
          href={`https://work.hasaki.vn/documents/${document.id}`}
          target="_blank"
        >
          Link work.hasaki.vn
        </a>
      ),
    });
    return (
      <div id="page_edit_document_page">
        <PageHeader
          className="site-page-header"
          title={t("hr:document")}
          subTitle={title}
          extra={[
            id ? (
              <DropdownAntd
                menu={{
                  items,
                }}
              >
                <a onClick={(e) => e.preventDefault()}>
                  <Space>
                    {/* <Button
                      className="mr -8"
                      size="small"
                      type="primary"
                      icon={<LinkOutlined />}
                    /> */}
                    <LinkOutlined />
                  </Space>
                </a>
              </DropdownAntd>
            ) : (
              []
            ),
          ]}
        ></PageHeader>
        <Spin spinning={this.state.loading}>
          <Row gutter={24}>
            <Col xs={24} sm={24} md={24} lg={14} xl={14}>
              <div className="card mr-1 p-3 pt-0">
                <Form
                  className="ant-advanced-search-form pt-3"
                  layout="vertical"
                  onFinish={(values) => this.handleSubmitForm(values)}
                  ref={this.formRef}
                >
                  {id ? (
                    <>
                      <strong style={{ float: "right", color: "#17A2B8" }}>
                        {t('hr:status')} : {status[document.status]}
                      </strong>
                      <br></br>
                    </>
                  ) : (
                    []
                  )}
                  <Row gutter={24}>
                    <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                      <Form.Item
                        label={t("hr:title")}
                        name="title"
                        hasFeedback
                        rules={[
                          {
                            required: true,
                            message: t("hr:input_title"),
                          },
                        ]}
                      >
                        <Input disabled={disableField} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                      <Form.Item
                        label={t("hr:control_no")}
                        name="document_code"
                        rules={[
                          {
                            required: true,
                            message: t("hr:input_control_no"),
                          },
                        ]}
                      >
                        <Input disabled={disableField} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={24}>
                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                      <Form.Item
                        label={t("hr:category")}
                        name="category_id"
                        hasFeedback
                        rules={[
                          {
                            required: true,
                            message: t("hr:please_choose_category"),
                          },
                        ]}
                      >
                        <Dropdown
                          datas={categories}
                          takeZero={false}
                          defaultOption="-- All Categories --"
                          disabled={disableField}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                      <Form.Item label={t("hr:main_type")} name="main_type">
                        <Dropdown
                          datas={mainTypeDocument}
                          defaultOption="-- All Main Type --"
                          disabled={disableField}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                      <Form.Item
                        label={t("hr:type")}
                        name="type"
                        rules={[
                          {
                            required: true,
                            message: t("hr:please_chosse_type"),
                          },
                        ]}
                      >
                        <Dropdown
                          datas={types}
                          defaultOption="-- All Types --"
                          disabled={disableField}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={24}>
                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                      <Form.Item label={t("hr:dept")} name="department_id">
                        <Dropdown
                          datas={departments}
                          defaultOption="-- All Departments --"
                          disabled={disableField}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                      <Form.Item label={t("hr:major")} name="major_id">
                        <Dropdown
                          datas={majorsALl}
                          defaultOption="-- All Majors --"
                          disabled={disableField}
                          onSelect={(key) => {
                            if (key == "all") {
                              let arrMajors = [];
                              Object.keys(majors).map((m) =>
                                arrMajors.push(majors[m]["id"])
                              );
                              this.formRef.current.setFieldsValue({
                                major_id: arrMajors,
                              });
                              return;
                            }
                          }}
                          mode="multiple"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                      <Form.Item label={t("SKU")} name="asset_id">
                        <SkuDeviceDropdown
                          defaultOption="-- All SKU Device --"
                          disabled={disableField}
                          mode="multiple"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  {document.main_type == MAIN_TYPE_DOCUMENT ? (
                    <>
                      <Row gutter={24}>
                        <Col span={24}>
                          <Form.Item label={t("hr:skill")} name="skill_id">
                            {/* <Dropdown
                              disabled={disableField}
                              datas={this.state.listSkill}
                              onSearch={this.onSearchSkill.bind(this)}
                              defaultOption="-- Type to search skill --"
                            /> */}
                            <SkillDropdown
                              disabled={disableField}
                              defaultOption="-- Type to search skill --"
                              // paramSearch={{ status: 2 }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={24}>
                        <Col span={24}>
                          <Form.Item label={t("hr:major_of_skill")}>
                            <Dropdown
                              disabled={true}
                              value={this.state.majorSkills}
                              datas={majorsALl}
                              defaultOption="-- Major of skill --"
                              mode="multiple"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  ) : (
                    ""
                  )}

                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item
                        label={t("hr:summary")}
                        name="lead"
                        hasFeedback
                        rules={[
                          {
                            required: true,
                            message: t("hr:please_input_summary"),
                          },
                        ]}
                      >
                        <TextArea disabled={disableField} rows={4} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item
                        name="source_file"
                        label={t("Source File")}
                        valuePropName="source_file"
                        extra="Maximum file size 25MB!"
                      >
                        <Upload
                          extensions={["ppt", "pptx"]}
                          type={arrMimeType}
                          size={25}
                          onRemove={() =>
                            this.setState({ remove_source_file: true })
                          }
                          defaultFileList={
                            document.source_file
                              ? [
                                {
                                  uid: "-1",
                                  name: document.source_file
                                    ? document.source_file.split("/").pop()
                                    : "",
                                  status: "done",
                                  url: document.source_file
                                    ? URL_HR +
                                    "/production/training/" +
                                    document.source_file
                                    : "",
                                },
                              ]
                              : null
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item
                        name="pdf_file"
                        label={t("hr:file")}
                        valuePropName="pdf_file"
                        extra="Support file . Maximum file size 25MB!"
                      >
                        <Upload
                          type={[typeFilePdf, typeFileMp4, typeFileImagePng, typeFileExcel, typeFileWord]}
                          size={25}
                          accept=".pdf, video/*, image/*, .xlsx, .xls, .docx, .doc"
                          onRemove={() =>
                            this.setState({ remove_pdf_file: true })
                          }
                          defaultFileList={
                            document.pdf_file
                              ? [
                                {
                                  uid: "-1",
                                  name: document.pdf_file
                                    ? document.pdf_file.split("/").pop()
                                    : "",
                                  status: "done",
                                  url: document.pdf_file
                                    ? URL_HR +
                                    "/production/training/" +
                                    document.pdf_file
                                    : "",
                                },
                              ]
                              : null
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="file"
                    label={t("hr:thumbnail")}
                    valuePropName="file"
                    extra="Support file PNG/JPG/JPEG. Maximum file size 10MB!"
                  >
                    <Avatar
                      onChange={(e) => this.setState({ file: e })}
                      url={document && document.image}
                    />
                  </Form.Item>
                  <Divider className="m-0" />
                  <Row gutter={24} className="pt-3">
                    <Col xs={12} sm={12} md={12} lg={12} xl={12} key="btn-back">
                      {checkPermission("hr-document-update") ? (
                        <Button
                          type="primary"
                          htmlType="submit"
                          disabled={disableField}
                        >
                          {t('hr:submit')}
                        </Button>
                      ) : (
                        ""
                      )}
                    </Col>
                    <Col
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      key="bnt-submit"
                      style={{ textAlign: "right" }}
                    >
                      <Button
                        type="default"
                        icon={<RollbackOutlined />}
                        onClick={() =>
                          this.props.history.push("/company/document")
                        }
                      >
                        {t('hr:cancel')}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Col>
            {id ? (
              <Col xs={24} sm={24} md={24} lg={10} xl={10}>
                <div className="mt-3">
                  <Tabs defaultActiveKey="1" type="card">
                    <TabPane className="tab_content" tab={t("hr:option")} key="1">
                      <DocumentOption
                        staffInfo={staff_info}
                        profile={profile}
                        document={document}
                        getDocument={() => this.getDocument()}
                        onCreateDocumentTracking={(tracking = {}) => this.cpnTrackingRef.current.insertTracking(tracking)}
                      ></DocumentOption>
                      {
                        (document?.main_type === 1 && !document?.major_id?.includes("999999999")) && (
                          <div className="mt-2" >
                            <Tracking
                              ref={this.cpnTrackingRef}
                              documentId={this.props.match.params.id}
                              document={document}
                              history={this.props.history}
                            />
                          </div>
                        )
                      }
                    </TabPane>
                    <TabPane className="tab_content" tab={t("hr:history")} key="2">
                      <DocumentHistory
                        visible={visibleHistory}
                        document={document}
                        categories={this.state.categories}
                        types={this.state.types}
                        listSkill={this.state.listSkill}
                      />
                    </TabPane>
                    <TabPane
                      className="tab_content"
                      tab={t("hr:counter_view")}
                      key="counter_view"
                    >
                      <div className="table_in_block">
                        <CounterView
                          documentId={this.props.match.params.id}
                          chapterId={0}
                        />
                      </div>
                    </TabPane>
                    <TabPane
                      className="tab_content text-center"
                      tab="QR Code"
                      key="3"
                    >
                      <QRCode
                        id="qrDocument"
                        value={`{"action":"document","id":${document.id},"id_chapter":null}`}
                        style={{ marginTop: 20, marginBottom: 20 }}
                      />
                      <br />
                      <Button
                        type="link"
                        onClick={() => this.downloadQR()}
                        className="txt_color_1"
                      >
                        {" "}
                        {t('hr:download_qr_code')}
                      </Button>
                    </TabPane>
                    <TabPane className="tab_content" tab={t("hr:feedback")} key="4">
                      <DocumentFeedback
                        style={{ marginLeft: 20 }}
                        feedbacks={feedback.length > 0 ? feedback : []}
                      ></DocumentFeedback>
                    </TabPane>
                    <TabPane
                      className="tab_content"
                      tab={t("hr:question")}
                      key="question"
                    >
                      <DocumentQuestion
                        history={this.props.history}
                        id={this.props.match.params.id}
                        style={{ marginLeft: 20 }}
                      />
                    </TabPane>
                  </Tabs>
                </div>
                {document.main_type == MAIN_TYPE_DOCUMENT ? (
                  <div id="block_chapter">
                    <ChapterComponent
                      documentID={match.params.id}
                      isDraft={false}
                      submitDraft={document.status == 2 || document.status == 3}
                      document={document}
                      refreshChapter={() => {
                        this.getDocument();
                        this.getListChapters();
                      }}
                      chapters={this.state.chapters}
                      types={types}
                    />
                  </div>
                ) : (
                  ""
                )}
                {document.main_type == MAIN_TYPE_DOCUMENT &&
                  Array.isArray(document.chapter_draft) &&
                  document.chapter_draft.length ? (
                  <div id="block_chapter" className="mb-3">
                    <ChapterComponent
                      documentID={match.params.id}
                      isDraft={true}
                      document={document}
                      submitDraft={false}
                      refreshChapter={() => {
                        this.getDocument();
                        this.getListChapters();
                      }}
                      chapters={this.state.chapterDrafts}
                      types={types}
                    />
                  </div>
                ) : null}
              </Col>
            ) : (
              []
            )}
          </Row>
        </Spin>
        <RevisedModal
          visible={this.state.visibleRevised}
          data={this.state.revised}
          setVisible={(visibleRevised) => this.setState({ visibleRevised })}
          categories={this.state.categories}
          types={this.state.types}
          status={this.state.status}
        />
        {this.state.document.id ? (
          <DocumentHistoryModal
            visible={this.state.visibleHistory}
            hiddenModal={() => this.setState({ visibleHistory: false })}
            documentId={this.state.document.id}
            categories={this.state.categories}
            types={this.state.types}
            listSkill={this.state.listSkill}
          />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.auth.info,
    baseData: state.baseData,
  };
};

export default connect(mapStateToProps, null)(withTranslation()(DocumentForm));
