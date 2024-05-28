import React, { Component } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { PageHeader } from "@ant-design/pro-layout";
import { Form, Col, Row, Input, Button, Table, Popconfirm, Modal } from "antd";
import { faPlus, faPen, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Dropdown from "~/components/Base/Dropdown";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { deleteMajor, list, update, create } from "~/apis/major";
import {
  showNotify, 
  historyReplace,
  historyParams,
  checkManager,
  checkPermission,
} from "~/services/helper";
import { statusMajor } from "./config";
const FormItem = Form.Item;

class Major extends Component {
  /**
   *
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.formModalRef = React.createRef();
    this.state = {
      visiblePopup: false,
      majorList: [],
      majorPopup: {},
      datas: [],
      data: {},
    };
  }

  componentDidMount() {
    let values = this.formRef.current.getFieldsValue();
    this.getMajor(values);
  }

  async getMajor(params = {}) {
    this.setState({ loading: true });
    params = {
      ...params,
    };
    historyReplace(params);
    let response = await list(params);
    if (response.status) {
      this.setState({ loading: false, majorList: response.data });
    } else {
      showNotify("Notification", response.message, "error");
      this.setState({ loading: false });
    }
  }
/**
 * submit modal
 */
  submitModal() {
    this.formModalRef.current
      .validateFields()
      .then((values) => {
        this.submitFormModal(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }

  submitFormModal() {
    let {t}= this.props
    this.setState({ loading: true });
    let message = "";
    let values = this.formModalRef.current.getFieldsValue();
    let xhr;
    if (this.state.data?.id) {
      xhr = update(this.state.data?.id, values);
      message = t("hr:update_susscess");
    } else {
      xhr = create(values);
      message = t("hr:create_susscess");
    }
    xhr.then((res) => {
      if (res.status) {
        showNotify("Notification", message);
        this.setState({ visiblePopup: false, data: {} });
        let valuesSearch = this.formRef.current.getFieldsValue();
        this.getMajor(valuesSearch);
      } else {
        showNotify("Notification", res.message, "error");
      }
    });
  }

  openModal(data) {
    this.setState({ data, visiblePopup: true }, () =>
      this.formModalRef.current.setFieldsValue(data)
    );
  }
  /**handle delete */
  handleDelete = async (id) => {
    let res = await deleteMajor(id);
    if (res.status) {
      let majorList = this.state.majorList.filter((r) => r.id != id);
      this.setState({ majorList });
    }
  };

  submitForm = (e) => {
    this.setState({ page: 1 }, () => {
      let values = this.formRef.current.getFieldsValue();
      this.getMajor({ ...values });
    });
  };

  render() {
    const { t } = this.props;
    const validatePriority = (rule, value, callback) => {
      if (value > 255) {
        callback(t("hr:The value can't be more than 255"));
      } else {
        callback();
      }
    };
  
    let { majors, departments } = this.props.baseData;
    const column = [
      {
        title: "No.",
        align: "center",
        width: "5%",
        render: (r) => this.state.majorList.indexOf(r) + 1,
      },
      {
        title: t("name"),
        render: (r) => r.name,
      },
      {
        title: t("priority"),
        render: (r) => r.priority,
        align: "center",
      },
      {
        title: t("hr:status"),
        render: (r) =>
          typeof statusMajor[r.status] !== "undefined" &&
         statusMajor[r.status],
      },
      {
        title: t("action"),
        render: (r, record) => (
          <>
            {
              checkPermission("hr-setting-major-update") ?
              <Button
                type="primary"
                size="small"
                icon={<FontAwesomeIcon icon={faPen} />}
                onClick={() => this.openModal(r)}
              />
              : null
            }
            {
              <Popconfirm
                title={t("hr:confirm_delete")}
                placement="topLeft"
                icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                onConfirm={() => this.handleDelete(r.id)}
              >
                {
                  checkPermission("hr-setting-major-delete") ?
                    <Button
                      className="ml-2 "
                      size="small"
                      danger
                      icon={<FontAwesomeIcon icon={faTrashAlt} />}
                    />
                  : null
                }
              </Popconfirm>
            }
          </>
        ),
        align: "center",
      },
    ];
    return (
      <div>
        <PageHeader
          title={t("major")}
          subTitle=""
          tags={[
            <div key="tags">
              {checkPermission("hr-setting-major-create") ? (
                <Button
                  type="primary"
                  icon={<FontAwesomeIcon icon={faPlus} />}
                  onClick={() =>
                    this.setState({ visiblePopup: true, data: {} })
                  }
                >
                  &nbsp;{t("add_new")}
                </Button>
              ) : null}
            </div>,
          ]}
        />
        <Row className="card pl-3 pr-3 mb-3">
          <Form
            className="pt-3"
            layout="vertical"
            ref={this.formRef}
            onFinish={this.submitForm.bind(this)}
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="name">
                  <Input placeholder={"Name"} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Button type="primary" htmlType="submit">
                  &nbsp;{t("search")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Row>
        <Table dataSource={this.state.majorList} columns={column} />
        <Modal
          title={this.state.data.id ? t("edit") : t("add_new")}
          open={this.state.visiblePopup}
          onCancel={() => {
            this.setState({ visiblePopup: false, data: {} });
          }}
          afterClose={() => {
            this.formModalRef.current.resetFields();
            this.setState({ data: {} });
          }}
          onOk={() => this.submitModal()}
          okText={t("submit")}
          width={"40%"}
        >
          <Form ref={this.formModalRef} name="ModalForm" layout="vertical">
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label={t("name")}
                  rules={[
                    {
                      required: true,
                      message: t("hr:input_name"),
                    },
                    {
                      pattern: new RegExp(/^.{1,100}$/),
                      message: t("do_not _more_than_100_characters!"),
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <FormItem name="status" label={t("status")}>
                  <Dropdown
                    datas={statusMajor}
                    defaultOption="-- All Status --"
                  />
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem name="parent_id" label={t("Major")}>
                  <Dropdown datas={majors} defaultOption="-- Majors --" />
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  name="priority"
                  label={t("priority")}
                  rules={[
                    {
                      validator: validatePriority,
                    },
                  ]}
                >
                  <Input type="number" min="0" max="255" />
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth.info,
  baseData: state.baseData,
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(Major));
