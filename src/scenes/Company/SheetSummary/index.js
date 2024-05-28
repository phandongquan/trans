import React, { Component } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import {Table,Form,Row,Col,DatePicker,Button,Modal,} from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import StaffDropdown from "~/components/Base/StaffDropdown";
import Dropdown from "~/components/Base/Dropdown";
import { getList } from "~/apis/company/sheetSummary";
import { exportToXLS, timeFormatStandard, formatVND, checkManager, showNotify, checkPermission,} from "~/services/helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faFileExport } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import { header, formatSheetSummary, formatHeaders } from "./config/exportSheetSummary";
import { getDivisionByDept } from "~/apis/setting/division";
import Tab from "~/components/Base/Tab";
import tabList from "~/scenes/Company/config/tabListTask";
import FormatKpi from "./FormatKpi";
import kpiConfigApi from "~/apis/company/kpiConfig";
import {screenResponsive} from '~/constants/basic';
import ExportSheetSummary from "./components/ExportSheetSummary";
import ImportSheetSummary from "./components/ImportSheetSummary";

const WIDTH_COLUMN = 80;
const ALIGN_COLUMN = "center";
export class SheetSummary extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      loading: false,
      datas: [],
      total: 0,
      limit: 30,
      page: 1,
      divisions: [],
      visible: false,
      kpiJson: {},
      kpiStaffInfo: {},
      record: {},
      kpiGroups: [],
      groups: [],
      visibleRevenue : false , 
      datasRevenue : []
    };
  }
  
  componentDidMount() {
    const { staff_info } = this.props.auth;

    if (staff_info.staff_dept_id) {
      this.getListDivision(staff_info.staff_dept_id);
    }

    this.formRef.current.setFieldsValue({
      month: dayjs(),
      department_id: staff_info.staff_dept_id,
      // major_id: staff_info.major_id,
      // division_id: staff_info.division_id
    });

    this.getListMyConfig();
  }

  /**
   * Get list my config
   */
  getListMyConfig = () => {
    let params = {
      status: 1,
      limit: -1,
      offset: 0
    };
    let xhr = kpiConfigApi.getList(params);
    xhr.then((res) => {
      if (res.status) {
        this.setState({ kpiGroups: res.data.rows, groups: res.data.group}, () => {
          let values = this.formRef.current.getFieldsValue();
          this.getListSheetSummary(values);
        })
      } else {
        showNotify('Notify', res.message, 'error')
      }
    });
  };

  /**
   * Get list division
   * @param {*} deptId
   */
  getListDivision = async (deptId) => {
    if (!deptId) {
      return false;
    }
    this.formRef.current.setFieldsValue({
      division_id: null,
    });
    let response = await getDivisionByDept(deptId);
    if (response.status) {
      this.setState({ divisions: response.data });
    }
  };

  /**
   * @event submit form
   * @param {Object} values
   */
  submitForm = (values) => {
    this.setState({ page: 1 }, () => this.getListSheetSummary(values));
  };

  /**
   * Get list sheet summary
   * @param {*} params
   */
  getListSheetSummary = async (params = {}) => {
    this.setState({ loading: true });
    params = {
      ...params,
      limit: this.state.limit,
      offset: (this.state.page - 1) * this.state.limit,
      // limit: -1,
      // offset: 0,
      month: params.month ? timeFormatStandard(params.month, "YYYY-MM") : null,
      is_admin: 1,
    };

    let response = await getList(params);
    if (response.status) {
      this.setState({ loading: false });
      let kpiGroups = this.state.kpiGroups;
      let { rows } = response.data;
      rows.map((r, index) => {
        if(r.kpis) {
          kpiGroups.map(k => {
            if(typeof r.kpis[k.code] !== "undefined") {
              rows[index][k.code] = r.kpis[k.code].kpi
            }
          })
        }
      })
      this.setState({ datas: response.data.rows, total: response.data.total });
    }
  };

  /**
   * Get percent record
   */
  getPercentRecord = (record) => {
    let percent = 0;
    let sum_confirm_hours = record.sum_confirm_hours
      ? Number(record.sum_confirm_hours)
      : 0;
    if (sum_confirm_hours && record.working_time) {
      percent = (sum_confirm_hours * 100) / record.working_time;
    }

    return percent.toFixed(0);
  };

  /**
   * Onchange page
   * @param {*} page
   */
  onChangePage = (page) => {
    let values = this.formRef.current.getFieldsValue();
    this.setState({ page }, () => this.getListSheetSummary({ ...values }));
  };

  /**
   * Export sheet summary
   */
  exportSheetSummary = async () => {
    this.setState({ loading: true });
    let sheetSummaries = [];
    let params = this.formRef.current.getFieldsValue();
    params = {
      ...params,
      limit: -1,
      offset: 0,
      month: params.month ? timeFormatStandard(params.month, "YYYY-MM") : null,
      is_admin: 1,
    };

    let response = await getList(params);
    if (response.status) {
      this.setState({ loading: false });
      let { kpiGroups } = this.state;
      sheetSummaries = response.data.rows;
      sheetSummaries.map((r, index) => {
        if (r.kpis) {
          kpiGroups.map(k => {
            if (typeof r.kpis[k.code] !== "undefined") {
              sheetSummaries[index][k.code] = r.kpis[k.code].kpi
            }
          })
        }
      })
      let headerFormat = formatHeaders(kpiGroups);
      let dataFormat = formatSheetSummary(sheetSummaries, kpiGroups);
      let datas = [...[headerFormat], ...dataFormat];
      let fileName = `Sheet-summary-${dayjs().format("YYYY-MM")}`;

      exportToXLS(fileName, datas);
    }
  };

  render() {
    const {
      t,
      baseData: { departments, majors, divisions, locations },
      auth: { staff_info },
    } = this.props;
    const { visible, kpiJson, kpiStaffInfo, kpiGroups, groups, loading } = this.state;
    let columnsRevenue = [
      {
        title: 'id',
        dataIndex :'id'
      },
      {
        title: t('hr:name'),
        dataIndex :'name'
      },
      {
        title: t('hr:level'),
        dataIndex :'lv'
      },
      {
        title: t('hr:cost'),
        render : r => <span>{formatVND(r.cost, "")}</span>
      }
      
    ]
    let columns = [
      {
        title: 'No.',
        render: r => this.state.datas.indexOf(r) + 1,
        fixed: 'left',
        width: 50
      },
      {
        title: t("hr:staff"),
        render: (r) => {
          if(!r.staff) {
            return ''
          }
          return (
            <>
              {r.staff.staff_name}
              <small className="ml-2">
                <strong>({r.staff.code})</strong>
              </small>
              <div>
                <small>
                  {departments.find((d) => d.id == r.staff.staff_dept_id)?.name || ''} / 
                  {divisions.find((d) => d.id == r.staff.division_id)?.name || ''} / 
                  {majors.find((m) => m.id == r.staff.major_id)?.name || ''}
                </small>
              </div>
            </>
          )
        },
        width: 150,
        fixed: 'left',
      },
      {
        title: t("hr:total") + (' ') + t('hr:confirmed_hour'),
        width:50,
        render: (r) => (r.sum_confirm_hours ? r.sum_confirm_hours : 0),
        sorter: (a, b) => a.sum_confirm_hours - b.sum_confirm_hours,
        align: ALIGN_COLUMN,
        width: WIDTH_COLUMN
      },
      {
        title: t("hr:task_finish"),
        dataIndex: "count_status",
        sorter: (a, b) => a.count_status - b.count_status,
        align: ALIGN_COLUMN,
        width: WIDTH_COLUMN
      },
      {
        title: t("hr:working_days"),
        dataIndex: "working_day",
        sorter: (a, b) => a.working_day - b.working_day,
        align: ALIGN_COLUMN,
        width: WIDTH_COLUMN
      },
      {
        title: t("hr:task_pending"),
        dataIndex: "count_task_pending",
        sorter: (a, b) => a.count_task_pending - b.count_task_pending,
        align: ALIGN_COLUMN,
        width: WIDTH_COLUMN
      },
      {
        title: t("hr:task_lated"),
        dataIndex: "count_task_lated",
        sorter: (a, b) => a.count_task_lated - b.count_task_lated,
        align: ALIGN_COLUMN,
        width: WIDTH_COLUMN
      },
      {
        title: t("hr:standard_working_time"),
        dataIndex: "working_time",
        sorter: (a, b) => a.working_time - b.working_time,
        align: ALIGN_COLUMN,
        width: WIDTH_COLUMN
      },
      {
        title: t("hr:Working days"),
        dataIndex: "working_day",
        sorter: (a, b) => a.working_day - b.working_day,
        align: ALIGN_COLUMN,
        width: WIDTH_COLUMN
      },
      {
        title: t("hr:num_of_compensatory_hour"),
        dataIndex: "sum_time_diff",
        sorter: (a, b) => a.sum_time_diff - b.sum_time_diff,
        align: ALIGN_COLUMN,
        width: WIDTH_COLUMN
      },
      {
        title: t("hr:percent_finish"),
        dataIndex: "kpi",
        sorter: (a, b) => a.kpi - b.kpi,
        align: ALIGN_COLUMN,
        width: WIDTH_COLUMN
      },
      {
        title: t("hr:bonus")+ t(" (VND)"),
        sorter: (a, b) => a.skill_revenue - b.skill_revenue,
        align: ALIGN_COLUMN,
        render: (r) => <>
          <span>{formatVND(r.skill_revenue, "")}</span>
          <Button
            className="ml-2"
            type="primary"
            icon={<FontAwesomeIcon icon={faEye} />}
            onClick={() => {
              let dataObj = r?.skill_revenue_logs ? r?.skill_revenue_logs : {}
              let datasFormat = []
              if(Object.keys(dataObj).length){
                Object.keys(dataObj).map(key => {
                  datasFormat.push({
                    id: key,
                    name: dataObj[key].name,
                    lv: dataObj[key].lv,
                    cost: dataObj[key].cost
                  })
                })
              }
              this.setState({
                visibleRevenue: true,
                datasRevenue: datasFormat
              })
            }}
            size="small"
          />
        </>,
        width: 160
      },
      {
        title: "Kpi",
        align: "center",
        render: (r) => {
          if (r.kpi_json || r.kpis) {
            return (
              <div>
                {r.kpi}
                <Button
                  type="primary"
                  icon={<FontAwesomeIcon icon={faEye} />}
                  onClick={() =>
                    this.setState({
                      visible: true,
                      kpiJson: r.kpi_json,
                      kpiStaffInfo: r.staff,
                      record: r
                    })
                  }
                  size="small"
                />
              </div>
            );
          }
        },
        width: 80,
      },
      {
        title: t("ht:total") + t(" KPIs (h)"),
        align: "center",
        render: r => r.hour_total_kpi,
        width: 100,
      },
    ];

    kpiGroups.map(k => {
      columns.push({
        title: <span><small>{k.criterion} <b>{k.code}</b></small></span>,
        dataIndex: k.code,
        align: ALIGN_COLUMN,
        width: WIDTH_COLUMN,
      },)
    })
    
    return (
      <div id="page_set_summary">
        <PageHeader title={t("hr:sheet_summary")} 
          extra={checkPermission('hr-sheet-summary-import') ? <ImportSheetSummary translang={this.props} /> : null}
        />
        <Row className="card pl-3 pr-3 mb-3 mr-3">
          <div id="tab_responsive">
            <div className='tab_content_mantenance_device'>
          <Tab
            // tabs={tabList(
            //   staff_info?.major_id,
            //   checkManager(staff_info?.position_id)
            // )}
            tabs={tabList(this.props)}
          ></Tab>
            </div>
          </div>
          <Form
            ref={this.formRef}
            className="mt-3"
            layout="vertical"
            onFinish={this.submitForm.bind(this)}
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="month">
                  <DatePicker className="w-100" picker="month" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name="department_id">
                  <Dropdown
                    datas={departments}
                    defaultOption={t("hr:all_department")}
                    onChange={(value) => this.getListDivision(value)}
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
                <Form.Item name="division_id">
                  <Dropdown
                    datas={this.state.divisions}
                    defaultOption={t("hr:all_section")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name="major_id">
                  <Dropdown
                    datas={majors}
                    defaultOption={t("hr:all_major")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="staff_id">
                  <StaffDropdown defaultOption={t("ht:all_staff")} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6} className="pb-2">
                <Form.Item >
                  <div className="block_height_button">
                    <Button type="primary" htmlType="submit">
                      {t("hr:search")}
                    </Button>
                    {
                      checkPermission('hr-sheet-summary-export') ?
                        <>
                          <Button
                            className="ml-1"
                            loading={loading}
                            key="export-staff"
                            type="primary"
                            icon={<FontAwesomeIcon icon={faFileExport} />}
                            onClick={() => this.exportSheetSummary()}
                          >
                            {t("hr:export_file")}
                          </Button>
                          <ExportSheetSummary
                            getParams={() => this.formRef.current.getFieldsValue()}
                            setLoading={loading => this.setState({loading: loading})}
                            kpiGroups={kpiGroups}
                            groups={groups}
                            loading={loading}
                          />
                        </>
                        : ''
                    }
                  </div>
                  </Form.Item>
              </Col>
            </Row>
          </Form>
        </Row>

        <Row gutter={[16, 24]}>
          <Col span={24}>
            {window.innerWidth < screenResponsive  ? 
                <div className='block_scroll_data_table'>
                    <div className='main_scroll_table table_2000'> 
                        <Table
                            loading={loading}
                            style={{ width: "99%" }}
                            dataSource={this.state.datas}
                            columns={columns}
                            rowKey="staff_id"
                            pagination={{
                              total: this.state.total,
                              pageSize: this.state.limit,
                              hideOnSinglePage: true,
                              showSizeChanger: false,
                              current: this.state.page,
                              onChange: (page) => this.onChangePage(page),
                            }}
                        />
                    </div>
                </div>
                :
                <Table
                  loading={loading}
                  style={{ width: "99%" }}
                  dataSource={this.state.datas}
                  columns={columns}
                  rowKey="staff_id"
                  pagination={{
                    total: this.state.total,
                    pageSize: this.state.limit,
                    hideOnSinglePage: true,
                    showSizeChanger: false,
                    current: this.state.page,
                    onChange: (page) => this.onChangePage(page),
                  }}
                  // pagination={false}
                  // scroll={{ y: 'calc(100vh - 350px)' }}
                  scroll={{ x: 1500, y: 'calc(100vh - 350px)' }}
                />
            }
          </Col>
        </Row>

        <Modal
          visible={visible}
          onCancel={() =>
            this.setState({ visible: false, kpiJson: {}, kpiStaffInfo: {} })
          }
          footer={false}
          width={window.innerWidth < screenResponsive  ? "100%":"60%"}
          title={
            <strong>
              {kpiStaffInfo.staff_name} - {kpiStaffInfo.code}
            </strong>
          }
        >
           
          <div className={window.innerWidth < screenResponsive  ? '':'block_scroll_data_table'}>
            <div className={window.innerWidth < screenResponsive  ? '':'main_scroll_table'}> 
                <FormatKpi
                  data={this.state.record}
                  kpiGroups={this.state.kpiGroups}
                  groups={this.state.groups}
                />
            </div>
          </div>          
          <Row>
            {kpiJson &&
              Object.keys(kpiJson).map((key) => {
                return (
                  <>
                    <Col xs={24} sm={24} md={24} lg={18} xl={18} className="p-2 border-bottom">
                      {key}
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={6} xl={6} className="p-2 border-bottom">
                      {kpiJson[key]}
                    </Col>
                  </>
                );
              })}
          </Row>
        </Modal>
        <Modal 
          title={t('hr:kill_revenue_log')}
          open={this.state.visibleRevenue}
          onCancel={() =>
            this.setState({ visibleRevenue: false, datasRevenue: []})
          }
          footer={false}
          width={window.innerWidth < screenResponsive  ? "100%":"60%"}
        >
          <Table dataSource={this.state.datasRevenue}
            columns={columnsRevenue}
            pagination={false}
          />
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  baseData: state.baseData,
  auth: state.auth.info,
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(SheetSummary));
