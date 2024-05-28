import React, { Component } from "react";
import { PageHeader } from "@ant-design/pro-layout";
import { Link } from "react-router-dom";
import { Button, Table, Row, Col, Form, Popconfirm, Input } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus,faEye, faPen, faTrashAlt, faCopy} from "@fortawesome/free-solid-svg-icons";
import Dropdown from "~/components/Base/Dropdown";
import tabListTraining from "../config/tabListTraining";
import Tab from "~/components/Base/Tab";
import TooltipButton from "~/components/Base/TooltipButton";
import { getList, deleteTrainingPlan, updateTrainingPlan, copyTrainingPlan } from "~/apis/company/TrainingPlan";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { showNotify, historyParams, historyReplace ,timeFormatStandard, parseIntegertoTime} from "~/services/helper";
import { statusTrainingPlan, subTypeRangeUsers } from "./config";
import CreateUpdateDate from "~/components/Base/CreateUpdateDate";
import { QuestionCircleOutlined , LinkOutlined} from "@ant-design/icons";
import { statusInactive } from "./config";

const FormItem = Form.Item;
const dateFormat = 'HH:mm DD/MM/YY';
class TrainingPlan extends Component {
  /**
   *
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      trainingPlanList: [],
      limit: 30,
      total: 0,
      loading: false,
      page: 1,
      selectedRowKeys: [],
    };
  }
  /**
   *
   * @param {*} params
   */
  componentDidMount() {
    let params = historyParams();
    if (params.offset) {
      this.setState({ page: params.offset / this.state.limit + 1 });
    }
    this.formRef.current.setFieldsValue(params);
    this.getTrainingPlan(params);
  }

  /**
   *
   * delete training plan
   */
  getDeleteTrainingPlan(e, id) {
    // e.stopPropagation();
    // let xhr = deleteTrainingPlan(id);
    // xhr.then((response) => {
    //   if (response.status) {
    //     let values = this.formRef.current.getFieldsValue();
    //     this.getTrainingPlan(values);
    //     showNotify("Notification", "Training plan has been removed!");
    //   } else {
    //     showNotify("Notification", response.message);
    //   }
    // });

    let xhr = deleteTrainingPlan(id, {
      is_approved: true,
      value: statusInactive,
    });

    xhr.then((res) => {
      this.setState({ loading: false });
      if (res.status) {
        showNotify("Notify", "Successfully");
        let values = this.formRef.current.getFieldsValue();
        this.getTrainingPlan(values);
      } else {
        showNotify("Notify", res.message, "error");
      }
    });
  }

  /**
   * submit Form
   */
  submitForm = (e) => {
    this.setState({ page: 1 }, () => {
      let values = this.formRef.current.getFieldsValue();
      this.getTrainingPlan(values);
    });
  };

  /**
   *
   * @param {*}  page
   */
  onChangePage = (page) => {
    let params = historyParams();
    delete params.limit;
    delete params.offset;
    delete params.sort;
    let values = this.formRef.current.getFieldsValue();
    values = {
      ...params,
      ...values,
    };
    this.setState({ page }, () => this.getTrainingPlan(values));
  };

  /**
   *
   * get list
   */
  getTrainingPlan = (params = {}) => {
    this.setState({
      loading: true,
    });
    params = {
      ...params,
      limit: this.state.limit,
      offset: params.offset || (this.state.page - 1) * this.state.limit,
    };
    historyReplace(params);
    let xhr = getList(params);
    xhr.then((response) => {
      if (response.status) {
        let { data } = response;
        this.setState({
          trainingPlanList: data.rows,
          loading: false,
          total: data.total,
        });
      }
    });
  };

  /**copy training plan
   *
   */
  async onCopyTrainingPlan(e, id) {
    e.stopPropagation();
    let { t } = this.props;
    let response = await copyTrainingPlan(id);
    if (response.status) {
      let values = this.formRef.current.getFieldsValue();
      this.getTrainingPlan(values);
      showNotify(t("Notification"), t("Plan has been copyed!"));
    } else {
      showNotify(t("Notification"), response.message);
    }
  }

  render() {
    const { t } = this.props;
    let { departments, majors, positions } = this.props.baseData;
    let { trainingPlanList } = this.state;
    const { selectedRowKeys, setSelectedRowKeys, loading } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const hasSelected = selectedRowKeys;
    const columns = [
      {
        title: "No.",
        align: "center",
        render: (r) => this.state.trainingPlanList.indexOf(r) + 1,
      },
      {
        title: t("hr:title"),
        render: (r) => <strong>{r.name}</strong>,
      },
      {
        title: t("hr:dept"),
        render: (r) => departments.find((d) => d.id === r.department_id)?.name,
      },
      {
        title: t("hr:major"),
        render: (r) => {
          let result = [];
          if (Array.isArray(r.major_id)) {
            r.major_id.map((majorId) => {
              result.push(majors.find((m) => m.id == majorId)?.name);
            });
          }
          return result.join(", ");
        },
      },
      {
        title: t("hr:duration") + ' ' + t("hr:date"),
        align: "center",
        render: (r) => <div>{r.during_time}</div>,
      },
      {
        title: t("hr:status"),
        render: (r) =>
          typeof statusTrainingPlan[r.status] !== "undefined" &&
          statusTrainingPlan[r.status],
      },
      // {
      //   title: "Last update",
      //   render: (r) => <CreateUpdateDate record={r}  /> ,
      // },
      {
        title: t("hr:last_update"),
        render: (r) => (
          <>
            {
              <small>
                {typeof r.created_at == "string" &&
                r.created_at != "-0001-11-30 00:00:00"
                  ? `Created: ${timeFormatStandard(r.created_at, dateFormat)}`
                  : r.created_at && r.created_at > 0
                  ? `Created: ${parseIntegertoTime(r.created_at, dateFormat)}`
                  : ""}
              </small>
            }
            {r.created_by > 0 && (
              <small>
                &nbsp;By {r.created_by_user ? r.created_by_user.staff_name : ""}{" "}
                #<strong>{r.created_by}</strong>
              </small>
            )}
            {
              <small>
                <br />
                {typeof r.updated_at == "string" &&
                r.updated_at != "-0001-11-30 00:00:00"
                  ? `Modified: ${timeFormatStandard(r.updated_at, dateFormat)}`
                  : r.updated_at && r.updated_at > 0
                  ? `Modified: ${parseIntegertoTime(r.updated_at, dateFormat)}`
                  : ""}
              </small>
            }
            {r.updated_by > 0 && (
              <small>
                &nbsp;By {r.updated_by_user ? r.updated_by_user.staff_name : ""}{" "}
                #<strong>{r.updated_by}</strong>
              </small>
            )}
            {
              <small>
                <br />
                {typeof r.verify_at == "string" &&
                r.verify_at != "-0001-11-30 00:00:00"
                  ? `Verify: ${timeFormatStandard(r.verify_at, dateFormat)}`
                  : r.verify_at && r.verify_at > 0
                  ? `Verify: ${parseIntegertoTime(r.verify_at, dateFormat)}`
                  : ""}
              </small>
            }
            {r.verify_by > 0 && (
              <small>
                &nbsp;By {r.verify_by_user ? r.verify_by_user.staff_name : ""} #
                <strong>{r.verify_by}</strong>
              </small>
            )}
            {
              <small>
                <br />
                {typeof r.approved_at == "string" &&
                r.approved_at != "-0001-11-30 00:00:00"
                  ? `Approved: ${timeFormatStandard(r.approved_at, dateFormat)}`
                  : r.approved_at && r.approved_at > 0
                  ? `Approved: ${parseIntegertoTime(r.approved_at, dateFormat)}`
                  : ""}
              </small>
            }
            {r.approved_by > 0 && (
              <small>
                &nbsp;By{" "}
                {r.approved_by_user ? r.approved_by_user.staff_name : ""} #
                <strong>{r.app_by}</strong>
              </small>
            )}
          </>
        ),
      },
      {
        title: t("hr:action"),
        width: "16%",
        align: "center",
        render: (r) => (
          <>
            <Link
              to={`/company/training-plan/${r.id}/edit`}
              key="edit-training-plan"
            >
              <TooltipButton
                title={t("hr:edit")}
                type="primary"
                size="small"
                icon={<FontAwesomeIcon icon={faPen} />}
              />
            </Link>
            <Link
              to={`/company/training-plan/${r.id}/preview`}
              key="preview-training-plan"
            >
              <Button
                title={t("hr:view")}
                type="primary"
                size="small"
                className=" ml-2"
                icon={<FontAwesomeIcon icon={faEye} />}
              />
            </Link>
            <Popconfirm
              title={t("hr:confirm_copy_selected_item")}
              placement="topLeft"
              icon={<QuestionCircleOutlined style={{ color: "red" }} />}
              onConfirm={(e) => this.onCopyTrainingPlan(e, r.id)}
            >
              <TooltipButton
                title={t("hr:copy")}
                // style={{ marginLeft: 4 }}
                className="ml-2"
                onClick={(e) => e.stopPropagation()}
                type="primary"
                size="small"
                icon={<FontAwesomeIcon icon={faCopy} />}
              />
            </Popconfirm>
            <Button
              className="ml-2"
              size="small"
              type="primary"
              icon={<LinkOutlined />}
              onClick={() =>
                this.props.history.push(
                  `/company/training-report?plan_id=${r.id}`
                )
              }
            />
            <Popconfirm
              title={"hr:confirm_change_inactive_selected_item"}
              placement="topLeft"
              icon={<QuestionCircleOutlined style={{ color: "red" }} />}
              onConfirm={(e) => this.getDeleteTrainingPlan(e, r.id)}
            >
              {
                <Button
                  danger
                  style={{ marginLeft: 8 }}
                  size="small"
                  icon={<FontAwesomeIcon icon={faTrashAlt} />}
                />
              }
            </Popconfirm>
          </>
        ),
      },
    ];
    const { limit, offset, total } = this.state;
    return (
      <div>
        <PageHeader
          title={t("hr:training_plan")}
          subTitle=""
          tags={[
            <div key="tags">
              <Link
                to={"/company/training-plan/create"}
                key="create-training-plan"
              >
                {
                  <Button
                    key="create-training-plan"
                    type="primary"
                    icon={<FontAwesomeIcon icon={faPlus} />}
                  >
                    &nbsp;{t("hr:add_new")}
                  </Button>
                }
              </Link>
            </div>,
          ]}
        />
        <Row className="card pl-3 pr-3 mb-3">
          <Tab tabs={tabListTraining(this.props)} />
          <Form
            className="pt-3"
            layout="vertical"
            ref={this.formRef}
            onFinish={this.submitForm.bind(this)}
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="name">
                  <Input placeholder={t("hr:title") + "," + t('hr:code')} />
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
                <FormItem name="major_id">
                  <Dropdown datas={majors} defaultOption={t("hr:all_major")} />
                </FormItem>
              </Col>

              {/* <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <FormItem name="type">
                  <Dropdown
                    datas={subTypeRangeUsers}
                    defaultOption="-- All Type --"
                  />
                </FormItem>
              </Col> */}
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <FormItem name="status">
                  <Dropdown
                    datas={statusTrainingPlan}
                    defaultOption={t("hr:all_status")}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={12} className="mb-2">
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Button type="primary" htmlType="submit">
                  {t("hr:search")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Row>
        <Table
          dataSource={this.state.trainingPlanList}
          loading={this.state.loading}
          columns={columns}
          pagination={{
            onChange: (page) => this.onChangePage(page),
            current: this.state.page,
            pageSize: this.state.limit,
            total: this.state.total,
            hideOnSinglePage: true,
            showSizeChanger: false,
          }}
          rowKey="key"
        />
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

export default connect(mapStateToProps)(withTranslation()(TrainingPlan));
