import React, { Component } from "react";
import Tab from "~/components/Base/Tab";
import { PageHeader } from "@ant-design/pro-layout";
import { Button, Table, Row, Col, Form, Input, Modal, DatePicker} from "antd";
import tabListTraining from "../config/tabListTraining";
import Dropdown from "~/components/Base/Dropdown";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import {getListReport, deleteTrainingPlan, getReportChart } from "~/apis/company/TrainingPlan";
import { showNotify, historyParams, historyReplace, exportToXLS, timeFormatStandard } from "~/services/helper";
import { LinkOutlined} from "@ant-design/icons";
import StaffDropdown from "~/components/Base/StaffDropdown";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { formatDataReport , formatHeaderReport} from "./config/exportTrainingReport";
import dayjs from 'dayjs';
import { dateFormat, levels } from '~/constants/basic'
import TrainingPlanReportChart from '~/components/Company/TrainingPlanReport/reportChart';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
class TrainingPlanReport extends Component {
  /**
   *
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    let params = historyParams();
    this.state = {
      trainingReportList: [],
      limit: 30,
      total: 0,
      loading: false,
      page: 1,
      selectedRowKeys: [],
      detailPlanStaffs: [],
      visible: false,
      datas: [],
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
    let values = this.formRef.current.getFieldsValue();
    params = {
      ...params,
      ...values,
    };
    this.getTrainingReport(params);
  }

  /**
   *
   * get list training report by staff
   */
  getTrainingReport = (params = {}) => {
    this.setState({
      loading: true,
    });
    if (params.date) {
      params.from_date = timeFormatStandard(params.date[0], dateFormat);
      params.to_date = timeFormatStandard(params.date[1], dateFormat);
      delete params.date;
    }
    params = {
      ...params,
      limit: this.state.limit,
      offset: params.offset || (this.state.page - 1) * this.state.limit,
    };
    historyReplace(params);
    let xhr = getListReport(params);
    xhr.then((response) => {
      if (response.status) {
        let { data } = response;
        this.setState({
          trainingReportList: data.rows,
          loading: false,
          total: data.total,
        });
      }
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
    let values = this.formRef.current.getFieldsValue();
    values = {
      ...params,
      ...values,
    };
    this.setState({ page }, () => this.getTrainingReport(values));
  };

  /**
   *
   * delete training report
   */
  getDeleteTrainingReport(e, id) {
    const { t } = this.props;
    e.stopPropagation();
    let xhr = deleteTrainingPlan(id);
    xhr.then((response) => {
      if (response.status) {
        let values = this.formRef.current.getFieldsValue();
        this.getTrainingReport(values);

        showNotify(t("hr:notification"), t("hr:has_been_remove"));
      } else {
        showNotify(t("hr:notification"), response.message);
      }
    });
  }
  /**
   * submit Form
   */
  submitFormReport = (values) => {
    this.setState({ page: 1 }, () => {
      let values = this.formRef.current.getFieldsValue();
      this.getTrainingReport(values);
    });
  };

  /**
   *
   * export training report
   */
  async exportTrainingReport() {
    this.setState({ loading: true });
    let { baseData } = this.props;
    let values = this.formRef.current.getFieldsValue();
    let params = {
      ...values,
    };
    let response = await getListReport(params);
    if (response.status) {
      let header = formatHeaderReport();
      let data = formatDataReport(response.data.rows);
      let fileName = `Training-Report ${dayjs().format("YYYY-MM-DD")}`;
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
  /**
   * Render data status
   */
  render() {
    const {
      t,
      baseData: { locations, divisions, departments, positions, majors },
    } = this.props;
    let { selectedRowKeys, trainingReportList, detailPlanStaffs,  reportDatas } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const columns = [
      {
        title: "No.",
        align: "center",
        render: (r) => this.state.trainingReportList.indexOf(r) + 1,
      },
      {
        title: t('hr:training_plan'),
        render: (r) => r.name,
      },
      {
        title: t("hr:staff"),
        render: (r) => {
          if (!r) return "";
          return (
            <>
              <div>
                {r.staff_name} <strong>#{r.code}</strong>
              </div>
              <div>
                <small>
                  {departments.find((d) => d.id == r.staff_dept_id)?.name} /
                  {majors.find((m) => m.id == r.major_id)?.name} /
                  {locations.find((l) => l.id == r.staff_loc_id)?.name}
                </small>
              </div>
            </>
          );
        },
      },
      {
        title: t("hr:start"),
        align: "center",
        render: (r) => <div>{r.start_date}</div>,
      },
      {
        title: t("hr:deadline"),
        align: "center",
        render: (r) => <div>{r.end_date}</div>,
      },
      {
        title: t("hr:dept"),
        render: (r) => {
          let dept = departments.find((d) => d.id == r.department_id);
          return `${dept ? dept.name : ""} `;
        },
      },
      {
        title: t("hr:status"),
        render: (r) => {
          if (r.status == 0) return "Inactive";
          if (r.total_skill == Number(r.quantity_skill)) return "Completed";
          if (
            r.total_skill > Number(r.quantity_skill) &&
            dayjs(r.end_date).unix() < dayjs().unix()
          )
            return "Expired";
          return "Active";
        },
      },
      {
        title: t("hr:ratio_of_finished"),
        align: "center",
        render: (r) => (
          <span>
            {((Number(r.quantity_skill) / r.total_skill) * 100).toFixed(2)}%
          </span>
        ),
      },
      {
        title: t("hr:action"),
        align: "center",
        render: (r) => {
          return (
            <Button
              className="ml -2"
              size="small"
              type="primary"
              icon={<LinkOutlined />}
              onClick={() =>
                this.props.history.push(
                  `/company/staff/${r.staff_id}/training-plan?plan_id=${r.plan_id}`
                )
              }
            />
          );
        },
      },
    ];
    return (
      <div>
        <PageHeader title={t("hr:training_report")} />
        <Row className="card pl-3 pr-3 mb-3">
          <Tab tabs={tabListTraining(this.props)} />
          <Form
            className="pt-3"
            layout="vertical"
            ref={this.formRef}
            onFinish={this.submitFormReport.bind(this)}
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="date">
                  <DatePicker.RangePicker
                    className="w-100"
                    placeholder={t("hr:s_e_request")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="keyword">
                  <Input placeholder={ t("hr:title")} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="staff_id">
                  <StaffDropdown defaultOption={t("hr:all_staff")} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="location_id">
                  <Dropdown
                    datas={locations}
                    defaultOption={t("hr:all_location")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="department_id">
                  <Dropdown
                    datas={departments}
                    defaultOption={t("hr:all_department")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="staff_pic">
                  <StaffDropdown defaultOption="--- All Staff Pic ---" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Button type="primary" htmlType="submit">
                  {t("search")}
                </Button>
                <Button
                  type="primary"
                  className="ml-2"
                  icon={<FontAwesomeIcon icon={faFileExport} />}
                  onClick={() => this.exportTrainingReport()}
                >
                  &nbsp;{t("hr:export")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Row>
        <Row gutter={[24, 12]}>
          <Col xs={24} sm={24} md={24} lg={12} xl={12} className="mb-3">
           <TrainingPlanReportChart />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={this.state.trainingReportList}
          loading={this.state.loading}
          pagination={{
            onChange: (page) => this.onChangePage(page),
            current: this.state.page,
            pageSize: this.state.limit,
            total: this.state.total,
            hideOnSinglePage: true,
            showSizeChanger: false,
          }}
          // pagination={{ pageSize: 30, showSizeChanger: false }}
          rowKey="key"
        />
        <Modal
          open={this.state.visible}
          onCancel={() => this.setState({ visible: false })}
          width={"70%"}
        >
          <Table columns={columns} dataSource={this.state.detailPlanStaffs} />
        </Modal>
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
export default connect(mapStateToProps)(withTranslation()(TrainingPlanReport));
