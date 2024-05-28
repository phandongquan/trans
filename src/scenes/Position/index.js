import React, { Component } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { PageHeader } from "@ant-design/pro-layout";
import { Form, Col, Row, Input, Button, Table, Popconfirm, Modal } from "antd";
import { faPlus, faPen, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Dropdown from "~/components/Base/Dropdown";
import {
  list as apiList,
  update,
  deletePosition,
  create,
} from "~/apis/position";
import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  showNotify,
  historyReplace,
  historyParams,
  checkManager,
  checkPermission,
} from "~/services/helper";
import { statusPosition } from "./config";

const FormItem = Form.Item;

class Position extends Component {
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
      positionList: [],
      datas: [],
      data: {},
      loading: false,
    };
  }

  componentDidMount() {
    let values = this.formRef.current.getFieldsValue();
    this.getPosition(values);
  }
  /**get list position
   *
   */
  async getPosition(params = {}) {
    this.setState({ loading: true });
    params = {
      ...params,
    };
    historyReplace(params);
    let response = await apiList(params);
    if (response.status) {
      this.setState({ loading: false, positionList: response.data });
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
  /**submitModal
   *
   */
  submitFormModal() {
    let { t } = this.props;
    let values = this.formModalRef.current.getFieldsValue();
    let xhr;
    let message = "";
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
        this.getPosition(valuesSearch);
      } else {
        showNotify("Notification", res.message, "error");
      }
    });
    xhr.catch((err) => showNotify("Notification", err, "error"));
  }
  /**
   * event click btn search
   * @param {*}
   */
  submitForm() {
    let values = this.formRef.current.getFieldsValue();
    this.setState({ page: 1 }, () => this.getPosition(values));
  }
  /**handle delete */
  handleDelete = async (id) => {
    let res = await deletePosition(id);
    if (res.status) {
      let positionList = this.state.positionList.filter((r) => r.id != id);
      this.setState({ positionList });
    }
  };

  openModal(data) {
    this.setState({ data, visiblePopup: true }, () =>
      this.formModalRef.current.setFieldsValue(data)
    );
  }

  render() {
    const { t } = this.props;
    let { visiblePopup, datas } = this.state;
    let { positions } = this.props.baseData;
    const validatePriority = (rule, value, callback) => {
      if (value > 255) {
        callback(t("hr:the value can't be more than 255"));
      } else {
        callback();
      }
    };

    const column = [
      {
        title: "No.",
        align: "center",
        width: "5%",
        render: (r) => this.state.positionList.indexOf(r) + 1,
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
        title: t("create"),
        render: (r) => r.created_at,
        align: "center",
      },
      {
        title: t("hr:update"),
        render: (r) => r.updated_at,
        align: "center",
      },
      {
        title: t("hr:status"),
        render: (r) =>
          typeof statusPosition[r.status] !== "undefined" &&
         statusPosition[r.status],
      },
      {
        title: t("action"),
        render: (r, record) => (
          <>
            {
              checkPermission("hr-setting-position-update") ?
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
                  checkPermission("hr-setting-position-delete") ?
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
          title={t("position")}
          subTitle=""
          tags={[
            <div key="tags">
              {
                checkPermission("hr-setting-position-create") ?
                <Button
                  type="primary"
                  icon={<FontAwesomeIcon icon={faPlus} />}
                  onClick={() =>
                    this.setState({ visiblePopup: true, data: {} })
                  }
                >
                  &nbsp;{t("add_new")}
                </Button>
                : null
              }
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
        <Table dataSource={this.state.positionList} columns={column} />
        <Modal
          title={this.state.data.id ?  t("edit") : t("add_new")}
          open={this.state.visiblePopup}
          onOk={() => this.submitModal()}
          onCancel={() => {
            this.setState({ visiblePopup: false, data: {} });
          }}
          afterClose={() => {
            this.formModalRef.current.resetFields();
            this.setState({ data: {} });
          }}
          okText={t("submit")}
          width={"40%"}
        >
          <Form ref={this.formModalRef} name="ModalForm" layout="vertical">
            <Row gutter={24}>
              <Col span={24}>
                <FormItem
                  name="name"
                  label={t("name")}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: t('hr:input_name'),
                    },
                    {
                      pattern: new RegExp(/^.{1,100}$/),
                      message: t("hr:do_not_more_than_100_characters!"),
                    },
                  ]}
                >
                  <Input />
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem name="status" label={t("status")}>
                <Dropdown
                    datas={statusPosition}
                    defaultOption="-- All Status --"
                  />
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
                  <Input type="number"  min="0" max="255"   />
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
)(withTranslation()(Position));
