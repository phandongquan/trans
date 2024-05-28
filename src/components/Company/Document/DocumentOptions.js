import React, { Component } from 'react';
import { Row, Col, Button, Modal, Radio, Form, Input, DatePicker, Table, Avatar } from 'antd';
import { SendOutlined, CloseOutlined, DoubleLeftOutlined, RedoOutlined, SyncOutlined } from '@ant-design/icons';
import { updateDocument, pushNotification } from '~/apis/company/document';
import { showNotify, checkManagerHigher, checkPermission, getThumbnailHR, showInfoStaff, timeFormatStandard, convertToFormData, convertToFormDataV2, exportToXLS } from '~/services/helper';
import { withTranslation } from 'react-i18next';
import { subTypeRangeUsers, typeFileExcel, typePushNotificationDocument, typeRangeUsers } from '~/constants/basic';
import DocumentSendNotifyModal from "./DocumentSendNotifyModal";
import { getList as apiListTrainingQuestions } from '~/apis/company/TrainningQuestion';
import TextArea from 'antd/lib/input/TextArea';
import Dropdown from '~/components/Base/Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faSearch } from '@fortawesome/free-solid-svg-icons';
import Upload from '~/components/Base/Upload';
import { searchForDropdown, searchForDropdownSkill } from '~/apis/company/staffSearchDropDown';
import { connect } from 'react-redux';
import { upraisePushNotify } from '~/apis/company/skill';
import { createComunication } from '~/apis/company/document';
import dayjs from 'dayjs';
import { formatHeader, formatData } from '~/scenes/Company/Skill/config/exportModalSkillRequest';
import { trackingDocument } from '~/apis/company/document/tracking';
import ModalSkillRequest from '../Skill/ModalSkillRequest';
class DocumentOptions extends Component {
  constructor(props) {
    super(props);
    this.formModalRef = React.createRef();
    this.formFilterStaff = React.createRef();
    this.state = {
      visibleHistory: false,
      selectedRowKeys: [],
      visibleRequestSkill: false,
      dataRangeUsers: [],
      loading: false,
      dataComunication: [],
      rangeUser: null,
      deadline: null,
      sub_type: null,
      file: '',
      offsetStaff: 0,
      limitStaff: 50,
      totalStaff: 0,
      staffTypes: {}
    };
  }

  handleInput = (status) => {
    let { t, document, auth: { profile, staff_info } } = this.props;
    let { pdf_file, lead } = document;
    let message = t("Document updated!");
    if (status === "notify") {
      let data = {
        title: t("Bạn có một tài liệu mới"),
        content: document.title,
        data: {
          notify: {
            document_id: Number(document.id),
            type: typePushNotificationDocument,
          },
        },
        department_id: document.department_id,
        major_id: document.major_id,
      };
      let xhr = pushNotification(data);
      xhr.then((response) => {
        if (response.status !== 0) {
          showNotify(
            t("hr:notification"),
            t("Notification has been send to staffs in department!")
          );
        } else {
          showNotify(t("hr:notification"), response.message, "error");
        }
      });
    } else {
      let formData = new FormData();
      formData.append("_method", "PUT");
      switch (status) {
        case "draft":
          formData.append("status", 1);
          break;
        case "verify":
          formData.append("status", 2);
          break;
        case "publish":
          formData.append("status", 3);
          break;
        case "cancel":
          formData.append("status", 4);
          break;
        default:
          break;
      }

      let xhr = updateDocument(document.id, formData);
      xhr.then(async (response) => {
        if (response.status !== 0) {
          showNotify(t("hr:notification"), message);
          this.props.getDocument();

          if (status == 'publish') {
            const params = {
              summary: lead,
              attachment: pdf_file,
              created_by: profile.id,
            }
            let responseTracking = await trackingDocument(document.id, params);
            if (responseTracking.status && document.main_type == 1) {
              const { staff_name, staff_email } = staff_info;
              const staff = { name: staff_name, email: staff_email, role_id: 0, id: profile.id };
              const newData = {
                ...responseTracking.data,
                created_by_user: staff,
                updated_by_user: staff,
              }
              this.props.onCreateDocumentTracking(newData);
            }
          }
        } else {
          showNotify(t("hr:notification"), response.message, "error");
        }
      });
    }
  };

  /**
   * Check document has question not approved.
   */
  publishDocument = async () => {
    let { document } = this.props;
    let params = {
      document_id: document.id,
      status: 3,
      is_admin: 1,
    };
    let response = await apiListTrainingQuestions(params);
    if (response.status) {
      if (Array.isArray(response.data.rows) && response.data.rows.length) {
        let result = [];
        response.data.rows.map((question, index) => {
          let details = question.detail;
          let arrAns = [];
          details.map((item) => {
            arrAns.push(
              <Col span={24} key={item.id}>
                <Radio
                  disabled
                  checked={item.is_correct ? "checked" : ""}
                  className={item.is_correct ? "correct" : ""}
                  style={{ whiteSpace: "break-spaces" }}
                >
                  {item.content}
                </Radio>
              </Col>
            );
          });
          result.push(
            <div className="m-3" key={question.id}>
              <strong>Question {index + 1}: </strong>
              <span> {question.title}</span>
              <div dangerouslySetInnerHTML={{ __html: question.content }} />
              <Row gutter={24}>{arrAns}</Row>
            </div>
          );
        });

        Modal.confirm({
          title: "Xác nhận duyệt câu hỏi.",
          width: "50%",
          content: (
            <div>
              <div className="mb-3">
                Document đang có câu hỏi đang chờ duyệt. Bạn có đồng ý duyệt
                luôn câu hỏi hay không ?
              </div>
              <div style={{ overflowY: "scroll", maxHeight: 600 }}>
                {result}
              </div>
            </div>
          ),
          onOk: () => this.handleInput("publish"),
        });
      } else {
        this.handleInput("publish");
      }
    } else {
      showNotify("Notify", response.message, "error");
    }
  };

  /***
   * button create comunication
   */
  createComunication = async () => {
    let { document } = this.props;
    let response = await createComunication(document.id);
  };

  renderItemOptions = () => {
    let { t, document, staffInfo, profile } = this.props;
    const sendBackComponent =
      (document.status == 3 && checkPermission("hr-document-detail-approve")) ||
        document.status == 2 ? (
        <Button
          type="warning"
          className="border"
          onClick={() => {
            Modal.confirm({
              title: "Are you sure ?",
              content: "Do you want to send back document.",
              onOk: () => this.handleInput("draft"),
            });
          }}
        >
          {t("hr:send_back")}
        </Button>
      ) : null;

    switch (document.status) {
      case 1:
        return (
          <Row gutter={24}>
            <Col span={24}>
              <Button
                type="warning"
                className="border"
                onClick={() => {
                  Modal.confirm({
                    title: "Xác nhận ?",
                    content: "Bạn muốn không dùng tài liệu này?",
                    onOk: () => this.handleInput("cancel"),
                  });
                }}
              >
                {t("hr:cancel")}
              </Button>
              {checkPermission("hr-document-detail-verify") ? (
                <Button
                  className="ml-2"
                  type="primary"
                  onClick={() => {
                    this.handleInput("verify");
                  }}
                >
                  {t("hr:verify")}
                </Button>
              ) : (
                ""
              )}
            </Col>
          </Row>
        );
      case 2:
        return (
          <Row gutter={24}>
            <Col span={24}>
              {sendBackComponent}
              {checkManagerHigher(staffInfo.position_id) ? (
                checkPermission("hr-document-detail-approve") ? (
                  <Button
                    type="primary"
                    className="ml-2"
                    onClick={() => this.publishDocument()}
                  >
                    {t("hr:publish")}
                  </Button>
                ) : (
                  ""
                )
              ) : null}
            </Col>
          </Row>
        );
      case 3:
        return (
          <Row gutter={24}>
            <Col span={24}>
              {sendBackComponent}
              {checkPermission("hr-document-detail-notify-update") ? (
                <Button
                  type="primary"
                  className="ml-2"
                  onClick={() =>
                    this.setState({
                      visibleHistory: true,
                    })
                  }
                >
                  {t("hr:send_notify")}
                </Button>
              ) : (
                ""
              )}
              {this.props.document?.skill_id ? (
                <Button
                  className="ml-2"
                  type="primary"
                  onClick={() => this.setState({ visibleRequestSkill: true })}
                >
                  Skill request
                </Button>
              ) : (
                []
              )}
            </Col>
          </Row>
        );
      case 4:
        return (
          <Row gutter={24}>
            <Col span={24}>
              {checkPermission("hr-document-detail-verify") ? (
                <Button
                  type="primary"
                  className="border"
                  onClick={() => {
                    Modal.confirm({
                      title: "Xác nhận ?",
                      content: "Bạn muốn dùng lại tài liệu này?",
                      onOk: () => this.handleInput("verify"),
                    });
                  }}
                >
                  {t("hr:verify")}
                </Button>
              ) : null}
            </Col>
          </Row>
        );
      default:
        return "";
    }

  };
  /**
   *
   * @param {*} values
   */
  handleFilterStaff = (values) => {
    values.limit = this.state.limitStaff;
    values.offset =  this.state.offsetStaff
    let xhr = searchForDropdownSkill(values, this.props.document.skill_id);
    xhr.then((res) => {
      if (res.status) {
        this.setState({ dataRangeUsers: res.data.rows , totalStaff : res.data.total });
      }
    });
  };
  onChangePageStaff(page){
    let values = this.formFilterStaff.current.getFieldsValue();
    this.setState({ offsetStaff: (page - 1) * this.state.limitStaff }, () => this.handleFilterStaff({ ...values }));
  }
  /**
   * onSelectMultipleFilters
   * @param {*} selectedRowKeys
   */
  onSelectMultipleFilters = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };
  /**
   * Loading Button
   */
  enterLoading = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false });
    }, 1000);
  };
  render() {
    let {
      t,
      baseData: { departments, divisions, majors, positions, locations },
    } = this.props;
    return (
      <div className="">
        {this.renderItemOptions()}
        <DocumentSendNotifyModal
          visible={this.state.visibleHistory}
          hiddenModal={() => this.setState({ visibleHistory: false })}
          documentId={this.props.document.id}
        />
        <ModalSkillRequest 
          data={this.props.document?.skill}
          visible={this.state.visibleRequestSkill}
          onCancel ={() => this.setState({ visibleRequestSkill: false})}
          enterLoading = {() => this.enterLoading()}
        />
      </div>
    );
  }
}
/**
 * Map redux state to component props
 * @param {Object} state 
 */
const mapStateToProps = (state) => {
  return {
    auth: state.auth.info,
    baseData: state.baseData
  }
}
export default connect(mapStateToProps)(withTranslation()(DocumentOptions));