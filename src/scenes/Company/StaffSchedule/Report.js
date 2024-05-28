import React, { Component } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Row, Col, Form, Input, Button, Divider, DatePicker } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "~/components/Base/Dropdown";
import dayjs from "dayjs";
import StaffDropdown from "~/components/Base/StaffDropdown";
import "./config/detail.css";
import Tab from "~/components/Base/Tab";
import tabList from "./config/tabList";
import { dateFormat, timeFormat } from "~/constants/basic";
import { getList as apiGetList } from "~/apis/company/staffSchedule";
import { getListStaffleave as apiGetListStaffleave } from "~/apis/company/staffLeave";
import tab from "../Skill/config/tab";
import { getSummary as apiGetSummary } from "~/apis/company/timesheet";
import { timeFormatStandard } from "~/services/helper";

const { RangePicker } = DatePicker;
class Report extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      arrInfo: {},
      timesheets: {},
      staffLeave: {},
    };
  }

  /**
   * @lifecycle
   */
  componentDidMount() {
    this.formRef.current.setFieldsValue({
      date: dayjs(dayjs(), dateFormat),
    });
    let values = this.formRef.current.getFieldsValue();
    this.getListStaffSchedule(values);
    this.getSummaryTimesheet(values);
    this.getListStaffleave(values);
  }


  async getListStaffleave(params){
    params = {
     ...params,
      is_manager: true,
      group_by_staff_loc_id: true,
    };
    delete params.date;
    let response = await apiGetListStaffleave(params);
    
      if (response.status) {
        let result = [];
       // let { data } = response;
        let staffLeave = response.data.rows;
        if (typeof staffLeave == "object") {
          Object.keys(staffLeave).map((location_id) => {
            if (staffLeave[location_id]) {
              Object.keys(staffLeave[location_id]).map((item) => {
                if (typeof result[location_id] == "undefined")
                  result[location_id] = {};
  
                
                  result[location_id]["A"] =
                    typeof result[location_id]["A"] != "undefined"
                      ? result[location_id]["A"] + 1
                      : 1;
                });
            }
          });
        }
        
        this.setState({ staffLeave: result });
      }
    
    //console.log(response.data)
  }


  async getListStaffSchedule(params) {
    params = {
      ...params,
      is_manager: true,
      group_by_location_id: true,
      major_id: params.major_id,
    };

    if (params.date) {
      params.from_date = dayjs(params.date)
        .startOf("day")
        .unix();
      params.to_date = dayjs(params.date)
        .endOf("day")
        .unix();
      delete params.date;
    }
    let response = await apiGetList(params);
    if (response.status) {
      let result = [];
      let staffSchedule = response.data.rows;
      console.log(staffSchedule);
      if (typeof staffSchedule == "object") {
        Object.keys(staffSchedule).map((location_id) => {
          if (staffSchedule[location_id]) {
            Object.keys(staffSchedule[location_id]).map((item) => {
              if (typeof result[location_id] == "undefined")
                result[location_id] = {};

              let shift = staffSchedule[location_id][item].staffsche_shift;
              let totalShift = staffSchedule[location_id][item].total_shift;
              if (shift.indexOf("HC") === 0)
                result[location_id]["HC"] =
                  typeof result[location_id]["HC"] != "undefined"
                    ? result[location_id]["HC"] + totalShift
                    : totalShift;
              else if (shift.indexOf("AM") === 0)
                result[location_id]["AM"] =
                  typeof result[location_id]["AM"] != "undefined"
                    ? result[location_id]["AM"] + totalShift
                    : totalShift;
              else if (shift.indexOf("PM") === 0)
                result[location_id]["PM"] =
                  typeof result[location_id]["PM"] != "undefined"
                    ? result[location_id]["PM"] + totalShift
                    : totalShift;
              else if (shift.indexOf("W") === 0)
                result[location_id]["W"] =
                  typeof result[location_id]["W"] != "undefined"
                    ? result[location_id]["W"] + totalShift
                    : totalShift;
              else if (shift.indexOf("H") === 0)
                result[location_id]["H"] =
                  typeof result[location_id]["H"] != "undefined"
                    ? result[location_id]["H"] + totalShift
                    : totalShift;
              else if (shift.indexOf("S") === 0)
                result[location_id]["S"] =
                  typeof result[location_id]["S"] != "undefined"
                    ? result[location_id]["S"] + totalShift
                    : totalShift;
              else if (shift.indexOf("A") === 0)
                result[location_id]["A"] =
                  typeof result[location_id]["A"] != "undefined"
                    ? result[location_id]["A"] + totalShift
                    : totalShift;
              else if (shift.indexOf("C") === 0)
                result[location_id]["C"] =
                  typeof result[location_id]["C"] != "undefined"
                    ? result[location_id]["C"] + totalShift
                    : totalShift;
            });
          }
        });
      }

      this.setState({ arrInfo: result });
    }
  }

  /**
   * render body table
   */
  renderBodyTable() {
    let { locations } = this.props.baseData;
    let { arrInfo, timesheets, staffLeave } = this.state;

    let result = [];
    if (Object.keys(arrInfo).length) {
      Object.keys(arrInfo).map((key) => {
        result.push(
          <tr key={key}>
            <td className="">{locations.map((l) => l.id == key && l.name)}</td>
            <td className="text-center">
              {typeof staffLeave[key] != "undefined"
                ? typeof staffLeave[key].A != "undefined"
                  ? staffLeave[key].A
                  : 0
                : 0}
            </td>
            <td className="text-center">
              {typeof arrInfo[key].W != "undefined" ? arrInfo[key].W : 0}
            </td>
            <td className="text-center">
              {typeof arrInfo[key].HC != "undefined" ? arrInfo[key].HC : 0}
            </td>
            <td className="text-center">
              {typeof arrInfo[key].AM != "undefined" ? arrInfo[key].AM : 0}
            </td>
            <td className="text-center">
              {typeof arrInfo[key].PM != "undefined" ? arrInfo[key].PM : 0}
            </td>
            <td className="text-center">
              {typeof timesheets[key] != "undefined"
                ? typeof timesheets[key].total != "undefined"
                  ? timesheets[key].total
                  : 0
                : 0}
            </td>
            <td className="text-center">
              {typeof timesheets[key] != "undefined"
                ? typeof timesheets[key].total_late != "undefined"
                  ? timesheets[key]["total_late"]
                  : 0
                : 0}
            </td>
          </tr>
        );
      });
    }
    return result;
  }

  /**
   * Call api get summary timesheet
   */
  getSummaryTimesheet(params) {
    if (params.date) {
      params.from_date = timeFormatStandard(params.date, dateFormat);
      params.to_date = timeFormatStandard(params.date, dateFormat);
    }
    let xhr = apiGetSummary(params);
    xhr.then((response) => {
      if (response.status) {
        let result = [];
        let { data } = response;
        Object.keys(data.total).map((key) => {
          result[data.total[key].location_id] = {
            total: data.total[key].total,
            total_late: 0,
          };
        });
        Object.keys(data.total_late).map((key) => {
          result[data.total_late[key].location_id].total_late =
            data.total_late[key].total;
        });
        this.setState({ timesheets: result });
      }
    });
  }

  /**
   * @event submit Form
   * @param {*} values
   */
  submitForm(values) {
    console.log(values);
    this.getListStaffSchedule(values);
    this.getSummaryTimesheet(values);
    this.getListStaffleave(values);
  }

  render() {
    let {
      t,
      baseData: { departments, locations, majors },
    } = this.props;

    return (
      <>
        <PageHeader
          title={t("hr:staff_schedule")}
          tags={
            <Link
              to={`/company/staff-schedule/create`}
              key="create-staff-schedule"
            >
              <Button
                key="create-staff"
                type="primary"
                icon={<FontAwesomeIcon icon={faPlus} />}
              >
                &nbsp;{t("hr:add_new")}
              </Button>
            </Link>
          }
        />

        <Row className="card pl-3 pr-3 mb-4">
          <Form
            className="pt-3"
            ref={this.formRef}
            name="searchStaffForm"
            onFinish={this.submitForm.bind(this)}
            layout="vertical"
          >
            <Row gutter={24}>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name="date">
                  <DatePicker
                    format={dateFormat}
                    placeholder={t("hr:date")}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                <Form.Item name="major_id">
                  <Dropdown datas={majors} defaultOption={t("hr:major")} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                <Form.Item name="location_id">
                  <Dropdown
                    datas={locations}
                    defaultOption={t("hr:all_location")}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                <Form.Item name="department_id">
                  <Dropdown
                    datas={departments}
                    defaultOption={t("hr:all_department")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4} key="submit">
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    {t("hr:search")}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Row>

        <Row className="block_table_staff_schedule_report table_in_block card pl-3 pr-3 mb-3">
          <Col span={24}>
            <Tab tabs={tabList(this.props)} />
            <Divider className="mt-0" />
            <table className="table table-striped table_report">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>A</th>
                  <th>W</th>
                  <th>HC</th>
                  <th>AM</th>
                  <th>PM</th>
                  <th>{t("hr:check_in")}</th>
                  <th>{t("hr:late")}</th>
                </tr>
              </thead>
              <tbody>{this.renderBodyTable()}</tbody>
            </table>
          </Col>
        </Row>
      </>
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
)(withTranslation()(Report));
