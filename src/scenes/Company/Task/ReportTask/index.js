import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col,Form, Input,  DatePicker  } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import Dropdown from "~/components/Base/Dropdown";
import { dateFormat } from '~/constants/basic'
import { historyReplace, showNotify, historyParams, timeFormatStandard } from '~/services/helper';
import { getListReportTask } from '~/apis/company/task/reportTask';
import Tab from '~/components/Base/Tab';
import tabListTask from '../../config/tabListTask';
import dayjs from "dayjs";
import './reportTask.scss'
const { RangePicker } = DatePicker;
const FormatDate = "YYYY-MM-DD";

class ReportTask extends Component {
  /**
   *
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      loading: false,
      report: [],
      dataSource: [],
    };
  }

  componentDidMount() {
    const yesterday = dayjs()
      .subtract(1, "day")
      .format("YYYY-MM-DD");
    this.formRef.current.setFieldsValue({
     date: [dayjs().subtract(1,"d"), dayjs().subtract(1,"d")],
    });
    let values = this.formRef.current.getFieldsValue();
    this.getReportTask(values);
  }

  async getReportTask(params = {}) {
    params = {
      ...params,
      from_date: params.date ? dayjs(params.date[0]).format('YYYY-MM-DD') : null,
      to_date: params.date ? dayjs(params.date[1]).format('YYYY-MM-DD') : null
  }
  delete params.date
    this.setState({ loading: true });
    let response = await getListReportTask(params);
    if (response.status) {
      let dataSource = [];
      let rowDaily = [];
      let rowSchedule = [];
      let rowWorkflow = [];
      let rowOther = [];
      let rowTimeSheet = [];
      let rowTotalTask = [];
      let rowSS = [];
      response.data.map((child) => {
        if (typeof child.children != "undefined" && child.children) {
          child.children.map((d) => {
            // daily
            rowDaily["task_group"] = "Daily tasks";
            rowDaily["location_" + d.location_id] = d.daily;

            // Scheduale
            rowSchedule["task_group"] = "Schedule tasks";
            rowSchedule["location_" + d.location_id] = d.schedule;
            //Workflow
            rowWorkflow["task_group"] = "WF tasks";
            rowWorkflow["location_" + d.location_id] = d.workflow;
            //Other
            rowOther["task_group"] = "Other tasks";
            rowOther["location_" + d.location_id] = d.other;
            //TimeSheet
            rowTimeSheet["task_group"] = <b>Total timesheets</b>;
            rowTimeSheet["location_" + d.location_id] = <b>{d.working_time}</b>;
            //TotalTask
            rowTotalTask["task_group"] = <b>Total tasks time</b>;
            rowTotalTask["location_" + d.location_id] =<b>{(
              d.daily +
              d.schedule +
              d.workflow +
              d.other
            ).toFixed(2)}</b> 
            //COMP
            rowSS["task_group"] =<b>Timesheets Vs Tasks</b>;
            let value = (
              d.working_time -
              (d.daily + d.schedule + d.workflow + d.other)
            ).toFixed(2);
            let content = value;
            if (value !== "0") {
              content = <span style={{ color: "#ff3300" }}>{value}</span>;
            }
            rowSS["location_" + d.location_id] =<b>{content}</b> ;
          });
        }
      });
      dataSource.push(rowTimeSheet);
      dataSource.push(rowTotalTask);
      dataSource.push(rowSS);
      dataSource.push(rowDaily);
      dataSource.push(rowSchedule);
      dataSource.push(rowWorkflow);
      dataSource.push(rowOther);
      this.setState({ loading: false, report: response.data, dataSource });
    } else {
      showNotify("Notification", response.message, "error");
      this.setState({ loading: false });
    }
  }

  /**
   * Submit form
   * @param {*} values
   */
  submitForm = async () => {
    this.setState({ page: 1 }, () => {
      let values = this.formRef.current.getFieldsValue();
      this.getReportTask(values);
    });
  };
  /**
   * @render
   */
  render() {
    let {
      t,
      baseData: { locations, departments, positions, majors },
    } = this.props;
    let { report } = this.state;
    const uniqueCities = Array.from(
      new Set(report.map((location) => location.city_name))
    );
    const columns = [
      {
        title: "",
        align: "right",
        children: [
          {
            title: "Task Group",
            dataIndex: "task_group",
            fixed: "true",
            width: 200,
            key: "task_group",
          },
        ],
      },
      // {
      //   title: "",
      //   children: [
      //     {
      //       title: "Task name",
      //       width: 150,
      //       dataIndex: "task_name",
      //       key: "task_name",
      //     },
      //   ],
      // },
      ...uniqueCities.map((city) => {
        return {
          title: city,

          children: report
            .filter((location) => location.city_name === city)
            .flatMap((location) =>
              location.children.map((child) => {
                const locationInfo = locations.find(
                  (loc) => loc.id === child.location_id
                );
                const locationName = locationInfo
                  ? locationInfo.name
                  : "Unknown";
                return {
                  align: "center",
                  title: locationName,
                  dataIndex: `location_${child.location_id}`,
                  key: `location_${child.location_id}`,
                };
              })
            ),
        };
      }),
    ];

    return (
      <div>
        <PageHeader title={t("hr:report_task")} />
        <Row className="card pl-3 pr-3 mb-3">
          <div id="tab_responsive">
            <div className="tab_content_mantenance_device">
              <Tab tabs={tabListTask(this.props)}></Tab>
            </div>
          </div>
          <Form
            className="pt-3"
            layout="vertical"
            ref={this.formRef}
            onFinish={(values) => this.submitForm(values)}
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="date">
                  <DatePicker.RangePicker
                    style={{ width: "100%" }}
                    format={dateFormat}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name="location_id">
                  <Dropdown
                    datas={locations}
                    defaultOption={t("hr:all_location")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name="major_id">
                  <Dropdown
                    datas={majors}
                    mode="multiple"
                    defaultOption={t("hr:all_major")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={2} xl={2}>
                <Button type="primary" htmlType="submit">
                  &nbsp;{t("search")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Row>
        <div className="table-container">
          <Table
            className="table-container"
            columns={columns}
            bordered
            size="middle"
            scroll={{
              x: 20000,
              y: 900,
            }}
            dataSource={this.state.dataSource}
          />
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ReportTask));
