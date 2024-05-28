import { Table, Row, Col, Button, Modal, Form, Input } from "antd";
import React, { Component } from "react";
import { PageHeader } from "@ant-design/pro-layout";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { getListStaff } from "~/apis/company/TrainingPlan";
import { historyParams, exportToXLS } from "~/services/helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faFileExport, faLink } from "@fortawesome/free-solid-svg-icons";
import Tab from "~/components/Base/Tab";
import { screenResponsive } from "~/constants/basic";
import tabConfig from "src/scenes/Company/Staff/config/tab";
import { subTypeRangeUsers, statusTrainingPlanSkill } from "./config";
import Dropdown from "~/components/Base/Dropdown";
import {
  formatHeaderStaff,
  formatDataStaff,
} from "./config/exportTrainingStaff";
import dayjs from "dayjs";
import "./config/trainingPlanStaff.css";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import queryString from 'query-string';
import { find } from "lodash";
import StaffDropdown from "~/components/Base/StaffDropdown";

const FormItem = Form.Item;
class TrainingPlanStaff extends Component {
  /**
   *
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    let params = historyParams();
    this.state = {
      detailPlanStaffs: [],
      loading: false,
      visible: false,
      detail: {},
      limit: 30,
      total: 0,
      page: 1,
      selectedRowKeys: [],
      datas: [],
    };
  }

  /**
   * @lifecycle
   */
  componentDidMount() {
    let history = historyParams();
    let params = {};
    if (typeof history.plan_id != "undefined") {
      params.plan_id = history.plan_id;
    }
    this.getListTrainingPlanStaff(params);
  }

  /**
   *
   * get list training plan by staff
   */
  async getListTrainingPlanStaff(params) {
    let { id } = this.props.match.params;
    params = { ...params, staff_id: id };
    let response = await getListStaff(params);
    if (response.status) {
      let { data } = response;
      this.setState({
        detailPlanStaffs: data.rows,
      });
    }
  }

  /**
   *
   * submit form training plan staff
   */
  submitFormTrainingPlanStaff() {
    let values = this.formRef.current.getFieldsValue();
    this.getListTrainingPlanStaff(values);
  }

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
    this.setState({ page }, () => this.getListTrainingPlanStaff(values));
  };

  /**
   *
   * export training plan staff
   */
  async exportTrainingPlanStaff() {
    this.setState({ loading: true });
    let { id } = this.props.match.params;
    let values = this.formRef.current.getFieldsValue();
    let params = {
      ...values,
      staff_id: id,
    };
    let response = await getListStaff(params);
    if (response.status) {
      let header = formatHeaderStaff();
      let data = formatDataStaff(response.data.rows);
      let fileName = `Training-Plan-Staff ${dayjs().format("YYYY-MM-DD")}`;
      let dataFormat = [...header, ...data];
      exportToXLS(fileName, dataFormat, [
        null,
        { width: 20 },
        { width: 20 },
        { width: 25 },
        { width: 30 },
        { width: 10 },
        { width: 30 },
        { width: 35 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 10 },
        { width: 25 },
        { width: 10 },
        { width: 10 },
        { width: 20 },
        { width: 20 },
        { width: 15 },
        { width: 10 },
        { width: 20 },
        { width: 25 },
      ]);
    }
    this.setState({ loading: false });
  }

  render() {
    let { t, match } = this.props;
    let { id } = match.params;
    let { detailPlanStaffs, detail } = this.state;
    const {
      baseData: {  majors,  departments, locations},
      auth: { staff_info },
    } = this.props;
    const { selectedRowKeys, setSelectedRowKeys, loading } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const constTablist = tabConfig(id,this.props);
    const columns = [
      {
        title: "No.",
        align: "center",
        render: (r) => this.state.detailPlanStaffs.indexOf(r) + 1,
      },
      {
        title: t("hr:title"),
        render: (r) => {
          if(r.training_plan_detail_skill?.training_plan_detail?.training_plan) {
            return r.training_plan_detail_skill?.training_plan_detail?.training_plan?.name
          } else {
            let logs = r.logs ? JSON.parse(r.logs) : [];
            if(typeof logs['training_plan'] != 'undefined') {
              return logs['training_plan']['name']
            }
          }
        }
      },
      {
        title: t("Round Title"),
        render: (r) => {
          if(r.training_plan_detail_skill?.training_plan_detail) {
            return r.training_plan_detail_skill?.training_plan_detail.name
          } else {
            let logs = r.logs ? JSON.parse(r.logs) : [];
            if(typeof logs['training_plan_detail'] != 'undefined') {
              return logs['training_plan_detail']['name']
            }
          }
        }
      },
      {
        title: t("hr:skill_name"),
        render: (r) => <div>{r.training_plan_detail_skill?.skill?.name}</div>,
      },
      {
        title: t("hr:level"),
        render: (r) => <div>{r.level}</div>,
      },
      {
        title: t("hr:status"),
        render: (r) =>
          typeof statusTrainingPlanSkill[r.status] !== "undefined" &&
          statusTrainingPlanSkill[r.status],
      },
      {
        title: t("hr:start_date"),
        align: "center",
        render: (r) => <div>{r.start_date}</div>,
      },
      {
        title: t("hr:deadline"),
        align: "center",
        render: (r) => <div>{r.end_date}</div>,
      },
      {
        title: t("hr:request_type"),
        render: (r) =>
          subTypeRangeUsers[r.training_plan_detail_skill?.sub_type],
      },
      {
        title: t("hr:confirm"),
        render: (r) => <div>{r.confirm_at}</div>,
      },
      {
        title: t("hr:Viewed"),
        render: (r) => <div>{r.view_at}</div>,
      },
      {
        title: t("hr:examined"),
        render: (r) => {
          if (r.staff_skill != null) {
            let params = {
              staff_id: r.staff_id,
              skill_id: r.training_plan_detail_skill?.skill.id,
              result: null,
              status: null,
            };
            return (
              <Link
                to={
                  `/company/training-examination/result?` +
                  queryString.stringify(params)
                }
                target="_blank"
              >
                <FontAwesomeIcon icon={faLink} style={{ color: "#3da8ee" }} />
              </Link>
            );
          }
        },
      },
      {
        title: t("hr:updated_by"),
        render: (r) => <div>{r.staff_skill?.updated_by_user.name}</div>,
      },
      {
        title: t("hr:PIC"),
        width: "15%",
        render: (r) => {
          let result = [];
          if (r.staff_pic) {
            r.staff_pic.map((s) => {
              const major = majors.find((m) => m.id == s.major_id)?.name || "";
              result.push(<div>{s.staff_name + "-" + major   }</div>);
            }); 
          }
          return result;
        },
      },
      {
        title: t("hr:action"),
        align: "center",
        render: (r) => {
          return (
            <Button
              type="primary"
              size="small"
              icon={<FontAwesomeIcon icon={faEye} />}
              onClick={() => this.setState({ visible: true, detail: r })}
            />
          );
        },
      },
    ];
    return (
      <div>
        <PageHeader title={t("hr:training_plan")} />
        <Row className="card p-3 pt-0 mb-3">
          <Tab tabs={constTablist} />
          <Form
            className="pt-3"
            layout="vertical"
            ref={this.formRef}
            onFinish={() => this.submitFormTrainingPlanStaff()}
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="keyword">
                  <Input placeholder={"Title training plan"} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <FormItem name="sub_type">
                  <Dropdown
                    datas={subTypeRangeUsers}
                    defaultOption="-- All Type --"
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="staff_pic">
                  <StaffDropdown defaultOption="--- All Staff Pic ---" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Button type="primary" htmlType="submit">
                  {t("hr:search")}
                </Button>
                <Button
                  type="primary"
                  className="ml-2"
                  icon={<FontAwesomeIcon icon={faFileExport} />}
                  onClick={() => this.exportTrainingPlanStaff()}
                >
                  &nbsp;{t("hr:export")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <div className="block_scroll_data_table">
              <div className="main_scroll_table">
                <Table
                  dataSource={this.state.detailPlanStaffs}
                  columns={columns}
                  loading={this.state.loading}
                  rowKey="key"
                  pagination={{
                    onChange: (page) => this.onChangePage(page),
                    current: this.state.page,
                    pageSize: this.state.limit,
                    total: this.state.total,
                    hideOnSinglePage: true,
                    showSizeChanger: false,
                  }}
                  rowClassName={(r) => {
                    return dayjs(r.end_date).unix() < dayjs().unix() &&
                      r.level == 0
                      ? "bg-warning-request-skill"
                      : "";
                  }}
                />
              </div>
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Modal
              open={this.state.visible}
              onCancel={() => this.setState({ visible: false })}
              width={"40%"}
              title="Training Plan Staff"
              okButtonProps={{
                style: {
                  display: "none",
                },
              }}
            >
              {detail ? (
                <>
                  <Row gutter={24}>
                    <Col span={6}>Title:</Col>
                    <Col span={18}>
                      {
                        detail.training_plan_detail_skill?.training_plan_detail
                          ?.training_plan.name
                      }
                    </Col>
                    <Col span={6}>Round Title:</Col>
                    <Col span={18}>
                      {
                        detail.training_plan_detail_skill?.training_plan_detail
                          .name
                      }
                    </Col>
                    <Col span={6}>Skill Name:</Col>
                    <Col span={18}>
                      {detail.training_plan_detail_skill?.skill?.name}
                    </Col>
                    <Col span={6}>Level:</Col>
                    <Col span={18}> {detail.level}</Col>
                    {/* <Col span={6}>Status: </Col>
                    <Col span={18}>{statusTrainingPlan[detail.training_plan_detail_skill?.training_plan_detail?.training_plan.status]}</Col> */}
                    <Col span={6}>Start day: </Col>
                    <Col span={18}>{detail.start_date}</Col>
                    <Col span={6}>Deadline:</Col>
                    <Col span={18}> {detail.end_date}</Col>
                    <Col span={6}>Confirm:</Col>
                    <Col span={18}>{detail.confirm_at}</Col>
                  </Row>
                </>
              ) : null}
            </Modal>
          </Col>
        </Row>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  baseData: state.baseData,
  auth: state.auth.info,
});
const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(TrainingPlanStaff));
