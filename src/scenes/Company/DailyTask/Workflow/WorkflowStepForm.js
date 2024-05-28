import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Modal,
  Form,
  Row,
  Col,
  Input,
  InputNumber,
  TimePicker,
  Spin,
  Button,
  Tabs,
} from "antd";
import Dropdown from "~/components/Base/Dropdown";
import dayjs from "dayjs";
import {
  insert as apiInsert,
  update as apiUpdate,
  detail as apiDetail,
} from "~/apis/company/dailyTask/workflowStep";
import debounce from "lodash/debounce";
import { searchForDropdown as getSkillList } from "~/apis/company/skill";
import {
  convertToFormData,
  showNotify,
  timeFormatStandard,
  cleanObject,
  getURLHR,
} from "~/services/helper";
import {
  workflowStepAction,
  typeFileImagePng,
  typeFileImageJpg,
  typeFileImageJpeg,
  screenResponsive,
} from "~/constants/basic";
import UploadMultiple from "~/components/Base/UploadMultiple";
import { MEDIA_URL_HR } from "~/constants";
import QRCode from "qrcode.react";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const timeFormat = "HH:mm";
export class WorkflowStepForm extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.uploadRef = null;
    this.state = {
      loading: false,
      listSkill: [],
      wfstep: null,
    };

    this.getListSkill = debounce(this.getListSkill, 500);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.id != this.props.id) {
      this.uploadRef.resetForm();
      if (this.props.id == 0) {
        this.formRef.current.resetFields();
      } else {
        this.getDetailWorkflowStep(this.props.id);
      }
    }
  }

  /**
   * Get detail workflow step
   * @param {*} wfstepId
   */
  getDetailWorkflowStep = async (wfstepId = 0) => {
    let response = await apiDetail(wfstepId);
    if (response.status) {
      let workflowStep = response.data;
      this.setState({ wfstep: workflowStep });
      workflowStep.begintime = workflowStep.begintime
        ? dayjs(workflowStep.begintime, timeFormat)
        : null;
      workflowStep.endtime = workflowStep.endtime
        ? dayjs(workflowStep.endtime, timeFormat)
        : null;
      workflowStep.skill_id = workflowStep.skill_id
        ? workflowStep.skill_id
        : null;

      workflowStep.criterions = workflowStep.criterions ? workflowStep.criterions : [{name: ''},{name: ''},{name: ''},{name: ''},{name: ''}]
      this.formRef.current.setFieldsValue(workflowStep);
      if (workflowStep.images) {
        let historyFileList = [];
        workflowStep.images.map((f, i) =>
          historyFileList.push({
            uid: `history-${i}`,
            name: f.split("/").pop(),
            fileRaw: f,
            status: "done",
            url: MEDIA_URL_HR + f,
          })
        );
        this.uploadRef.setValues({ historyFileList });
      }

      if (workflowStep.skill_id) {
        this.getListSkill({ id: workflowStep.skill_id });
      }
    }
  };

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
   * List skill for dropdown
   */
  async getListSkill(params = {}) {
    let skillResponse = await getSkillList(params);
    if (skillResponse && skillResponse.data) {
      let listSkill = skillResponse.data.results;
      this.setState({ listSkill });
    }
  }

  /**
   * @event before submit form
   * Validate before submit
   */
  handleFormSubmit(e) {
    e.preventDefault();
    this.formRef.current
      .validateFields()
      .then((values) => {
        this.submitForm(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }

  /**
   * Submit Form
   * @param {*} values
   */
  submitForm = (values) => {
    this.setState({ loading: true });
    let { id, wfid } = this.props;
    values.begintime = values.begintime
      ? timeFormatStandard(values.begintime, timeFormat)
      : "00:00:00";
    values.endtime = values.endtime
      ? timeFormatStandard(values.endtime, timeFormat)
      : "00:00:00";
    values.skill_id = values.skill_id ? values.skill_id : 0;
    values.wfid = wfid;

    let criterions = values.criterions;
    delete(values.criterions);

    values = cleanObject(values);
    let formData = convertToFormData(values);

    if(Array.isArray(criterions)) {
      criterions.map(c => {
        formData.append("criterions[][name]", c.name)
      })
    }

    let dataUpload = this.uploadRef.getValues();
    if (dataUpload.fileList && Array.isArray(dataUpload.fileList)) {
      dataUpload.fileList.map((f) => formData.append("images[]", f));
    }
    if (dataUpload.removeFileList && Array.isArray(dataUpload.removeFileList)) {
      dataUpload.removeFileList.map((f) =>
        formData.append("remove_images[]", f)
      );
    }

    let xhr;
    let message;
    const {t} =(this.props.translang.translang)
    if (id) {
      formData.append("_method", "PUT");
      xhr = apiUpdate(id, formData);
      message = t("update_checklist_item");
    } else {
      xhr = apiInsert(formData);
      message = t("create_checklist_item");
    }

    xhr.then((response) => {
      this.setState({ loading: false });
      if (response.status) {
        showNotify("Notify", message);
        this.props.refreshTable();
        this.uploadRef.resetForm();
        this.formRef.current.resetFields();
      } else {
        showNotify("Notify", response.message, "error");
      }
    });
  };

  /**
   * Download QR code
   */
  downloadQR = () => {
    const canvas = document.getElementById("qrWorkflowStepDailyTask");

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `qr_code_workflow_step_daily_task.png`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  render() {
    const {id } = this.props;
    const {t} =(this.props.translang.translang)
    return (
      <Modal
        title={
          <div style={{ fontWeight: "bold" }}>
            {id ? t("hr:update_checklist_item") : t("hr:create_checklist_item")}
          </div>
        }
        open={this.props.visible}
        onCancel={() => this.props.hidePopup()}
        width=   {window.innerWidth < screenResponsive  ? "100%":"60%"}
        onOk={this.handleFormSubmit.bind(this)}
      >
        <Form layout="vertical" ref={this.formRef}>
          <Spin spinning={this.state.loading}>
            <Tabs>
              <Tabs.TabPane tab={t('hr:main_tab')} key="form" className="mt-3">
                <Row gutter={12}>
                  <Col span={24}>
                    <Form.Item
                      name="name"
                      label={t('name')}
                      hasFeedback
                      rules={[{ required: true, message: t("hr:input_name") }]}
                    >
                      <Input placeholder={t("name")} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                    <Form.Item name="begintime" label={t("hr:time_start")}>
                      <TimePicker
                        className="w-100"
                        format={timeFormat}
                        placeholder={t("hr:time_start")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                    <Form.Item name="endtime" label={t("hr:time_end")}>
                      <TimePicker
                        className="w-100"
                        format={timeFormat}
                        placeholder={t("hr:time_end")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                    <Form.Item name="duration" label={t("duration")}>
                      <InputNumber
                        min={0}
                        className="w-100"
                        placeholder={t("duration")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                    <Form.Item name="repeat" label={t("repeat")}>
                      <InputNumber
                        min={0}
                        className="w-100"
                        placeholder={t('repeat')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                    <Form.Item name="action_id" label={t("hr:action_require")}>
                      <Dropdown
                        datas={workflowStepAction}
                        defaultOption={t("hr:action_require")}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col span={24}>
                    <Form.Item name="skill_id" label={t("hr:skill_require")}>
                      <Dropdown
                        datas={this.state.listSkill}
                        defaultOption={t("hr:all_skill")}
                        onSearch={this.onSearchSkill.bind(this)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col span={24}>
                    <Form.Item name="description" label={t("hr:description")}>
                      <Input.TextArea rows={5} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col xs={24} sm={24} md={24} lg={20} xl={20}>
                    <Form.Item label={t('images')}>
                      <UploadMultiple
                        type={[
                          typeFileImageJpg,
                          typeFileImagePng,
                          typeFileImageJpeg,
                        ]}
                        size={30}
                        onRef={(ref) => {
                          this.uploadRef = ref;
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={4} xl={4} className="text-center">
                    <QRCode
                      size={60}
                      id="qrWorkflowStepDailyTask"
                      value={`{"action":"workflow_step_dailytask","id":${id}}`}
                    />
                    <br />
                    <Button
                      type="link"
                      onClick={() => this.downloadQR()}
                      className="txt_color_1"
                    >
                      {" "}
                      Download QR Code
                    </Button>
                  </Col>
                </Row>
              </Tabs.TabPane>
              <Tabs.TabPane tab={t('hr:criteria_tab')} key="criterions" className="mt-3">
                <Form.List name="criterions">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Row key={key}>
                          <Col span={24}>
                            <Form.Item
                              {...restField}
                              name={[name, "name"]}
                            >
                              <Input placeholder={`Criterion ${key + 1}`} />
                            </Form.Item>
                          </Col>
                          {/* <Col
                            span={1}
                            className="d-flex align-items-center justify-content-center"
                          >
                            <Form.Item>
                              <MinusCircleOutlined
                                onClick={() => remove(name)}
                              />
                            </Form.Item>
                          </Col> */}
                        </Row>
                      ))}
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                        >
                          {t('hr:add_criteria')}
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Tabs.TabPane>
            </Tabs>
          </Spin>
        </Form>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowStepForm);
