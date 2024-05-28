import React, { Component } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { PageHeader } from "@ant-design/pro-layout";
import { Form, Col, Row, Input, Button, Table, Popconfirm, Modal } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Dropdown from "~/components/Base/Dropdown";
import { basicStatus } from "~/constants/basic";
import { list, create, update, deleteLevel } from "~/apis/organigram";
import { faPlus, faPen, faTrashAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  showNotify,
  historyReplace,checkPermission
} from "~/services/helper";
import OrganigramChart from "~/components/Company/Organigram/organigramChart";
import { Link } from "react-router-dom";
import TooltipButton from '~/components/Base/TooltipButton';

const FormItem = Form.Item;

class Organigram extends Component {
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
      levelList: [],
      data: [],
      loading: false,
      dataDropdown: [],
      charts: [],
      isExpanded: false,
    };
  }

  /**get list level
   *
   */
  async getListLevel(params = {}) {
    this.setState({ loading: true });
    params = {
      ...params,
    };
    historyReplace(params);
    let response = await list(params);
    const { baseData: { departments, majors, positions }} = this.props;
    if (response.status) {
      const dataDropdown = response.data.rows.map((d) => {
        let deparment = departments.find((dep) => dep.id === d.department_id);
        let deptName = deparment ? deparment.name : "";
        let position = positions.find((pos) => pos.id === d.position_id);
        let positionName = position ? position.name : "";
        let major = majors.find((maj) => maj.id === d.major_id);
        let majorName = major ? major.name : "";
        let replacedString = `${deptName} / ${positionName} / ${majorName}`;
        return {
          id: d.id,
          name: replacedString,
        };
      });
      this.setState({
        loading: false,
        levelList: response.data.rows,
        dataDropdown,
        charts: response.data.chart,
      });
    } else {
      showNotify("Notification", response.message, "error");
      this.setState({ loading: false });
    }
  }
  componentDidMount() {
    let values = this.formRef.current.getFieldsValue();
    this.getListLevel(values);
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
    let parentId = values.parent_id !== undefined && values.parent_id !== null ? values.parent_id : 0;
    values.parent_id = parentId;
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
        this.getListLevel(valuesSearch);
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
    this.getListLevel(values);
  }

  /**handle delete */
  handleDelete = async (id) => {
    let res = await deleteLevel(id);
    if (res.status) {
      let levelList = this.state.levelList.filter((r) => r.id != id);
      this.setState({ levelList });
    }
  };

  openModal(data) {
    this.setState({ data, visiblePopup: true }, () =>
      this.formModalRef.current.setFieldsValue(data)
    );
  }

  toggleExpand = () => {
    this.setState((prevState) => ({
      isExpanded: !prevState.isExpanded,
    }));
  };

  render() {
    let {
      t,
      match,
      baseData: { departments, majors, positions },
    } = this.props;
    let { dataDropdown } = this.state;
    const { charts, isExpanded } = this.state;
    const validatePriority = (rule, value, callback) => {
      if (value > 8 || value < 2) {
        callback(t("hr:the value can't be less than 2 and more than 8"));
      } else {
        callback();
      }
    };
    const column = [
      {
        title: "No.",
        render: (r) => this.state.levelList.indexOf(r) + 1,
        align: "center",
        width: "5%",
      },
      {
        title: t("hr:level_code"),
        render: (r) => r.code,
      },
      {
        title: t("hr:level"),
        render: (r) => r.level,
        align: "center",
      },
      {
        title: t("department"),
        render: (r) => departments.find((d) => d.id === r.department_id)?.name,
        align: "center",
      },
      {
        title: t("position"),
        render: (r) => positions.find((p) => p.id === r.position_id)?.name,
        align: "center",
      },
      {
        title: t("major"),
        render: (r) => majors.find((m) => m.id === r.major_id)?.name,
        align: "center",
      },
      {
        title: t("hr:parent_level"),
        render: (r) => {
          let deparment = departments.find(
            (d) => d.id === r.parent?.department_id
          );
          let deptName = deparment ? deparment.name : "";
          let position = positions.find((p) => p.id === r.parent?.position_id);
          let positionName = position ? position.name : "";
          let major = majors.find((m) => m.id === r.parent?.major_id);
          let majorName = major ? major.name : "";
          return `${deptName} / ${positionName} / ${majorName}`;
        },
      },
      {
        title: t('hr:is_location_required'),
        render: (r) =>  typeof basicStatus[r.location_required] !== "undefined" &&
        basicStatus[r.location_required],
      },
      {
        title: t("action"),
        render: (r, record) => (
          <>
            { checkPermission("hr-setting-organigram-update") ?
              <Button
                type="primary"
                size="small"
                icon={<FontAwesomeIcon icon={faPen} />}
                onClick={() => this.openModal(r)}
              />
              : null
            }
            {
              <Link
                to={`/company/staff/list?department_id=${r.department_id}&position_id=${r.position_id}&major_id=${r.major_id}&status=1`}
              >
                <TooltipButton
                  title={t("hr:view")}
                  style={{ marginLeft: 5 }}
                  type="primary"
                  size="small"
                  icon={<FontAwesomeIcon icon={faEye} />}
                />
              </Link>
            }
            {
              <Popconfirm
                title={t("hr:confirm_delete")}
                placement="topLeft"
                icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                onConfirm={() => this.handleDelete(r.id)}
              >
                {
                 checkPermission("hr-setting-organigram-delete") ?
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
          title={t("hr:level")}
          subTitle=""
          tags={[
            <div key="tags">
              {checkPermission("hr-setting-organigram-create") ? (
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
              {
                <Button
                  type="primary"
                  size="small"
                  className=" ml-2"
                  icon={<FontAwesomeIcon icon={faEye} />}
                  onClick={this.toggleExpand}
                >
                  {isExpanded ? t("hr:collapse_chart") : t("expand_chart")}
                </Button>
              }
            </div>,
          ]}
        />
        <Row className="card pl-3 pr-3 mb-3">
          <Form
            className="pt-3 mb-2"
            layout="vertical"
            ref={this.formRef}
            onFinish={this.submitForm.bind(this)}
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="level">
                  <Input placeholder={t("hr:level")} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <FormItem name="department_id">
                  <Dropdown
                    datas={departments}
                    defaultOption={t("hr:all_department")}
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <FormItem name="position_id">
                  <Dropdown
                    datas={positions}
                    defaultOption={t("hr:all_position")}
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <FormItem name="major_id">
                  <Dropdown datas={majors} defaultOption={t("hr:all_major")} />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Button type="primary" htmlType="submit">
                  &nbsp;{t("search")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24} className="mb-3">
            <OrganigramChart
              datas={
                isExpanded
                  ? charts
                  : charts.slice(0, Math.ceil(charts.length / 12))
              }
            />
            {/* <OrganigramChart datas={this.state.charts}></OrganigramChart> */}
          </Col>
        </Row>
        <Table
          dataSource={this.state.levelList}
          columns={column}
          pagination={false}
        />
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
          footer={[
            this.state.data.level !== 0 && this.state.data.level !== 1 ? (
              <Button
                key="submit"
                type="primary"
                onClick={() => this.submitModal()}
              >
                {t("submit")}
              </Button>
            ) : null,
            <Button
              key="cancel"
              onClick={() => this.setState({ visiblePopup: false, data: {} })}
            >
              {t("cancel")}
            </Button>,
          ]}
          width={"40%"}
        >
          {" "}
          <Form ref={this.formModalRef} name="ModalForm" layout="vertical">
            <Row gutter={24}>
              <Col span={24}>
                <FormItem
                  name="level"
                  label={t("hr:level")}
                  rules={[
                    {
                      validator: validatePriority,
                    },
                  ]}
                >
                  <Input type="number" min="2" max="8" />
                </FormItem>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={t("department")}
                  name="department_id"
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: t("select_department"),
                    },
                  ]}
                >
                  <Dropdown
                    datas={departments}
                    defaultOption={t("hr:all_department")}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="position_id"
                  label={t("position")}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: t("hr:please_choose_position"),
                    },
                  ]}
                >
                  <Dropdown
                    datas={positions}
                    defaultOption={t("hr:all_position")}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={t("major")}
                  name="major_id"
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: t("please_choose_major"),
                    },
                  ]}
                >
                  <Dropdown datas={majors} defaultOption={t("hr:all_major")} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="parent_id" label={t("hr:parent_level")}>
                  <Dropdown datas={dataDropdown} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="location_required"
                  label={t("hr:is_location_required")}
                >
                  <Dropdown datas={basicStatus} />
                </Form.Item>
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
)(withTranslation()(Organigram));
