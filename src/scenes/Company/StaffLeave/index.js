import React, { Component } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Button, Form, Row, Col, DatePicker, Table, Tag } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import { Link } from "react-router-dom";
import {
  faPlus,
  faPen,
  faTrashAlt,
  faCheck,
  faFileExport,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Dropdown from "~/components/Base/Dropdown";
import StaffDropdown from "~/components/Base/StaffDropdown";
import {
  approvedStatus,
  mainTypeStaffLeaves,
  leaveTypes,
  leaveTypeCustoms,
  dateTimeFormat,
  dateFormat,
  leaveReasons,
} from "~/constants/basic";
import {
  getList as apiGetListStaffLeave,
  approve as apiApprove,
  reject as apiReject,
} from "~/apis/company/staffLeave";
import {
  parseIntegertoTime,
  timeFormatStandard,
  showNotify,
  historyReplace,
  historyParams,
  checkManager,
  checkPermission,
} from "~/services/helper";
import dayjs from "dayjs";
import { getList as apiGetListStaffSchedule } from "~/apis/company/staffSchedule";
import { getShifts } from "~/apis/company/timesheet";
import {
  formatHeaderHistory,
  stylesHistory,
  formatData,
} from "./exportStaffLeave";
import ExcelService from "~/services/ExcelService";
import { screenResponsive } from "~/constants/basic";

const FormatDate = "YYYY-MM-DD";
const { RangePicker } = DatePicker;
class StaffLeave extends Component {
  /**
   *
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.formRef = React.createRef();

    let params = historyParams();
    let page = 1;
    let limit = params.limit ? params.limit : 35;
    if (params.offset) {
      page = params.offset / limit + 1;
    }
    this.state = {
      leaveRowKeysSelected: [],
      staffLeaveRowKeysSelected: [],
      leaves: [],
      loading: false,
      limit,
      schedules: [],
      total: 0,
      page,
      shifts: [],
    };
  }

  /**
   * @lifecycle
   */
  componentDidMount() {
    this.getArrayShifts();

    /** Set fieldsValue */
    let params = historyParams();
    let { staffInfo } = this.props;
    params = {
      ...params,
      department_id: params.department_id
        ? params.department_id
        : staffInfo.staff_dept_id,
      location_id: params.location_id
        ? params.location_id
        : staffInfo.staff_loc_id,
    };
    if (params.from_date && params.to_date) {
      params.date = [
        dayjs(params.from_date, dateFormat),
        dayjs(params.to_date, dateFormat),
      ];
    }
    this.formRef.current.setFieldsValue(params);
    let values = this.formRef.current.getFieldsValue();

    this.getListStaffLeave(values);
  }

  /**
   * get array shift
   */
  getArrayShifts = async () => {
    let response = await getShifts();
    if (response.status) {
      this.setState({ shifts: response.data });
    }
  };

  /**
   * Get List staff leave
   * @param {*} params
   */
  async getListStaffLeave(params = {}) {
    this.setState({ loading: true });

    let values = {
      ...params,
      limit: this.state.limit,
      offset: (this.state.page - 1) * this.state.limit,
    };
    if (values.date) {
      values.from_date =
        typeof values.date !== undefined && values.date
          ? timeFormatStandard(values.date[0], FormatDate)
          : undefined;
      values.to_date =
        typeof values.date !== undefined && values.date
          ? timeFormatStandard(values.date[1], FormatDate)
          : undefined;
      delete values.date;
    }
    historyReplace(values);

    let response = await apiGetListStaffLeave({
      ...values,
      sort: "leave_id",
      is_manager: true,
      total: 1,
    });

    if (response.status) {
      let { data } = response;

      let fromDate = dayjs().format(dateTimeFormat);
      let toDate = dayjs().format(dateTimeFormat);
      let staffIds = [];
      if (data.rows && Array.isArray(data.rows)) {
        data.rows.map((r) => {
          if (r.leave_approved == 0) {
            if (dayjs(r.leave_from) < dayjs(fromDate)) {
              fromDate = r.leave_from;
            }

            if (dayjs(r.leave_from) > dayjs(toDate)) {
              toDate = r.leave_from;
            }
            if (staffIds.indexOf(r.staff_id) == -1) {
              staffIds.push(r.staff_id);
            }
          }
        });
      }

      let scheduleParams = {
        staff_id: staffIds.join(","),
        from_date: dayjs(fromDate)
          .startOf("day")
          .unix(),
        to_date: dayjs(toDate)
          .endOf("day")
          .unix(),
      };
      let responseSchedules = await apiGetListStaffSchedule(scheduleParams);
      if (responseSchedules.status) {
        let { data } = responseSchedules;
        if (data.rows.length > 0) {
          this.setState({ schedules: data.rows });
        }
      }

      this.setState({ leaves: data.rows, total: data.total, loading: false });
    } else {
      showNotify("Notify", response.message, "error");
      this.setState({ leaves: [], total: 0, loading: false });
    }
  }

  /**
   * @event change page
   *
   * @param {*} page
   */
  onChangePage(page) {
    let values = this.formRef.current.getFieldsValue();
    this.setState({ page }, () => this.getListStaffLeave({ ...values }));
  }

  /**
   * @event submit form
   * @param {Object} values
   */
  submitForm = (values) => {
    this.setState({ page: 1 }, () => this.getListStaffLeave(values));
  };

  /**
   * @event delete staff skill
   * @param {*} id
   */
  onMassApproveStaffLeave() {
    let { t } = this.props;
    if (!this.state.staffLeaveRowKeysSelected.length) {
      showNotify(t("Notification"), t("Please select leave"), "error");
      return;
    }
    this.setState({ loading: true });
    let { shifts } = this.state;
    const promises = [];
    this.state.staffLeaveRowKeysSelected.map((staffLeave, index) => {
      let data = {
        leave_staff_id: staffLeave.leave_staff_id,
        leave_type: staffLeave.leave_type,
        leave_shift: staffLeave.leave_shift,
        leave_note: staffLeave.leave_note,
        leave_reason: staffLeave.leave_reason,
        leave_is_valid: 1,
        leave_from: staffLeave.leave_from
          ? timeFormatStandard(staffLeave.leave_from)
          : null,
        leave_to: staffLeave.leave_to
          ? timeFormatStandard(staffLeave.leave_to)
          : staffLeave.leave_from
          ? timeFormatStandard(staffLeave.leave_from)
          : null,
      };

      if (staffLeave.leave_type == "SC") {
        if (staffLeave.leave_shift) {
          if (shifts[staffLeave.leave_shift]) {
            let workingTime = shifts[staffLeave.leave_shift].split("-");
            data.leave_from = staffLeave.leave_from
              ? timeFormatStandard(staffLeave.leave_from, FormatDate) +
                " " +
                workingTime[0]
              : null;
            data.leave_to = staffLeave.leave_to
              ? timeFormatStandard(staffLeave.leave_to, FormatDate) +
                " " +
                workingTime[1]
              : null;
          }
        }
      }
      promises.push(apiApprove(staffLeave.leave_id, data));
    });
    Promise.all(promises).then((response) => {
      let values = this.formRef.current.getFieldsValue();
      this.getListStaffLeave(values);
      this.setState({ leaveRowKeysSelected: [] });
      showNotify(t("Notification"), t("Datas has been approved"));
    });

    this.setState({ loading: false });
  }
  /**
   * @event delete mass staff skill
   * @param {*} id
   */
  async onMassRejectStaffLeave() {
    let { t } = this.props;
    if (!this.state.staffLeaveRowKeysSelected.length) {
      showNotify(t("Notification"), t("Please select leave"), "error");
      return;
    }
    this.setState({ loading: true });
    const promises = [];
    this.state.staffLeaveRowKeysSelected.map(async (staffLeave, index) => {
      let data = {
        leave_staff_id: staffLeave.leave_staff_id,
        leave_type: staffLeave.leave_type,
        leave_note: staffLeave.leave_note,
        leave_reason: staffLeave.leave_reason,
        leave_is_valid: 1,
        leave_from: staffLeave.leave_from
          ? timeFormatStandard(staffLeave.leave_from)
          : null,
        leave_to: staffLeave.leave_to
          ? timeFormatStandard(staffLeave.leave_to)
          : staffLeave.leave_from
          ? timeFormatStandard(staffLeave.leave_from)
          : null,
      };
      promises.push(apiReject(staffLeave.leave_id, data));
    });
    Promise.all(promises).then((response) => {
      let values = this.formRef.current.getFieldsValue();
      this.getListStaffLeave(values);
      this.setState({ leaveRowKeysSelected: [] });
      showNotify(t("Notification"), t("Datas has been Reject"));
    });
    this.setState({ loading: false });
  }

  /**
   * Check condition approved
   * @param {*} record
   */
  checkConditionApproved = (record) => {
    const { schedules } = this.state;
    const index = schedules.findIndex(
      (s) =>
        record.staff_id == s.staffsche_staff_id &&
        dayjs(record.leave_from).format(dateFormat) ==
          parseIntegertoTime(s.staffsche_time_in, dateFormat)
    );
    return index > -1 ? false : true;
  };

  /**
   * Export staff leave
   */
  exportStaffLeave = () => {
    let staffList = [];

    let params = this.formRef.current.getFieldsValue();
    // params.limit = -1;
    // params.offset = 0;

    params = {
      ...params,
      limit: -1,
      offset: 0,
      sort: "leave_id",
      is_manager: true,
      total: 1,
    };

    let xhr = apiGetListStaffLeave(params);
    xhr.then((response) => {
      this.setState({ loading: false });

      if (response.status) {
        staffList = response.data.rows;
        let header = formatHeaderHistory();
        let data = formatData(staffList);

        let fileName = `Staff-history-${dayjs().format("YYYY-MM-DD")}`;

        let datas = [...header.headers, ...data];

        let excelService = new ExcelService(["Main Sheet"]);
        excelService
          .addWorksheetDatas(datas)
          .addWorksheetStyles(stylesHistory)
          .mergeCells(header.merges)
          .forceDownload(fileName);
      }
    });
  };

  render() {
    let {
      t,
      baseData: { locations, departments, majors, positions },
      auth: { staff_info },
    } = this.props;
    let { leaves, schedules } = this.state;
    const types = { ...leaveTypeCustoms, ...leaveTypes };
    const columns = [
      {
        title: "No.",
        render: (r) => this.state.leaves.indexOf(r) + 1,
      },
      {
        title: t("hr:name"),
        render: (r) => (
          <div>
            <Link
              to={`/company/staff-leave/${
                r.leave_main_type === 2 ? "create-custom/" : ""
              }${r.leave_id}/edit`}
            >
              {r.staff_name}
            </Link>{" "}
            <small>#{r.code}</small> <br />
            <small>
              {departments.map((d) => r.staff_dept_id == d.id && d.name)}{" "}
            </small>{" "}
            /
            <small>
              {locations.map((l) => r.staff_loc_id == l.id && l.name)}
            </small>
          </div>
        ),
      },
      {
        title: t("hr:shift"),
        render: (r) => {
          let result = "";
          if (r.leave_main_type == 1) {
            switch (r.leave_shift) {
              case "AM":
                result = "Morning";
                break;
              case "PM":
                result = "Afternoon";
                break;
              default:
                result = "All Day";
                break;
            }
          } else result = r.leave_shift;
          return result;
        },
      },
      {
        title: t("hr:date"),
        render: (r) =>
          r.leave_from != "-0001-11-30 00:00:00" &&
          timeFormatStandard(r.leave_from, dateFormat),
      },
      {
        title: t("hr:type"),
        render: (r) => {
          let result = [];
          Object.keys(types).map((i) => {
            if (i == r.leave_type) {
              if (r.leave_type == "CO") {
                result.push(
                  <span>
                    {types[i]} <br />
                    {dayjs(r.leave_from).format("HH:mm:ss") != "00:00:00" ? (
                      <small>
                        {dayjs(r.leave_from).format("HH:mm:ss")}-{" "}
                        {dayjs(r.leave_to).format("HH:mm:ss")}
                        &nbsp;{dayjs(r.leave_to).format("YYYY-MM-DD")}
                      </small>
                    ) : (
                      []
                    )}
                  </span>
                );
              } else {
                result.push(types[i]);
              }
            }
          });
          return result;
        },
      },
      {
        title: t("hr:approved"),
        render: (r) => {
          let color = "";
          let text = "";
          switch (r.leave_approved) {
            case 1:
              color = "green";
              break;
            case 2:
              color = "red";
              break;
            default:
              color = "default";
              break;
          }
          text = approvedStatus[r.leave_approved];

          if (r.leave_approved == 0) {
            const index = schedules.findIndex(
              (s) =>
                r.staff_id == s.staffsche_staff_id &&
                dayjs(r.leave_from).format(dateFormat) ==
                  parseIntegertoTime(s.staffsche_time_in, dateFormat)
            );
            if (index == -1) {
              color = "orange";
              text = t("No Schedule");
            }
          }
          return <Tag color={color}>{text}</Tag>;
        },
      },
      {
        title: t("hr:created_at"),
        render: (r) =>
          r.leave_created_at != "-0001-11-30 00:00:00"
            ? dayjs(r.leave_created_at).format("YYYY-MM-DD HH:mm")
            : "",
      },
      {
        title: t("hr:approved_by"),
        render: (r) => (
          <div>
            <small>
              {r.leave_approved_at
                ? dayjs(r.leave_approved_at).format("YYYY-MM-DD HH:mm")
                : ""}
            </small>
            <div>
              {r.leave_approved_by_user && r.leave_approved_by_user.name}
            </div>
          </div>
        ),
      },
      {
        title: t("hr:note"),
        render: (r) => <div style={{ maxWidth: "120px" }}>{r.leave_note}</div>,
      },
      {
        title: t("hr:action"),
        align: "center",
        render: (r) => {
          return checkPermission("hr-staff-leave-update") ? (
            <Link
              to={`/company/staff-leave/${
                r.leave_main_type === 2 ? "create-custom/" : ""
              }${r.leave_id}/edit`}
            >
              <Button
                type="primary"
                size="small"
                icon={<FontAwesomeIcon icon={faPen} />}
              ></Button>
            </Link>
          ) : (
            ""
          );
        },
      },
    ];
    return (
      <div id="page_staff_leave">
        {window.innerWidth < screenResponsive ? (
          <>
            <div className="title_page_mobile">{t("hr:staff_schedule")}</div>
            <div className="block_btn_action_header">
              {checkPermission("hr-staff-leave-create") ? (
                <Link to={`/company/staff-leave/create`} key="create-new-leave">
                  <Button
                    key="create-new-leave"
                    type="primary"
                    icon={<FontAwesomeIcon icon={faPlus} />}
                  >
                    &nbsp;{t("hr:add_new_leave")}
                  </Button>
                </Link>
              ) : (
                ""
              )}
              {checkPermission("hr-staff-leave-create") ? (
                <Link
                  to={`/company/staff-leave/create-custom`}
                  key="create-new-other-type"
                  className="ml-3"
                >
                  <Button
                    key="create-new-other-type"
                    type="primary"
                    icon={<FontAwesomeIcon icon={faPlus} />}
                  >
                    &nbsp;{t("hr:add_new_orther_type")}
                  </Button>
                </Link>
              ) : (
                ""
              )}
            </div>
          </>
        ) : (
          <PageHeader
            title={t("hr:staff_leave_application")}
            tags={
              // checkManager(staff_info.position_id) ?
              <>
                {checkPermission("hr-staff-leave-create") ? (
                  <Link
                    to={`/company/staff-leave/create`}
                    key="create-new-leave"
                  >
                    <Button
                      key="create-new-leave"
                      type="primary"
                      icon={<FontAwesomeIcon icon={faPlus} />}
                    >
                      &nbsp;{t("hr:add_new_leave")}
                    </Button>
                  </Link>
                ) : (
                  ""
                )}
                {checkPermission("hr-staff-leave-create") ? (
                  <Link
                    to={`/company/staff-leave/create-custom`}
                    key="create-new-other-type"
                    className="ml-3"
                  >
                    <Button
                      key="create-new-other-type"
                      type="primary"
                      icon={<FontAwesomeIcon icon={faPlus} />}
                    >
                      &nbsp;{t("hr:add_new_orther_type")}
                    </Button>
                  </Link>
                ) : (
                  ""
                )}
              </>
              // : []
            }
          />
        )}

        <Row className="card pl-3 pr-3 mb-3">
          <Form
            className="pt-3 form_staff_leave"
            ref={this.formRef}
            name="searchForm"
            onFinish={this.submitForm.bind(this)}
            layout="vertical"
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={7} xl={7}>
                <Form.Item name="staff_id">
                  <StaffDropdown defaultOption={t("hr:all_staff")} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={10} xl={10}>
                <Form.Item name="date">
                  <RangePicker style={{ width: "100%" }} format={FormatDate} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={7} xl={7}>
                <Form.Item name="location_id">
                  <Dropdown
                    datas={locations}
                    defaultOption={t("hr:all_location")}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={7} xl={7}>
                <Form.Item name="department_id">
                  <Dropdown
                    datas={departments}
                    defaultOption={t("hr:all_department")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={5} xl={5}>
                <Form.Item name="position_id">
                  <Dropdown
                    datas={positions}
                    defaultOption={t("hr:all_position")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={5} xl={5}>
                <Form.Item name="major_id">
                  <Dropdown datas={majors} defaultOption={t("hr:all_major")} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={7} xl={7}>
                <Form.Item name="is_approve">
                  <Dropdown
                    datas={approvedStatus}
                    defaultOption={t("hr:all_status")}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={7} xl={7}>
                <Form.Item name="main_type">
                  <Dropdown
                    datas={mainTypeStaffLeaves}
                    defaultOption={t("all_main_type")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={5} xl={5}>
                <Form.Item name="leave_type">
                  <Dropdown datas={types} defaultOption={t("hr:all_type")} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={5} xl={5}>
                <Form.Item name="leave_reason">
                  <Dropdown
                    datas={leaveReasons}
                    defaultOption={t("hr:reason")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={7} xl={7}>
                <Button type="primary" htmlType="submit">
                  {t("hr:search")}
                </Button>
                {checkPermission("hr-staff-leave-export") ? (
                  <Button
                    key="export-staff-leave"
                    type="primary"
                    className="ml-2 btn_form"
                    onClick={() => this.exportStaffLeave()}
                  >
                    <FontAwesomeIcon icon={faFileExport} />
                    &nbsp;{t("hr:export")}
                  </Button>
                ) : (
                  ""
                )}
              </Col>
            </Row>
          </Form>
        </Row>
        <Row>
          <Col span={24}>
            {window.innerWidth < screenResponsive ? (
              <div className="block_scroll_data_table">
                <div className="main_scroll_table table_1500">
                  <Table
                    rowSelection={{
                      // hideSelectAll: true,
                      selectedRowKeys: this.state.leaveRowKeysSelected,
                      onChange: (selectedRowKeys, selectedRows) => {
                        let staffLeaveRowKeysSelected = [];
                        if (selectedRows.length) {
                          selectedRows.map((leave) => {
                            staffLeaveRowKeysSelected.push(leave);
                          });
                        }
                        this.setState({
                          leaveRowKeysSelected: selectedRowKeys,
                          staffLeaveRowKeysSelected,
                        });
                      },
                      columnWidth: "50px",
                      getCheckboxProps: (record) => ({
                        disabled:
                          record.leave_approved != 0 ||
                          this.checkConditionApproved(record),
                        // Column configuration not to be checked
                        name: record.leave_approved,
                      }),
                    }}
                    dataSource={leaves}
                    columns={columns}
                    loading={this.state.loading}
                    showSorterTooltip={true}
                    pagination={{
                      total: this.state.total,
                      pageSize: this.state.limit,
                      hideOnSinglePage: true,
                      showSizeChanger: false,
                      current: this.state.page,
                      onChange: (page) => this.onChangePage(page),
                    }}
                    rowKey={(leave) => leave.leave_id}
                    footer={() => (
                      <>
                        {checkPermission("hr-staff-leave-approve") ? (
                          <Button
                            type="primary"
                            onClick={() => this.onMassApproveStaffLeave()}
                            className="mr-2"
                            icon={<FontAwesomeIcon icon={faCheck} />}
                          >
                            &nbsp;{t("hr:approve_selected_leave")}
                          </Button>
                        ) : (
                          ""
                        )}
                        {checkPermission("hr-staff-leave-approve") ? (
                          <Button
                            type="danger"
                            onClick={() => this.onMassRejectStaffLeave()}
                            icon={<FontAwesomeIcon icon={faTrashAlt} />}
                          >
                            &nbsp;{t("hr:reject_selected_leave")}
                          </Button>
                        ) : (
                          ""
                        )}
                      </>
                    )}
                  />
                </div>
              </div>
            ) : (
              <Table
                rowSelection={{
                  // hideSelectAll: true,
                  selectedRowKeys: this.state.leaveRowKeysSelected,
                  onChange: (selectedRowKeys, selectedRows) => {
                    let staffLeaveRowKeysSelected = [];
                    if (selectedRows.length) {
                      selectedRows.map((leave) => {
                        staffLeaveRowKeysSelected.push(leave);
                      });
                    }
                    this.setState({
                      leaveRowKeysSelected: selectedRowKeys,
                      staffLeaveRowKeysSelected,
                    });
                  },
                  columnWidth: "50px",
                  getCheckboxProps: (record) => ({
                    disabled:
                      record.leave_approved != 0 ||
                      this.checkConditionApproved(record),
                    // Column configuration not to be checked
                    name: record.leave_approved,
                  }),
                }}
                dataSource={leaves}
                columns={columns}
                loading={this.state.loading}
                showSorterTooltip={true}
                pagination={{
                  total: this.state.total,
                  pageSize: this.state.limit,
                  hideOnSinglePage: true,
                  showSizeChanger: false,
                  current: this.state.page,
                  onChange: (page) => this.onChangePage(page),
                }}
                rowKey={(leave) => leave.leave_id}
                footer={() => (
                  <>
                    {checkPermission("hr-staff-leave-approve") ? (
                      <Button
                        type="primary"
                        onClick={() => this.onMassApproveStaffLeave()}
                        className="mr-2"
                        icon={<FontAwesomeIcon icon={faCheck} />}
                      >
                        &nbsp;{t("hr:approve_selected_leave")}
                      </Button>
                    ) : (
                      ""
                    )}
                    {checkPermission("hr-staff-leave-approve") ? (
                      <Button
                        type="danger"
                        onClick={() => this.onMassRejectStaffLeave()}
                        icon={<FontAwesomeIcon icon={faTrashAlt} />}
                      >
                        &nbsp;{t("hr:reject_selected_leave")}
                      </Button>
                    ) : (
                      ""
                    )}
                  </>
                )}
              />
            )}
          </Col>
        </Row>
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
const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(StaffLeave));
